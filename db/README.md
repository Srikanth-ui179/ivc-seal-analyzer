# IndusScript AI database — Phase 1

This directory contains the stable archaeological and visual-catalogue layer plus Phase 2 corpus-provenance infrastructure. It does not contain computational observations, model outputs, translations, linguistic assumptions, or decipherment claims.

## Local setup

1. Install Docker Desktop and ensure it is running.
2. Optionally copy `.env.example` to `.env` and replace the development password.
   The same file includes the server-only `DATABASE_URL` used by the Next.js application.
3. Start PostgreSQL and apply migrations:

   ```powershell
   ./scripts/db-migrate.ps1
   ```

4. Check database health:

   ```powershell
   ./scripts/db-health.ps1
   ```

5. Verify Phase 1 integrity rules:

   ```powershell
   ./scripts/db-verify-phase1.ps1
   ```

6. Verify Phase 2 frozen dataset-version integrity rules:

   ```powershell
   ./scripts/db-verify-phase2-datasets.ps1
   ```

7. Verify Phase 2 corpus delivery, staging, and provenance integrity rules:

   ```powershell
   ./scripts/db-verify-corpus-provenance.ps1
   ```

8. Verify the ingestion pipeline safeguards:

   ```powershell
   ./scripts/db-verify-ingestion-pipeline.ps1
   ```

The development service uses PostgreSQL 16 and listens on `localhost:5432` by default. Credentials default to the development-only values in `.env.example`.

## Application access layer

The server-side TypeScript repository lives in `lib/db/phase1-repository.ts` and `lib/db/dataset-version-repository.ts`. It uses parameterized PostgreSQL queries through `lib/db/client.ts`; neither module may be imported by a Client Component. `DATABASE_URL` must remain server-only and must never use a `NEXT_PUBLIC_` prefix.

## Migration policy

Run migrations through `scripts/db-migrate.ps1`. It records completed files in `schema_migrations`, executes files in lexical order, and skips already-applied migrations. Do not edit a migration after it has been applied to a shared database; add a new numbered migration instead.

## Scope and provenance rules

- `research` records are source-backed archaeological/catalogue records. The user-facing application queries this scope only.
- `demo` remains an internal synthetic-test scope. Persistent legacy fixture rows are removed by `0015_remove_legacy_demo_fixtures.sql`; verification scripts create and roll back their own test rows.
- `archaeological_assertions` preserve source-specific claims without overwriting stable records.
- `(subject_type, subject_id)` is a polymorphic reference. PostgreSQL triggers enforce that the target exists in the declared table and that its scope matches the linked source. Supported subject types: `site`, `object`, `inscription`, `sign_occurrence`, `sign`, `sign_sequence`, `sign_variant`, `object_relationship`.
- Phase 2 and Phase 3 must only reference this layer. They must not update archaeological facts, catalogue forms, or source assertions.

## Phase 2 dataset snapshots and corpus provenance

- **Dataset selection (`0006`–`0009`)**: `dataset_versions` and `dataset_version_inscriptions`. A dataset version is a reproducibility snapshot of selected Phase 1 inscriptions. Membership must match `record_scope`; frozen versions and their membership are immutable.
- **Corpus delivery & staging (`0010`–`0014`)**: `corpus_releases`, `corpus_release_files`, `corpus_ingestion_runs`, `corpus_staging_rows`. Preserves authorized delivery trails and immutable raw payloads prior to Phase 1 reconciliation.
- **External catalogue identifiers & object relations (`0011`)**: `catalogue_identifiers` (polymorphic external IDs) and `object_relationships` (source-backed physical/die relations).
- **Transcriptions & visual sign variants (`0012`)**: `sign_variants`, `sign_variant_assignments`, and extended sequence/occurrence metadata for exact source token preservation.
