\set ON_ERROR_STOP on

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM dataset_versions WHERE record_scope = 'demo') THEN
    RAISE EXCEPTION 'Legacy demo dataset versions remain in the database';
  END IF;
END;
$$;

BEGIN;

-- Transaction-scoped research records exercise frozen-dataset integrity.
INSERT INTO sites (id, stable_id, record_scope, canonical_name)
VALUES ('20000000-0000-4000-8000-000000000011', 'TEST-SITE-DATASET-0001', 'research', 'Verification site');
INSERT INTO objects (id, stable_id, record_scope, site_id, object_type)
VALUES ('20000000-0000-4000-8000-000000000021', 'TEST-OBJ-DATASET-0001', 'research', '20000000-0000-4000-8000-000000000011', 'verification object');
INSERT INTO inscriptions (id, stable_id, record_scope, object_id, surface_label)
VALUES ('20000000-0000-4000-8000-000000000031', 'TEST-INS-DATASET-0001', 'research', '20000000-0000-4000-8000-000000000021', 'verification face');
INSERT INTO dataset_versions (id, stable_id, record_scope, name, selection_criteria)
VALUES ('20000000-0000-4000-8000-000000000081', 'TEST-DATASET-VERIFY-0001', 'research', 'Verification dataset', 'Transaction-scoped integrity fixture.');
INSERT INTO dataset_version_inscriptions (dataset_version_id, inscription_id)
VALUES ('20000000-0000-4000-8000-000000000081', '20000000-0000-4000-8000-000000000031');
UPDATE dataset_versions SET state = 'frozen', frozen_at = now()
WHERE id = '20000000-0000-4000-8000-000000000081';

DO $$
BEGIN
  BEGIN
    DELETE FROM dataset_version_inscriptions
    WHERE dataset_version_id = '20000000-0000-4000-8000-000000000081';
    RAISE EXCEPTION 'Expected frozen dataset membership rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

ROLLBACK;

SELECT 'Phase 2 dataset verification passed; no persistent demo dataset found' AS result;
