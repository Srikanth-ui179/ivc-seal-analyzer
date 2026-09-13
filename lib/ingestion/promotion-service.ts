import "server-only";
import { databaseQuery } from "@/lib/db/client";
import { CANONICAL_SITES } from "./m77-parser";
import { validateRawM77Record } from "./m77-validator";
import { getStagedRowsForRun } from "./staging-service";
import type { ParsedM77Row, PromotionResult } from "./types";

export async function validateAndPromoteIngestionRun(runId: string): Promise<PromotionResult> {
  // 1. Fetch run details
  const runRes = await databaseQuery<{ id: string; stable_id: string; record_scope: string; state: string; corpus_release_id: string }>(
    `SELECT id, stable_id, record_scope, state, corpus_release_id FROM corpus_ingestion_runs WHERE id = $1`,
    [runId]
  );
  const run = runRes.rows[0];
  if (!run) throw new Error(`Ingestion run ${runId} not found.`);
  if (run.state !== "staged") throw new Error(`Ingestion run ${runId} is in state '${run.state}', expected 'staged'.`);

  // 2. Fetch release and source
  const releaseRes = await databaseQuery<{ id: string; source_id: string; authorization_status: string }>(
    `SELECT id, source_id, authorization_status FROM corpus_releases WHERE id = $1`,
    [run.corpus_release_id]
  );
  const release = releaseRes.rows[0];
  if (!release) throw new Error(`Corpus release ${run.corpus_release_id} not found.`);
  if (run.record_scope === "research" && release.authorization_status !== "authorized") {
    throw new Error(`Cannot promote research ingestion run against unauthorized release (${release.authorization_status}).`);
  }

  // 3. Fetch and validate staged rows
  const stagedRows = await getStagedRowsForRun(runId);
  if (stagedRows.length === 0) {
    throw new Error(`Ingestion run ${runId} has no staging rows.`);
  }

  const validatedRows: ParsedM77Row[] = [];
  const validationErrors: Array<{ key: string; errors: unknown[] }> = [];

  for (const row of stagedRows) {
    const res = validateRawM77Record(row.rawPayload);
    if (res.isValid && res.parsedRow) {
      validatedRows.push(res.parsedRow);
    } else {
      validationErrors.push({ key: row.sourceRowKey, errors: res.errors });
    }
  }

  if (validationErrors.length > 0) {
    await databaseQuery(
      `UPDATE corpus_ingestion_runs SET state = 'rejected', rejected_at = now(), validation_summary = $2 WHERE id = $1`,
      [runId, `Validation failed for ${validationErrors.length} rows: ${JSON.stringify(validationErrors.slice(0, 5))}`]
    );
    throw new Error(`Validation failed for ${validationErrors.length} rows in run ${runId}.`);
  }

  // 4. Update run to 'validated'
  await databaseQuery(
    `UPDATE corpus_ingestion_runs SET state = 'validated', validated_at = now(), validation_summary = $2 WHERE id = $1`,
    [runId, `Successfully validated ${validatedRows.length} rows.`]
  );

  // 5. Execute promotion inside transaction
  await databaseQuery("BEGIN");
  try {
    const sourceId = release.source_id;
    const releaseId = release.id;
    const scope = run.record_scope;

    // A. Ensure Canonical Sites exist
    const siteIdMap = new Map<string, string>();
    for (const [code, info] of Object.entries(CANONICAL_SITES)) {
      const stableId = `SITE-${code.replace(/\s+/g, "_")}`;
      const res = await databaseQuery<{ id: string }>(
        `INSERT INTO sites (stable_id, record_scope, status, canonical_name, modern_region, country, latitude, longitude)
         VALUES ($1, $2, 'active', $3, $4, $5, $6, $7)
         ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [stableId, scope, info.canonicalName, info.modernRegion, info.country, info.latitude, info.longitude]
      );
      siteIdMap.set(info.canonicalName.toUpperCase(), res.rows[0].id);
      siteIdMap.set(code, res.rows[0].id);
    }

    // B. Ensure Canonical Signs exist (1..417)
    const signIdMap = new Map<number, string>();
    for (let s = 1; s <= 417; s++) {
      const pad = String(s).padStart(3, "0");
      const stableId = `SIGN-M-${pad}`;
      const code = `M-${pad}`;
      const res = await databaseQuery<{ id: string }>(
        `INSERT INTO signs (stable_id, record_scope, status, catalogue_namespace, catalogue_code, visual_label, visual_description)
         VALUES ($1, $2, 'active', 'mahadevan', $3, $4, $5)
         ON CONFLICT (catalogue_namespace, catalogue_code) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [stableId, scope, code, `Sign ${code}`, `Mahadevan (1977) visual catalogue sign ${code}. Descriptive catalogue record only; has no assigned language, phonetic value, or translation.`]
      );
      signIdMap.set(s, res.rows[0].id);
    }

    let promotedObjects = 0;
    let promotedInscriptions = 0;
    let promotedSequences = 0;
    let promotedOccurrences = 0;
    let promotedIdentifiers = 0;
    let promotedAssertions = 0;

    // Group rows by object (textNumber)
    const rowsByText = new Map<number, ParsedM77Row[]>();
    for (const row of validatedRows) {
      const list = rowsByText.get(row.textNumber) ?? [];
      list.push(row);
      rowsByText.set(row.textNumber, list);
    }

    for (const [textNumber, rows] of Array.from(rowsByText.entries())) {
      const firstRow = rows[0];
      const siteId = siteIdMap.get(firstRow.siteCode) ?? siteIdMap.get(firstRow.siteName.toUpperCase()) ?? siteIdMap.get("MOHENJO-DARO")!;
      const objStableId = `OBJ-M77-${textNumber}`;

      // Insert or get Object
      const objRes = await databaseQuery<{ id: string }>(
        `INSERT INTO objects (stable_id, record_scope, status, site_id, object_type, material)
         VALUES ($1, $2, 'active', $3, $4, $5)
         ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [objStableId, scope, siteId, firstRow.objectType, firstRow.material]
      );
      const objectId = objRes.rows[0].id;
      promotedObjects++;

      // Insert primary Catalogue Identifier
      await databaseQuery(
        `INSERT INTO catalogue_identifiers (record_scope, subject_type, subject_id, catalogue_namespace, identifier_text, source_id, corpus_release_id, source_locator, is_primary)
         VALUES ($1, 'object', $2, 'mahadevan', $3, $4, $5, $6, true)
         ON CONFLICT (catalogue_namespace, identifier_text, subject_type) DO NOTHING`,
        [scope, objectId, String(textNumber), sourceId, releaseId, `Text ${textNumber}`]
      );
      promotedIdentifiers++;

      // Insert field symbol assertion if present
      if (firstRow.fieldSymbol) {
        await databaseQuery(
          `INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, certainty, source_id, source_locator, note)
           VALUES ('object', $1, 'field_symbol_motif', $2, 'asserted', $3, $4, 'Archaeological classification of field symbol/motif from Mahadevan (1977).')
           ON CONFLICT DO NOTHING`,
          [objectId, firstRow.fieldSymbol, sourceId, `Text ${textNumber}`]
        );
        promotedAssertions++;
      }

      // Group by surface
      const rowsBySurface = new Map<string, ParsedM77Row[]>();
      for (const r of rows) {
        const sList = rowsBySurface.get(r.surfaceLabel) ?? [];
        sList.push(r);
        rowsBySurface.set(r.surfaceLabel, sList);
      }

      for (const [surfaceLabel, surfaceRows] of Array.from(rowsBySurface.entries())) {
        const insStableId = `INS-M77-${textNumber}-${surfaceLabel.toUpperCase()}`;
        const insRes = await databaseQuery<{ id: string }>(
          `INSERT INTO inscriptions (stable_id, record_scope, status, object_id, surface_label)
           VALUES ($1, $2, 'active', $3, $4)
           ON CONFLICT (object_id, surface_label) DO UPDATE SET updated_at = now()
           RETURNING id`,
          [insStableId, scope, objectId, surfaceLabel]
        );
        const inscriptionId = insRes.rows[0].id;
        promotedInscriptions++;

        for (const sRow of surfaceRows) {
          const seqStableId = `SEQ-M77-${textNumber}-${surfaceLabel.toUpperCase()}-${sRow.lineNumber}`;
          const isPrimary = sRow.lineNumber === 1;

          const seqRes = await databaseQuery<{ id: string }>(
            `INSERT INTO sign_sequences (stable_id, record_scope, status, inscription_id, sequence_basis, sequence_version, is_primary, source_id, corpus_release_id, source_locator, source_transcription, source_token_order, recorded_direction)
             VALUES ($1, $2, 'active', $3, 'source_transcription', 1, $4, $5, $6, $7, $8, 'source_recorded', 'right_to_left')
             ON CONFLICT (inscription_id, sequence_basis, sequence_version) DO UPDATE SET updated_at = now()
             RETURNING id`,
            [seqStableId, scope, inscriptionId, isPrimary, sourceId, releaseId, `Text ${textNumber}, line ${sRow.lineNumber}`, sRow.sourceTranscription]
          );
          const sequenceId = seqRes.rows[0].id;
          promotedSequences++;

          // Insert occurrences
          for (const sign of sRow.signs) {
            const occStableId = `OCC-M77-${textNumber}-${surfaceLabel.toUpperCase()}-${sRow.lineNumber}-${String(sign.positionIndex).padStart(2, "0")}`;
            const targetSignId = sign.signCode ? signIdMap.get(sign.signCode) ?? null : null;
            const identStatus = sign.isDamaged ? "damaged" : sign.isUnidentified ? "unidentified" : "identified";

            await databaseQuery(
              `INSERT INTO sign_occurrences (stable_id, record_scope, status, sequence_id, sign_id, position_index, identification_status, source_position_index, source_token_text)
               VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, $8)
               ON CONFLICT (sequence_id, position_index) DO NOTHING`,
              [occStableId, scope, sequenceId, targetSignId, sign.positionIndex, identStatus, sign.positionIndex, sign.rawToken]
            );
            promotedOccurrences++;
          }
        }
      }
    }

    // 6. Update run to 'promoted'
    await databaseQuery(
      `UPDATE corpus_ingestion_runs SET state = 'promoted', promoted_at = now() WHERE id = $1`,
      [runId]
    );

    await databaseQuery("COMMIT");

    return {
      ingestionRunId: runId,
      promotedObjectsCount: promotedObjects,
      promotedInscriptionsCount: promotedInscriptions,
      promotedSequencesCount: promotedSequences,
      promotedOccurrencesCount: promotedOccurrences,
      promotedIdentifiersCount: promotedIdentifiers,
      promotedAssertionsCount: promotedAssertions,
      promotedAt: new Date(),
    };
  } catch (error) {
    await databaseQuery("ROLLBACK");
    await databaseQuery(
      `UPDATE corpus_ingestion_runs SET state = 'rejected', rejected_at = now(), validation_summary = $2 WHERE id = $1`,
      [runId, `Promotion aborted and rolled back: ${error instanceof Error ? error.message : String(error)}`]
    );
    throw error;
  }
}
