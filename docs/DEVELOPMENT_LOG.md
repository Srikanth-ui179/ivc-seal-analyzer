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

### Tooling

- Added `pg` and `@types/pg`.
- Configured pnpm `allowBuilds` to approve only `sharp`.
- Project owner reports `pnpm install --frozen-lockfile`, `pnpm rebuild sharp`, and `pnpm dev` succeed locally.

## Planned, not implemented

- Phase 2 dataset versions, analysis runs, and computational observations.
- Phase 3 model runs, predictions, hypotheses, or hypothesis evidence.
- Real archaeological corpus imports.
- Detail pages for individual Phase 1 entities.
- Authentication, authorization, backups, deployment, and production monitoring.
