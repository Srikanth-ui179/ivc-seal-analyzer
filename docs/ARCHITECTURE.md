# Architecture

## Guiding boundary

The stable archaeological/catalogue layer is the source of truth. Computational observations, model predictions, and hypotheses are future layers that may reference Phase 1 records but must never rewrite them.

## Application structure

```text
app/                  Next.js routes and page composition
components/           Reusable layout, UI, and feature components
data/                 Current frontend mock data used outside the DB proof of concept
lib/db/               Server-only PostgreSQL client, typed entities, repositories
db/migrations/        Ordered PostgreSQL migrations
db/seeds/             Synthetic demo fixtures only
db/scripts/           SQL verification checks
scripts/              PowerShell migration, health, and verification runners
docker-compose.yml    Local PostgreSQL 16 service
```

The current frontend uses Next.js App Router. Most pages remain presentational and may use `data/mock-research.ts`; the Inscription Explorer is the Phase 1 database proof of concept and does not substitute mock archaeological records when its database is unavailable.

## Server-side database access

`lib/db/client.ts` imports `server-only`, creates a pooled `pg` client, and reads `DATABASE_URL` only on the server. No client component may import this code, and no database credential may use a `NEXT_PUBLIC_` name.

`lib/db/types.ts` defines typed Phase 1 entities and paginated response shapes. `lib/db/phase1-repository.ts` contains parameterized read queries for sites, objects, inscriptions, signs, sequences, and occurrences. Its list functions support bounded pagination and limited filters.

The Explorer page is dynamic server-rendered and calls `listInscriptions({ scope: "all" })`. It clearly marks rows whose `record_scope` is `demo`.

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

The following are intentionally **not implemented**:

- Computational observations and analysis runs.
- Dataset versions.
- Model runs and predictions.
- AI hypotheses and hypothesis evidence.

When introduced, they must be their own versioned tables and services. They may reference Phase 1 stable IDs and evidence, but must not mutate archaeological facts, source assertions, visual catalogue records, or published sequence alternatives.
