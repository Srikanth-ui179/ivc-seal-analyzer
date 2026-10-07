# System Architecture & Technical Specification

### Version: v3.0.0 — Final Capstone Release

---

## 1. Architectural Philosophy & Guiding Principles

The **IVC Seal Analyzer** is architected around one foundational scholarly principle: **Method Before Model**.

Because the Indus Valley script remains undeciphered, the computational architecture enforces strict, non-negotiable boundaries between:

1. **Database Facts:** Verified, catalogued physical and epigraphic records from primary publications (e.g., CISI Vol. 1, Parpola et al., 1987).
2. **Computed Structural Observations:** Empirical mathematical and statistical patterns calculated over immutable transcriptions (e.g., positional frequencies, transition counts, edit distances).
3. **Source Metadata:** Bibliographic, archival, licensing, and methodological provenance.
4. **Scholarly Interpretations:** Theoretical hypotheses, reading-direction conjectures, or comparative linguistic theories.

Under no circumstances does a higher layer mutate, rewrite, or synthesize records in a lower layer.

---

## 2. End-to-End System Architecture

The complete system pipeline flows sequentially from primary archaeological records to the deployed production interface:

```text
Corpus / Source Data (CISI Mohenjo-daro / Carlson 2023 Digitization)
        │
        ▼
PostgreSQL 16 Relational Engine (Docker Compose Local & Neon Serverless Production)
        │
        ▼
Repository / Data-Access Layer (`lib/db/` — Server-Only, Parameterized Queries)
        │
        ▼
Computational Analysis Engine (`lib/db/analysis-repository.ts` — Metrics M1..M11)
        │
        ▼
Research Dashboard & Inscription Explorer (`/research/dashboard`, `/explorer`)
        │
        ▼
Evidence Traceability Layer (`EvidenceObject`, Record Identifiers, Denominators)
        │
        ▼
Evidence-Grounded AI Research Assistant (`lib/ai/` — 14 Controlled Research Tools)
        │
        ▼
Next.js Production Application (App Router, Server Components, Route Handlers)
        │
        ▼
Vercel Edge & Cloud Hosting (`https://ivc-seal-analyzer-two.vercel.app`)
```

---

## 3. Strict Layer Isolation & Research Integrity

### Why the AI Assistant Has No Unrestricted Database Access

In many modern LLM architectures, an agent is given direct access to a database through arbitrary Text-to-SQL generation. In an academic research tool for an undeciphered script, **unrestricted Text-to-SQL is unacceptable** for three critical reasons:

1. **Hallucination of Linguistic Significance:** An unconstrained model writing ad-hoc SQL might group tokens based on unstated linguistic assumptions (e.g., treating frequent pairs as "words" or suffixes), conflating statistical co-occurrence with linguistic structure.
2. **Denominational Distortion:** Without strict, predefined denominators, an LLM might calculate percentages against fluctuating subsets (e.g., ignoring broken seals, conflating complete with incomplete sequences, or calculating probabilities over mixed corpora).
3. **Reproducibility Failure:** Two researchers asking the same question might receive queries with different `WHERE` clauses, invalidating the scientific reproducibility of published findings.

### Controlled Research Tools Architecture

To solve this, the AI Assistant operates exclusively through **14 parameterized, injection-safe research tools** implemented in `lib/ai/research-tools.ts`:

```text
User Question
     │
     ▼
Deterministic Intent Router (`lib/ai/research-router.ts`)
     │ (Regex classification, entity extraction, pronoun resolution)
     ▼
Controlled Parameter Set (e.g., signCode: 'P122', limit: 10)
     │
     ▼
Parameterized Repository Query (`lib/db/analysis-repository.ts`)
     │ (Scoped strictly to DATASET-CISI-MOHENJODARO-V1)
     ▼
Structured Evidence Object (`lib/ai/evidence-format.ts`)
     │ (Typed claims, verified denominators, record IDs, limitations)
     ▼
Prose Synthesis Engine (`lib/ai/assistant-service.ts`)
     │ (Gemini 2.0 Flash or Deterministic Academic Synthesizer)
     ▼
Evidence-Citation UI (`EvidenceCard` with direct links to `/explorer/[id]`)
```

Every response embeds an `EvidenceCard` that links directly to underlying physical seals, allowing researchers to verify every claim against the primary archaeological catalogue.

---

## 4. Application Structure & Module Boundaries

```text
ivc-seal-analyzer/
├── app/                              # Next.js App Router routes & server pages
│   ├── api/research/assistant/       # POST Route Handler for AI research queries
│   ├── explorer/                     # Inscription Explorer & [id] detail page
│   ├── sign-catalogue/               # Visual Sign Catalogue & [id] detail page
│   ├── research/
│   │   ├── assistant/                # Interactive AI Research Assistant interface
│   │   ├── dashboard/                # Computational Research Dashboard (5 SVG charts)
│   │   └── datasets/                 # Dataset & Provenance Register & [id] detail
│   ├── analyze/                      # Comprehensive M1..M11 Analysis Workspace
│   ├── map/                          # Leaflet Archaeological Site Map & Register
│   ├── layout.tsx                    # Root layout with responsive header & metadata
│   ├── page.tsx                      # Landing page with hero, stats, and workflows
│   └── not-found.tsx                 # Branded academic 404 recovery page
├── components/                       # Modular UI components
│   ├── dashboard/                    # SVG charts, Sign, Transition, Motif, & Outlier Explorers
│   ├── features/research-assistant/  # Assistant chat UI, Answer, EvidenceCard, & Stat badges
│   ├── layout/                       # Responsive site-header with mobile drawer navigation
│   └── ui/                           # Badges, buttons, cards, tabs, and layout primitives
├── lib/                              # Core backend and business logic
│   ├── ai/                           # AI assistant pipeline
│   │   ├── assistant-service.ts      # Dual-mode synthesis (Gemini + Deterministic fallback)
│   │   ├── evidence-format.ts        # Typed EvidenceObject interfaces and creators
│   │   ├── gemini-client.ts          # Native Node.js REST client for Gemini 2.0 Flash
│   │   ├── research-router.ts        # Deterministic intent routing & pronoun resolution
│   │   ├── research-tools.ts         # 14 controlled research tools wrapping DB queries
│   │   └── research-types.ts         # Intent types, tool arguments, and assistant responses
│   └── db/                           # Server-only database access layer
│       ├── client.ts                 # Pooled pg client (`server-only`)
│       ├── types.ts                  # TypeScript entity definitions (Sites, Inscriptions, Signs)
│       ├── phase1-repository.ts      # Read queries for primary archaeological entities
│       ├── analysis-repository.ts    # Computational metrics engine (M1 through M11)
│       ├── analysis-types.ts         # Statistical shapes (histograms, transitions, motifs)
│       ├── multisite-repository.ts   # Multi-site comparison engine with gating safeguards
│       └── dataset-version-repository.ts # Frozen dataset snapshot metadata & rosters
├── db/                               # Relational database schema & migrations
│   ├── migrations/                   # 18 ordered SQL migration files (0001..0018)
│   └── seeds/                        # Synthetic demo fixtures (isolated to DEMO scope)
├── docs/                             # Engineering & architectural documentation
│   ├── ARCHITECTURE.md               # This system architecture specification
│   ├── PROJECT.md                    # Project purpose, boundaries, and status
│   ├── ROADMAP.md                    # Milestone progression from V1 to V3.0
│   └── DEVELOPMENT_LOG.md            # Detailed chronological engineering changelog
└── docker-compose.yml                # Local PostgreSQL 16 container definition
```

---

## 5. Relational Database Layer (PostgreSQL 16)

### Core Archaeological Entities

```text
Source ──< archaeological_assertion >── Site | Object | Inscription | Sign Occurrence

Site 1 ──< Object 1 ──< Inscription 1 ──< Sign Sequence 1 ──< Sign Occurrence >── 1 Sign
```

- `sources`: Primary publications, archive records, and license documentation.
- `sites`: Archaeological site datums with published latitude/longitude and coordinate precision.
- `objects`: Physical inscribed artefacts (e.g., square steatite stamp seals, copper tablets).
- `inscriptions`: Discrete inscribed faces/surfaces of an object.
- `signs`: Canonical visual catalogue entries (Parpola `P-001` through `P-417`). Strictly visual; no semantic or phonetic columns.
- `sign_sequences`: Published sign transcriptions, line labels, and layout structures.
- `sign_occurrences`: Individual sign tokens ordered by 1-based index within an inscription sequence.
- `archaeological_assertions`: Source-attributed assertions with certainty ratings, preserving competing scholarly claims without overwriting stable entity records.

### Provenance & Ingestion Staging

Migrations `0010` through `0018` introduce strict ingestion provenance tables:

- `corpus_releases`: Delivered archive metadata, provider details, rights, and license references.
- `corpus_release_files`: Delivered file catalogue with SHA-256 checksums and functional roles.
- `corpus_ingestion_runs`: Tracked ingestion lifecycles (`staged`, `validated`, `promoted`, `rejected`).
- `corpus_staging_rows`: Format-agnostic raw JSONB payloads preserving delivered data.
- `catalogue_identifiers`: External cross-catalogue numbers (e.g., Mahadevan M-77 numbers vs. Parpola CISI numbers).
- `sign_variants`: Visual sign glyph variations linked to canonical signs without semantic claims.

### Frozen Dataset Snapshots

```text
dataset_versions 1 ──< dataset_version_inscriptions >── 1..* Inscriptions
```

All computational analysis and AI research queries are parameterized by immutable dataset snapshots:

- **Active Dataset:** `DATASET-CISI-MOHENJODARO-V1` (UUID: `00000000-0000-4000-8000-000000000181`)
- **Freeze Policy:** Once frozen, a dataset snapshot cannot be altered. Changes require a new version identifier.
- **Relational Joins:** Every analytical query joins explicitly through `dataset_version_inscriptions`, guaranteeing that experimental or staging data never contaminates published research metrics.

---

## 6. Computational Analysis Engine (`lib/db/analysis-repository.ts`)

The computational engine calculates 11 standardized empirical metrics (M1 through M11):

| Metric | Code | Description & Epigraphic Safeguards |
|---|---|---|
| **Coverage** | **M5** | Distribution of token identification certainty (`identified`, `tentative`, `unidentified`, `damaged`). |
| **Frequency** | **M1** | Ranked sign frequencies, corpus shares, and cumulative distributions. |
| **Sequence Length** | **M2** | Summary statistics (min, max, median, mean: 5.60 ± 2.05) and histogram over 1–13 signs. |
| **Positional Skew** | **M3** | Initial-position (Pos 1) frequency. Terminal-position metrics are gated due to unrecorded completeness. |
| **Adjacency** | **M4** | Co-occurrence frequency of adjacent identified tokens ($pos$ and $pos + 1$). Threshold: $\ge 2$. |
| **Positional Profiles** | **M6** | Breakdown across positions 1, 2, 3, 4, 5+ and normalized relative position ($pos / length$). |
| **Transitions** | **M7** | Predecessor ($pos - 1$) and successor ($pos + 1$) matrices with conditional transition probabilities. |
| **Sequence Motifs** | **M8** | Contiguous n-grams of lengths 2, 3, and 4 occurring $\ge 2$ times (e.g., `P000 P122 P385` in 3 seals). |
| **Diversity & Repetition** | **M9** | Corpus uniqueness ratios and identification of signs repeated on a single inscribed face. |
| **Duplicates** | **M10** | Exact identical sequences across distinct seals and near-duplicates (Levenshtein distance = 1). |
| **Structural Outliers** | **M11** | Rule-based outlier flags (length $\ge 10$, multiple internal repeats, hapax legomena density). |

---

## 7. Evidence-Grounded AI Assistant Architecture

### 14 Controlled Research Tools

The assistant exposes 14 strictly typed, parameterized tools in `lib/ai/research-tools.ts`:

1. `getCorpusOverview()`: Overall corpus statistics, active vs reference site counts.
2. `getSignFrequency(signCode?)`: Occurrence counts, corpus share %, initial position counts.
3. `getSignOccurrences(signCode, limit)`: Bounded listing of matching inscriptions with position highlights.
4. `getSignPositionalProfile(signCode)`: Formal distribution across positions 1..5+ and mean relative position.
5. `getTransitions(signCode, targetSign?, direction?)`: Directed predecessors and successors with probabilities.
6. `getMotifs(motifQuery?, length?)`: Contiguous trigrams and 4-grams with complete inscription enumeration.
7. `getDuplicateSequences()`: Exact identical sequence groups across distinct physical seals.
8. `getNearDuplicateSequences()`: Near-duplicate sequence pairs under Levenshtein edit distance = 1.
9. `getOutliers(outlierType?)`: Length outliers ($\ge 10$ signs) and internal repetition anomalies.
10. `getSiteCorpusStatus(siteQuery?)`: Delineation between Mohenjo-daro and reference-only benchmark sites.
11. `getDatasetLimitations()`: Epigraphic and sampling caveats (completeness unrecorded, RTL catalogue order).
12. `checkReadingDirectionAndCompleteness()`: Safeguard explaining terminal position cannot be certified as physical edge.
13. `searchInscriptions(query)`: Exact search by stable identifier or CISI seal ID.
14. `getUnsupportedQueryResponse(topic, targetSubject?)`: Safe handling of translation, meaning, language, or word requests.

### Dual-Engine Synthesis Pipeline

To guarantee uninterrupted availability without requiring mandatory cloud API keys:

1. **Google Gemini 2.0 Flash:** When `GEMINI_API_KEY` is configured in the environment, the server invokes Gemini via a native Node.js REST client (`lib/ai/gemini-client.ts`). The prompt injects the verified `EvidenceObject` and enforces an academic, objective persona strictly forbidding ungrounded speculation.
2. **Deterministic Academic Synthesizer:** If `GEMINI_API_KEY` is missing or fails, the platform seamlessly falls back to a deterministic academic prose generator. This generator synthesizes structured academic prose containing all statistical denominators, findings, and limitation notices directly from the `EvidenceObject`.

---

## 8. Security & Environment Configuration

- **Server-Only Enforcement:** Database connection logic in `lib/db/client.ts` uses `import "server-only"`. Any attempt to import database code into client components produces a compile-time build failure.
- **Zero Client Credential Exposure:** Database URLs and AI API keys are never prefixed with `NEXT_PUBLIC_`.
- **Parameterized SQL:** All queries execute through parameter arrays `$1, $2, ...` in node-postgres. String interpolation in SQL is strictly forbidden.
- **Third-Party Boundary:** Map tiles use OpenStreetMap/CARTO web tile servers loaded dynamically on the client with explicit attribution. Leaflet DOM popup content is assembled using DOM text nodes to prevent cross-site scripting (XSS).
