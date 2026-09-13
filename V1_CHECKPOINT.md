# Research-Ready Corpus Explorer V1

## Milestone

**Research-Ready Corpus Explorer V1** is the stopping point for this session.

The application is a provenance-aware, read-only browser for the currently authorized CISI research corpus. It does not decipher, translate, assign a language to, or assign phonetic or semantic values to Indus signs.

## Current corpus and provenance

- **Corpus release:** `REL-CISI-MAYIG-V1` (`v2024.1`).
- **Source:** Corpus of Indus Seals and Inscriptions (CISI), Parpola et al.; digitized by Michael Carlson under the recorded release rights.
- **Scope:** Mohenjo-daro records from the current CISI digitization (`M-1` through `M-199`); this is a documented working subset, not a complete multi-site Indus corpus.
- **Sign namespace:** `cisi_parpola:P-NNN`.
- **Persistent demo data:** removed by `0015_remove_legacy_demo_fixtures.sql`. `record_scope = 'demo'` remains only an internal integrity-testing capability; transaction-scoped verification fixtures are rolled back.

## Final database counts

| Entity | Research count |
| --- | ---: |
| Sources | 1 |
| Corpus releases | 1 |
| Frozen dataset versions | 1 |
| Sites | 1 |
| Objects | 179 |
| Inscriptions | 179 |
| Sign sequences | 179 |
| Sign occurrences | 1,003 |
| Distinct signs | 182 |
| Persistent demo records | 0 |

## Completed functionality

- PostgreSQL 16 migrations through `0015`.
- Stable, source-aware archaeological/catalogue records and scope/provenance integrity checks.
- Corpus delivery, file, staging, external-identifier, source-transcription, sign-variant, and object-relationship provenance infrastructure.
- Private ingestion path and verification safeguards; raw staged payloads are not exposed in the browser.
- Research-only Explorer, inscription/object/site/sign detail routes, sign catalogue, provenance display, and live corpus statistics.
- Frozen research dataset version support for later reproducible Phase 2 work.
- Transaction-scoped verification fixtures; no synthetic record is present in the research UI or persistent database.

## Known limitations

- The active corpus is a bounded CISI/Mohenjo-daro subset, not a complete Indus corpus.
- No corpus images are exposed unless rights permit them.
- Material, dimensions, and excavation/context fields remain absent where the source does not provide them.
- The Analyze page remains an explicitly labelled fixed mock interface; it is not connected to the research corpus and performs no inference.
- No authentication, authoring workflow, production backup policy, or hosted deployment is implemented.

## Explicitly deferred V2 work

- Reproducible analysis-run metadata linked to a frozen research dataset.
- Descriptive measurements only: sign frequency, sequence length, positional distribution, and co-occurrence.
- Research review/export workflows and hosted V1 deployment hardening.

The following remain explicitly out of scope: machine learning, model predictions, hypotheses, embeddings, decipherment, translation, language assignment, and phonetic values.

## Verification commands used

```powershell
.\scripts\db-migrate.ps1
.\scripts\db-verify-phase1.ps1
.\scripts\db-verify-phase2-datasets.ps1
.\scripts\db-verify-corpus-provenance.ps1
.\scripts\db-verify-ingestion-pipeline.ps1
pnpm tsc --noEmit
pnpm run build
git diff --check
```

The database scope verification confirmed zero persistent demo sources, sites, objects, inscriptions, sequences, occurrences, signs, datasets, and releases.

## Exact recommended stopping point

**Stop after documenting this checkpoint.** Do not add another feature, analysis method, or Phase 3 capability. Resume only with a separately approved V2 milestone: reproducible analysis-run metadata for the frozen research dataset.
