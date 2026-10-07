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

### V2.1 — Archaeological site map reliability

- Added the database-backed `/map` route, Leaflet map, and accessible site register for research-scoped archaeological sites with recorded coordinates.
- The map derives corpus/reference-only status and object/inscription counts from repository data. It preserves links to site details and Explorer filtering by `siteId`.
- Coordinates represent published site-level archaeological reference datums. Recorded precision describes the site datum where available; neither map markers nor precision represent individual seal or inscription findspots.
- Registered reference-only sites are source-backed published benchmarks with zero corpus objects and inscriptions. The active corpus site remains determined by current research records rather than hard-coded UI values.
- Popup content now uses text-safe DOM construction and coordinate bounds are validated before marker or viewport use. Invalid coordinate values are omitted from the canvas without breaking the site register.
- The default basemap uses OpenStreetMap tiles with visible OpenStreetMap attribution. Tile availability and terms are external dependencies.

### V2.2 — Computational sign analysis foundation

- Replaced mock analysis prototype with server-rendered, database-backed `/analyze` route parameterized by frozen dataset version snapshots (`lib/db/analysis-repository.ts`, `lib/db/analysis-types.ts`).
- Connected analysis directly to frozen research dataset `DATASET-CISI-MOHENJODARO-V1` (179 inscriptions, 179 primary sequences, 1,003 character occurrences, 182 distinct signs) joining via `dataset_version_inscriptions`.
- Implemented **M5 (Corpus Coverage)**: token identification status coverage (100% identified, 0% tentative/unidentified/damaged in current release) and sequence completeness coverage (100% not_recorded).
- Implemented **M1 (Sign Frequency Distribution)**: primary distribution restricted to identified tokens (top sign P324 with 99 occurrences / 9.87%, P122 with 76 occurrences / 7.58%); separate panel for non-identified coverage.
- Implemented **M2 (Sequence Length Distribution)**: summary statistics (min 1, max 13, median 5, mean 5.60, sample standard deviation 2.16) and complete sequence length frequency histogram. Separated complete vs. incomplete vs. unrecorded subsets.
- Implemented **M3 (Positional Frequencies)**: first-position distribution based on source-recorded position 1 (top initial signs: P324 at 43.02%, P086 at 10.61%). Included epigraphic safeguard stating recorded order is not an inferred reading direction. Gated terminal-position frequency to complete sequences (0 reported due to unrecorded source completeness, with clear research explanation).
- Implemented **M4 (Adjacent Sign-Pair Frequency)**: consecutive positions (`pos` and `pos + 1`), both identified, gap-breaking, threshold ≥ 2 (111 pairs meeting threshold; top pair P122-P385 with 29 occurrences).
- Maintained strict methodological safeguards: empirical counts only, no AI/ML, no decipherment, no phonetic/semantic claims, no computed result storage in database.

### Production hardening (V2.2 post-audit)

- Created and applied idempotent migration `0017_seed_frozen_dataset_v1.sql` to populate `DATASET-CISI-MOHENJODARO-V1` (`00000000-0000-4000-8000-000000000181`) and its 179 research inscription memberships in hosted PostgreSQL.
- Updated `/map` basemap fallback to use open OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), eliminating external API key requirements.
- Added `isValidUuid` guard to detail repository lookups (`getObject`, `getInscription`, `getSign`, `getSignSequence`) ensuring invalid slugs trigger clean 404s rather than database unavailability errors.
- Enhanced `getDatasetVersion` to support both UUID and `stable_id` queries (`WHERE (dv.id::text = $1 OR dv.stable_id = $1)`).

### V2.3 — Advanced computational sign analysis


- Expanded `/analyze` server-rendered research dashboard with 6 advanced computational analysis dimensions parameterized by frozen research dataset `DATASET-CISI-MOHENJODARO-V1` (`00000000-0000-4000-8000-000000000181`).
- Implemented **M6 (Sign Positional Profiles & Normalized Relative Position)**: distribution across positions 1, 2, 3, 4, 5+ and normalized relative position (`pos / length` on sequences of length ≥ 2; mean and sample standard deviation) for signs with ≥ 10 occurrences. Characterizes formal positional clustering (e.g. P324 early mean 0.251, P122 late mean 0.702, P385 terminal-skewed mean 0.948) without assigning grammatical prefix/suffix roles.
- Implemented **M7 (Immediate Sign Transitions: Successors & Predecessors)**: empirical direct adjacency transitions for high-frequency signs (frequency ≥ 20) reporting top predecessors (pos - 1) and successors (pos + 1) with exact transition probabilities conditioned on non-boundary tokens.
- Implemented **M8 (Contiguous Sequence Motifs & Initial Combinations)**: identified recurring contiguous subsequences of lengths 2, 3, and 4 occurring ≥ 2 times across the corpus (44 trigrams, 13 4-grams, 28 initial 2-sign combinations) with occurrence counts, inscription counts, and example identifiers. Re-emphasized methodological constraint that terminal patterns cannot be certified as complete due to unrecorded sequence boundary completeness.
- Implemented **M9 (Sequence Diversity & Internal Sign Repetition)**: corpus-level diversity metrics (160 sequences / 89.4% have 100% unique signs; 19 sequences / 10.6% have duplicate signs; mean diversity ratio 0.983) and isolated 9 signs exhibiting internal repetition within single inscriptions (P268, P324, P145, P147, P378, P000, P009, P154, P205).
- Implemented **M10 (Sequence Duplicates & Near-Duplicates)**: identified 2 exact duplicate sequences across 5 inscriptions (`P000 P122 P385` in 3 inscriptions; `P086 P123 P122 P385` in 2 inscriptions) and 10 near-duplicate sequence pairs differing by Levenshtein edit distance = 1 on sequences of length ≥ 3 (classified by insertion, deletion, or substitution).
- Implemented **M11 (Measurable Structural Outliers)**: mathematical rule-based anomaly detection flagging sequences with length ≥ 10 (>2 SD above mean of 5.60: 8 inscriptions), multiple internal duplicate signs (repeat count ≥ 2: 1 inscription), or high density of corpus-unique hapax legomena signs.
- Maintained strict methodological discipline: empirical descriptive statistics only, no decipherment, no phonetic/semantic claims, no ML clustering as "words", and no database mutation.

### V2.4 — Research dashboard and evidence exploration layer

- Created a dedicated research exploration dashboard at `/research/dashboard` (`components/dashboard/`, `app/research/dashboard/page.tsx`) implementing the research workflow: `EXPLORE → DISCOVER → INSPECT → TRACE BACK TO EVIDENCE`.
- Preserved strict research safeguards and dataset context (`DATASET-CISI-MOHENJODARO-V1`, UUID `00000000-0000-4000-8000-000000000181`, 179 inscriptions, 1,003 sign tokens, 182 sign types).
- Implemented **Overview & Visualizations** (`components/dashboard/dashboard-overview.tsx`):
  - Corpus metrics and curated computational findings.
  - 5 responsive, lightweight visual charts implemented in pure accessible SVG/Tailwind (no heavy 3rd-party charting bundles):
    1. Sign frequency distribution bar chart (top 15 signs).
    2. Sequence length distribution histogram (lengths 1–14 with sample mean marker at 5.60).
    3. Positional skew profiles (early vs. late comparative distribution).
    4. Dominant directional transitions bar chart (observed adjacencies).
    5. Contiguous sequence motifs frequency breakdown.
- Implemented **Sign Explorer** (`components/dashboard/sign-explorer.tsx`):
  - Interactive sign selector (e.g. P324, P122, P086, P385).
  - Empirical metrics: total corpus count, percentage of occurrences, inscription count, initial position count, positional distribution (positions 1..5+), normalized relative position, top predecessors, top successors, and recurring motifs containing the sign.
  - Evidence traceability: complete table of underlying inscriptions containing the target sign, displaying full transcribed sequence with highlighted target token, and direct links to `/explorer/[id]`.
- Implemented **Transition Explorer** (`components/dashboard/transition-explorer.tsx`):
  - Interactive sign-pair selector (e.g. P122 → P385, P324 → P122).
  - Empirical metrics: pair transition count, conditional transition probability relative to the source sign, and total occurrences of both signs.
  - Evidence traceability: complete list of underlying inscriptions containing the exact transition with sequence context and direct links to `/explorer/[id]`. Explicit epigraphic safeguard clarifying transitions represent observed sequence adjacency, not grammatical or syntactic relations.
- Implemented **Motif Explorer** (`components/dashboard/motif-explorer.tsx`):
  - Subsequence filter by motif length: Trigrams (length 3), 4-Grams (length 4), and Initial 2-sign patterns.
  - Evidence traceability: display of every matching inscription as clickable badge pills routing directly to `/explorer/[id]`.
- Implemented **Duplicate & Near-Duplicate Explorer** (`components/dashboard/duplicate-explorer.tsx`):
  - Side-by-side inspection of exact duplicate sequences (e.g. `P000 P122 P385` in 3 inscriptions; `P086 P123 P122 P385` in 2 inscriptions).
  - Near-duplicate sequence comparison under Levenshtein edit distance = 1, categorizing operation type (insertion, deletion, substitution) with side-by-side clickable inscription comparisons.
- Implemented **Structural Outlier Explorer** (`components/dashboard/outlier-explorer.tsx`):
  - Rule-based anomaly viewer across length outliers (length ≥ 10), internal repetition outliers (duplicate signs within sequence), and hapax legomena density.
  - Direct links to `/explorer/[id]` with objective epigraphic descriptions.
- Updated main site navigation (`components/layout/site-header.tsx`), Research overview page (`app/research/page.tsx`), and Computational analysis page (`app/analyze/page.tsx`) with clear navigation paths and entry points to the new dashboard.
- Maintained server-side database access, zero new AI/ML claims, strict frozen dataset scoping, and zero mutations to the frozen corpus.

### V2.5 — Corpus expansion & multi-site research foundation

- **Corpus Investigation & Honest Grounding**: Conducted rigorous review of candidate open machine-readable corpora. Confirmed upstream `mayig/indus-valley-script-corpus` contains only Mohenjo-daro material (`m001_m099`, `m100_m199`). Evaluated alternative community corpora and found zero openly licensed, verified machine-readable transcriptions for Harappa or other sites with unambiguous sign-concordance mappings. In accordance with the project's non-negotiable research rules ("DO NOT invent data; A smaller verified dataset is better than a larger fabricated dataset"), completed V2.5 as the **Multi-Site Dataset Foundation & Provenance Architecture** without fabricating a second site's inscriptions.
- **Source Registry Migration (`0018_source_registry_and_multisite_foundation.sql`)**: Extended PostgreSQL `sources` table to capture archive/repository (`repository_or_archive`), license details (`licence_name`, `licence_url`), corpus scope, archaeological scope, catalogue systems, transcription systems, sign numbering conventions, checksums, and explicit limitations. Backfilled verified bibliographic metadata for `SRC-CISI-PARPOLA-ET-AL`, `SRC-POSSEHL-2002-GAZETTEER`, `SRC-UNESCO-DHOLAVIRA-2021`, and `SRC-ASI-EXCAVATION-REPORTS`.
- **Corpus Sites vs. Reference-Only Sites Epigraphic Boundary**: Formalized distinction between active **Corpus Sites** (sites with verified digitized inscriptions in the frozen dataset) and **Reference-Only Sites** (published benchmark coordinates from Possehl 2002, ASI, and UNESCO with 0 ingested corpus inscriptions). Updated `/sites/[id]` and dashboard to prevent treating reference map coordinates as evidence of corpus presence.
- **Multi-Site Analysis Engine & Comparative Gating (`lib/db/multisite-repository.ts`)**: Built `getMultiSiteReport(datasetVersionId)`. When $\ge 2$ corpus sites exist in a dataset, it evaluates comparative metrics (inscriptions by site, sign occurrences, vocabulary size, length distribution, shared vs. site-specific signs). When $< 2$ corpus sites exist, cross-site comparative metrics are strictly gated to prevent misleading zero-data comparisons, providing a transparent methodological notice instead.
- **Interactive Corpus & Sites Dashboard (`components/dashboard/sites-explorer.tsx`, `/research/dashboard?tab=sites`)**: Added dedicated `🏛️ Corpus & Sites` tab to the computational research dashboard displaying active dataset composition, active corpus sites table with direct links to Explorer, reference benchmark sites roster, and primary source licensing details.
- **Corpus Register Enhancements (`app/research/datasets/`, `app/research/datasets/[id]`)**: Upgraded dataset versioning index and detail views to present full corpus composition, site attribution tables, and bibliographic provenance cards.
- Frozen Dataset Immutability Preserved**: Verified that `DATASET-CISI-MOHENJODARO-V1` (UUID `00000000-0000-4000-8000-000000000181`, 179 inscriptions, 1,003 tokens, 182 distinct signs) remains untouched and strictly frozen.

### V2.6 — Evidence-grounded AI research assistant

- **Architecture Built (`DATA → COMPUTATION → EVIDENCE → AI EXPLANATION`)**: Implemented an evidence-grounded research assistant allowing researchers to query corpus statistics and epigraphic observations through natural language without fabricating claims.
- **Controlled Research Tools (`lib/ai/research-tools.ts`)**: Built 14 parameterized, injection-safe research tools strictly scoped to frozen dataset `DATASET-CISI-MOHENJODARO-V1` (`00000000-0000-4000-8000-000000000181`):
  1. `getCorpusOverview()` (179 seals, 1,003 tokens, 182 signs, 1 corpus site, 9 reference sites).
  2. `getSignFrequency(signCode?)` (P324: 99 occurrences, 9.87%; P122: 76 occurrences).
  3. `getSignOccurrences(signCode, limit)` (matching seals with highlighted signs).
  4. `getSignPositionalProfile(signCode)` (positions 1..5+, mean relative position).
  5. `getTransitions(signCode, targetSign?, direction?)` (top successor P385 with 29 occurrences / 38.2% conditional probability; empirical predecessors verified directly from database).
  6. `getMotifs(motifQuery?, length?)` (top trigram `P000 P122 P385` in 3 seals).
  7. `getDuplicateSequences()` (2 duplicate groups across 5 seals).
  8. `getNearDuplicateSequences()` (10 pairs with Levenshtein distance = 1).
  9. `getOutliers(outlierType?)` (longest sequence: 13 signs in INS-CISI-M-38A / INS-CISI-M-23A; 8 sequences with length $\ge 10$).
  10. `getSiteCorpusStatus(siteQuery?)` (Mohenjo-daro active; Harappa reference-only; comparison held).
  11. `getDatasetLimitations()` (epigraphic caveats, single-site scope).
  12. `checkReadingDirectionAndCompleteness()` (completeness unrecorded; final token not certified physical end).
  13. `searchInscriptions(query)` (search by stable ID or CISI seal ID).
  14. `getUnsupportedQueryResponse(topic, targetSubject?)` (refuses translations, decipherment, meanings, language, or word claims).
- **Deterministic Question Router (`lib/ai/research-router.ts`)**: Implemented intent classification with regex entity extraction and conversational pronoun resolution ("it", "them", "those inscriptions"). Accurately mapped all 15 mandatory test questions and unsupported inquiries (decipherment, translation, language, meaning). Zero arbitrary SQL generation.
- **Structured Evidence Object (`lib/ai/evidence-format.ts`)**: Defined typed evidence format returning dataset metadata, claims, statistical denominators, record identifiers, limitations, and route links.
- **Dual-Mode LLM Integration (`lib/ai/assistant-service.ts`)**: Supports Gemini 2.0 Flash when `GEMINI_API_KEY` is provided, and seamless fallback to deterministic academic evidence synthesis when unconfigured. Strict system prompts enforce research integrity and forbid translation or decipherment claims.
- **Evidence-Citation UI (`components/features/research-assistant/`)**: Reusable components (`research-assistant.tsx`, `answer.tsx`, `evidence-card.tsx`, `evidence-stat.tsx`, `evidence-inscription.tsx`, `limitation-notice.tsx`, `suggested-question.tsx`) displaying structured claims, explicit denominators, and direct links to `/explorer/[id]`.
- **Routes & Navigation (`app/research/assistant/`, `app/api/research/assistant/`)**: Created dedicated assistant page `/research/assistant` and API endpoint `/api/research/assistant`. Updated primary navigation and research hub with Assistant entry points.
- **V2.6 Final Audit & Integrity Hardening**: Fixed repository lookups (`lib/db/phase1-repository.ts`) to resolve both UUID and `stable_id` parameters preventing broken links across explorers and assistant cards; added explicit decipherment intent routing; ensured dynamic outlier claims; verified 100% test pass rate across all 15 research questions, conversational context, unsupported inquiries, and production routes.

## Planned, not implemented

- Phase 2 n-gram directional entropy and information-theoretic metrics requiring physical boundary grounding.
- Phase 3 model runs, predictions, hypotheses, or hypothesis evidence.
- Expansion of corpus to additional sites (Harappa, Lothal, Kalibangan, etc.) as further digitized CISI/M77 data becomes verified and authorized.
- Image and photographic asset integration.
- Findspot-level mapping; available data remains at site-level reference-coordinate granularity.
- Authentication, authorization, backups, deployment, and production monitoring.
