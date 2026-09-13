BEGIN;

-- The initial development fixture is obsolete now that the authorized research
-- corpus is present. This forward-only cleanup removes only demo-scoped rows;
-- research records, corpus releases, and frozen research datasets are untouched.
-- The two application triggers are disabled only long enough to remove legacy
-- immutable-demo dependents in dependency order.
ALTER TABLE dataset_version_inscriptions DISABLE TRIGGER dataset_version_inscriptions_integrity;
ALTER TABLE corpus_staging_rows DISABLE TRIGGER corpus_staging_rows_immutable;

DELETE FROM dataset_version_inscriptions dvi
USING dataset_versions dv
WHERE dvi.dataset_version_id = dv.id
  AND dv.record_scope = 'demo';
DELETE FROM dataset_versions WHERE record_scope = 'demo';

DELETE FROM archaeological_assertions a
USING sources s
WHERE a.source_id = s.id
  AND s.record_scope = 'demo';
DELETE FROM catalogue_identifiers WHERE record_scope = 'demo';
DELETE FROM object_relationships WHERE record_scope = 'demo';
DELETE FROM sign_variant_assignments WHERE record_scope = 'demo';
DELETE FROM sign_occurrences WHERE record_scope = 'demo';
DELETE FROM sign_sequences WHERE record_scope = 'demo';
DELETE FROM inscriptions WHERE record_scope = 'demo';
DELETE FROM sign_variants WHERE record_scope = 'demo';
DELETE FROM objects WHERE record_scope = 'demo';
DELETE FROM signs WHERE record_scope = 'demo';
DELETE FROM sites WHERE record_scope = 'demo';

DELETE FROM corpus_staging_rows csr
USING corpus_ingestion_runs cir
WHERE csr.corpus_ingestion_run_id = cir.id
  AND cir.record_scope = 'demo';
DELETE FROM corpus_ingestion_runs WHERE record_scope = 'demo';
DELETE FROM corpus_release_files crf
USING corpus_releases cr
WHERE crf.corpus_release_id = cr.id
  AND cr.record_scope = 'demo';
DELETE FROM corpus_releases WHERE record_scope = 'demo';
DELETE FROM sources WHERE record_scope = 'demo';

ALTER TABLE corpus_staging_rows ENABLE TRIGGER corpus_staging_rows_immutable;
ALTER TABLE dataset_version_inscriptions ENABLE TRIGGER dataset_version_inscriptions_integrity;

COMMIT;
