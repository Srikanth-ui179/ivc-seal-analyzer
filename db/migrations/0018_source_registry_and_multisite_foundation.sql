BEGIN;

-- Migration 0018: Source registry enhancements and multi-site foundation
--
-- Adds comprehensive provenance, archive, catalogue, transcription, and licensing
-- metadata columns to the sources table. Backfills verified bibliographic records
-- for the CISI source and reference site gazetteers.
--
-- Preserves existing frozen dataset version DATASET-CISI-MOHENJODARO-V1 untouched.

-- 1. Extend sources table with full provenance and catalogue metadata
ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS repository_or_archive text,
  ADD COLUMN IF NOT EXISTS licence_name text,
  ADD COLUMN IF NOT EXISTS licence_url text,
  ADD COLUMN IF NOT EXISTS corpus_scope text,
  ADD COLUMN IF NOT EXISTS archaeological_scope text,
  ADD COLUMN IF NOT EXISTS catalogue_system text,
  ADD COLUMN IF NOT EXISTS transcription_system text,
  ADD COLUMN IF NOT EXISTS sign_numbering_convention text,
  ADD COLUMN IF NOT EXISTS limitations text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS checksum text;

-- 2. Populate verified provenance metadata for CISI source
UPDATE sources
SET
  repository_or_archive = 'Suomalainen Tiedeakatemia (Finnish Academy of Science and Letters); open machine-readable digitization in mayig/indus-valley-script-corpus (GitHub)',
  licence_name = 'MIT License (Carlson 2024 digitization); scholarly print copyright (CISI Vols 1-3)',
  licence_url = 'https://github.com/mayig/indus-valley-script-corpus/blob/main/LICENSE',
  corpus_scope = 'Mohenjo-daro Seals (M-1 through M-199; 179 primary inscribed faces)',
  archaeological_scope = 'Mohenjo-daro urban settlement, Sindh, Pakistan (excavations by Marshall, Mackay, Sahni, Vats, Majumdar)',
  catalogue_system = 'Corpus of Indus Seals and Inscriptions (CISI) volume artefact numbers with surface label (e.g. M-1A)',
  transcription_system = 'Source-recorded right-to-left sign sequence transcription; no phonetic or linguistic reconstruction',
  sign_numbering_convention = 'Parpola / CISI sign codes (P-NNN, e.g. P122, P324, P385)',
  limitations = 'Partial corpus (179 artefacts); sequence completeness values unrecorded (not_recorded); line-end preservation not recorded; does not represent full Mahadevan 1977 corpus',
  notes = 'Machine-readable JSON digitization created by Michael Carlson (2024) based on CISI photographic facsimiles.'
WHERE stable_id = 'SRC-CISI-PARPOLA-ET-AL';

-- 3. Populate verified provenance metadata for site gazetteers and excavation reports
UPDATE sources
SET
  repository_or_archive = 'AltaMira Press / Rowman & Littlefield',
  licence_name = 'Scholarly monograph copyright (academic reference datum)',
  corpus_scope = 'Geographic reference gazetteer for Indus civilization sites (Appendix A)',
  archaeological_scope = 'Greater Indus Valley urban and regional settlement network (Pakistan and northwestern India)',
  catalogue_system = 'Site name gazetteer with approximate regional benchmark coordinates',
  limitations = 'Coordinates represent published site-level datums (multi-hectare urban perimeters), not individual seal or artefact findspots.',
  notes = 'Primary published reference benchmark for Indus archaeological site coordinates.'
WHERE stable_id = 'SRC-POSSEHL-2002-GAZETTEER';

UPDATE sources
SET
  repository_or_archive = 'UNESCO World Heritage Centre / Archaeological Survey of India (ASI)',
  licence_name = 'UNESCO World Heritage documentation (public reference dossier)',
  corpus_scope = 'World Heritage Inscription Dossier 1642 property boundary coordinates',
  archaeological_scope = 'Dholavira fortified city on Khadir Bet, Great Rann of Kutch, Gujarat, India',
  catalogue_system = 'Official property boundary datum (23°53''10"N, 70°12''47"E)',
  limitations = 'Site datum encompasses walled citadel, middle town, lower town, and reservoirs. 0 corpus inscriptions ingested.',
  notes = 'Excavations directed by R.S. Bisht (1989-1990 to 2004-2005).'
WHERE stable_id = 'SRC-UNESCO-DHOLAVIRA-2021';

UPDATE sources
SET
  repository_or_archive = 'Archaeological Survey of India (Government of India)',
  licence_name = 'Official government archaeological excavation memoirs (public reference)',
  corpus_scope = 'Published site coordinates and excavation reports for Lothal, Kalibangan, Surkotada, Banawali, Rakhigarhi',
  archaeological_scope = 'Harappan excavated settlements in Gujarat, Rajasthan, and Haryana, India',
  catalogue_system = 'Memoirs of the Archaeological Survey of India (MASI)',
  limitations = 'Excavation reports cite published benchmarks for mounds; 0 corpus inscriptions ingested in current release.',
  notes = 'Key directors include S.R. Rao (Lothal), B.B. Lal and J.P. Joshi (Kalibangan), R.S. Bisht (Banawali), A. Nath (Rakhigarhi).'
WHERE stable_id = 'SRC-ASI-EXCAVATION-REPORTS';

COMMIT;
