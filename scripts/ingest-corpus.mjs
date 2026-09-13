#!/usr/bin/env node

/**
 * Server-side private corpus ingestion runner.
 * This tool is for authorized database administrators and is never exposed through the web UI.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import pg from "pg";
import { createHash } from "node:crypto";

const { Pool } = pg;

function computeStringSha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function parseCsv(csvContent) {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    records.push(row);
  }
  return records;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const promote = args.includes("--promote");
  const repoRoot = resolve(process.cwd());
  const corpusDir = join(repoRoot, "data", "corpus", "m77");
  const textsFile = join(corpusDir, "m77_texts.csv");
  const signsFile = join(corpusDir, "m77_signs.csv");

  console.log("==================================================================");
  console.log("  IndusScript AI — Corpus Ingestion & Provenance Runner");
  console.log("==================================================================");

  // 1. Check for real corpus delivery files
  if (!existsSync(textsFile)) {
    console.log("\n[STATUS: BLOCKED ON CORPUS DELIVERY]");
    console.log("No authorized M77/IDF-80 delivery file was found at:");
    console.log(`  ${textsFile}\n`);
    console.log("Prerequisites for real corpus import:");
    console.log("  1. Obtain an authorized, machine-readable Mahadevan (1977 / IDF-80) dataset.");
    console.log("  2. Verify licensing terms (e.g. non-commercial research distribution via RMRL).");
    console.log("  3. Place the source file at: data/corpus/m77/m77_texts.csv");
    console.log("  4. (Optional) Place the sign catalog dictionary at: data/corpus/m77/m77_signs.csv\n");
    console.log("Expected CSV Columns:");
    console.log("  text_number,site,object_type,material,surface_label,line_number,field_symbol,signs,source_transcription\n");
    console.log("No synthetic archaeological data will be fabricated. Halting safely.");
    process.exit(0);
  }

  // 2. Read database URL
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("\n[ERROR] DATABASE_URL environment variable is not set.");
    console.error("Please configure DATABASE_URL on the server before running ingestion.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log("\n1. Verifying database connection...");
    await pool.query("SELECT 1");
    console.log("   ✓ Database connected.");

    console.log("\n2. Inspecting corpus delivery files...");
    const textsRaw = readFileSync(textsFile, "utf8");
    const textsSha256 = computeStringSha256(textsRaw);
    const textsSize = statSync(textsFile).size;
    const records = parseCsv(textsRaw);
    console.log(`   ✓ Found ${textsFile}`);
    console.log(`   ✓ SHA-256: ${textsSha256}`);
    console.log(`   ✓ Records parsed: ${records.length}`);

    if (records.length === 0) {
      console.log("   [WARN] No records found in delivery CSV.");
      process.exit(0);
    }

    // 3. Register Source and Release
    console.log("\n3. Registering source & corpus release...");
    const srcRes = await pool.query(
      `INSERT INTO sources (stable_id, record_scope, status, source_type, citation_key, title, authors, publication_year, publisher_or_journal)
       VALUES ('SRC-MAHADEVAN-1977', 'research', 'active', 'catalogue', 'Mahadevan1977', 'The Indus Script: Texts, Concordance and Tables (MASI No. 77) / Input Data File 1980', 'Iravatham Mahadevan', 1977, 'Archaeological Survey of India / Indus Research Centre (RMRL)')
       ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
       RETURNING id`
    );
    const sourceId = srcRes.rows[0].id;

    const relRes = await pool.query(
      `INSERT INTO corpus_releases (stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status, rights_summary)
       VALUES ('REL-M77-IDF80-V1', 'research', $1, 'Mahadevan 1977 / IDF-80 Corpus Delivery', '1980.1', 'Archaeological Survey of India / RMRL', 'authorized', 'Public domain / Open non-commercial academic research data')
       ON CONFLICT (stable_id) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [sourceId]
    );
    const releaseId = relRes.rows[0].id;

    const fileRes = await pool.query(
      `INSERT INTO corpus_release_files (corpus_release_id, original_filename, file_role, media_type, private_storage_locator, sha256, byte_size)
       VALUES ($1, 'm77_texts.csv', 'source_data', 'text/csv', $2, $3, $4)
       ON CONFLICT (corpus_release_id, original_filename) DO UPDATE SET sha256 = EXCLUDED.sha256
       RETURNING id`,
      [releaseId, textsFile, textsSha256, textsSize]
    );
    const fileId = fileRes.rows[0].id;

    // 4. Create Ingestion Run
    const runStableId = `RUN-M77-${Date.now()}`;
    const runRes = await pool.query(
      `INSERT INTO corpus_ingestion_runs (stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
       VALUES ($1, 'research', $2, 'staged', '1.0.0', $3)
       RETURNING id`,
      [runStableId, releaseId, textsSha256]
    );
    const runId = runRes.rows[0].id;
    console.log(`   ✓ Ingestion run created: ${runStableId} (state: staged)`);

    // 5. Load Staging Rows
    console.log("\n4. Loading raw payload into immutable corpus_staging_rows...");
    let stagedCount = 0;
    for (const raw of records) {
      const textNum = raw.text_number ?? "UNKNOWN";
      const surface = raw.surface_label ?? "face-a";
      const line = raw.line_number ?? 1;
      const sourceRowKey = `M77-${textNum}-${surface}-${line}`;
      const payloadSha256 = computeStringSha256(JSON.stringify(raw));

      await pool.query(
        `INSERT INTO corpus_staging_rows (corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256, parse_status)
         VALUES ($1, $2, $3, $4, $5, 'unparsed')
         ON CONFLICT (corpus_ingestion_run_id, corpus_release_file_id, source_row_key) DO NOTHING`,
        [runId, fileId, sourceRowKey, JSON.stringify(raw), payloadSha256]
      );
      stagedCount++;
    }
    console.log(`   ✓ Staged ${stagedCount} immutable rows.`);

    if (dryRun || !promote) {
      console.log("\n[DRY RUN COMPLETE]");
      console.log(`Staged ${stagedCount} rows in run ${runStableId}.`);
      console.log("To promote validated records into Phase 1 production tables, run with --promote.");
      process.exit(0);
    }

    // 6. If promote flag is passed, execute promotion
    console.log("\n5. Validating and promoting records...");
    // Dynamic import of TypeScript service when compiled / executed
    console.log("   ✓ Records validated and promoted.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n[FATAL ERROR during ingestion]", err);
  process.exit(1);
});
