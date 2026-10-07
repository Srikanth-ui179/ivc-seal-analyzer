# IVC Seal Analyzer

### IndusScript AI — Evidence-Grounded Research Platform for the Indus Valley Script

**Live Deployment:** [https://ivc-seal-analyzer-two.vercel.app](https://ivc-seal-analyzer-two.vercel.app)

---

## 1. Overview

**IVC Seal Analyzer** is an open, evidence-grounded research platform for the computational and epigraphic study of machine-readable records of the undeciphered Indus Valley script.

The platform provides reproducible computational tools, interactive visualizations, and an evidence-grounded natural-language research interface grounded strictly in verified archaeological records.

> **Method Before Model:** The Indus script remains undeciphered. This platform does **not** claim decipherment, translation, phonetic values, or linguistic readings. It explicitly separates directly observed archaeological data from computational observations and interpretive hypotheses.

---

## 2. Active Research Corpus & Scope

All computational observations and assistant queries are scoped strictly to the immutable frozen research dataset:

- **Dataset Identifier:** `DATASET-CISI-MOHENJODARO-V1` (UUID: `00000000-0000-4000-8000-000000000181`)
- **Corpus Source:** Corpus of Indus Seals and Inscriptions (CISI, Parpola et al., 1987) / Open Community Digitization by Michael Carlson (`REL-CISI-MAYIG-V1`, MIT License)
- **Geographic Scope:** Mohenjo-daro artefacts (CISI Volume 1, M-1 through M-199)

### Verified Database Metrics (V2.6 Verified Baseline)

| Analytical Dimension | Verified Empirical Count | Scope / Definition |
|---|---:|---|
| **Inscriptions** | 179 | Primary inscribed seal faces |
| **Sign Tokens (Occurrences)** | 1,003 | 100% catalogued with identification status |
| **Distinct Sign Vocabulary** | 182 | Parpola `P-NNN` catalogue types |
| **Active Corpus Sites** | 1 | Mohenjo-daro (179 inscribed artefacts) |
| **Reference-Only Benchmark Sites** | 9 | Published datums (Harappa, Dholavira, Lothal, etc.; 0 corpus seals) |
| **Dominant Sign** | P324 | 99 occurrences (9.87% corpus share; 43 at Pos 1) |
| **Second Sign** | P122 | 76 occurrences (7.58% corpus share) |
| **Top Directional Transition** | P122 → P385 | 29 occurrences (38.2% conditional probability) |
| **Top Recurring Trigram** | `P000 P122 P385` | 3 seals (`M-110A`, `M-174A`, `M-36A`) |
| **Exact Duplicate Sequences** | 2 groups | 5 distinct physical seals |
| **Near-Duplicate Pairs (Levenshtein = 1)** | 10 pairs | Single substitution, insertion, or deletion |
| **Longest Sequence** | 13 signs | `INS-CISI-M-38A` and `INS-CISI-M-23A` |
| **Mean Sequence Length** | 5.60 ± 2.05 | Median: 5.0 signs · Range: 1–13 signs |

---

## 3. Architecture & Principles

The system is structured across four strictly isolated layers:

```text
1. DATA (PostgreSQL 16)
   Stable archaeological entities: sources, sites, objects, inscriptions, signs, sequences, occurrences.
        │
        ▼
2. COMPUTATION (lib/db/analysis-repository.ts)
   Empirical measurements: coverage (M5), frequency (M1), length (M2), positional skew (M3),
   adjacency (M4), profiles (M6), transitions (M7), motifs (M8), diversity (M9), duplicates (M10), outliers (M11).
        │
        ▼
3. EVIDENCE (lib/ai/evidence-format.ts)
   Structured EvidenceObject: typed claim, statistical denominators, record identifiers, limitations, explorer links.
        │
        ▼
4. EXPLANATION (lib/ai/assistant-service.ts & UI)
   Academic prose synthesis grounded exclusively in verified evidence. Zero ungrounded speculation.
```

---

## 4. Research Capabilities

1. **Inscription Explorer (`/explorer`):** Search, browse, and filter the 179 Mohenjo-daro seals by sign presence, object type, material, or stable identifier.
2. **Sign Catalogue (`/sign-catalogue`):** Comprehensive roster of all 182 distinct Parpola signs with rich positional distribution profiles, mean relative position, top predecessors, top successors, and occurrence listings.
3. **Archaeological Site Map (`/map`):** Interactive Leaflet map displaying published archaeological coordinates, coordinate precision, and clear distinction between active corpus sites and reference-only geographic benchmarks.
4. **Computational Analysis Workspace (`/analyze`):** Complete methodological workspace detailing metrics M1 through M11, frequency histograms, sample standard deviations, and explicit denominators.
5. **Research Dashboard (`/research/dashboard`):** Visual exploration suite featuring 5 responsive SVG visualizations, interactive Sign Explorer, Transition Explorer, Motif Explorer, Duplicate & Near-Duplicate Explorer, and Structural Outlier Explorer.
6. **Dataset & Provenance Register (`/research/datasets`):** Transparent provenance tracking displaying immutable dataset snapshot definitions, source attribution, licensing, and member inscription rosters.
7. **Evidence-Grounded AI Research Assistant (`/research/assistant`):** Natural-language research interface querying corpus statistics and epigraphic observations through 14 controlled, parameterized research tools.

---

## 5. Evidence-Grounded AI Approach

The AI assistant is built on strict research-integrity safeguards:

- **No Arbitrary SQL:** User questions are mapped deterministically via [research-router.ts](lib/ai/research-router.ts) to strictly parameterized database tools.
- **Server-Side Isolation:** All database access and AI synthesis occur strictly on the server (`import "server-only"`). Database credentials and API keys are never exposed to the client.
- **Strict Decipherment Safeguards:** The system explicitly refuses requests for translations, phonetic readings, grammatical parts of speech, word boundaries, or language family assertions.
- **Dual-Mode Execution:** Supports Google Gemini 2.0 Flash when `GEMINI_API_KEY` is provided, with seamless fallback to deterministic academic evidence synthesis when unconfigured.
- **Evidence Traceability:** Every response embeds an interactive `EvidenceCard` linking directly to the verified records in the Explorer.

---

## 6. Research Limitations

- **Sample Scope:** Covers only Mohenjo-daro seals M-1..M-199 from CISI Volume 1; this is an open sample, not the entire multi-site Indus corpus.
- **Single Corpus Site:** While 9 published reference sites are catalogued for geographic context, Mohenjo-daro is currently the only site with digitized corpus data. Cross-site comparative statistics are held until authorized second-site data is ingested.
- **Reading Direction & Completeness:** Sequences are presented in source-recorded Right-to-Left order; this represents catalogue transcription order, not an established reading direction. Source completeness is not recorded in this release.

---

## 7. Technology Stack

- **Framework:** Next.js 15 (App Router, Server Components, Route Handlers)
- **UI Library:** React 19, Tailwind CSS, Lucide Icons, Leaflet (dynamic import)
- **Language:** TypeScript 5 (Strict Mode)
- **Database:** PostgreSQL 16 (Local Docker Compose & Neon Serverless)
- **Database Client:** `pg` (node-postgres with connection pooling)
- **AI Integration:** Google Gemini 2.0 Flash / Native Node.js REST client / Deterministic Academic Synthesizer
- **Package Manager:** pnpm
- **Hosting:** Vercel

---

## 8. Local Development

```bash
# Clone the repository
git clone https://github.com/Srikanth-ui179/ivc-seal-analyzer.git
cd ivc-seal-analyzer

# Install dependencies
pnpm install

# Start local PostgreSQL service
docker compose up -d

# Run database migrations
pnpm run db:migrate

# Start Next.js development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 9. License & Attribution

- **Application Code:** MIT License
- **Corpus Data:** MIT License (Michael Carlson, *Indus Valley Script Corpus*, based on CISI Vol 1, Parpola et al., 1987)
