import "server-only";
import { databaseQuery } from "@/lib/db/client";
import { computeJsonSha256 } from "./checksum";
import type { CorpusReleaseFileInput, CorpusReleaseInput, IngestionRunInput, M77RawRecord, StagedRowInput } from "./types";

export async function ensureCorpusSource(input: {
  stableId: string;
  sourceType: string;
  citationKey: string;
  title: string;
  authors?: string;
  publicationYear?: number;
  publisherOrJournal?: string;
  recordScope?: "research" | "demo";
}): Promise<string> {
  const recordScope = input.recordScope ?? "research";
  const result = await databaseQuery<{ id: string }>(
    `INSERT INTO sources (stable_id, record_scope, status, source_type, citation_key, title, authors, publication_year, publisher_or_journal)
     VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, $8)
     ON CONFLICT (stable_id) DO UPDATE SET title = EXCLUDED.title, updated_at = now()
     RETURNING id`,
    [input.stableId, recordScope, input.sourceType, input.citationKey, input.title, input.authors ?? null, input.publicationYear ?? null, input.publisherOrJournal ?? null]
  );
  return result.rows[0].id;
}

export async function createCorpusRelease(input: CorpusReleaseInput): Promise<string> {
  const result = await databaseQuery<{ id: string }>(
    `INSERT INTO corpus_releases (stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status, received_at, permission_reference, rights_summary, data_dictionary_reference)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (stable_id) DO UPDATE SET release_label = EXCLUDED.release_label, updated_at = now()
     RETURNING id`,
    [
      input.stableId,
      input.recordScope,
      input.sourceId,
      input.releaseLabel,
      input.deliveryVersion,
      input.providerName,
      input.authorizationStatus,
      input.receivedAt ?? new Date(),
      input.permissionReference ?? null,
      input.rightsSummary ?? null,
      input.dataDictionaryReference ?? null,
    ]
  );
  return result.rows[0].id;
}

export async function registerCorpusReleaseFile(input: CorpusReleaseFileInput): Promise<string> {
  const result = await databaseQuery<{ id: string }>(
    `INSERT INTO corpus_release_files (corpus_release_id, original_filename, file_role, media_type, private_storage_locator, sha256, byte_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (corpus_release_id, original_filename) DO UPDATE SET sha256 = EXCLUDED.sha256
     RETURNING id`,
    [input.corpusReleaseId, input.originalFilename, input.fileRole, input.mediaType ?? null, input.privateStorageLocator, input.sha256, input.byteSize ?? null]
  );
  return result.rows[0].id;
}

export async function startIngestionRun(input: IngestionRunInput): Promise<string> {
  const result = await databaseQuery<{ id: string }>(
    `INSERT INTO corpus_ingestion_runs (stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
     VALUES ($1, $2, $3, 'staged', $4, $5)
     ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [input.stableId, input.recordScope, input.corpusReleaseId, input.importerVersion, input.manifestSha256]
  );
  return result.rows[0].id;
}

export async function stageRawRows(
  runId: string,
  fileId: string,
  rawRecords: M77RawRecord[]
): Promise<number> {
  let stagedCount = 0;
  for (const raw of rawRecords) {
    const textNum = raw.text_number ?? "UNKNOWN";
    const surface = raw.surface_label ?? "face-a";
    const line = raw.line_number ?? 1;
    const sourceRowKey = `M77-${textNum}-${surface}-${line}`;
    const payloadSha256 = computeJsonSha256(raw as Record<string, unknown>);

    await databaseQuery(
      `INSERT INTO corpus_staging_rows (corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256, parse_status)
       VALUES ($1, $2, $3, $4, $5, 'unparsed')
       ON CONFLICT (corpus_ingestion_run_id, corpus_release_file_id, source_row_key) DO NOTHING`,
      [runId, fileId, sourceRowKey, JSON.stringify(raw), payloadSha256]
    );
    stagedCount++;
  }
  return stagedCount;
}

export async function getStagedRowsForRun(runId: string): Promise<Array<{ id: string; sourceRowKey: string; rawPayload: M77RawRecord }>> {
  const result = await databaseQuery<{ id: string; source_row_key: string; raw_payload: M77RawRecord }>(
    `SELECT id, source_row_key, raw_payload FROM corpus_staging_rows WHERE corpus_ingestion_run_id = $1 ORDER BY source_row_key`,
    [runId]
  );
  return result.rows.map((r) => ({
    id: r.id,
    sourceRowKey: r.source_row_key,
    rawPayload: r.raw_payload,
  }));
}
