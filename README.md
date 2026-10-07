# IVC Seal Analyzer

### An evidence-grounded research platform for computational exploration of the Indus Valley script corpus.

[![Release](https://img.shields.io/badge/Release-v3.0.0--Capstone-blue.svg)](https://github.com/Srikanth-ui179/ivc-seal-analyzer)
[![Status](https://img.shields.io/badge/Status-Complete%20%26%20Verified-success.svg)](https://ivc-seal-analyzer-two.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

**Production Deployment:** [https://ivc-seal-analyzer-two.vercel.app](https://ivc-seal-analyzer-two.vercel.app)

**GitHub Repository:** [https://github.com/Srikanth-ui179/ivc-seal-analyzer](https://github.com/Srikanth-ui179/ivc-seal-analyzer)

**Version:** `v3.0.0` (Final Capstone Release)

---

## 1. Problem Statement & Motivation

The Indus Valley Civilization (c. 2600–1900 BCE) produced thousands of inscribed artefacts—principally miniature steatite stamp seals, terracotta tablets, and copper plates. To this day, the Indus script remains **undeciphered**.

Research into this corpus faces severe structural challenges:
- **Brevity:** The mean sequence length is under 6 signs, lacking the narrative volume of Egyptian hieroglyphs or Mesopotamian cuneiform.
- **Absence of a Multilingual Rosetta Stone:** There are no verified bilingual or multilingual inscriptions.
- **Epigraphic Uncertainty:** Discrepancies exist between competing sign catalogues (e.g., Parpola vs. Mahadevan).
- **Sensationalism & Pseudoscience:** The field is frequently inundated with premature, unverified decipherment claims, subjective phonetic readings, and ideological language assignments.

### Project Motivation: Method Before Model
The **IVC Seal Analyzer** was created to establish a rigorous, open, and reproducible computational research foundation for epigraphists and computer scientists. Instead of rushing to train generative models that fabricate plausible-sounding "translations," this platform implements **Method Before Model**:
1. Anchoring every computational observation in verified archaeological provenance.
2. Reporting explicit mathematical denominators for all statistical findings.
3. Strictly separating empirical observations from speculative interpretations.
4. Providing an evidence-grounded AI research assistant that operates through controlled database tools rather than arbitrary SQL generation or unconstrained text generation.

---

## 2. What the Project Actually Does

The platform transforms raw, digitized archaeological records into an accessible, interactive, and mathematically sound research environment:

- **Primary Corpus Inscription Explorer (`/explorer`):** Search, browse, and filter authentic inscribed seal faces by sign composition, object type, material, or stable identifier.
- **Visual Sign Catalogue (`/sign-catalogue`):** Comprehensive roster of all 182 distinct Parpola signs (`P-001`..`P-417`) featuring positional distribution histograms, mean relative positions, and predecessor/successor matrices.
- **Archaeological Site Map (`/map`):** Interactive geospatial visualization and accessible site register displaying published reference coordinates and distinguishing active corpus sites from geographic benchmark datums.
- **Computational Analysis Workspace (`/analyze`):** Formal workspace detailing empirical metrics **M1 through M11**, including frequency distributions, sequence length statistics, positional skews, transition probabilities, contiguous motifs, and structural outliers.
- **Interactive Research Dashboard (`/research/dashboard`):** Visual exploration suite featuring 5 custom SVG visualizations, interactive Sign Explorer, Transition Explorer, Motif Explorer, Duplicate & Near-Duplicate Explorer, and Structural Outlier Explorer with 100% evidence traceability.
- **Corpus Provenance & Dataset Register (`/research/datasets`):** Transparent provenance tracking displaying immutable dataset definitions, source attributions, licensing, and member inscription rosters.
- **Evidence-Grounded AI Research Assistant (`/research/assistant`):** Natural-language research interface querying corpus statistics and epigraphic observations through 14 controlled, parameterized research tools with interactive citation cards.

---

## 3. Corpus Provenance & Active Research Scope

All computational observations, visualizations, and assistant queries in the production platform are scoped strictly to the immutable frozen research dataset:

- **Dataset Identifier:** `DATASET-CISI-MOHENJODARO-V1` (UUID: `00000000-0000-4000-8000-000000000181`)
- **Primary Source:** *Corpus of Indus Seals and Inscriptions* (CISI, Vol. 1: Collections in India and Pakistan; Parpola, Joshi, & Shah, 1987).
- **Digitization Reference:** Open Community Digitization by Michael Carlson (`REL-CISI-MAYIG-V1`, MIT License).
- **Geographic Scope:** Authentic Mohenjo-daro seals (CISI Volume 1, artefacts M-1 through M-199).
- **Immutability Guarantee:** The dataset is locked in PostgreSQL via trigger constraints. Every analytical query joins explicitly on `dataset_version_inscriptions`.

---

## 4. Authoritative Corpus Baseline & Verified Metrics

The following metrics represent the verified empirical baseline of the platform:

| Analytical Dimension | Empirical Value | Scholarly Definition & Methodological Scope |
|---|---:|---|
| **Primary Inscriptions** | **179** | Discrete inscribed seal faces from Mohenjo-daro |
| **Catalogued Sign Tokens** | **1,003** | Total sign occurrences (100% catalogued with certainty status) |
| **Distinct Sign Types** | **182** | Parpola `P-NNN` visual catalogue forms |
| **Active Corpus Sites** | **1** | Mohenjo-daro (179 inscribed artefacts) |
| **Reference-Only Benchmark Sites** | **9** | Published datums (Harappa, Lothal, Dholavira, etc.; 0 corpus seals) |
| **Most Frequent Sign** | **P324** | **99** occurrences (9.87% corpus share; 43 occurrences at Position 1) |
| **Second Most Frequent Sign** | **P122** | **76** occurrences (7.58% corpus share) |
| **Dominant Directional Transition** | **P122 → P385** | **29** occurrences (**38.2%** conditional transition probability) |
| **Low-Frequency Predecessor** | **P086 → P122** | **1** occurrence in the corpus |
| **Top Recurring Trigram** | `P000 P122 P385` | **3** distinct seals (`M-110A`, `M-174A`, `M-36A`) |
| **Exact Duplicate Sequences** | **2 groups** | 5 distinct physical seals sharing identical sign sequences |
| **Near-Duplicate Pairs** | **10 pairs** | Sequence pairs differing by Levenshtein edit distance = 1 |
| **Sequence Length Range** | **1–13 signs** | Mean: 5.60 ± 2.05 signs (Median: 5.0 signs) |
| **Longest Sequences** | **13 signs** | Inscriptions `INS-CISI-M-38A` and `INS-CISI-M-23A` |

### Categorization of Research Data

To prevent misleading claims, the platform strictly separates all data into four distinct epistemic categories:

1. **DATABASE FACTS:** Directly observed and verified archaeological records (e.g., physical object dimensions, steatite material, catalogue numbers, recorded sign tokens).
2. **COMPUTED STRUCTURAL OBSERVATIONS:** Algorithmic and statistical measurements calculated across immutable sequence strings (e.g., positional frequencies, transition probabilities, edit distances).
3. **SOURCE METADATA:** Bibliographic citations, digitization checksums, archive repository records, and licensing information.
4. **SCHOLARLY INTERPRETATIONS:** Reading direction theories, comparative linguistic hypotheses, or iconographic discussions.

> **Critical Methodological Notice:** Structural frequency does **not** imply linguistic meaning. An adjacent sign pair with high conditional probability (such as `P122 → P385`) represents an empirical statistical regularity in recorded sign transcription order. It does **not** identify a grammatical compound, word boundary, suffix, or semantic concept.

---

## 5. Research Methodology & Safeguards

The platform adheres to explicit research safeguards:

```text
       ┌────────────────────────────────────────────────────────┐
       │                 RESEARCH SAFEGUARDS                    │
       ├────────────────────────────────────────────────────────┤
       │  • Analyzes recorded visual sign sequences ONLY.       │
       │  • Does NOT decipher the Indus script.                 │
       │  • Does NOT assign phonetic or pronunciation values.    │
       │  • Does NOT claim semantic meanings or definitions.    │
       │  • Does NOT identify words, morphemes, or grammar.     │
       │  • Does NOT classify language family affiliations.     │
       └────────────────────────────────────────────────────────┘
```

1. **Source-Recorded Transcription Sequences:** Signs are recorded and analyzed in catalogue transcription order (Right-to-Left convention as recorded by Parpola). Position 1 represents the first transcribed token, not a proven cognitive starting point.
2. **Frozen Dataset Model:** Analysis runs strictly against versioned, scope-checked snapshot tables (`dataset_versions`, `dataset_version_inscriptions`), preventing data drift.
3. **Parameterized Repository Queries:** All mathematical operations execute via deterministic SQL queries and TypeScript functions with explicit sample sizes ($N$) and standard deviations ($SD$).
4. **Complete Evidence Traceability:** Every metric, chart, and AI summary provides direct links back to the primary archaeological inscriptions and seal records.
5. **Epigraphic Distinction of Sites:** Mohenjo-daro is an active corpus site. Other major Indus cities (Harappa, Lothal, Dholavira, etc.) are catalogued strictly as geographic reference benchmarks. Cross-site statistical comparisons are held until an authorized second-site corpus is ingested.

---

## 6. Computational Analysis Engine (Metrics M1–M11)

The platform implements 11 standardized empirical metrics in `lib/db/analysis-repository.ts`:

- **M1 — Sign Frequency Distribution:** Absolute occurrence counts, corpus share percentage, and cumulative distribution across identified sign types.
- **M2 — Sequence Length Distribution:** Summary statistics (min, max, median, mean: 5.60 ± 2.05) and histogram for inscriptions ranging from 1 to 13 signs.
- **M3 — Positional Frequencies:** Absolute counts at initial position (Pos 1) and terminal position (gated due to unrecorded sequence completeness).
- **M4 — Adjacent Sign-Pair Frequencies:** Empirical co-occurrence frequency of consecutive identified tokens ($pos$ and $pos + 1$) occurring $\ge 2$ times.
- **M5 — Corpus & Identification Coverage:** Epigraphic certainty breakdown across tokens (`identified`: 100%, `tentative`, `unidentified`, `damaged`).
- **M6 — Sign Positional Profiles & Normalized Relative Distribution:** Detailed distribution across positions 1, 2, 3, 4, 5+ and mean normalized relative position ($pos / length$).
- **M7 — Immediate Sign Transitions:** Predecessor ($pos - 1$) and successor ($pos + 1$) matrices with conditional transition probabilities $P(\text{succ} \mid \text{pred})$.
- **M8 — Contiguous Sequence Motifs:** Recurring n-grams of lengths 2, 3, and 4 occurring $\ge 2$ times across the corpus.
- **M9 — Sequence Diversity & Internal Repetition:** Ratio of distinct signs to total length per sequence and detection of internal sign repetitions on single seal faces.
- **M10 — Sequence Duplicates & Near-Duplicates:** Identification of exact identical sequences across distinct physical seals and near-duplicate pairs under Levenshtein edit distance = 1.
- **M11 — Measurable Structural Outliers:** Rule-based detection of statistical outliers: sequence length $\ge 10$ signs, multiple internal duplicates, or high hapax legomena density.

---

## 7. Evidence-Grounded AI Research Assistant

The AI Research Assistant (`/research/assistant`) allows scholars and students to explore corpus patterns using natural language without the risk of fabricated claims.

### Why the Assistant Has No Arbitrary SQL Access
In traditional LLM-over-database implementations, the model generates arbitrary SQL queries. In research on an undeciphered script, arbitrary Text-to-SQL is hazardous because:
- The model might write queries based on unstated linguistic assumptions (e.g., treating frequent pairs as words).
- It can invent arbitrary filters, distorting statistical denominators.
- Non-deterministic SQL generation prevents scientific reproducibility.

### Controlled Research Tools Architecture
The AI assistant operates exclusively through **14 parameterized research tools** (`lib/ai/research-tools.ts`):
1. `getCorpusOverview()`: Overall dataset state, active vs reference site counts.
2. `getSignFrequency(signCode?)`: Exact occurrence counts, corpus percentages, and initial-position counts.
3. `getSignOccurrences(signCode, limit)`: Bounded listing of matching inscriptions with highlighted sign positions.
4. `getSignPositionalProfile(signCode)`: Formal distribution across positions 1..5+ and mean relative position.
5. `getTransitions(signCode, targetSign?, direction?)`: Predecessor and successor frequencies and conditional probabilities.
6. `getMotifs(motifQuery?, length?)`: Contiguous trigrams and 4-grams with complete inscription enumeration.
7. `getDuplicateSequences()`: Exact identical sequence groups across distinct physical seals.
8. `getNearDuplicateSequences()`: Near-duplicate sequence pairs under Levenshtein edit distance = 1.
9. `getOutliers(outlierType?)`: Length outliers ($\ge 10$ signs) and multiple internal repetition outliers.
10. `getSiteCorpusStatus(siteQuery?)`: Delineation between Mohenjo-daro and reference-only sites.
11. `getDatasetLimitations()`: Epigraphic and sampling caveats (completeness unrecorded, RTL catalogue order).
12. `checkReadingDirectionAndCompleteness()`: Safeguard explaining terminal position cannot be certified as physical edge.
13. `searchInscriptions(query)`: Exact search by stable ID or CISI seal ID.
14. `getUnsupportedQueryResponse(topic, targetSubject?)`: Safe handling of translation, meaning, language, or word requests.

### Responsible AI Implementation Details
- **Deterministic Intent Classification:** Queries are mapped to tools via regex and entity extraction in `lib/ai/research-router.ts`.
- **Pronoun & Context Resolution:** Resolves conversational references ("it", "them", "those inscriptions") based on session state.
- **Explicit Refusal Safeguards:** Requests asking to "translate this seal", "what language is this", or "what does sign P122 mean" are immediately intercepted with an academic refusal explaining why the script cannot be deciphered or translated.
- **Structured Evidence Cards:** Every response embeds an interactive `EvidenceCard` detailing the claim, verified denominator, dataset badge, methodological caveats, and direct links to `/explorer/[id]`.
- **Dual-Mode Synthesis Pipeline:** Invokes Google Gemini 2.0 Flash via server-side REST API when `GEMINI_API_KEY` is present. If unconfigured or unavailable, it seamlessly falls back to a deterministic academic evidence synthesizer.

---

## 8. System Architecture Overview

```text
Corpus / Source Data (CISI Vol. 1, Parpola et al., 1987 / Carlson 2023)
        │
        ▼
PostgreSQL 16 Relational Engine (Docker Compose Local & Neon Serverless Cloud)
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
Evidence-Grounded AI Research Assistant (`lib/ai/` — 14 Controlled Tools, Router)
        │
        ▼
Next.js Production Application (App Router, Server Components, Route Handlers)
        │
        ▼
Vercel Edge & Cloud Hosting (`https://ivc-seal-analyzer-two.vercel.app`)
```

- **Server-Only Boundary:** Database access in `lib/db/client.ts` enforces `import "server-only"`. No database credentials or client secrets are exposed to the browser.
- **Injection Safety:** All queries use parameterized SQL arrays (`$1, $2, ...`). Zero raw string interpolation.
- **Third-Party Isolation:** Map tile rendering uses OpenStreetMap/CARTO web tiles dynamically imported on the client, isolating external dependencies from server rendering.

---

## 9. Technology Stack

- **Frontend & App Framework:** Next.js 15 (App Router, React Server Components, Route Handlers)
- **UI & Styling:** React 19, Tailwind CSS, Lucide Icons
- **Interactive Mapping:** Leaflet 1.9 (dynamically imported with OpenStreetMap/CARTO tiles)
- **Programming Language:** TypeScript 5 (Strict Mode, 100% typechecked)
- **Database:** PostgreSQL 16 (`postgres:16-alpine` via Docker Compose; Neon Serverless in production)
- **Database Client:** `pg` (node-postgres with connection pooling)
- **AI Integration:** Google Gemini 2.0 Flash REST API / Deterministic Academic Synthesizer
- **Package Manager:** pnpm
- **Deployment & Hosting:** Vercel Global Edge Network
- **Version Control:** Git & GitHub

---

## 10. Project Structure

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
│   ├── layout.tsx                    # Root layout with responsive navigation header
│   ├── page.tsx                      # Landing page with hero, statistics, and workflows
│   └── not-found.tsx                 # Branded academic 404 recovery page
├── components/                       # Reusable React components
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
│   ├── ARCHITECTURE.md               # Detailed system architecture specification
│   ├── PROJECT.md                    # Project purpose, boundaries, and status
│   ├── ROADMAP.md                    # Milestone progression from V1 to V3.0
│   └── DEVELOPMENT_LOG.md            # Detailed chronological engineering changelog
├── .env.example                      # Documented environment variable template
├── docker-compose.yml                # Local PostgreSQL 16 container definition
└── package.json                      # Project metadata, scripts, and dependencies
```

---

## 11. Explicit Research Limitations

The platform openly documents its analytical limitations as deliberate research safeguards:

1. **Sample Scope:** The machine-readable corpus is currently limited to the verified Mohenjo-daro dataset (179 seals, CISI Vol. 1, M-1..M-199). It is not the entire Indus corpus.
2. **Single Corpus Site:** While 9 published reference sites are catalogued for geographic context, Mohenjo-daro is currently the only site with digitized inscription data. Cross-site comparative statistics remain gated until an authorized second-site corpus is ingested.
3. **Transcription Order:** Transcriptions follow the source-recorded Right-to-Left convention. This reflects catalogue editorial recording order, not an established physical reading direction.
4. **Source Completeness:** Physical damage and broken seal boundaries are not systematically encoded in the source digitization. Consequently, terminal tokens cannot be certified as physical sequence boundaries.
5. **Tool-Bound AI Responses:** The AI assistant is constrained strictly to data retrievable through the 14 research tools; it cannot perform open-ended external reasoning or speculate on historical narratives.
6. **Provider Fallback:** In the absence of a `GEMINI_API_KEY`, the assistant operates via deterministic academic evidence synthesis without degradation in statistical accuracy.

---

## 12. Local Development & Setup

### Prerequisites
- Node.js 20+ and `pnpm`
- Docker and Docker Compose (for local PostgreSQL 16)
- Git

### Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/Srikanth-ui179/ivc-seal-analyzer.git
cd ivc-seal-analyzer

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start local PostgreSQL 16 container
docker compose up -d

# 5. Run database migrations (applies 0001..0018)
pnpm run db:migrate

# 6. Start Next.js development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (`.env`)

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (`postgresql://indusscript:indusscript_dev_only@localhost:5432/indusscript_ai`) |
| `POSTGRES_DB` | Dev only | Database name for local Docker container (`indusscript_ai`) |
| `POSTGRES_USER` | Dev only | Database username for local Docker container (`indusscript`) |
| `POSTGRES_PASSWORD` | Dev only | Database password for local Docker container (`indusscript_dev_only`) |
| `POSTGRES_PORT` | Dev only | Database host port (`5432`) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for assistant prose synthesis. If omitted, uses deterministic synthesis. |

### Development Commands

```bash
pnpm dev              # Start Next.js development server on port 3000
pnpm build            # Build production Next.js application
pnpm start            # Start production server
pnpm lint             # Run ESLint validation
pnpm tsc --noEmit     # Run TypeScript typecheck in strict mode
```

---

## 13. Final Release Information

- **Version:** `v3.0.0`
- **Milestone:** Final Capstone Release & Presentation Package
- **Status:** Complete, Verified, and Locked
- **Production URL:** [https://ivc-seal-analyzer-two.vercel.app](https://ivc-seal-analyzer-two.vercel.app)
- **GitHub URL:** [https://github.com/Srikanth-ui179/ivc-seal-analyzer](https://github.com/Srikanth-ui179/ivc-seal-analyzer)
- **Corpus Scope:** `DATASET-CISI-MOHENJODARO-V1` (179 inscriptions, 1,003 tokens, 182 distinct signs)
- **Core Capabilities:** Inscription Explorer, Visual Sign Catalogue, Archaeological Site Map, Computational Metrics M1–M11, Research Dashboard with 5 SVG Visualizations, Multi-Site Provenance Gating, and Evidence-Grounded AI Research Assistant.
- **Engineering Status:** Engineering development is officially complete. All functional and non-functional requirements have been verified.

---

## 14. License & Attribution

- **Application Code & Algorithms:** MIT License © 2026 Srikanth / IVC Seal Analyzer Contributors.
- **Corpus Data:** MIT License (Michael Carlson, *Indus Valley Script Corpus*, based on *Corpus of Indus Seals and Inscriptions*, Vol. 1, Parpola et al., 1987).
- **Map Cartography:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, tiles courtesy of [CARTO](https://carto.com/).
