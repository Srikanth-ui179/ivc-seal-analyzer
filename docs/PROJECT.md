# IVC Seal Analyzer (IndusScript AI)

## Project Purpose

**IVC Seal Analyzer** is an evidence-grounded computational research platform designed for the empirical study of machine-readable records of the undeciphered Indus Valley Civilization script. Built as durable research infrastructure, it establishes verifiable connections between primary archaeological source records, visual sign catalogues, transcription sequences, reproducible statistical metrics, and an evidence-grounded AI research assistant.

The platform's primary methodological contribution is **Method Before Model**: making source provenance, statistical denominators, and epigraphic limitations visible and inseparable from the data being analyzed.

---

## Methodological Boundaries & Negative Claims

To maintain scholarly integrity, the platform operates under strict negative research claims:

- **No Decipherment:** The system does **not** claim to decipher, translate, or linguistically read the Indus script.
- **No Phonetic Inference:** No phonetic, acoustic, or spoken values are assigned to any sign.
- **No Semantic Claims:** Visual sign types are descriptive catalogue references (Parpola `P-NNN`), not words, morphemes, or semantic tokens.
- **No Language Classification:** The system makes no assertion regarding linguistic affiliation (e.g., Dravidian, Indo-Aryan, Munda, or language isolate).
- **Separation of Evidence:** Observed archaeological facts, computed structural patterns, and scholarly interpretations are strictly distinguished. No synthetic demonstration record is ever presented as archaeological evidence.

---

## Project Status: COMPLETE (v3.0.0 Final Capstone Release)

The project has achieved its final engineering milestone. All planned capabilities across Phases 1, 2, and 3 have been delivered, audited, and deployed to production.

### Delivered Capabilities

1. **Archaeological Foundation (V1):**
   - Source-backed relational schema (PostgreSQL 16) with strict record-scope boundaries (`research` vs `demo`).
   - Authorized CISI research corpus (`DATASET-CISI-MOHENJODARO-V1`, UUID: `00000000-0000-4000-8000-000000000181`).
   - Server-only typed data access repository (`lib/db/phase1-repository.ts`).
   - Inscription Explorer (`/explorer`) and detail routes for Inscriptions, Signs, Objects, and Sites.

2. **Computational Analysis Infrastructure (V2.0–V2.5):**
   - Archaeological Site Map (`/map`) and accessible site register with published coordinates and precision metrics.
   - Comprehensive analytical metrics M1 through M11 (`/analyze`): frequency distributions, positional skew, transition matrices, contiguous motifs, internal sequence diversity, exact and near-duplicates, and rule-based structural outliers.
   - Research Dashboard (`/research/dashboard`) featuring 5 responsive SVG visualizations and interactive exploratory drill-downs.
   - Multi-Site Research Foundation & Provenance Register (`/research/datasets`) establishing strict isolation between active Corpus Sites and reference-only geographic benchmarks.

3. **Evidence-Grounded AI Research Assistant (V2.6):**
   - Interactive conversational interface (`/research/assistant`, `app/api/research/assistant`).
   - 14 parameterized, injection-safe research tools (`lib/ai/research-tools.ts`).
   - Deterministic query intent router (`lib/ai/research-router.ts`) with zero arbitrary SQL generation.
   - Dual-engine synthesis: Google Gemini 2.0 Flash integration with seamless fallback to deterministic academic synthesis.
   - Reusable evidence-citation cards (`EvidenceCard`) linking directly to verified Explorer records.

4. **Product Polish & Final Integration (V2.7):**
   - Responsive multi-device navigation header with mobile drawer.
   - Enriched Sign Detail view (`/sign-catalogue/[id]`) with live positional distributions and predecessor/successor matrices.
   - Directional inscription sequence progression (`P000 → P122 → P385`) with clickable graphemes.
   - Cross-workflow deep-linking into the AI Assistant (`?q=...`).
   - Custom academic 404 page and comprehensive metrics reconciliation.

5. **Capstone Presentation Packaging (V3.0):**
   - Engineering complete. Pushed to GitHub and deployed to Vercel production.
   - Standardized documentation package for academic evaluation, code review, and technical interviews.

---

## Authoritative Corpus Baseline

All metrics and platform computations are strictly locked to the verified research baseline:

- **Primary Inscriptions:** 179 physical seal faces
- **Catalogued Sign Tokens:** 1,003 occurrences (100% catalogued with identification status)
- **Distinct Sign Vocabulary:** 182 Parpola catalogue types
- **Active Corpus Sites:** 1 (Mohenjo-daro, 179 inscribed artefacts)
- **Reference-Only Benchmark Sites:** 9 (Harappa, Lothal, Dholavira, Kalibangan, etc.; 0 corpus seals)
- **Most Frequent Sign:** P324 (99 occurrences, 9.87% corpus share; 43 at Position 1)
- **Second Most Frequent Sign:** P122 (76 occurrences, 7.58% corpus share)
- **Top Directional Transition:** P122 → P385 (29 occurrences, 38.2% conditional probability)
- **Infrequent Predecessor:** P086 → P122 (1 occurrence)
- **Top Recurring Trigram:** `P000 P122 P385` (3 seals: `M-110A`, `M-174A`, `M-36A`)
- **Exact Duplicate Sequences:** 2 groups across 5 distinct seals
- **Near-Duplicate Pairs:** 10 pairs (Levenshtein distance = 1)
- **Sequence Length Range:** 1–13 signs (Mean: 5.60 ± 2.05; longest: `M-38A` and `M-23A`)

---

## Technology Stack

- **Framework:** Next.js 15 (App Router, Server Components, Route Handlers)
- **UI & Visualization:** React 19, Tailwind CSS, Lucide Icons, Leaflet (dynamic import)
- **Language:** TypeScript 5 (Strict Mode, 100% typechecked)
- **Database:** PostgreSQL 16 (`postgres:16-alpine` via Docker Compose; Neon Serverless for cloud deployment)
- **Database Client:** `pg` (node-postgres with connection pooling, server-only)
- **AI Integration:** Google Gemini 2.0 Flash / Native Node.js REST client / Deterministic Academic Synthesizer
- **Hosting & CI/CD:** Vercel Production Deployment + GitHub Actions / Git repository

---

## Repository Documentation

- [README.md](../README.md): Comprehensive capstone presentation, local setup, and architecture summary.
- [ARCHITECTURE.md](ARCHITECTURE.md): Multi-layer system design, boundary rules, and data flow.
- [ROADMAP.md](ROADMAP.md): Historical milestone progression from V1 to V3.0 (marked Complete).
- [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md): Complete chronological record of engineering implementations.
