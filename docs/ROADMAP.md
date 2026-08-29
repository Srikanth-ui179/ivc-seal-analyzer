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

**Status: planned. Target: months 3–5.**

- Define versioned corpus/dataset selection.
- Add reproducible, parameterized analysis runs.
- Implement simple descriptive statistics: sign frequency, sequence length, positional distribution, and co-occurrence.
- Present computational observations as measurements with methods and uncertainty, never as translations.
- Add tests and benchmark fixtures using only clearly labelled synthetic or properly sourced records.

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
