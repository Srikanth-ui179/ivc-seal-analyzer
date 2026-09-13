# Development Log

This log distinguishes completed implementation from planned work. “Locally verified” refers to the project owner’s reported local execution unless a command was run in the current agent session.

## Completed

### Frontend foundation

- Created the Next.js/TypeScript/Tailwind frontend foundation.
- Added Home, Analyze, Sign Catalogue, Inscription Explorer, Research/Methodology, and About routes.
- Established a research-oriented UI that distinguishes archaeological records, computational observations, and future AI hypotheses.
- Kept the initial analysis UI explicitly mock-only and avoided translation/decipherment claims.

### Phase 1 database foundation

- Added PostgreSQL 16 Docker Compose development setup.
- Added ordered migrations for extensions, enums, Phase 1 schema, integrity triggers, indexes, and synthetic seed data.
- Implemented tables for sources, sites, objects, inscriptions, signs, sign sequences, sign occurrences, and archaeological assertions.
- Added foreign keys, unique constraints, indexes, timestamps, and demo/research scope controls.
- Added a polymorphic assertion-integrity trigger and same-scope triggers.
- Added synthetic `DEMO-` fixtures only; no archaeological data was fabricated.

### Local database verification

- Added PowerShell migration, health-check, and Phase 1 verification runners.
- Migration runner was corrected to use detached Compose startup, health waiting, and explicit argument arrays.
- Verification runner was corrected to pass `psql -v ON_ERROR_STOP=1` correctly.
- Project owner reports migrations and Phase 1 SQL verification passed locally.

### Server-side access and Explorer proof of concept

- Added a server-only PostgreSQL client using `pg` and `DATABASE_URL`.
- Added typed, parameterized Phase 1 read repositories with pagination and limited filtering.
- Connected `/explorer` to PostgreSQL.
- Project owner reports the local Next.js server connects successfully and Explorer displays `DEMO-INS-0001` with a Demo Data label.
- Added read-only database-backed detail routes for Phase 1 inscriptions, signs, objects, and sites.

### Tooling

- Added `pg` and `@types/pg`.
- Configured pnpm `allowBuilds` to approve only `sharp`.
- Project owner reports `pnpm install --frozen-lockfile`, `pnpm rebuild sharp`, and `pnpm dev` succeed locally.

### Phase 2 — versioned dataset selection

- Added frozen dataset-version records and explicit Phase 1 inscription membership snapshots.
- Added scope and immutability triggers: dataset membership must match demo/research scope, and frozen selections cannot be changed.
- Added a synthetic `DEMO-DATASET-0001` fixture containing only the existing synthetic inscription.
- Added typed server-side reads and a read-only dataset-version catalogue/detail view.
- No analysis runs, computational observations, model predictions, or hypotheses were added.

### Research corpus transition

- Removed the legacy persistent synthetic fixture through a forward-only cleanup migration.
- Updated the research UI and aggregate statistics to read only research-scoped archaeological/catalogue records.
- Retained `record_scope` and transaction-scoped synthetic verification fixtures for integrity testing; no demo record is part of the user-facing corpus.

### Phase 2 — corpus delivery, staging, and provenance foundation

- Added migrations `0010`–`0014` implementing the authorized corpus delivery and provenance architecture:
  - `corpus_releases`, `corpus_release_files`, `corpus_ingestion_runs`, `corpus_staging_rows` for authorized releases and immutable raw row staging.
  - `catalogue_identifiers` for polymorphic external catalogue numbers.
  - `object_relationships` for source-backed archaeological object relationships with self-reference prevention.
  - `sign_variants` and `sign_variant_assignments` for visual variant cataloguing without linguistic/semantic claims.
  - Extended `sign_sequences` and `sign_occurrences` for exact source transcriptions, reading direction, layout, completeness, tokens, and markers.
- Expanded `archaeological_assertions` subject types to include `sign`, `sign_sequence`, `sign_variant`, and `object_relationship` with polymorphic validation and scope isolation.
- Enforced immutability on raw staging rows, terminal ingestion runs (`promoted`/`rejected`), authorized-release requirements on research transcriptions, and strict `research`/`demo` cross-scope boundaries.
- Added comprehensive indexes in migration `0014`.
- Added transaction-scoped verification SQL in `db/scripts/corpus_provenance_verify.sql` and PowerShell runner `scripts/db-verify-corpus-provenance.ps1`.
- Implemented M77 / IDF-80 ingestion infrastructure in `lib/ingestion/` (parser, validator, staging service, transactional promotion service, checksum utilities).
- Created `docs/M77_INGESTION_SPECIFICATION.md` detailing source-provided facts, normalized fields, derived mappings, and unrepresented fields.
- Added private CLI ingestion runner `scripts/ingest-corpus.mjs` and `scripts/corpus-ingest.ps1`.
- Added ingestion pipeline verification SQL `db/scripts/ingestion_pipeline_verify.sql` and runner `scripts/db-verify-ingestion-pipeline.ps1`.
- Confirmed that without authorized delivery files placed at `data/corpus/m77/m77_texts.csv`, the ingestion pipeline halts safely without fabricating data.

### Phase 2 — Real Corpus Ingestion (CISI / Mayig Digitization)

- Researched, verified, and downloaded the MIT-licensed machine-readable Indus script corpus digitized by Michael Carlson from the Corpus of Indus Seals and Inscriptions (CISI, Parpola et al.):
  - Upstream repository: `https://github.com/mayig/indus-valley-script-corpus`
  - License: MIT (Copyright 2024 Michael Carlson)
  - Delivered under `data/corpus/cisi/` (179 artefact JSON files, covering Mohenjo-daro M-1 through M-199).
- Created dedicated CISI JSON ingestion runner `scripts/ingest-cisi-corpus.mjs` and PowerShell wrapper `scripts/cisi-ingest.ps1`.
- Registered source `SRC-CISI-PARPOLA-ET-AL` and corpus release `REL-CISI-MAYIG-V1`.
- Promoted 179 real Mohenjo-daro artefact records, 179 inscriptions, 179 sign sequences, 1,003 character-level sign occurrences, 182 distinct Parpola sign types (`cisi_parpola:P-NNN`), and 179 catalogue identifiers into PostgreSQL under `record_scope = 'research'`.
- Preserved exact Parpola sign ordering (Right-to-Left recorded direction) and raw token representations without semantic/phonetic interpretation.
- Unrecorded fields (material, exact dimensions, excavation strata) remain NULL rather than fabricated.
- Updated Explorer (`/explorer`), Sign Catalogue (`/sign-catalogue`), and detail routes (`/explorer/[id]`, `/objects/[id]`, `/sites/[id]`, `/sign-catalogue/[id]`) to browse, search, and filter real database records while clearly distinguishing `research` from synthetic `demo` fixtures.
- Updated Homepage (`/`) to display live PostgreSQL corpus statistics (179 inscriptions, 182 signs, 1,003 occurrences).
- Updated Research page (`/research`) with dedicated Corpus Provenance section detailing release `REL-CISI-MAYIG-V1`, licensing, and WIP dataset boundaries.

## Planned, not implemented

- Phase 2 analysis runs, n-gram frequencies, and computational observations.
- Phase 3 model runs, predictions, hypotheses, or hypothesis evidence.
- Expansion of corpus to additional sites (Harappa, Lothal, Kalibangan, etc.) as further digitized CISI/M77 data becomes verified and authorized.
- Image and photographic asset integration.
- Authentication, authorization, backups, deployment, and production monitoring.
