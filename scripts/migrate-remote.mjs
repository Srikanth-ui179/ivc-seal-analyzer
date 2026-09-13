#!/usr/bin/env node
/**
 * Cross-platform remote PostgreSQL migration runner.
 *
 * Applies migrations 0001 through 0015 to the PostgreSQL database specified
 * by the DATABASE_URL environment variable. Tracks applied migrations in
 * schema_migrations table, consistent with local migration scripts.
 *
 * Usage:
 *   node scripts/migrate-remote.mjs
 *   DATABASE_URL="postgres://..." node scripts/migrate-remote.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "db", "migrations");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[ERROR] DATABASE_URL environment variable is required.");
  console.error("Provide DATABASE_URL or configure it in your environment.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });

  try {
    console.log("Connecting to PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully.\n");

    // Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Read and sort all migration files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration files in db/migrations/.\n`);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      // Check if migration is already applied
      const checkRes = await client.query(
        "SELECT 1 FROM schema_migrations WHERE version = $1",
        [file]
      );

      if (checkRes.rows.length > 0) {
        console.log(`[SKIPPED] ${file} (already applied)`);
        skippedCount++;
        continue;
      }

      console.log(`[APPLYING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      const startTime = Date.now();
      try {
        // Execute the migration script
        await client.query(sqlContent);

        // Record in schema_migrations
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file]
        );

        const duration = Date.now() - startTime;
        console.log(`[SUCCESS]  ${file} (${duration}ms)`);
        appliedCount++;
      } catch (err) {
        console.error(`\n[FAILED]   Migration ${file} failed:`);
        console.error(err.message);
        throw err;
      }
    }

    console.log("\n==========================================");
    console.log(`Migration complete: ${appliedCount} applied, ${skippedCount} skipped.`);
    console.log("==========================================");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\n[FATAL] Migration execution aborted.", err);
  process.exit(1);
});
