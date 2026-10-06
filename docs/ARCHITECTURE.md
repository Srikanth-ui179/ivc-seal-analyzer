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

### Archaeological site map

`/map` is a dynamic, database-backed map of research-scoped archaeological sites. `listSitesForMap` returns site-level coordinates, recorded coordinate precision, and research object/inscription counts. The client-only Leaflet component validates latitude (`-90..90`) and longitude (`-180..180`) before creating a marker; invalid values are excluded from the canvas without preventing the site register from rendering.

The map presents site-level archaeological reference coordinates, not individual artefact or inscription findspots. Coordinate precision, when recorded, describes the published site datum and does not increase the precision of an artefact location. Corpus sites have one or more research records; reference-only sites are published site records with zero corpus objects and inscriptions. The accompanying accessible site register provides the same coordinate, precision, coverage, and site-detail links without requiring map interaction. Site-detail links and the Explorer's `siteId` filter use the site record identifier.

Leaflet is dynamically imported to avoid server rendering browser APIs. The default basemap uses OpenStreetMap, with visible OpenStreetMap attribution; deployments may override the tile URL and attribution through public map environment variables (`NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`). Tile availability and terms remain a third-party dependency. Leaflet popup content is built with DOM text nodes, so database values are never inserted as raw HTML.

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

### Phase 2 computational sign analysis

`/analyze` is a server-rendered analysis workspace parameterized by frozen dataset version snapshots (`lib/db/analysis-repository.ts`, `lib/db/analysis-types.ts`). Every measurement query joins explicitly on `dataset_version_inscriptions` rather than using a broad `record_scope = 'research'` shortcut.

Implemented measurements:
- **M5. Corpus & identification coverage**: token counts and percentages by epigraphic certainty status (`identified`, `tentative`, `unidentified`, `damaged`); sequence counts by source completeness status.
- **M1. Sign frequency distribution**: ranked frequencies and corpus shares for identified tokens; tentative/unidentified/damaged forms monitored in separate visible panels.
- **M2. Sequence length distribution**: summary statistics (min, max, median, mean, sample standard deviation) and frequency histogram; complete and incomplete subsets separated.
- **M3. Positional frequencies**: first-position frequency based on source-recorded `position_index = 1`; terminal-position frequency gated strictly to `source_completeness = 'complete'`. Highlights that catalogue transcription order is not an inferred reading direction.
- **M4. Adjacent sign-pair frequency**: empirical co-occurrence frequency of consecutive identified positions (`pos` and `pos + 1`). Gaps or non-identified tokens break pairs. Filtered by threshold `frequency >= 2`.
- **M6. Sign positional profiles & normalized relative position**: for frequent signs (threshold: total occurrences ≥ 10), reports distribution across positions 1, 2, 3, 4, 5+ and normalized relative position (`position_index / sequence_length` on sequences of length ≥ 2; mean and sample standard deviation). Characterizes formal positional clustering without assigning grammatical prefix/suffix roles.
- **M7. Immediate sign transitions (predecessors & successors)**: for high-frequency signs (total occurrences ≥ 20), reports top immediately preceding signs (pos - 1) and succeeding signs (pos + 1) with transition conditional probabilities over non-boundary positions. Co-occurrence counts reflect recorded transcription adjacency only.
- **M8. Contiguous sequence motifs & initial combinations**: contiguous subsequences of lengths 2, 3, and 4 occurring ≥ 2 times across the corpus, with occurrence counts, inscription counts, and example identifiers. Terminal motifs are explicitly gated/noted as incomplete due to unrecorded sequence completeness.
- **M9. Sequence diversity & internal sign repetition**: corpus-level diversity summary (100% unique-sign sequences vs sequences with repeated signs; mean diversity ratio) and identification of signs occurring multiple times on a single inscribed surface.
- **M10. Sequence duplicates & near-duplicates**: identifies exact identical sequences across multiple inscriptions, as well as near-duplicate sequence pairs differing by Levenshtein edit distance = 1 on sequences of length ≥ 3 (classified by insertion, deletion, or substitution).
- **M11. Measurable structural outliers**: rule-based detection of statistical anomalies (>2 standard deviations above mean length [length ≥ 10], internal duplicate count ≥ 2, or high density of corpus-unique hapax legomena signs).

Boundary constraints: All outputs are empirical observations on transcribed catalogue tokens; no decipherment, phonetic, semantic, or translation claims. Computed results are dynamically evaluated from the frozen dataset and not stored as database records.

### Phase 2 research dashboard & visual exploration layer (V2.4)

`/research/dashboard` provides an interactive visual exploration and evidence-traceability layer on top of the computational analysis engine (`components/dashboard/`, `lib/db/analysis-repository.ts`).

Core architecture and UX flow:
```
Dashboard overview & visualizations
  ↓
Interesting pattern (sign, transition, motif, duplicate, outlier)
  ↓
Pattern detail & relative distribution metrics
  ↓
Underlying inscriptions (complete enumeration with target highlight)
  ↓
Object & archaeological context (/explorer/[id])
  ↓
Site datum & published provenance (/sites/[id], /objects/[id])
```

Interactive exploration modules:
- **Corpus overview & key findings**: summary cards, 5 responsive SVG/Tailwind visualizations (Sign Frequency bar chart, Sequence Length histogram, Positional Skew comparative profile, Dominant Adjacency transitions chart, and Contiguous Motifs frequency breakdown).
- **Sign Explorer**: detailed sign profile (occurrences, corpus %, initial frequency, positional breakdown across positions 1–5+, mean relative position ± SD), frequent predecessors and successors, motifs containing the sign, and the **complete list of underlying inscriptions** containing the selected sign with the sign highlighted in each sequence.
- **Transition Explorer**: directed adjacency transitions (`Sign 1 → Sign 2`), co-occurrence frequencies, conditional probabilities $P(\text{succ} \mid \text{pred})$, and **complete enumeration of underlying inscriptions** with the adjacent pair highlighted in context.
- **Motif Explorer**: contiguous n-grams (Trigrams of length 3, 4-Grams of length 4, and Initial 2-sign prefix-like patterns) with interactive badges linking directly to every matching seal.
- **Duplicate & Near-Duplicate Explorer**: side-by-side comparative inspection of exact sequence duplicate groups (e.g. M-110A, M-175A, M-19A) and Levenshtein edit distance = 1 near-duplicate pairs with direct links to both seals.
- **Structural Outlier Explorer**: rule-based inspection of statistical outliers (length ≥ 10, multiple internal duplicates, hapax legomena density) with transparent criteria and direct links to `/explorer/[id]`.
- **Evidence Traceability Guarantee**: Every computational observation provides direct links to the physical seals and digitized records responsible for that observation.

### Phase 2 multi-site research foundation & provenance register (V2.5)

V2.5 establishes the multi-site computational foundation, enriched source provenance schema, and corpus register without fabricating data or breaking frozen dataset immutability:

- **Source Provenance Schema (`db/migrations/0018_...`)**: Extended `sources` table to capture archive/repository (`repository_or_archive`), license framework (`licence_name`, `licence_url`), corpus scope (`corpus_scope`), archaeological scope (`archaeological_scope`), catalogue system (`catalogue_system`), transcription system (`transcription_system`), sign numbering convention (`sign_numbering_convention`), checksums, limitations, and bibliographic notes.
- **Corpus Sites vs. Reference-Only Sites**: Clarifies the epigraphic boundary between **Corpus Sites** (sites with active, verified inscription sequences in the frozen dataset) and **Reference-Only Sites** (geographic benchmark datums from Possehl 2002, ASI, and UNESCO with published coordinates but 0 ingested corpus sequences). Coordinates on the map or in the database never imply corpus membership.
- **Dynamic Dataset Breakdown (`lib/db/dataset-version-repository.ts`)**: Evaluates site composition and source provenance dynamically via relational joins through `dataset_version_inscriptions`, ensuring `DATASET-CISI-MOHENJODARO-V1` remains permanently frozen and immutable.
- **Multi-Site Analysis Engine & Safeguard (`lib/db/multisite-repository.ts`)**: Implements `getMultiSiteReport()`. If $\ge 2$ corpus sites exist, it computes cross-site metrics (inscription counts, token counts, vocabulary size, length distributions, shared vs. site-specific signs). If $< 2$ corpus sites exist, cross-site comparative statistics are strictly gated and held, with an explicit methodological disclosure explaining that comparative claims require an authorized, verified second site corpus.
- **Corpus & Sites Dashboard View (`components/dashboard/sites-explorer.tsx`)**: Integrates into `/research/dashboard?tab=sites`, providing researchers with full visibility into dataset composition, active corpus sites, reference benchmarks, primary sources, and licensing.
- **Corpus Register & Detail Enhancement (`app/research/datasets/`, `app/research/datasets/[id]`)**: Renders full bibliographic source cards, licensing links, catalogue systems, site breakdown tables, and member inscription rosters.

### Not implemented

The following are intentionally **not implemented**:

- Decipherment, translation, or phonetic prediction.
- Syntactic trees, grammatical parts of speech, or word/phrase identification.
- Directional entropy or information-theoretic metrics requiring un-truncated physical grounding.
- Model runs, embeddings, clustering, and neural network predictions.
- AI hypotheses and hypothesis evidence.
- Fabricated cross-site statistical comparisons (cross-site comparative statistics are held until an authorized second site is ingested and verified).
- Semantic or phonetic assignments.

When introduced in future phases, they must be their own versioned tables and services. They may reference Phase 1 stable IDs and evidence, but must not mutate archaeological facts, source assertions, visual catalogue records, or published sequence alternatives.
