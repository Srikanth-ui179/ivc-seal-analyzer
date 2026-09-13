\set ON_ERROR_STOP on

BEGIN;

-- ============================================================================
-- 1. Test Corpus Delivery & Staging Integrity
-- ============================================================================
DO $$
DECLARE
  v_src_id uuid := '00000000-0000-4000-8000-000000000200';
  v_rel_id uuid := '00000000-0000-4000-8000-000000000201';
  v_file_id uuid := '00000000-0000-4000-8000-000000000211';
  v_run_id uuid := '00000000-0000-4000-8000-000000000221';
  v_row_id uuid := '00000000-0000-4000-8000-000000000231';
BEGIN
  -- Insert demo source for verification
  INSERT INTO sources (id, stable_id, record_scope, source_type, title)
  VALUES (v_src_id, 'DEMO-SRC-INGEST-0001', 'demo', 'demo_fixture', 'Test Demo Ingestion Source');

  -- Insert demo corpus release
  INSERT INTO corpus_releases (id, stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status)
  VALUES (v_rel_id, 'DEMO-REL-INGEST-0001', 'demo', v_src_id, 'Synthetic Ingestion Release', 'v1.0', 'Synthetic Test Provider', 'authorized');

  -- Insert demo release file with valid SHA-256
  INSERT INTO corpus_release_files (id, corpus_release_id, original_filename, file_role, private_storage_locator, sha256, byte_size)
  VALUES (v_file_id, v_rel_id, 'demo_corpus.csv', 'source_data', '/data/demo_corpus.csv', repeat('1', 64), 1024);

  -- Malformed SHA-256 (not 64 hex characters) must fail
  BEGIN
    INSERT INTO corpus_release_files (corpus_release_id, original_filename, file_role, private_storage_locator, sha256)
    VALUES (v_rel_id, 'bad_sha.csv', 'source_data', '/data/bad.csv', 'invalid-sha256');
    RAISE EXCEPTION 'Expected rejection of malformed SHA-256 checksum';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Create ingestion run in staged state
  INSERT INTO corpus_ingestion_runs (id, stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
  VALUES (v_run_id, 'DEMO-RUN-INGEST-0001', 'demo', v_rel_id, 'staged', 'v1.0.0', repeat('2', 64));

  -- Insert staging row
  INSERT INTO corpus_staging_rows (id, corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256, parse_status)
  VALUES (v_row_id, v_run_id, v_file_id, 'DEMO-M77-1001-A-1', '{"text_number":1001,"site":"Mohenjo-daro","signs":"342 65 99"}'::jsonb, repeat('3', 64), 'unparsed');

  -- Immutability check: staging row cannot be updated
  BEGIN
    UPDATE corpus_staging_rows SET parse_status = 'valid' WHERE id = v_row_id;
    RAISE EXCEPTION 'Expected rejection of staging row update';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Immutability check: staging row cannot be deleted
  BEGIN
    DELETE FROM corpus_staging_rows WHERE id = v_row_id;
    RAISE EXCEPTION 'Expected rejection of staging row deletion';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- ============================================================================
-- 2. Test Ingestion State Transitions & Promotion Safeguards
-- ============================================================================
DO $$
DECLARE
  v_run_id uuid := '00000000-0000-4000-8000-000000000221';
  v_empty_run_id uuid := '00000000-0000-4000-8000-000000000222';
  v_rel_id uuid := '00000000-0000-4000-8000-000000000201';
BEGIN
  -- An empty run without staging rows cannot be promoted
  INSERT INTO corpus_ingestion_runs (id, stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
  VALUES (v_empty_run_id, 'DEMO-RUN-EMPTY-0001', 'demo', v_rel_id, 'staged', 'v1.0.0', repeat('4', 64));

  BEGIN
    UPDATE corpus_ingestion_runs SET state = 'validated', validated_at = now() WHERE id = v_empty_run_id;
    UPDATE corpus_ingestion_runs SET state = 'promoted', promoted_at = now() WHERE id = v_empty_run_id;
    RAISE EXCEPTION 'Expected rejection of promoting an empty ingestion run';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid transition: staged -> validated -> promoted
  UPDATE corpus_ingestion_runs SET state = 'validated', validated_at = now() WHERE id = v_run_id;
  UPDATE corpus_ingestion_runs SET state = 'promoted', promoted_at = now() WHERE id = v_run_id;

  -- Promoted run is immutable
  BEGIN
    UPDATE corpus_ingestion_runs SET state = 'rejected', rejected_at = now() WHERE id = v_run_id;
    RAISE EXCEPTION 'Expected rejection of modifying a promoted ingestion run';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- ============================================================================
-- 3. Test Duplicate Artifact Preservation (No Merging of Physical Objects)
-- ============================================================================
DO $$
DECLARE
  v_site_id uuid := '00000000-0000-4000-8000-000000000210';
  v_src_id uuid := '00000000-0000-4000-8000-000000000200';
  v_seal_id uuid := '00000000-0000-4000-8000-000000000241';
  v_sealing_id uuid := '00000000-0000-4000-8000-000000000242';
BEGIN
  -- Insert demo site for verification
  INSERT INTO sites (id, stable_id, record_scope, canonical_name)
  VALUES (v_site_id, 'DEMO-SITE-INGEST-0001', 'demo', 'Test Demo Site');

  -- Insert two distinct physical objects (seal and sealing) sharing the same text
  INSERT INTO objects (id, stable_id, record_scope, site_id, object_type, material)
  VALUES (v_seal_id, 'DEMO-OBJ-SEAL-0001', 'demo', v_site_id, 'seal', 'steatite'),
         (v_sealing_id, 'DEMO-OBJ-SEALING-0001', 'demo', v_site_id, 'sealing', 'terracotta');

  -- Connect them via source-backed object relationship (impression_of)
  INSERT INTO object_relationships (stable_id, record_scope, subject_object_id, related_object_id, relationship_type, source_id, source_locator)
  VALUES ('DEMO-REL-SEALING-0001', 'demo', v_sealing_id, v_seal_id, 'impression_of', v_src_id, 'Test Plate 12');

  -- Verify distinct existence
  IF (SELECT count(*) FROM objects WHERE id IN (v_seal_id, v_sealing_id)) <> 2 THEN
    RAISE EXCEPTION 'Expected both physical objects to be preserved independently';
  END IF;
END;
$$;

-- ============================================================================
-- 4. Test Transactional Promotion Rollback on Provenance Violation
-- ============================================================================
DO $$
DECLARE
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000202';
  v_res_site_id uuid := '00000000-0000-4000-8000-000000000212';
  v_obj_id uuid := '00000000-0000-4000-8000-000000000251';
  v_ins_id uuid := '00000000-0000-4000-8000-000000000261';
  v_seq_id uuid := '00000000-0000-4000-8000-000000000271';
BEGIN
  INSERT INTO sources (id, stable_id, record_scope, source_type, title)
  VALUES (v_res_src_id, 'TEST-SRC-ROLLBACK-0001', 'research', 'catalogue', 'Test Source');

  INSERT INTO sites (id, stable_id, record_scope, canonical_name)
  VALUES (v_res_site_id, 'TEST-SITE-ROLLBACK-0001', 'research', 'Test Site');

  -- In a subtransaction, simulate promotion failure where source transcription is missing
  BEGIN
    INSERT INTO objects (id, stable_id, record_scope, site_id, object_type)
    VALUES (v_obj_id, 'TEST-OBJ-ROLLBACK-0001', 'research', v_res_site_id, 'seal');

    INSERT INTO inscriptions (id, stable_id, record_scope, object_id, surface_label)
    VALUES (v_ins_id, 'TEST-INS-ROLLBACK-0001', 'research', v_obj_id, 'face-a');

    -- This should fail because research source_transcription requires authorized release & transcription
    INSERT INTO sign_sequences (id, stable_id, record_scope, inscription_id, sequence_basis, source_id)
    VALUES (v_seq_id, 'TEST-SEQ-ROLLBACK-0001', 'research', v_ins_id, 'source_transcription', v_res_src_id);

    RAISE EXCEPTION 'Expected promotion failure to trigger rollback';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Verify that object was rolled back
  IF EXISTS (SELECT 1 FROM objects WHERE stable_id = 'TEST-OBJ-ROLLBACK-0001') THEN
    RAISE EXCEPTION 'Object should have been rolled back upon promotion failure';
  END IF;
END;
$$;


ROLLBACK;

SELECT 'Ingestion pipeline verification passed' AS result;
