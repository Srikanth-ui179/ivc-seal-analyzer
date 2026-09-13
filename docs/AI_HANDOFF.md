# AI Agent Handoff

## Current State Snapshot

IndusScript AI is a Next.js research platform with a stable, source-aware PostgreSQL Phase 1 archaeological/catalogue foundation and Phase 2 dataset selection, corpus provenance architecture, and corpus ingestion pipelines (migrations `0001`–`0014`). PostgreSQL 16 runs in Docker Compose. The `/explorer` page reads Phase 1 data through `lib/db/phase1-repository.ts`; `/sign-catalogue` reads distinct visual sign forms with corpus occurrence frequencies; `/research/datasets` reads frozen Phase 2 corpus snapshots.

**Real Ingested Corpus:**
- **Corpus Release:** `REL-CISI-MAYIG-V1` (v2024.1, MIT License, Michael Carlson digitization of Parpola et al. CISI).
- **Entities Promoted (`record_scope = 'research'`):** 179 Mohenjo-daro artefacts, 179 inscriptions, 179 sign sequences, 1,003 character-level sign occurrences, 182 distinct Parpola sign types (`cisi_parpola:P-NNN`), and 179 catalogue identifiers.
- **Legacy demo fixture:** Removed by the forward-only cleanup migration. `record_scope = 'demo'` remains an internal integrity/testing capability only and is not exposed by the research UI.
- **Sign ordering:** Strict Right-to-Left source-recorded order without semantic, linguistic, or phonetic claims.

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
- Real corpus records must retain `record_scope = research` and source provenance links.
- Do not remove the provenance/evidence separation.
- Computational outputs must remain separate from source-backed archaeological records.
- Model predictions must be versioned, reviewable, uncertainty-aware, and linked to their model/dataset context.
- Hypotheses must remain explicitly labelled hypotheses with evidence links; they are not facts.

## Architectural boundaries

Phase 1 is the stable source-of-truth layer: sources, sites, objects, inscriptions, visual signs, sequences, occurrences, and source assertions. Preserve its foreign keys, scope controls, assertion trigger, and migrations.

- **Phase 1:** source-backed archaeological/catalogue record and read UX.
- **Phase 2:** frozen dataset selection, authorized corpus delivery/staging provenance, corpus ingestion pipelines, and reproducible computational measurements; never archaeological truth.
- **Phase 3:** versioned model runs/predictions and review workflow.
- **Phase 4:** evaluation and research-review tooling.

## Commands

From the repository root in PowerShell:

```powershell
# One-time local environment file; do not commit .env.
Copy-Item .env.example .env

# Start PostgreSQL, wait for health, and apply only unapplied migrations.
.\scripts\db-migrate.ps1

# Check database reachability and migration status.
.\scripts\db-health.ps1

# Verify Phase 1 foreign keys, polymorphic assertions, scope controls, and absence of persistent demo fixtures.
.\scripts\db-verify-phase1.ps1

# Verify frozen Phase 2 dataset fixture and its scope/immutability controls.
.\scripts\db-verify-phase2-datasets.ps1

# Verify Phase 2 corpus delivery, staging, and provenance integrity rules.
.\scripts\db-verify-corpus-provenance.ps1

# Verify ingestion pipeline staging, state transitions, duplicate preservation, and rollback.
.\scripts\db-verify-ingestion-pipeline.ps1

# Run CISI Corpus Ingestion (dry-run or promote)
.\scripts\cisi-ingest.ps1 -DryRun
.\scripts\cisi-ingest.ps1 -Promote

# TypeScript checks & Next.js production build
pnpm tsc --noEmit
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

- The active research corpus covers 179 Mohenjo-daro artefacts (M-1 through M-199) from the open WIP CISI digitization. It is not the complete multi-site corpus.
- Unrecorded fields (material, exact dimensions, excavation strata) remain NULL rather than fabricated.
- Analysis runs, n-gram positional entropy, co-occurrence statistics, and Phase 3 machine learning models do not exist yet.
- There is no claim of sign interpretation, translation, or decipherment.

## Recommended next milestone

Implement Phase 2 computational measurement modules (e.g. sign frequency distributions, n-gram co-occurrences, positional entropy, and sequence length distributions) backed by frozen dataset versions, strictly separating statistical observations from archaeological facts.
