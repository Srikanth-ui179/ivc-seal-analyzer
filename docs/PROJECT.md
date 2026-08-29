# IndusScript AI

## Purpose

IndusScript AI is a research-oriented computational platform for studying the undeciphered Indus Valley Civilization script. It is being built as durable infrastructure for connecting archaeological records, visual sign catalogues, inscription sequences, reproducible computational work, and later reviewable AI-assisted research.

The project’s immediate purpose is to make source context, uncertainty, and method visible alongside the data being studied.

## What this project does not claim

IndusScript AI does **not** claim to decipher, translate, read, assign a language to, or establish phonetic values for the Indus script. A sign catalogue is visual and descriptive only. Pattern measurements, future model outputs, and hypotheses are not archaeological facts or linguistic conclusions.

No synthetic/demo record may be presented as archaeological evidence.

## Current phase

**Phase 1 — archaeological and catalogue data foundation — complete locally.**

The repository currently includes:

- A Next.js research interface.
- PostgreSQL 16 via Docker Compose.
- A stable Phase 1 archaeological/catalogue schema and source-assertion model.
- Synthetic, visibly marked `DEMO-` fixtures only; no fabricated archaeological data.
- A server-only TypeScript PostgreSQL repository.
- A database-backed Inscription Explorer proof of concept.

## Long-term direction

The intended path is careful and incremental:

1. Build a provenance-aware corpus and visual sign catalogue.
2. Add reproducible computational observations such as corpus statistics and sequence patterns.
3. Add versioned, reviewable model predictions.
4. Support explicit hypotheses and scholarly evaluation without changing source-backed records.

Future computational and AI layers must remain distinct from the Phase 1 archaeological layer.

## Current technology stack

- Next.js 15, React 19, TypeScript, Tailwind CSS.
- PostgreSQL 16 (`postgres:16-alpine`) through Docker Compose.
- `pg` for server-side, parameterized PostgreSQL access.
- pnpm for dependency management; only `sharp` is approved for build scripts through `pnpm-workspace.yaml`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for implementation boundaries and [AI_HANDOFF.md](AI_HANDOFF.md) before making changes.
