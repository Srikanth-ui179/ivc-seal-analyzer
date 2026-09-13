\set ON_ERROR_STOP on

BEGIN;

-- 1. Verify schema elements: new types and tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'corpus_release_authorization_status') THEN
    RAISE EXCEPTION 'Expected corpus_release_authorization_status enum type';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'corpus_release_file_role') THEN
    RAISE EXCEPTION 'Expected corpus_release_file_role enum type';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'corpus_ingestion_run_state') THEN
    RAISE EXCEPTION 'Expected corpus_ingestion_run_state enum type';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'catalogue_identifier_subject_type') THEN
    RAISE EXCEPTION 'Expected catalogue_identifier_subject_type enum type';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'object_relationship_type') THEN
    RAISE EXCEPTION 'Expected object_relationship_type enum type';
  END IF;
END;
$$;

-- Insert transaction-scoped baseline fixtures (will be rolled back at end of script)
DO $$
BEGIN
  INSERT INTO sources (id, stable_id, record_scope, source_type, title)
  VALUES ('00000000-0000-4000-8000-000000000001', 'DEMO-SRC-TEST-0001', 'demo', 'demo_fixture', 'Test Demo Source');

  INSERT INTO sites (id, stable_id, record_scope, canonical_name)
  VALUES ('00000000-0000-4000-8000-000000000011', 'DEMO-SITE-TEST-0001', 'demo', 'Test Demo Site');

  INSERT INTO objects (id, stable_id, record_scope, site_id, object_type)
  VALUES ('00000000-0000-4000-8000-000000000021', 'DEMO-OBJ-TEST-0001', 'demo', '00000000-0000-4000-8000-000000000011', 'seal');

  INSERT INTO inscriptions (id, stable_id, record_scope, object_id, surface_label)
  VALUES ('00000000-0000-4000-8000-000000000031', 'DEMO-INS-TEST-0001', 'demo', '00000000-0000-4000-8000-000000000021', 'face-a');

  INSERT INTO signs (id, stable_id, record_scope, catalogue_namespace, catalogue_code, visual_label)
  VALUES ('00000000-0000-4000-8000-000000000041', 'DEMO-SIGN-TEST-0001', 'demo', 'test', 'D-1', 'Test demo sign');

  INSERT INTO sign_sequences (id, stable_id, record_scope, inscription_id, sequence_basis, source_id)
  VALUES ('00000000-0000-4000-8000-000000000051', 'DEMO-SEQ-TEST-0001', 'demo', '00000000-0000-4000-8000-000000000031', 'source_transcription', '00000000-0000-4000-8000-000000000001');
END;
$$;

-- 2. Test authorized vs pending/restricted corpus release rules
DO $$
DECLARE
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000002';
  v_pending_rel_id uuid := '00000000-0000-4000-8000-000000000101';
  v_auth_rel_id uuid := '00000000-0000-4000-8000-000000000102';
BEGIN
  -- Insert research source for verification
  INSERT INTO sources (id, stable_id, record_scope, source_type, title)
  VALUES (v_res_src_id, 'TEST-SRC-RES-0001', 'research', 'catalogue', 'Test Research Source');

  -- Create pending research release
  INSERT INTO corpus_releases (id, stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status)
  VALUES (v_pending_rel_id, 'TEST-REL-PEND-0001', 'research', v_res_src_id, 'Pending Release', 'v1.0', 'Provider A', 'pending');

  -- Create authorized research release
  INSERT INTO corpus_releases (id, stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status)
  VALUES (v_auth_rel_id, 'TEST-REL-AUTH-0001', 'research', v_res_src_id, 'Authorized Release', 'v1.0', 'Provider A', 'authorized');

  -- Ingestion run on pending release must be rejected for research scope
  BEGIN
    INSERT INTO corpus_ingestion_runs (stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
    VALUES ('TEST-RUN-PEND-0001', 'research', v_pending_rel_id, 'staged', 'v1.0.0', repeat('a', 64));
    RAISE EXCEPTION 'Expected rejection of ingestion run on pending release';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Ingestion run on authorized release must succeed
  INSERT INTO corpus_ingestion_runs (stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
  VALUES ('TEST-RUN-AUTH-0001', 'research', v_auth_rel_id, 'staged', 'v1.0.0', repeat('a', 64));
END;
$$;

-- 3. Test staging row integrity and immutability
DO $$
DECLARE
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000002';
  v_auth_rel_id uuid := '00000000-0000-4000-8000-000000000102';
  v_other_rel_id uuid := '00000000-0000-4000-8000-000000000103';
  v_file_id uuid := '00000000-0000-4000-8000-000000000111';
  v_other_file_id uuid := '00000000-0000-4000-8000-000000000112';
  v_run_id uuid := '00000000-0000-4000-8000-000000000121';
  v_row_id uuid := '00000000-0000-4000-8000-000000000131';
BEGIN
  INSERT INTO corpus_release_files (id, corpus_release_id, original_filename, file_role, private_storage_locator, sha256)
  VALUES (v_file_id, v_auth_rel_id, 'corpus.csv', 'source_data', '/storage/corpus.csv', repeat('b', 64));

  INSERT INTO corpus_releases (id, stable_id, record_scope, source_id, release_label, delivery_version, provider_name, authorization_status)
  VALUES (v_other_rel_id, 'TEST-REL-OTHER-0001', 'research', v_res_src_id, 'Other Release', 'v2.0', 'Provider B', 'authorized');

  INSERT INTO corpus_release_files (id, corpus_release_id, original_filename, file_role, private_storage_locator, sha256)
  VALUES (v_other_file_id, v_other_rel_id, 'other.csv', 'source_data', '/storage/other.csv', repeat('c', 64));

  INSERT INTO corpus_ingestion_runs (id, stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
  VALUES (v_run_id, 'TEST-RUN-STAGE-0001', 'research', v_auth_rel_id, 'staged', 'v1.0.0', repeat('d', 64));

  -- File from different release must be rejected
  BEGIN
    INSERT INTO corpus_staging_rows (corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256)
    VALUES (v_run_id, v_other_file_id, 'row-1', '{"raw":"data"}'::jsonb, repeat('e', 64));
    RAISE EXCEPTION 'Expected rejection of staging row with file from different release';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid staging row
  INSERT INTO corpus_staging_rows (id, corpus_ingestion_run_id, corpus_release_file_id, source_row_key, raw_payload, raw_payload_sha256)
  VALUES (v_row_id, v_run_id, v_file_id, 'row-1', '{"raw":"data"}'::jsonb, repeat('e', 64));

  -- Staging row cannot be updated
  BEGIN
    UPDATE corpus_staging_rows SET parse_status = 'parsed' WHERE id = v_row_id;
    RAISE EXCEPTION 'Expected rejection of staging row update';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Staging row cannot be deleted
  BEGIN
    DELETE FROM corpus_staging_rows WHERE id = v_row_id;
    RAISE EXCEPTION 'Expected rejection of staging row deletion';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- 4. Test ingestion run state transitions and promotion requirements
DO $$
DECLARE
  v_auth_rel_id uuid := '00000000-0000-4000-8000-000000000102';
  v_empty_run_id uuid := '00000000-0000-4000-8000-000000000122';
  v_valid_run_id uuid := '00000000-0000-4000-8000-000000000121';
BEGIN
  -- An ingestion run without staging rows cannot be promoted
  INSERT INTO corpus_ingestion_runs (id, stable_id, record_scope, corpus_release_id, state, importer_version, manifest_sha256)
  VALUES (v_empty_run_id, 'TEST-RUN-EMPTY-0001', 'research', v_auth_rel_id, 'staged', 'v1.0.0', repeat('f', 64));

  BEGIN
    UPDATE corpus_ingestion_runs
    SET state = 'validated', validated_at = now()
    WHERE id = v_empty_run_id;

    UPDATE corpus_ingestion_runs
    SET state = 'promoted', promoted_at = now()
    WHERE id = v_empty_run_id;
    RAISE EXCEPTION 'Expected rejection of promoting an empty ingestion run';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid transition: staged -> validated -> promoted
  UPDATE corpus_ingestion_runs
  SET state = 'validated', validated_at = now()
  WHERE id = v_valid_run_id;

  UPDATE corpus_ingestion_runs
  SET state = 'promoted', promoted_at = now()
  WHERE id = v_valid_run_id;

  -- Promoted run cannot transition further
  BEGIN
    UPDATE corpus_ingestion_runs
    SET state = 'rejected', rejected_at = now()
    WHERE id = v_valid_run_id;
    RAISE EXCEPTION 'Expected rejection of modifying a promoted run';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- 5. Test catalogue identifiers polymorphic scope and unique primary rules
DO $$
DECLARE
  v_site_id uuid := '00000000-0000-4000-8000-000000000011'; -- DEMO-SITE-0001 (demo)
  v_src_id uuid := '00000000-0000-4000-8000-000000000001';  -- DEMO-SRC-0001 (demo)
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000002'; -- TEST-SRC-RES-0001 (research)
  v_id1 uuid := '00000000-0000-4000-8000-000000000141';
  v_id2 uuid := '00000000-0000-4000-8000-000000000142';
BEGIN
  -- Scope mismatch: research identifier referencing demo site
  BEGIN
    INSERT INTO catalogue_identifiers (record_scope, subject_type, subject_id, catalogue_namespace, identifier_text, source_id, source_locator)
    VALUES ('research', 'site', v_site_id, 'asi', 'ASI-101', v_res_src_id, 'p. 10');
    RAISE EXCEPTION 'Expected rejection of research identifier for demo site';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Primary identifier constraint: only one primary per subject
  INSERT INTO catalogue_identifiers (id, record_scope, subject_type, subject_id, catalogue_namespace, identifier_text, source_id, source_locator, is_primary)
  VALUES (v_id1, 'demo', 'site', v_site_id, 'test_cat_a', 'TEST-CAT-A-1', v_src_id, 'p. 1', true);

  BEGIN
    INSERT INTO catalogue_identifiers (id, record_scope, subject_type, subject_id, catalogue_namespace, identifier_text, source_id, source_locator, is_primary)
    VALUES (v_id2, 'demo', 'site', v_site_id, 'test_cat_b', 'TEST-CAT-B-1', v_src_id, 'p. 2', true);
    RAISE EXCEPTION 'Expected rejection of second primary catalogue identifier for same subject';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END;
$$;

-- 6. Test object relationships self-reference and scope rules
DO $$
DECLARE
  v_obj1 uuid := '00000000-0000-4000-8000-000000000021'; -- DEMO-OBJ-0001 (demo)
  v_src_id uuid := '00000000-0000-4000-8000-000000000001'; -- DEMO-SRC-0001 (demo)
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000002'; -- TEST-SRC-RES-0001 (research)
  v_res_obj1 uuid := '00000000-0000-4000-8000-000000000151';
  v_res_obj2 uuid := '00000000-0000-4000-8000-000000000152';
BEGIN
  -- Self-reference rejection
  BEGIN
    INSERT INTO object_relationships (stable_id, record_scope, subject_object_id, related_object_id, relationship_type, source_id, source_locator)
    VALUES ('DEMO-REL-0001', 'demo', v_obj1, v_obj1, 'impression_of', v_src_id, 'p. 5');
    RAISE EXCEPTION 'Expected rejection of self-referencing object relationship';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Scope mismatch: linking demo object to research source
  BEGIN
    INSERT INTO object_relationships (stable_id, record_scope, subject_object_id, related_object_id, relationship_type, source_id, source_locator)
    VALUES ('DEMO-REL-0002', 'demo', v_obj1, v_obj1, 'impression_of', v_res_src_id, 'p. 5');
    RAISE EXCEPTION 'Expected rejection of scope mismatched object relationship';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid research relationship between two research objects
  INSERT INTO objects (id, stable_id, record_scope, object_type)
  VALUES (v_res_obj1, 'TEST-RES-OBJ-0001', 'research', 'seal'),
         (v_res_obj2, 'TEST-RES-OBJ-0002', 'research', 'impression');

  INSERT INTO object_relationships (stable_id, record_scope, subject_object_id, related_object_id, relationship_type, source_id, source_locator)
  VALUES ('TEST-REL-OBJ-0001', 'research', v_res_obj2, v_res_obj1, 'impression_of', v_res_src_id, 'pl. IV, fig. 2');
END;
$$;

-- 7. Test sign variants and active variant assignment integrity
DO $$
DECLARE
  v_src_id uuid := '00000000-0000-4000-8000-000000000001'; -- DEMO-SRC-0001 (demo)
  v_sign_id uuid := '00000000-0000-4000-8000-000000000041'; -- DEMO-SIGN-0001 (demo)
  v_seq_id uuid := '00000000-0000-4000-8000-000000000051';  -- DEMO-SEQ-0001 (demo)
  v_var_id uuid := '00000000-0000-4000-8000-000000000161';
  v_occ_id uuid := '00000000-0000-4000-8000-000000000171';
BEGIN
  INSERT INTO sign_variants (id, stable_id, record_scope, catalogue_namespace, variant_code, visual_label, source_id, source_locator)
  VALUES (v_var_id, 'DEMO-VAR-0001', 'demo', 'demo_var', 'V-001', 'Variant form of D-001', v_src_id, 'p. 20');

  -- Occurrence linking variant and sign without an assignment must fail
  BEGIN
    INSERT INTO sign_occurrences (id, stable_id, record_scope, sequence_id, sign_id, sign_variant_id, position_index, identification_status)
    VALUES (v_occ_id, 'DEMO-OCC-0002', 'demo', v_seq_id, v_sign_id, v_var_id, 2, 'identified');
    RAISE EXCEPTION 'Expected rejection of occurrence variant mapping without active assignment';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Create active assignment
  INSERT INTO sign_variant_assignments (record_scope, variant_id, sign_id, source_id, source_locator)
  VALUES ('demo', v_var_id, v_sign_id, v_src_id, 'p. 21');

  -- Now occurrence insertion must succeed
  INSERT INTO sign_occurrences (id, stable_id, record_scope, sequence_id, sign_id, sign_variant_id, position_index, identification_status)
  VALUES (v_occ_id, 'DEMO-OCC-0002', 'demo', v_seq_id, v_sign_id, v_var_id, 2, 'identified');
END;
$$;

-- 8. Test source transcription provenance requirements on research sequences
DO $$
DECLARE
  v_res_src_id uuid := '00000000-0000-4000-8000-000000000002';
  v_auth_rel_id uuid := '00000000-0000-4000-8000-000000000102';
  v_res_obj_id uuid := '00000000-0000-4000-8000-000000000151';
  v_res_ins_id uuid := '00000000-0000-4000-8000-000000000181';
  v_res_seq_id uuid := '00000000-0000-4000-8000-000000000191';
  v_sign_id uuid := '00000000-0000-4000-8000-000000000195';
BEGIN
  INSERT INTO signs (id, stable_id, record_scope, catalogue_namespace, catalogue_code, visual_label)
  VALUES (v_sign_id, 'TEST-SIGN-RES-0001', 'research', 'test', 'T-001', 'Test sign');

  INSERT INTO inscriptions (id, stable_id, record_scope, object_id, surface_label)
  VALUES (v_res_ins_id, 'TEST-INS-RES-0001', 'research', v_res_obj_id, 'face-1');

  -- Incomplete provenance on research source_transcription sequence must fail
  BEGIN
    INSERT INTO sign_sequences (stable_id, record_scope, inscription_id, sequence_basis, source_id)
    VALUES ('TEST-SEQ-RES-FAIL', 'research', v_res_ins_id, 'source_transcription', v_res_src_id);
    RAISE EXCEPTION 'Expected rejection of research source_transcription sequence with incomplete provenance';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid research source_transcription sequence
  INSERT INTO sign_sequences (id, stable_id, record_scope, inscription_id, sequence_basis, source_id, corpus_release_id, source_locator, source_transcription, source_token_order)
  VALUES (v_res_seq_id, 'TEST-SEQ-RES-0001', 'research', v_res_ins_id, 'source_transcription', v_res_src_id, v_auth_rel_id, 'line 1', 'M-101 a', 'source_recorded');

  -- Occurrence on research source_transcription missing source_position_index or token text must fail
  BEGIN
    INSERT INTO sign_occurrences (stable_id, record_scope, sequence_id, sign_id, position_index, identification_status)
    VALUES ('TEST-OCC-RES-FAIL', 'research', v_res_seq_id, v_sign_id, 1, 'identified');
    RAISE EXCEPTION 'Expected rejection of research source transcription occurrence without source token data';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Valid research occurrence
  INSERT INTO sign_occurrences (stable_id, record_scope, sequence_id, sign_id, position_index, identification_status, source_position_index, source_token_text)
  VALUES ('TEST-OCC-RES-0001', 'research', v_res_seq_id, v_sign_id, 1, 'identified', 1, 'M-101');
END;
$$;

-- 9. Test expanded archaeological assertion subjects
DO $$
DECLARE
  v_src_id uuid := '00000000-0000-4000-8000-000000000001'; -- DEMO-SRC-0001 (demo)
  v_sign_id uuid := '00000000-0000-4000-8000-000000000041'; -- DEMO-SIGN-0001
  v_seq_id uuid := '00000000-0000-4000-8000-000000000051';  -- DEMO-SEQ-0001
  v_var_id uuid := '00000000-0000-4000-8000-000000000161';  -- DEMO-VAR-0001
BEGIN
  -- Assertion on sign
  INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
  VALUES ('sign', v_sign_id, 'visual_frequency_note', 'Rare stroke variant', v_src_id, 'p. 15');

  -- Assertion on sign_sequence
  INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
  VALUES ('sign_sequence', v_seq_id, 'direction_reading_note', 'Right-to-left orientation observed', v_src_id, 'p. 16');

  -- Assertion on sign_variant
  INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
  VALUES ('sign_variant', v_var_id, 'epigraphic_variant_class', 'Class II variant', v_src_id, 'p. 17');

  -- Assertion on non-existent subject must fail
  BEGIN
    INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
    VALUES ('sign_variant', '99999999-9999-4999-8999-999999999999', 'test', 'value', v_src_id, 'p. 1');
    RAISE EXCEPTION 'Expected rejection of assertion with non-existent sign_variant subject';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

-- 10. Verify frozen dataset integrity remains protected
DO $$
DECLARE
  v_res_dataset_id uuid;
  v_res_ins_id uuid;
BEGIN
  SELECT id INTO v_res_dataset_id FROM dataset_versions WHERE stable_id = 'DATASET-CISI-MOHENJODARO-V1';
  SELECT id INTO v_res_ins_id FROM inscriptions WHERE record_scope = 'research' LIMIT 1;
  -- Cannot add inscription to frozen dataset
  BEGIN
    INSERT INTO dataset_version_inscriptions (dataset_version_id, inscription_id)
    VALUES (v_res_dataset_id, v_res_ins_id);
    RAISE EXCEPTION 'Expected frozen dataset membership rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

ROLLBACK;

SELECT 'Corpus provenance verification passed' AS result;
