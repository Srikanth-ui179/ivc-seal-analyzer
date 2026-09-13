#!/usr/bin/env node

/**
 * CISI Corpus Ingestion Runner (Mayig open digitization of Parpola et al. CISI)
 *
 * Source:  https://github.com/mayig/indus-valley-script-corpus
 * License: MIT (Copyright 2024 Michael Carlson)
 * Site covered: Mohenjo-daro (M-1 through M-199, WIP)
 * Sign notation: Parpola/CISI P-NNN (not Mahadevan M-NNN)
 *
 * This script is a private server-side tool. Never exposed through the web UI.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

function sha256str(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function parseCisiId(id) {
  const m = id.match(/^M-(\d+)([A-Z]?)$/);
  if (!m) return null;
  return { artefactNum: m[1], sideLabel: m[2] || "A", cisiId: `M-${m[1]}` };
}

function inferObjectType(description) {
  const d = (description || "").toLowerCase();
  if (d.includes("tablet")) return "tablet";
  if (d.includes("sealing")) return "sealing";
  if (d.includes("seal")) return "seal";
  return "seal";
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const promote = args.includes("--promote");

  const repoRoot = resolve(process.cwd());
  const corpusDir = join(repoRoot, "data", "corpus", "cisi");
  const subDirs = ["m001_m099", "m100_m199"];

  console.log("==============================================================");
  console.log("  IndusScript AI - CISI Corpus Ingestion Runner");
  console.log("  Source: github.com/mayig/indus-valley-script-corpus");
  console.log("  License: MIT (Copyright 2024 Michael Carlson)");
  console.log("  WARNING: Partial corpus - Mohenjo-daro M-1..M-199 only");
  console.log("==============================================================\n");

  if (!existsSync(corpusDir)) {
    console.error("[BLOCKED] Corpus directory not found:", corpusDir);
    process.exit(1);
  }

  const allFiles = [];
  for (const sub of subDirs) {
    const dir = join(corpusDir, sub);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      allFiles.push({ path: join(dir, entry), name: entry, subdir: sub });
    }
  }

  if (allFiles.length === 0) { console.error("[BLOCKED] No JSON files found."); process.exit(1); }
  console.log(`1. Found ${allFiles.length} artefact JSON files.`);

  // Parse all files
  const artefacts = [];
  const signSet = new Set();
  let totalSides = 0, totalGraphemes = 0, quarantined = 0, validArtefacts = 0;

  for (const { path: fpath, name, subdir } of allFiles) {
    let parsed, errors = [];
    try {
      parsed = JSON.parse(readFileSync(fpath, "utf8"));
      if (!Array.isArray(parsed)) { errors.push("Root is not an array"); }
      else {
        for (const side of parsed) {
          if (!side.id) errors.push("Side missing id");
          else if (!side.graphemes || !Array.isArray(side.graphemes) || side.graphemes.length === 0)
            errors.push(`Side ${side.id}: empty graphemes`);
          else for (const g of side.graphemes) {
            if (g.id && typeof g.id === "string") signSet.add(g.id);
            else errors.push(`Grapheme missing id in ${side.id}`);
          }
        }
        if (!errors.length) {
          totalSides += parsed.length;
          totalGraphemes += parsed.reduce((s, side) => s + (side.graphemes?.length || 0), 0);
        }
      }
    } catch (e) { errors.push(`JSON parse error: ${e.message}`); }

    const valid = errors.length === 0;
    if (valid) validArtefacts++; else quarantined++;
    artefacts.push({ path: fpath, name, subdir, parsed: valid ? parsed : null, valid, errors });
  }

  console.log(`\n2. Parsed ${allFiles.length} files:`);
  console.log(`   Valid artefacts:     ${validArtefacts}`);
  console.log(`   Quarantined/errors:  ${quarantined}`);
  console.log(`   Total inscriptions:  ${totalSides}`);
  console.log(`   Total sign tokens:   ${totalGraphemes}`);
  console.log(`   Distinct sign types: ${signSet.size}`);
  if (quarantined > 0) {
    for (const a of artefacts.filter((a) => !a.valid))
      console.log(`   QUARANTINED: ${a.name}: ${a.errors.join("; ")}`);
  }

  if (dryRun && !promote) {
    console.log("\n[DRY RUN COMPLETE] No database changes made.");
    process.exit(0);
  }
  if (!promote) {
    console.log("\n[INFO] Add --promote to actually import records.");
    process.exit(0);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) { console.error("[ERROR] DATABASE_URL not set."); process.exit(1); }

  const pool = new Pool({ connectionString });
  try {
    console.log("\n3. Connecting to database...");
    await pool.query("SELECT 1");
    console.log("   Connected.");

    // Register source (CISI/Parpola)
    console.log("\n4. Registering source & corpus release...");
    const srcRes = await pool.query(
      `INSERT INTO sources (stable_id, record_scope, status, source_type, citation_key, title, authors, publication_year, publisher_or_journal)
       VALUES ('SRC-CISI-PARPOLA-ET-AL', 'research', 'active', 'catalogue',
               'Parpola1987CISI',
               'Corpus of Indus Seals and Inscriptions (CISI)',
               'Asko Parpola, B. M. Pande, Petteri Koskikallio (eds.)',
               1987,
               'Suomalainen Tiedeakatemia (Finnish Academy of Science and Letters)')
       ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
       RETURNING id`
    );
    const sourceId = srcRes.rows[0].id;
    console.log("   Source registered:", sourceId);

    const relRes = await pool.query(
      `INSERT INTO corpus_releases (stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status, rights_summary, permission_reference)
       VALUES ('REL-CISI-MAYIG-V1', 'research', $1,
               'CISI Corpus - Mayig Open Digitization v1 (Mohenjo-daro M-1..M-199)',
               '2024.1', 'Michael Carlson (github.com/mayig)', 'authorized',
               'MIT License (Copyright 2024 Michael Carlson). Open use, modification, redistribution with attribution.',
               'https://github.com/mayig/indus-valley-script-corpus/blob/main/LICENSE')
       ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [sourceId]
    );
    const releaseId = relRes.rows[0].id;
    console.log("   Release registered:", releaseId);

    // Register release files
    const fileIds = {};
    for (const sub of subDirs) {
      const dir = join(corpusDir, sub);
      if (!existsSync(dir)) continue;
      const jsonFiles = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
      const combined = jsonFiles.map((f) => readFileSync(join(dir, f))).join("");
      const dirSha256 = sha256str(combined);
      const totalBytes = jsonFiles.reduce((s, f) => s + statSync(join(dir, f)).size, 0);
      const fRes = await pool.query(
        `INSERT INTO corpus_release_files (corpus_release_id, original_filename, file_role, media_type, private_storage_locator, sha256, byte_size)
         VALUES ($1, $2, 'source_data', 'application/json', $3, $4, $5)
         ON CONFLICT (corpus_release_id, original_filename) DO UPDATE SET sha256 = EXCLUDED.sha256
         RETURNING id`,
        [releaseId, `${sub}.jsondir`, join(corpusDir, sub), dirSha256, totalBytes]
      );
      fileIds[sub] = fRes.rows[0].id;
      console.log(`   Release file: ${sub} (${jsonFiles.length} files, sha256: ${dirSha256.slice(0,12)}...)`);
    }

    // Create ingestion run
    const runStableId = `RUN-CISI-MAYIG-${Date.now()}`;
    const manifestSha256 = sha256str(JSON.stringify(Object.values(fileIds).sort()));
    const runRes = await pool.query(
      `INSERT INTO corpus_ingestion_runs (stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
       VALUES ($1, 'research', $2, 'staged', '1.0.0', $3)
       RETURNING id`,
      [runStableId, releaseId, manifestSha256]
    );
    const runId = runRes.rows[0].id;
    console.log(`   Ingestion run: ${runStableId}`);

    // Stage raw rows
    console.log("\n5. Staging raw rows...");
    let staged = 0;
    for (const a of artefacts.filter((a) => a.valid)) {
      for (const side of a.parsed) {
        const parsed = parseCisiId(side.id);
        if (!parsed) continue;
        const sub = parseInt(parsed.artefactNum) <= 99 ? "m001_m099" : "m100_m199";
        const fid = fileIds[sub];
        if (!fid) continue;
        const sourceRowKey = `CISI-${side.id}`;
        const rawPayload = JSON.stringify(side);
        await pool.query(
          `INSERT INTO corpus_staging_rows (corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256, parse_status)
           VALUES ($1, $2, $3, $4, $5, 'unparsed')
           ON CONFLICT (corpus_ingestion_run_id, corpus_release_file_id, source_row_key) DO NOTHING`,
          [runId, fid, sourceRowKey, rawPayload, sha256str(rawPayload)]
        );
        staged++;
      }
    }
    console.log(`   Staged ${staged} rows.`);

    // PROMOTE — transactional
    console.log("\n6. Promoting into Phase 1 tables (BEGIN transaction)...");
    await pool.query("BEGIN");

    try {
      // Site
      const siteRes = await pool.query(
        `INSERT INTO sites (stable_id, record_scope, status, canonical_name, country, latitude, longitude)
         VALUES ('SITE-MOHENJO-DARO', 'research', 'active', 'Mohenjo-daro', 'Pakistan', 27.3244, 68.1378)
         ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
         RETURNING id`
      );
      const siteId = siteRes.rows[0].id;

      // Signs
      const allSignIds = [...signSet].sort();
      const signDbIds = {};
      for (const signId of allSignIds) {
        const stableId = `SIGN-CISI-${signId}`;
        const res = await pool.query(
          `INSERT INTO signs (stable_id, record_scope, status, catalogue_namespace, catalogue_code, visual_label)
           VALUES ($1, 'research', 'active', 'cisi_parpola', $2, $3)
           ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
           RETURNING id`,
          [stableId, signId, signId]
        );
        signDbIds[signId] = res.rows[0].id;
      }
      console.log(`   Registered ${allSignIds.length} signs.`);

      // Group sides by artefact
      const artefactMap = new Map();
      for (const a of artefacts.filter((a) => a.valid)) {
        for (const side of a.parsed) {
          const p = parseCisiId(side.id);
          if (!p) continue;
          if (!artefactMap.has(p.cisiId)) artefactMap.set(p.cisiId, []);
          artefactMap.get(p.cisiId).push({ side, parsed: p });
        }
      }

      let promotedObjects = 0, promotedInscriptions = 0, promotedSequences = 0, promotedOccurrences = 0, promotedIdents = 0;

      for (const [cisiId, sides] of Array.from(artefactMap.entries())) {
        const firstSide = sides[0];
        const objectType = inferObjectType(firstSide.side.description);
        const objStableId = `OBJ-CISI-${cisiId}`;

        const objRes = await pool.query(
          `INSERT INTO objects (stable_id, record_scope, status, site_id, object_type)
           VALUES ($1, 'research', 'active', $2, $3)
           ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
           RETURNING id`,
          [objStableId, siteId, objectType]
        );
        const objectId = objRes.rows[0].id;
        promotedObjects++;

        await pool.query(
          `INSERT INTO catalogue_identifiers (record_scope, subject_type, subject_id, catalogue_namespace, identifier_text, source_id, corpus_release_id, source_locator, is_primary)
           VALUES ('research', 'object', $1, 'cisi_parpola', $2, $3, $4, $5, true)
           ON CONFLICT (catalogue_namespace, identifier_text, subject_type) DO NOTHING`,
          [objectId, cisiId, sourceId, releaseId, cisiId]
        );
        promotedIdents++;

        for (const { side, parsed: parsedId } of sides) {
          const surfaceLabel = `face-${parsedId.sideLabel.toLowerCase()}`;
          const insStableId = `INS-CISI-${side.id}`;

          const insRes = await pool.query(
            `INSERT INTO inscriptions (stable_id, record_scope, status, object_id, surface_label)
             VALUES ($1, 'research', 'active', $2, $3)
             ON CONFLICT (object_id, surface_label) DO UPDATE SET updated_at = now()
             RETURNING id`,
            [insStableId, objectId, surfaceLabel]
          );
          const inscriptionId = insRes.rows[0].id;
          promotedInscriptions++;

          const signIds = side.graphemes.map((g) => g.id);
          const sourceTranscription = signIds.join(" ");
          const seqStableId = `SEQ-CISI-${side.id}`;

          const seqRes = await pool.query(
            `INSERT INTO sign_sequences (stable_id, record_scope, status, inscription_id, sequence_basis, sequence_version, is_primary, source_id, corpus_release_id, source_locator, source_transcription, source_token_order, recorded_direction)
             VALUES ($1, 'research', 'active', $2, 'source_transcription', 1, true, $3, $4, $5, $6, 'source_recorded', 'right_to_left')
             ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
             RETURNING id`,
            [seqStableId, inscriptionId, sourceId, releaseId, side.id, sourceTranscription]
          );
          const sequenceId = seqRes.rows[0].id;
          promotedSequences++;

          for (let pos = 0; pos < signIds.length; pos++) {
            const signId = signIds[pos];
            const signDbId = signDbIds[signId];
            if (!signDbId) continue;
            const occStableId = `OCC-CISI-${side.id}-${pos + 1}`;
            await pool.query(
              `INSERT INTO sign_occurrences (stable_id, record_scope, status, sequence_id, sign_id, position_index, source_position_index, identification_status, source_token_text)
               VALUES ($1, 'research', 'active', $2, $3, $4, $4, 'identified', $5)
               ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()`,
              [occStableId, sequenceId, signDbId, pos + 1, signId]
            );
            promotedOccurrences++;
          }
        }
      }

      console.log(`   Objects:             ${promotedObjects}`);
      console.log(`   Inscriptions:        ${promotedInscriptions}`);
      console.log(`   Sign sequences:      ${promotedSequences}`);
      console.log(`   Sign occurrences:    ${promotedOccurrences}`);
      console.log(`   Catalogue IDs:       ${promotedIdents}`);
      console.log(`   Signs registered:    ${allSignIds.length}`);

      // Mark run promoted
      await pool.query(`UPDATE corpus_ingestion_runs SET state='validated', validated_at=now() WHERE id=$1`, [runId]);
      await pool.query(`UPDATE corpus_ingestion_runs SET state='promoted', promoted_at=now() WHERE id=$1`, [runId]);

      await pool.query("COMMIT");
      console.log("\n   TRANSACTION COMMITTED.");

    } catch (err) {
      await pool.query("ROLLBACK");
      console.error("\n[FATAL] Promotion failed - ROLLED BACK.", err.message);
      throw err;
    }

    console.log("\n=== INGESTION COMPLETE ===");
    console.log("Corpus: CISI Mayig Open Digitization (Mohenjo-daro M-1..M-199)");
    console.log("Release: REL-CISI-MAYIG-V1  |  Scope: research");
    console.log("Synthetic DEMO records have NOT been modified.");

  } finally {
    await pool.end();
  }
}

main().catch((err) => { console.error("[FATAL]", err.message); process.exit(1); });
