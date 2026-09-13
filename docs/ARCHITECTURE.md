# Architecture

## Guiding boundary

The stable archaeological/catalogue layer is the source of truth. Computational observations, model predictions, and hypotheses are future layers that may reference Phase 1 records but must never rewrite them.

## Application structure

```text
app/                  Next.js routes and page composition
components/           Reusable layout, UI, and feature components
data/                 Current frontend mock data used outside the DB proof of concept
lib/db/               Server-only PostgreSQL client, typed entities, repositories
lib/ingestion/        Server-side corpus delivery, staging, validation, and promotion tooling
db/migrations/        Ordered PostgreSQL migrations
db/seeds/             Synthetic demo fixtures only
db/scripts/           SQL verification checks
scripts/              PowerShell migration, health, verification, and ingestion runners
docker-compose.yml    Local PostgreSQL 16 service
```

The current frontend uses Next.js App Router. Most pages remain presentational and may use `data/mock-research.ts`; the Inscription Explorer and its read-only inscription, sign, object, and site detail routes are database-backed Phase 1 views. They do not substitute mock archaeological records when the database is unavailable.

## Server-side database access

`lib/db/client.ts` imports `server-only`, creates a pooled `pg` client, and reads `DATABASE_URL` only on the server. No client component may import this code, and no database credential may use a `NEXT_PUBLIC_` name.

`lib/db/types.ts` defines typed Phase 1 entities and paginated response shapes. `lib/db/phase1-repository.ts` contains parameterized read queries for sites, objects, inscriptions, signs, sequences, and occurrences. Its list functions support bounded pagination and limited filters.

`lib/db/dataset-version-repository.ts` is the small Phase 2 repository boundary. It reads frozen corpus snapshots only; it does not calculate observations or run models.

The Explorer page is dynamic server-rendered and reads research-scoped records only. Staging rows and internal demo scope records are never exposed through the research UI.

## Local database service

`docker-compose.yml` runs a named PostgreSQL 16 container, `indusscript-ai-postgres`, with a persistent named volume. The workspace is mounted read-only at `/workspace` so `psql` inside the container can execute migrations. The Compose health check uses `pg_isready`.

Migration scripts record completed filenames in `schema_migrations`, run files in lexical/numerical order, and skip already-applied migrations. Do not edit a migration that has been applied to a shared database; add a new ordered migration instead.

## Phase 1 data model

```text
Source ──< archaeological_assertion >── Site | Object | Inscription | Sign occurrence

Site 1 ──< Object 1 ──< Inscription 1 ──< Sign sequence 1 ──< Sign occurrence >── 1 Sign
```

Implemented tables:

- `sources`: bibliographic, catalogue, archive, or other provenance references.
- `sites`: archaeological location records.
- `objects`: physical objects that may carry inscriptions.
- `inscriptions`: discrete inscribed surfaces/faces of an object.
- `signs`: strictly visual/catalogue sign forms; no semantic, language, phonetic, or translation fields.
- `sign_sequences`: versioned source transcriptions, editorial normalizations, or alternative readings.
- `sign_occurrences`: ordered sign positions and identification status within a sequence.
- `archaeological_assertions`: source-specific claims that do not overwrite the stable entity record.

### Provenance and uncertainty

`archaeological_assertions` has a polymorphic `(subject_type, subject_id)` reference. A PostgreSQL trigger validates that the declared subject exists in the appropriate supported table and that the assertion source has matching scope. This preserves competing source-backed assertions rather than flattening them into one asserted truth.

`record_scope` is either `research` or `demo`. Demo rows require `DEMO-` stable identifiers, and PostgreSQL triggers prevent cross-scope links. `record_status`, assertion certainty, sequence basis, and sign identification status retain uncertainty and alternatives explicitly.

## Future-layer separation

### Phase 2 dataset versions

```text
Dataset version 1 ──< dataset_version_inscriptions >── 1 Phase 1 inscription
```

`dataset_versions` records a selection definition, scope, lifecycle state, and freeze time. `dataset_version_inscriptions` records the exact included Phase 1 inscription IDs. A trigger requires matching `record_scope`; therefore a demo dataset cannot contain research inscriptions, or vice versa.

Dataset versions begin as `draft` while membership is assembled. They can be frozen only when they contain at least one inscription. Frozen dataset versions and their membership are immutable: a changed selection requires a new version. They are Phase 2 reproducibility metadata, not archaeological facts.

The read-only dataset catalogue is available at `/research/datasets`.

### Phase 2 corpus delivery, staging, and provenance

```text
Authorized corpus delivery
  → corpus_releases
  → corpus_release_files
  → corpus_ingestion_runs
  → immutable corpus_staging_rows
  → validation/reconciliation
  → Phase 1 production records + provenance
  → QA
  → frozen research dataset
  → reproducible analysis runs
```

Implemented tables (migrations `0010`–`0014`):

- `corpus_releases`: delivery and release metadata, authorization status (`pending`, `authorized`, `restricted`, `withdrawn`), provider details, rights, and licence references.
- `corpus_release_files`: delivered file catalogue with SHA-256 checksums, byte sizes, and functional file roles (`source_data`, `data_dictionary`, `licence_or_permission`, `documentation`, `other`).
- `corpus_ingestion_runs`: tracked ingestion lifecycles (`staged`, `validated`, `promoted`, `rejected`), importer versions, manifest checksums, and transition validations.
- `corpus_staging_rows`: immutable format-agnostic raw delivered payloads (`raw_payload`, `raw_payload_sha256`, `source_row_key`) held in raw JSONB prior to validation/reconciliation into Phase 1 tables.
- `catalogue_identifiers`: polymorphic external catalogue numbers (`subject_type`, `subject_id`, `catalogue_namespace`, `identifier_text`, `is_primary`) for sites, objects, inscriptions, signs, and sign variants.
- `object_relationships`: source-backed archaeological object relationships (`impression_of`, `possible_same_die_as`, `physical_duplicate_of`, `cast_of`, `other_source_described`) with certainty levels and self-reference protection.
- `sign_variants` & `sign_variant_assignments`: visual variant forms linked to canonical catalogue signs via source-backed assignments without assigning semantic, phonetic, or translation meanings.
- Extended `sign_sequences` & `sign_occurrences`: preserves exact source transcriptions, line labels, reading directions, layout types, completeness, and exact source token texts and markers.
- Expanded `archaeological_assertions`: polymorphic subject types expanded to include `sign`, `sign_sequence`, `sign_variant`, and `object_relationship` with strict scope verification.

### Not implemented

The following are intentionally **not implemented**:

- Real archaeological corpus imports or live ingestion execution.
- Computational observations and analysis runs.
- Model runs and predictions.
- AI hypotheses and hypothesis evidence.

When introduced, they must be their own versioned tables and services. They may reference Phase 1 stable IDs and evidence, but must not mutate archaeological facts, source assertions, visual catalogue records, or published sequence alternatives.
