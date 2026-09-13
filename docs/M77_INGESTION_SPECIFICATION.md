# M77 / IDF-80 Corpus Ingestion Specification

## 1. Scope & Research Boundary

This specification defines the ingestion and mapping rules for integrating the **Iravatham Mahadevan (1977) Indus script corpus** (*The Indus Script: Texts, Concordance and Tables*, Memoirs of the Archaeological Survey of India No. 77) and its updated machine-readable **Input Data File 1980 (IDF-80)** into the IndusScript AI PostgreSQL database (schema migrations `0001`–`0014`).

### Strict Non-Decipherment Boundary
- The corpus is strictly visual, structural, and epigraphical.
- Signs are identified solely by standardized visual catalogue numbers (`M-001` to `M-417`).
- **No phonetic values, transliterations, grammatical interpretations, language family assignments, or translation claims** are permitted in database records.
- Field symbols and animal motifs are recorded strictly as archaeological catalogue classifications (e.g., `unicorn`, `short_horned_bull`, `elephant`), not religious or linguistic facts.

---

## 2. Distinction of Data Categories

| Category | Description | Examples |
| :--- | :--- | :--- |
| **Source-Provided Facts** | Direct epigraphic and catalogue data recorded by Mahadevan (1977 / IDF-80). | Text number (`1001`), Site name (`Mohenjo-daro`), Object type (`seal`), Material (`steatite`), Surface/Line (`face-a, line 1`), Sign integer codes (`342 65 99`), Field symbol code (`01` = Unicorn), Reading direction (`right_to_left`). |
| **Normalized Database Fields** | Controlled enum and lifecycle columns mandated by our PostgreSQL schema. | `record_scope = 'research'`, `status = 'active'`, `sequence_basis = 'source_transcription'`, `source_token_order = 'source_recorded'`, `is_primary = true`, `certainty = 'asserted'`. |
| **Derived Mappings** | Deterministic transformations and canonical geographic lookups. | Stable IDs (`OBJ-M77-1001`, `INS-M77-1001-A`, `SEQ-M77-1001-A-1`), Sign catalogue codes (`M-342`), Site canonical coordinates (Mohenjo-daro: `27.3294° N, 68.1389° E`). |
| **Information Not Currently Available** | Metadata absent in raw M77 text tables that must NOT be fabricated. | Exact physical dimensions in mm (`height_mm`, `width_mm`), high-resolution museum image rights/URLs, stratigraphic excavation trench layers. These fields remain `NULL` until populated by future source assertions. |

---

## 3. Stable Identifier and Schema Mapping

### A. Provenance & Release Layer
* **Source Record**:
  * `stable_id`: `SRC-MAHADEVAN-1977`
  * `source_type`: `catalogue`
  * `citation_key`: `Mahadevan1977`
  * `title`: `The Indus Script: Texts, Concordance and Tables (MASI No. 77) / Input Data File 1980`
  * `authors`: `Iravatham Mahadevan`
  * `publication_year`: `1977`
  * `publisher_or_journal`: `Archaeological Survey of India / Indus Research Centre (RMRL)`
* **Corpus Release Record**:
  * `stable_id`: `REL-M77-IDF80-V1`
  * `release_label`: `Mahadevan 1977 / IDF-80 Corpus Delivery`
  * `delivery_version`: `1980.1`
  * `provider_name`: `Archaeological Survey of India / RMRL`
  * `authorization_status`: `authorized`
  * `rights_summary`: `Public domain / Open non-commercial academic research data`
* **Release Files**:
  * `original_filename`: `m77_texts.csv` (`file_role = 'source_data'`)
  * `original_filename`: `m77_signs.csv` (`file_role = 'data_dictionary'`)

### B. Archaeological Entity Layer
* **Sites**:
  Mapped by 4-digit text number ranges:
  * `1001`–`1999`: `SITE-MOHENJO-DARO` (Mohenjo-daro, Sindh, Pakistan; `27.3294`, `68.1389`)
  * `2001`–`2999`: `SITE-HARAPPA` (Harappa, Punjab, Pakistan; `30.6300`, `72.8650`)
  * `3001`–`3999`: `SITE-LOTHAL` (Lothal, Gujarat, India; `22.5222`, `72.2497`)
  * `4001`–`4999`: `SITE-KALIBANGAN` (Kalibangan, Rajasthan, India; `29.4736`, `74.1311`)
  * `5001`–`5999`: `SITE-CHANHUDARO` (Chanhudaro, Sindh, Pakistan; `26.1750`, `68.3167`)
  * `6001`+: Specific site names (Banawali, Kot Diji, Surkotada, Allahdino, Desalpur, Near Eastern sites).
* **Objects**:
  * `stable_id`: `OBJ-M77-{text_number}` (e.g. `OBJ-M77-1001`)
  * `site_id`: FK to corresponding site
  * `object_type`: normalized M77 typology (e.g. `seal`, `sealing`, `miniature_tablet`, `pottery_graffito`, `copper_tablet`, `ivory_rod`, `bronze_implement`)
  * `material`: normalized M77 material (e.g. `steatite`, `terracotta`, `copper`, `faience`, `paste`, `ivory`)
* **Inscriptions**:
  * `stable_id`: `INS-M77-{text_number}-{surface}` (e.g. `INS-M77-1001-A`)
  * `object_id`: FK to object
  * `surface_label`: `face-a`, `face-b`, `face-c`, etc.
* **Catalogue Identifiers**:
  * `subject_type`: `object`
  * `catalogue_namespace`: `mahadevan`
  * `identifier_text`: `{text_number}` (e.g. `1001`)
  * `is_primary`: `true`

### C. Visual Sign Catalogue & Transcription Layer
* **Signs**:
  * `stable_id`: `SIGN-M-{number:03d}` (e.g. `SIGN-M-001` to `SIGN-M-417`)
  * `catalogue_namespace`: `mahadevan`
  * `catalogue_code`: `M-001` to `M-417`
  * `visual_label`: Descriptive label (e.g. `M-342 (Jar sign with handles)`)
* **Sign Sequences**:
  * `stable_id`: `SEQ-M77-{text_number}-{surface}-{line}` (e.g. `SEQ-M77-1001-A-1`)
  * `inscription_id`: FK to inscription
  * `sequence_basis`: `source_transcription`
  * `sequence_version`: `1`
  * `is_primary`: `true`
  * `source_id`: FK to `SRC-MAHADEVAN-1977`
  * `corpus_release_id`: FK to `REL-M77-IDF80-V1`
  * `source_locator`: `Text {text_number}, line {line}`
  * `source_transcription`: exact raw space-separated sign sequence string (e.g. `342 65 99`)
  * `source_token_order`: `source_recorded`
  * `recorded_direction`: `right_to_left`
  * `layout_type`: `linear` (or `multiline` if line > 1)
* **Sign Occurrences**:
  * `stable_id`: `OCC-M77-{text_number}-{surface}-{line}-{position:02d}`
  * `sequence_id`: FK to sequence
  * `sign_id`: FK to sign (resolved for identified signs `1..417`)
  * `position_index`: 1-based order in sequence (1, 2, 3...)
  * `source_position_index`: 1-based order in source transcription
  * `source_token_text`: exact token string (e.g. `342`)
  * `identification_status`:
    * `identified`: valid sign code `1` to `417`
    * `damaged`: code `999` / `0` / damaged marker
    * `unidentified`: uncertain sign
* **Archaeological Assertions**:
  * `subject_type`: `object`
  * `predicate`: `field_symbol_motif`
  * `value_text`: classification string (e.g. `unicorn`, `short_horned_bull`, `zebu`, `elephant`, `tiger`, `rhinoceros`, `antelope`, `composite_monster`, `human_figure`, `geometric_motif`, `none`)
  * `source_id`: FK to `SRC-MAHADEVAN-1977`

---

## 4. Preservation & Anti-Duplication Rules

1. **No Physical Deduplication**:
   - Distinct physical objects with identical sign sequences remain separate `objects` and `inscriptions` records.
   - Impressions/sealings sharing a common seal are linked via `object_relationships` (`relationship_type = 'impression_of'` or `'possible_same_die_as'`), never merged into a single row.
2. **Raw Staging Row Immutability**:
   - Delivered rows are stored as raw JSONB in `corpus_staging_rows` with a SHA-256 payload digest.
   - Once staged, rows are immutable (enforced by trigger `corpus_staging_rows_immutable`).

---

## 5. Validation and Quarantine Policy

A row is **rejected or quarantined** in staging (marked `parse_status = 'quarantined'` with `validation_errors`) if:
1. `text_number` is missing, non-numeric, or outside valid ranges (`1001`–`9999`).
2. `signs` sequence contains malformed tokens (non-integer, outside 1–419, or unrecognized modifier syntax).
3. The site code cannot be resolved to a recognized archaeological site.
4. `source_transcription` string is empty or missing.
5. Record scope is not `research`.
6. A conflicting primary catalogue identifier already exists.

Quarantined records remain in `corpus_staging_rows` for scholarly reconciliation and are **never silently promoted**.
