# IVC Seal Analyzer

## IndusScript AI — Research Platform for the Indus Valley Script

IVC Seal Analyzer is a research-oriented platform for exploring and analyzing machine-readable records of the undeciphered Indus Valley script.

The project focuses on structured archaeological and epigraphic data: objects, inscriptions, sign sequences, sign occurrences, catalogue identifiers, corpus provenance, and dataset versions.

It does **not** claim to decipher, translate, or assign established meanings to Indus signs.

---

## Current Research Corpus

The current release uses the open, machine-readable **CISI digitization by Michael Carlson (2024)**, based on the Corpus of Indus Seals and Inscriptions (CISI) material.

The current dataset contains **179 Mohenjo-daro artefacts** represented as machine-readable inscription records.

### Current Database State

| Record | Count |
|---|---:|
| Objects | 179 |
| Inscriptions | 179 |
| Distinct sign types | 182 |
| Sign occurrences | 1,003 |
| Sign sequences | 179 |
| Catalogue identifiers | 179 |
| Sites | 1 |
| Sources | 1 |
| Corpus releases | 1 |
| Frozen research datasets | 1 |
| Corpus staging rows | 537 |

The active corpus release is:

`REL-CISI-MAYIG-V1`

The frozen research dataset is:

`DATASET-CISI-MOHENJODARO-V1`

### Scope

The current corpus is limited to the available machine-readable Mohenjo-daro records. It should **not** be interpreted as a complete representation of every known Indus inscription.

Material, dimensions, archaeological strata, photographs, and other fields that are not present in the source data are left unpopulated rather than being inferred or fabricated.

---

## Research Philosophy

The project is designed as a **research tool**, not a decipherment engine.

The Indus script remains undeciphered, and the platform deliberately separates observed data from interpretation.

The system therefore aims to support:

- inspection of inscription records
- exploration of sign sequences
- sign-frequency and occurrence analysis
- catalogue cross-referencing
- corpus provenance tracking
- archaeological metadata management
- frozen dataset versions
- reproducible research workflows
- future statistical and computational analysis

The project does not present speculative sign meanings, translations, or phonetic values as established facts.

---

## Features

### Research Explorer

Browse the available research corpus and inspect individual records.

### Inscription Records

Each inscription can be examined together with its associated object, catalogue identifiers, and recorded sign sequence.

### Sign Catalogue

Explore the 182 distinct sign types represented in the current dataset and inspect their occurrences across the corpus.

### Object and Site Records

Navigate between inscriptions, objects, and their archaeological site relationships.

### Corpus Provenance

The database records the source and release from which corpus data originated, allowing research records to remain traceable to their source dataset.

### Dataset Versioning

The current research corpus is represented by a frozen dataset snapshot:

`DATASET-CISI-MOHENJODARO-V1`

This provides a stable basis for reproducible analysis.

### Ingestion Pipeline

The project includes a structured ingestion pipeline for validating, staging, and promoting machine-readable corpus records into PostgreSQL.

---

## Technology Stack

- Next.js
- TypeScript
- React
- PostgreSQL
- Node.js
- pg (node-postgres)
- Docker
- pnpm

The application uses server-side PostgreSQL access and parameterized queries.

---

## Architecture

```text
Machine-readable corpus
        │
        ▼
   Corpus Parser
        │
        ▼
     Validator
        │
        ▼
   Staging Tables
        │
        ▼
  Promotion Pipeline
        │
        ▼
    PostgreSQL
        │
        ▼
   Next.js Application
        │
        ▼
 Research Explorer / Catalogue / Records
