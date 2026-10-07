# Project Roadmap & Milestone History

### Status: COMPLETE (v3.0.0 Final Capstone Release)

The **IVC Seal Analyzer** project has concluded all engineering, computational, and documentation phases. The platform is complete, production-verified, and presented as a finalized student capstone research system.

---

## Milestone Overview

| Milestone | Scope & Core Deliverables | Status |
|---|---|:---:|
| **V1** | **Research-Ready Corpus Explorer**<br>PostgreSQL 16 relational data model, source provenance assertions, server-only typed repository, Inscription Explorer, and entity detail views. | **COMPLETE** |
| **V2.x** | **Research Infrastructure & Computational Analysis**<br>Archaeological site mapping (V2.1), foundational computational metrics M1–M5 (V2.2), advanced metrics M6–M11 (V2.3), interactive visual Research Dashboard (V2.4), and multi-site provenance gating (V2.5). | **COMPLETE** |
| **V2.6** | **Evidence-Grounded AI Research Assistant**<br>Deterministic intent routing, 14 parameterized research tools, structured EvidenceObject generation, dual-engine prose synthesis (Gemini 2.0 Flash + deterministic fallback), and strict decipherment refusal safeguards. | **COMPLETE** |
| **V2.7** | **Final Product Polish & Workflow Integration**<br>Responsive desktop and mobile navigation with drawer, enriched Sign Detail computational profiles, directional inscription sequence flows (`P000 → P122 → P385`), dashboard metric reconciliation, deep-linking into the AI assistant, and branded academic 404 page. | **COMPLETE** |
| **V3.0** | **Final Capstone Release & Presentation Package**<br>Presentation-grade documentation, full architecture specification, repository audit, production deployment smoke test, and clean Git tag `v3.0.0`. | **COMPLETE** |

---

## Detailed Milestone Records

### V1 — Research-Ready Corpus Explorer
- **Relational Archaeological Data Model:** Source-aware entities (`sources`, `sites`, `objects`, `inscriptions`, `signs`, `sign_sequences`, `sign_occurrences`, `archaeological_assertions`) preserving catalogued uncertainty and competing provenance claims.
- **Strict Scope Boundaries:** PostgreSQL trigger-enforced isolation separating `research` records from `demo` fixtures.
- **Server-Only Data Access:** Parameterized PostgreSQL repository (`lib/db/phase1-repository.ts`) with connection pooling, avoiding client-side credential exposure.
- **Database-Backed Explorer:** Search, filter, and pagination interface over authentic Mohenjo-daro inscriptions (`/explorer`).
- **Entity Detail Views:** Dedicated read-only detail routes for inscriptions, visual sign catalogue entries, objects, and archaeological sites.

### V2.x — Research Infrastructure & Computational Analysis
- **V2.1 (Archaeological Site Map):** Interactive Leaflet map (`/map`) and accessible site register displaying published reference coordinates, recorded coordinate precision, and clear demarcation between active corpus sites and reference benchmarks.
- **V2.2 (Computational Analysis Baseline):** Empirical metrics M1 through M5 (`/analyze`) delivering sign frequency distributions, sequence length statistics, initial-position frequencies, adjacent sign-pair frequencies, and corpus coverage reporting.
- **V2.3 (Advanced Computational Metrics):** Extended metrics M6 through M11 introducing sign positional distributions, conditional transition matrices, contiguous sequence motifs (trigrams, 4-grams), sequence diversity, exact and near-duplicates (Levenshtein distance = 1), and transparent rule-based structural outlier detection.
- **V2.4 (Interactive Research Dashboard):** Comprehensive visual workspace (`/research/dashboard`) featuring 5 responsive SVG charts and interactive drill-down explorers with 100% evidence traceability linking directly to underlying inscriptions.
- **V2.5 (Multi-Site Research Foundation):** Explicit multi-site schema and comparative analysis engine (`lib/db/multisite-repository.ts`) with programmatic gating that holds comparative cross-site statistics until an authorized second site is ingested. Frozen dataset immutability verified for `DATASET-CISI-MOHENJODARO-V1`.

### V2.6 — Evidence-Grounded AI Research Assistant
- **Strict Architecture Pipeline:** Four-layer data flow (`DATA → COMPUTATION → EVIDENCE → AI EXPLANATION`).
- **14 Controlled Research Tools:** Parameterized SQL functions (`lib/ai/research-tools.ts`) answering corpus overview, frequencies, positional profiles, transitions, motifs, duplicates, outliers, site statuses, and methodological limitations. Zero arbitrary SQL generation.
- **Deterministic Intent Router:** Regex-driven intent classification (`lib/ai/research-router.ts`) with conversational pronoun resolution ("it", "them", "those inscriptions") and safe refusal of decipherment, translation, language, and meaning requests.
- **Common Evidence Format:** Typed `EvidenceObject` (`lib/ai/evidence-format.ts`) with explicit statistical denominators, record identifiers, limitations, and route links.
- **Dual-Mode Synthesis:** Server-side Google Gemini 2.0 Flash integration with automatic, seamless fallback to deterministic academic synthesis when unconfigured.
- **Evidence-Citation UI:** Reusable components (`components/features/research-assistant/`) embedding interactive `EvidenceCard` widgets into conversational answers.

### V2.7 — Final Product Polish & Workflow Integration
- **Unified Navigation:** Responsive header (`components/layout/site-header.tsx`) with active state indicators and mobile drawer menu.
- **Enriched Sign Detail:** Computational profile section (`app/sign-catalogue/[id]/page.tsx`) with positional histograms, top transitions, motifs, and deep-link actions.
- **Directional Sequence Progression:** Sequence visualization (`app/explorer/[id]/page.tsx`) with clear arrow progression (`P000 → P122 → P385`) and clickable graphemes.
- **Metrics Reconciliation:** Dashboard overview copy aligned with verified V2.6 baseline (P122 → P385 = 29 occurrences / 38.2%; sequence length range = 1–13 signs).
- **Assistant Deep-Linking:** URL query parameter support (`?q=...`) allowing direct queries from sign records, inscriptions, or dashboard findings.
- **Branded 404 Page:** Custom error page (`app/not-found.tsx`) offering direct navigation recovery.

### V3.0 — Final Capstone Release & Presentation Package
- **Final Architecture & Documentation:** Presentation-grade `README.md`, `ARCHITECTURE.md`, and `PROJECT.md` formatted for academic reviewers, recruiters, and technical interviewers.
- **Codebase Freeze:** Zero unverified additions; frozen dataset verified. Clean Git commit and production tag `v3.0.0`.
- **Engineering Completion Sign-Off:** The project is fully delivered and ready for capstone presentation and technical interview defense.

---

## Future Scope (Post-Capstone Boundaries)

Any potential post-capstone scholarly work would require strict methodological preconditions:

1. **Second-Site Authorized Corpus Ingestion:** Ingesting verified Harappa or Lothal datasets only after primary digitizations are authorized and aligned to the Parpola sign catalogue.
2. **Physical Boundary Metadata:** Incorporating high-resolution photographic orthophotos and physical boundary records before exploring directional entropy or information-theoretic metrics.
3. **Scholarly Review Layer:** Supporting versioned academic annotations and hypothesis tracking as separate, non-mutating layers on top of the immutable archaeological foundation.
