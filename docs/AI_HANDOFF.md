# AI Agent Handoff

## Current State Snapshot

IndusScript AI is a Next.js research platform with a stable, source-aware PostgreSQL Phase 1 archaeological/catalogue foundation. PostgreSQL 16 runs in Docker Compose. The `/explorer` page is server-rendered and reads Phase 1 data through `lib/db/phase1-repository.ts`; it currently shows a synthetic, clearly labelled `DEMO-INS-0001` fixture. Phase 2 computational analysis and Phase 3 AI/ML tables are not implemented. Do not invent real archaeological data, claim translation/decipherment, or allow future outputs to rewrite Phase 1 records.

## Mandatory reading and working rules

1. **Read every `docs/*.md` file before modifying this project.**
2. Inspect existing code and migrations before proposing architectural changes.
3. Prefer incremental changes over rewrites.
4. Do not replace PostgreSQL without a strong, written technical reason and explicit project-owner approval.
5. Do not upgrade unrelated dependencies or add infrastructure without a demonstrated need.
6. Never claim a command, test, migration, or runtime integration passed unless it was actually run in the active environment.

## Research integrity rules

- Do not introduce translation, decipherment, language, semantic, or phonetic claims for Indus signs.
- Do not invent archaeological data and present it as real.
- Synthetic records must retain `record_scope = demo`, `DEMO-` stable IDs, and visible UI labelling.
- Do not remove the provenance/evidence separation.
- Do not modify Phase 1 archaeological records merely to accommodate an AI hypothesis or model output.
- Computational outputs must remain separate from source-backed archaeological records.
- Model predictions must be versioned, reviewable, uncertainty-aware, and linked to their model/dataset context.
- Hypotheses must remain explicitly labelled hypotheses with evidence links; they are not facts.

## Architectural boundaries

Phase 1 is the stable source-of-truth layer: sources, sites, objects, inscriptions, visual signs, sequences, occurrences, and source assertions. Preserve its foreign keys, scope controls, assertion trigger, and migrations.

Before implementing a new phase, state which boundary the change belongs to:

- **Phase 1:** source-backed archaeological/catalogue record and read UX.
- **Phase 2:** reproducible computational measurements; never archaeological truth.
- **Phase 3:** versioned model runs/predictions and review workflow.
- **Phase 4:** evaluation and research-review tooling.

Do not implement Phase 2 or later merely because a UI placeholder exists.

## Commands

From the repository root in PowerShell:

```powershell
# One-time local environment file; do not commit .env.
Copy-Item .env.example .env

# Start PostgreSQL, wait for health, and apply only unapplied migrations.
.\scripts\db-migrate.ps1

# Check database reachability and migration/demo status.
.\scripts\db-health.ps1

# Verify Phase 1 fixture, foreign keys, polymorphic assertions, and scope controls.
.\scripts\db-verify-phase1.ps1

# Install exact lockfile dependencies and build the approved Sharp native dependency.
pnpm install --frozen-lockfile
pnpm rebuild sharp

# Run and validate the web application.
pnpm dev
pnpm build
```

## Environment variables

Keep these server-side and never commit real values:

- `DATABASE_URL` — server-only PostgreSQL connection string for Next.js.
- `POSTGRES_DB` — local Docker database name.
- `POSTGRES_USER` — local Docker PostgreSQL user.
- `POSTGRES_PASSWORD` — local Docker PostgreSQL password.
- `POSTGRES_PORT` — local host port mapped to PostgreSQL.

Do not rename `DATABASE_URL` to a `NEXT_PUBLIC_` variable.

## Known limitations

- The database currently contains only one synthetic demo data path; no real archaeological corpus has been imported.
- Explorer is the only database-backed frontend proof of concept; other pages retain presentational/mock UI data.
- There are no detail routes, authentication, authoring UI, automated application tests, or production deployment configuration.
- Phase 2/3 schemas and services do not exist.
- There is no claim of sign interpretation, translation, or decipherment.

## Recommended next milestone

Build read-only detail routes for Phase 1 inscriptions, signs, objects, and sites using the existing repository functions. Keep demo labelling, provenance visibility, and database-only archaeological display intact. Do not introduce computational or AI tables in that milestone.
