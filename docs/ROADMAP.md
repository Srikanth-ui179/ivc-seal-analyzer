# Roadmap

This roadmap is paced for a student building alongside college work, DSA practice, and AI/ML learning over roughly one year. It prioritizes a small, reliable research foundation over premature model-building.

## Phase 1 — archaeological data foundation

**Status: COMPLETE locally.**

- PostgreSQL 16 Docker development environment.
- Source-aware archaeological/catalogue schema and integrity triggers.
- Synthetic demo fixture policy and verification checks.
- Server-only typed read repository.
- Database-backed Inscription Explorer proof of concept.

## Phase 2 — computational analysis

**Status: in progress. Target: months 3–5.**

- Define versioned corpus/dataset selection. **Implemented in the repository:** frozen, scope-checked Phase 1 inscription snapshots with a read-only catalogue.
- Authorized corpus delivery, staging, and provenance foundation. **Implemented in the repository:** migrations `0010`–`0014`, release metadata, immutable raw staging rows, catalogue identifiers, object relationships, visual sign variants, expanded assertion subjects, and verification suite.
- M77 / IDF-80 corpus ingestion pipeline. **Implemented in the repository:** parser, validator, staging and transactional promotion services, specification (`docs/M77_INGESTION_SPECIFICATION.md`), CLI runner, and verification tests. *Real corpus import is awaiting authorized source file placement at `data/corpus/m77/m77_texts.csv`.*
- Archaeological site map. **Implemented in V2.1:** a Leaflet map and accessible site register for published site-level reference coordinates, coordinate precision where recorded, corpus/reference-only coverage, site details, and Explorer filtering. It does not map individual artefact findspots; map tiles remain a CARTO/OpenStreetMap third-party dependency.
- Computational sign analysis foundation. **Implemented in V2.2:** server-rendered `/analyze` route parameterized by frozen dataset version snapshots, delivering empirical sign frequency distributions, sequence length statistics, first-position and terminal-position frequencies with reading-direction safeguards, adjacent sign-pair frequencies (frequency ≥ 2), and mandatory corpus coverage reporting.
- Advanced computational sign analysis. **Implemented in V2.3:** extended `/analyze` research dashboard with sign positional profiles & normalized relative distributions (M6), transition profiles for high-frequency signs with conditional predecessors and successors (M7), contiguous sequence motifs (length 3 trigrams, length 4 4-grams, initial combinations) with example identifiers (M8), sequence diversity and internal sign repetition metrics (M9), exact duplicate and near-duplicate sequence detection under Levenshtein edit distance (M10), and transparent rule-based structural outlier detection (M11).
- Research dashboard and evidence exploration layer. **Implemented in V2.4:** interactive visual dashboard (`/research/dashboard`) enabling researchers to explore computational patterns and immediately trace them back to underlying inscriptions. Includes 5 responsive SVG charts, interactive Sign Explorer, Transition Explorer, Motif Explorer, Duplicate/Near-Duplicate Explorer, and Structural Outlier Explorer with 100% evidence traceability linking to `/explorer/[id]`.
- Multi-site research foundation & corpus provenance register. **Implemented in V2.5:** extended source provenance schema (`db/migrations/0018_...`), explicit boundary between active Corpus Sites and Reference-Only Benchmark Sites, multi-site analysis engine (`lib/db/multisite-repository.ts`) with comparative metrics gating when $< 2$ corpus sites exist, interactive `🏛️ Corpus & Sites` dashboard tab (`components/dashboard/sites-explorer.tsx`), enhanced dataset register (`/research/datasets`), and complete immutability of `DATASET-CISI-MOHENJODARO-V1`.
- Present computational observations as measurements with methods and uncertainty, never as translations.
- Add tests using transaction-scoped synthetic fixtures or properly sourced records; do not persist demo archaeological records in the research database.


## Phase 3 — AI/ML capabilities

**Status: planned. Target: months 6–9.**

- Learn image annotation, computer-vision evaluation, and sequence-modelling fundamentals.
- Establish data licensing and annotation review workflows before training.
- Add versioned model runs and reviewable predictions.
- Start with narrow, evaluable tasks such as image-region classification or visual-sign retrieval.
- Keep predictions separate from records and require reviewer status/uncertainty.

## Phase 4 — research and evaluation

**Status: planned. Target: months 9–11.**

- Build reproducible evaluation datasets and metrics.
- Support explicitly labelled hypotheses with supporting/challenging evidence.
- Add scholarly review notes, export formats, and methodology documentation.
- Test reliability, provenance coverage, and failure cases before making research claims.

## Phase 5 — deployment and polish

**Status: planned. Target: months 11–12.**

- Harden database backups, environment configuration, and access control.
- Deploy the Next.js app and managed PostgreSQL service.
- Improve responsive exploration, accessibility, loading states, and error reporting.
- Publish a clear limitations statement and contributor/developer documentation.

## Ongoing habits

- Keep weekly work small and testable.
- Maintain DSA and AI/ML study separately from production claims.
- Prefer a documented experiment over a broad but unreproducible feature.
- Do not advance a phase merely because a UI can be demonstrated; advance it when data, methods, and evaluation are defensible.
