-- PostgreSQL does not allow a newly added enum value to be safely used until
-- the ALTER TYPE transaction commits. Keep this step separate from the trigger
-- definitions below.
ALTER TYPE assertion_subject_type ADD VALUE IF NOT EXISTS 'sign';
ALTER TYPE assertion_subject_type ADD VALUE IF NOT EXISTS 'sign_sequence';
ALTER TYPE assertion_subject_type ADD VALUE IF NOT EXISTS 'sign_variant';
ALTER TYPE assertion_subject_type ADD VALUE IF NOT EXISTS 'object_relationship';

BEGIN;

CREATE OR REPLACE FUNCTION archaeological_subject_scope(p_subject_type assertion_subject_type, p_subject_id uuid)
RETURNS record_scope LANGUAGE plpgsql STABLE AS $$
DECLARE
  resolved_scope record_scope;
BEGIN
  CASE p_subject_type::text
    WHEN 'site' THEN SELECT record_scope INTO resolved_scope FROM sites WHERE id = p_subject_id;
    WHEN 'object' THEN SELECT record_scope INTO resolved_scope FROM objects WHERE id = p_subject_id;
    WHEN 'inscription' THEN SELECT record_scope INTO resolved_scope FROM inscriptions WHERE id = p_subject_id;
    WHEN 'sign_occurrence' THEN SELECT record_scope INTO resolved_scope FROM sign_occurrences WHERE id = p_subject_id;
    WHEN 'sign' THEN SELECT record_scope INTO resolved_scope FROM signs WHERE id = p_subject_id;
    WHEN 'sign_sequence' THEN SELECT record_scope INTO resolved_scope FROM sign_sequences WHERE id = p_subject_id;
    WHEN 'sign_variant' THEN SELECT record_scope INTO resolved_scope FROM sign_variants WHERE id = p_subject_id;
    WHEN 'object_relationship' THEN SELECT record_scope INTO resolved_scope FROM object_relationships WHERE id = p_subject_id;
  END CASE;
  IF resolved_scope IS NULL THEN
    RAISE EXCEPTION 'invalid archaeological assertion subject: type %, id %', p_subject_type, p_subject_id USING ERRCODE = '23503';
  END IF;
  RETURN resolved_scope;
END;
$$;

CREATE FUNCTION corpus_release_scope(p_corpus_release_id uuid)
RETURNS record_scope LANGUAGE plpgsql STABLE AS $$
DECLARE
  resolved_scope record_scope;
BEGIN
  SELECT record_scope INTO resolved_scope FROM corpus_releases WHERE id = p_corpus_release_id;
  IF resolved_scope IS NULL THEN
    RAISE EXCEPTION 'corpus release % does not exist', p_corpus_release_id USING ERRCODE = '23503';
  END IF;
  RETURN resolved_scope;
END;
$$;

CREATE FUNCTION catalogue_identifier_subject_scope(p_subject_type catalogue_identifier_subject_type, p_subject_id uuid)
RETURNS record_scope LANGUAGE plpgsql STABLE AS $$
DECLARE
  resolved_scope record_scope;
BEGIN
  CASE p_subject_type
    WHEN 'site' THEN SELECT record_scope INTO resolved_scope FROM sites WHERE id = p_subject_id;
    WHEN 'object' THEN SELECT record_scope INTO resolved_scope FROM objects WHERE id = p_subject_id;
    WHEN 'inscription' THEN SELECT record_scope INTO resolved_scope FROM inscriptions WHERE id = p_subject_id;
    WHEN 'sign' THEN SELECT record_scope INTO resolved_scope FROM signs WHERE id = p_subject_id;
    WHEN 'sign_variant' THEN SELECT record_scope INTO resolved_scope FROM sign_variants WHERE id = p_subject_id;
  END CASE;
  IF resolved_scope IS NULL THEN
    RAISE EXCEPTION 'invalid catalogue identifier subject: type %, id %', p_subject_type, p_subject_id USING ERRCODE = '23503';
  END IF;
  RETURN resolved_scope;
END;
$$;

CREATE FUNCTION validate_corpus_release() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  source_scope record_scope;
BEGIN
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF source_scope IS NULL THEN
    RAISE EXCEPTION 'corpus release source % does not exist', NEW.source_id USING ERRCODE = '23503';
  END IF;
  IF source_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'corpus release scope must match source scope' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_corpus_ingestion_run() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  release_scope record_scope;
  release_authorization corpus_release_authorization_status;
BEGIN
  SELECT record_scope, authorization_status INTO release_scope, release_authorization FROM corpus_releases WHERE id = NEW.corpus_release_id;
  IF release_scope IS NULL THEN
    RAISE EXCEPTION 'corpus ingestion run release % does not exist', NEW.corpus_release_id USING ERRCODE = '23503';
  END IF;
  IF release_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'corpus ingestion run scope must match corpus release scope' USING ERRCODE = '23514';
  END IF;
  IF NEW.record_scope = 'research' AND release_authorization <> 'authorized' THEN
    RAISE EXCEPTION 'research ingestion requires an authorized corpus release' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.corpus_release_id <> OLD.corpus_release_id OR NEW.record_scope <> OLD.record_scope THEN
      RAISE EXCEPTION 'corpus ingestion run release and scope are immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.state IN ('promoted', 'rejected') THEN
      RAISE EXCEPTION 'promoted or rejected ingestion runs are immutable' USING ERRCODE = '23514';
    END IF;
    IF NOT ((OLD.state = 'staged' AND NEW.state IN ('staged', 'validated', 'rejected')) OR (OLD.state = 'validated' AND NEW.state IN ('validated', 'promoted', 'rejected'))) THEN
      RAISE EXCEPTION 'invalid corpus ingestion run state transition from % to %', OLD.state, NEW.state USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.state = 'promoted' AND NOT EXISTS (SELECT 1 FROM corpus_staging_rows WHERE corpus_ingestion_run_id = NEW.id) THEN
    RAISE EXCEPTION 'cannot promote a corpus ingestion run without raw staging rows' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_corpus_staging_row() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  run_state corpus_ingestion_run_state;
  run_release_id uuid;
  file_release_id uuid;
BEGIN
  SELECT state, corpus_release_id INTO run_state, run_release_id FROM corpus_ingestion_runs WHERE id = NEW.corpus_ingestion_run_id;
  SELECT corpus_release_id INTO file_release_id FROM corpus_release_files WHERE id = NEW.corpus_release_file_id;
  IF run_state IS NULL OR file_release_id IS NULL THEN
    RAISE EXCEPTION 'corpus ingestion run or release file does not exist' USING ERRCODE = '23503';
  END IF;
  IF run_state <> 'staged' THEN
    RAISE EXCEPTION 'raw staging rows may only be added to a staged ingestion run' USING ERRCODE = '23514';
  END IF;
  IF run_release_id <> file_release_id THEN
    RAISE EXCEPTION 'raw staging row file must belong to the ingestion run release' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION prevent_corpus_staging_row_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'raw corpus staging rows are immutable' USING ERRCODE = '23514';
END;
$$;

CREATE FUNCTION validate_catalogue_identifier() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  subject_scope record_scope;
  source_scope record_scope;
BEGIN
  subject_scope := catalogue_identifier_subject_scope(NEW.subject_type, NEW.subject_id);
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF source_scope IS NULL THEN RAISE EXCEPTION 'catalogue identifier source does not exist' USING ERRCODE = '23503'; END IF;
  IF subject_scope <> NEW.record_scope OR source_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'catalogue identifier scope must match subject and source scope' USING ERRCODE = '23514';
  END IF;
  IF NEW.corpus_release_id IS NOT NULL THEN
    IF corpus_release_scope(NEW.corpus_release_id) <> NEW.record_scope THEN
      RAISE EXCEPTION 'catalogue identifier corpus release scope must match identifier scope' USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM corpus_releases WHERE id = NEW.corpus_release_id AND source_id = NEW.source_id) THEN
      RAISE EXCEPTION 'catalogue identifier source must match corpus release source' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_sign_variant() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  source_scope record_scope;
BEGIN
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF source_scope IS NULL OR source_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'sign variant scope must match source scope' USING ERRCODE = '23514';
  END IF;
  IF NEW.corpus_release_id IS NOT NULL THEN
    IF corpus_release_scope(NEW.corpus_release_id) <> NEW.record_scope
       OR NOT EXISTS (SELECT 1 FROM corpus_releases WHERE id = NEW.corpus_release_id AND source_id = NEW.source_id) THEN
      RAISE EXCEPTION 'sign variant corpus release must match source and scope' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_sign_variant_assignment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  variant_scope record_scope;
  sign_scope record_scope;
  source_scope record_scope;
BEGIN
  SELECT record_scope INTO variant_scope FROM sign_variants WHERE id = NEW.variant_id;
  SELECT record_scope INTO sign_scope FROM signs WHERE id = NEW.sign_id;
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF variant_scope IS NULL OR sign_scope IS NULL OR source_scope IS NULL THEN
    RAISE EXCEPTION 'sign variant assignment references a missing record' USING ERRCODE = '23503';
  END IF;
  IF variant_scope <> NEW.record_scope OR sign_scope <> NEW.record_scope OR source_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'sign variant assignment scope must match variant, sign, and source scope' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_object_relationship() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  subject_scope record_scope;
  related_scope record_scope;
  source_scope record_scope;
BEGIN
  SELECT record_scope INTO subject_scope FROM objects WHERE id = NEW.subject_object_id;
  SELECT record_scope INTO related_scope FROM objects WHERE id = NEW.related_object_id;
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF subject_scope IS NULL OR related_scope IS NULL OR source_scope IS NULL THEN
    RAISE EXCEPTION 'object relationship references a missing record' USING ERRCODE = '23503';
  END IF;
  IF subject_scope <> NEW.record_scope OR related_scope <> NEW.record_scope OR source_scope <> NEW.record_scope THEN
    RAISE EXCEPTION 'object relationship scope must match both objects and source scope' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_sequence_corpus_provenance() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  release_scope record_scope;
  release_source_id uuid;
  release_authorization corpus_release_authorization_status;
BEGIN
  IF NEW.corpus_release_id IS NOT NULL THEN
    SELECT record_scope, source_id, authorization_status INTO release_scope, release_source_id, release_authorization FROM corpus_releases WHERE id = NEW.corpus_release_id;
    IF release_scope IS NULL THEN RAISE EXCEPTION 'sequence corpus release does not exist' USING ERRCODE = '23503'; END IF;
    IF release_scope <> NEW.record_scope THEN RAISE EXCEPTION 'sequence scope must match corpus release scope' USING ERRCODE = '23514'; END IF;
    IF NEW.source_id IS NOT NULL AND release_source_id <> NEW.source_id THEN RAISE EXCEPTION 'sequence source must match corpus release source' USING ERRCODE = '23514'; END IF;
  END IF;
  IF NEW.sequence_basis = 'source_transcription' AND NEW.record_scope = 'research' THEN
    IF NEW.corpus_release_id IS NULL OR NEW.source_id IS NULL OR NEW.source_locator IS NULL OR NEW.source_transcription IS NULL THEN
      RAISE EXCEPTION 'research source transcriptions require source, authorized release, locator, and exact source transcription' USING ERRCODE = '23514';
    END IF;
    IF release_authorization <> 'authorized' THEN
      RAISE EXCEPTION 'research source transcriptions require an authorized corpus release' USING ERRCODE = '23514';
    END IF;
    IF NEW.source_token_order <> 'source_recorded' THEN
      RAISE EXCEPTION 'research source transcriptions must preserve source-recorded token order' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_occurrence_corpus_provenance() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  sequence_scope record_scope;
  sequence_basis_value sequence_basis;
  variant_scope record_scope;
BEGIN
  SELECT record_scope, sequence_basis INTO sequence_scope, sequence_basis_value FROM sign_sequences WHERE id = NEW.sequence_id;
  IF sequence_scope IS NULL THEN RAISE EXCEPTION 'sign occurrence sequence does not exist' USING ERRCODE = '23503'; END IF;
  IF NEW.sign_variant_id IS NOT NULL THEN
    SELECT record_scope INTO variant_scope FROM sign_variants WHERE id = NEW.sign_variant_id;
    IF variant_scope IS NULL THEN RAISE EXCEPTION 'sign occurrence variant does not exist' USING ERRCODE = '23503'; END IF;
    IF variant_scope <> NEW.record_scope THEN RAISE EXCEPTION 'sign occurrence scope must match variant scope' USING ERRCODE = '23514'; END IF;
    IF NEW.sign_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sign_variant_assignments WHERE variant_id = NEW.sign_variant_id AND sign_id = NEW.sign_id AND record_scope = NEW.record_scope AND status = 'active') THEN
      RAISE EXCEPTION 'sign occurrence variant/sign mapping requires an active source-backed assignment' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF sequence_scope = 'research' AND sequence_basis_value = 'source_transcription' THEN
    IF NEW.source_position_index IS NULL OR NEW.source_token_text IS NULL THEN
      RAISE EXCEPTION 'research source transcription occurrences require source position and exact source token text' USING ERRCODE = '23514';
    END IF;
    IF NEW.source_position_index <> NEW.position_index THEN
      RAISE EXCEPTION 'research source transcription source position must match stored occurrence order' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION prevent_corpus_parent_scope_mismatch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.record_scope = OLD.record_scope THEN RETURN NEW; END IF;
  CASE TG_TABLE_NAME
    WHEN 'sources' THEN
      IF EXISTS (SELECT 1 FROM corpus_releases WHERE source_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM catalogue_identifiers WHERE source_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM sign_variants WHERE source_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM sign_variant_assignments WHERE source_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM object_relationships WHERE source_id = OLD.id AND record_scope <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change source scope while corpus provenance records use another scope' USING ERRCODE = '23514';
      END IF;
    WHEN 'corpus_releases' THEN
      IF EXISTS (SELECT 1 FROM corpus_ingestion_runs WHERE corpus_release_id = OLD.id AND record_scope <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change corpus release scope while ingestion runs use another scope' USING ERRCODE = '23514';
      END IF;
    WHEN 'signs' THEN
      IF EXISTS (SELECT 1 FROM sign_variant_assignments WHERE sign_id = OLD.id AND record_scope <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change sign scope while variant assignments use another scope' USING ERRCODE = '23514';
      END IF;
    WHEN 'sign_variants' THEN
      IF EXISTS (SELECT 1 FROM sign_variant_assignments WHERE variant_id = OLD.id AND record_scope <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change sign variant scope while assignments use another scope' USING ERRCODE = '23514';
      END IF;
    WHEN 'objects' THEN
      IF EXISTS (SELECT 1 FROM object_relationships WHERE (subject_object_id = OLD.id OR related_object_id = OLD.id) AND record_scope <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change object scope while object relationships use another scope' USING ERRCODE = '23514';
      END IF;
  END CASE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER corpus_releases_integrity BEFORE INSERT OR UPDATE ON corpus_releases FOR EACH ROW EXECUTE FUNCTION validate_corpus_release();
CREATE TRIGGER corpus_ingestion_runs_integrity BEFORE INSERT OR UPDATE ON corpus_ingestion_runs FOR EACH ROW EXECUTE FUNCTION validate_corpus_ingestion_run();
CREATE TRIGGER corpus_staging_rows_integrity BEFORE INSERT ON corpus_staging_rows FOR EACH ROW EXECUTE FUNCTION validate_corpus_staging_row();
CREATE TRIGGER corpus_staging_rows_immutable BEFORE UPDATE OR DELETE ON corpus_staging_rows FOR EACH ROW EXECUTE FUNCTION prevent_corpus_staging_row_mutation();
CREATE TRIGGER catalogue_identifiers_integrity BEFORE INSERT OR UPDATE ON catalogue_identifiers FOR EACH ROW EXECUTE FUNCTION validate_catalogue_identifier();
CREATE TRIGGER sign_variants_integrity BEFORE INSERT OR UPDATE ON sign_variants FOR EACH ROW EXECUTE FUNCTION validate_sign_variant();
CREATE TRIGGER sign_variant_assignments_integrity BEFORE INSERT OR UPDATE ON sign_variant_assignments FOR EACH ROW EXECUTE FUNCTION validate_sign_variant_assignment();
CREATE TRIGGER object_relationships_integrity BEFORE INSERT OR UPDATE ON object_relationships FOR EACH ROW EXECUTE FUNCTION validate_object_relationship();
CREATE TRIGGER sign_sequences_corpus_provenance_integrity BEFORE INSERT OR UPDATE ON sign_sequences FOR EACH ROW EXECUTE FUNCTION validate_sequence_corpus_provenance();
CREATE TRIGGER sign_occurrences_corpus_provenance_integrity BEFORE INSERT OR UPDATE ON sign_occurrences FOR EACH ROW EXECUTE FUNCTION validate_occurrence_corpus_provenance();

CREATE TRIGGER sources_corpus_scope_parent_integrity BEFORE UPDATE OF record_scope ON sources FOR EACH ROW EXECUTE FUNCTION prevent_corpus_parent_scope_mismatch();
CREATE TRIGGER corpus_releases_scope_parent_integrity BEFORE UPDATE OF record_scope ON corpus_releases FOR EACH ROW EXECUTE FUNCTION prevent_corpus_parent_scope_mismatch();
CREATE TRIGGER signs_corpus_scope_parent_integrity BEFORE UPDATE OF record_scope ON signs FOR EACH ROW EXECUTE FUNCTION prevent_corpus_parent_scope_mismatch();
CREATE TRIGGER sign_variants_scope_parent_integrity BEFORE UPDATE OF record_scope ON sign_variants FOR EACH ROW EXECUTE FUNCTION prevent_corpus_parent_scope_mismatch();
CREATE TRIGGER objects_corpus_scope_parent_integrity BEFORE UPDATE OF record_scope ON objects FOR EACH ROW EXECUTE FUNCTION prevent_corpus_parent_scope_mismatch();

CREATE TRIGGER corpus_releases_updated_at BEFORE UPDATE ON corpus_releases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER corpus_ingestion_runs_updated_at BEFORE UPDATE ON corpus_ingestion_runs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER catalogue_identifiers_updated_at BEFORE UPDATE ON catalogue_identifiers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER object_relationships_updated_at BEFORE UPDATE ON object_relationships FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sign_variants_updated_at BEFORE UPDATE ON sign_variants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sign_variant_assignments_updated_at BEFORE UPDATE ON sign_variant_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
