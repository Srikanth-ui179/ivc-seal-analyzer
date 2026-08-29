BEGIN;

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Resolves the scope of a polymorphic assertion subject and raises an error when
-- its declared subject_type does not match an existing Phase 1 entity.
CREATE FUNCTION archaeological_subject_scope(p_subject_type assertion_subject_type, p_subject_id uuid)
RETURNS record_scope LANGUAGE plpgsql STABLE AS $$
DECLARE
  resolved_scope record_scope;
BEGIN
  CASE p_subject_type
    WHEN 'site' THEN SELECT record_scope INTO resolved_scope FROM sites WHERE id = p_subject_id;
    WHEN 'object' THEN SELECT record_scope INTO resolved_scope FROM objects WHERE id = p_subject_id;
    WHEN 'inscription' THEN SELECT record_scope INTO resolved_scope FROM inscriptions WHERE id = p_subject_id;
    WHEN 'sign_occurrence' THEN SELECT record_scope INTO resolved_scope FROM sign_occurrences WHERE id = p_subject_id;
  END CASE;
  IF resolved_scope IS NULL THEN
    RAISE EXCEPTION 'invalid archaeological assertion subject: type %, id %', p_subject_type, p_subject_id USING ERRCODE = '23503';
  END IF;
  RETURN resolved_scope;
END;
$$;

CREATE FUNCTION validate_archaeological_assertion() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  subject_scope record_scope;
  source_scope record_scope;
BEGIN
  subject_scope := archaeological_subject_scope(NEW.subject_type, NEW.subject_id);
  SELECT record_scope INTO source_scope FROM sources WHERE id = NEW.source_id;
  IF source_scope IS NULL THEN
    RAISE EXCEPTION 'assertion source % does not exist', NEW.source_id USING ERRCODE = '23503';
  END IF;
  IF subject_scope <> source_scope THEN
    RAISE EXCEPTION 'assertion source scope (%) must match subject scope (%)', source_scope, subject_scope USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_phase1_child_scope() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_scope record_scope;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'objects' THEN
      IF NEW.site_id IS NOT NULL THEN
        SELECT record_scope INTO parent_scope FROM sites WHERE id = NEW.site_id;
        IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'object scope must match site scope' USING ERRCODE = '23514'; END IF;
      END IF;
    WHEN 'inscriptions' THEN
      SELECT record_scope INTO parent_scope FROM objects WHERE id = NEW.object_id;
      IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'inscription scope must match object scope' USING ERRCODE = '23514'; END IF;
    WHEN 'signs' THEN
      IF NEW.parent_sign_id IS NOT NULL THEN
        SELECT record_scope INTO parent_scope FROM signs WHERE id = NEW.parent_sign_id;
        IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'sign scope must match parent sign scope' USING ERRCODE = '23514'; END IF;
      END IF;
    WHEN 'sign_sequences' THEN
      SELECT record_scope INTO parent_scope FROM inscriptions WHERE id = NEW.inscription_id;
      IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'sequence scope must match inscription scope' USING ERRCODE = '23514'; END IF;
      IF NEW.source_id IS NOT NULL THEN
        SELECT record_scope INTO parent_scope FROM sources WHERE id = NEW.source_id;
        IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'sequence scope must match source scope' USING ERRCODE = '23514'; END IF;
      END IF;
    WHEN 'sign_occurrences' THEN
      SELECT record_scope INTO parent_scope FROM sign_sequences WHERE id = NEW.sequence_id;
      IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'occurrence scope must match sequence scope' USING ERRCODE = '23514'; END IF;
      IF NEW.sign_id IS NOT NULL THEN
        SELECT record_scope INTO parent_scope FROM signs WHERE id = NEW.sign_id;
        IF parent_scope <> NEW.record_scope THEN RAISE EXCEPTION 'occurrence scope must match sign scope' USING ERRCODE = '23514'; END IF;
      END IF;
  END CASE;
  RETURN NEW;
END;
$$;

-- Prevent a parent scope change from invalidating already-linked children.
CREATE FUNCTION prevent_phase1_parent_scope_mismatch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.record_scope = OLD.record_scope THEN RETURN NEW; END IF;
  CASE TG_TABLE_NAME
    WHEN 'sources' THEN
      IF EXISTS (SELECT 1 FROM sign_sequences WHERE source_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM archaeological_assertions a WHERE a.source_id = OLD.id AND archaeological_subject_scope(a.subject_type, a.subject_id) <> NEW.record_scope) THEN
        RAISE EXCEPTION 'cannot change source scope while linked records use another scope' USING ERRCODE = '23514';
      END IF;
    WHEN 'sites' THEN
      IF EXISTS (SELECT 1 FROM objects WHERE site_id = OLD.id AND record_scope <> NEW.record_scope) THEN RAISE EXCEPTION 'cannot change site scope while linked objects use another scope' USING ERRCODE = '23514'; END IF;
    WHEN 'objects' THEN
      IF EXISTS (SELECT 1 FROM inscriptions WHERE object_id = OLD.id AND record_scope <> NEW.record_scope) THEN RAISE EXCEPTION 'cannot change object scope while linked inscriptions use another scope' USING ERRCODE = '23514'; END IF;
    WHEN 'inscriptions' THEN
      IF EXISTS (SELECT 1 FROM sign_sequences WHERE inscription_id = OLD.id AND record_scope <> NEW.record_scope) THEN RAISE EXCEPTION 'cannot change inscription scope while linked sequences use another scope' USING ERRCODE = '23514'; END IF;
    WHEN 'signs' THEN
      IF EXISTS (SELECT 1 FROM signs WHERE parent_sign_id = OLD.id AND record_scope <> NEW.record_scope)
         OR EXISTS (SELECT 1 FROM sign_occurrences WHERE sign_id = OLD.id AND record_scope <> NEW.record_scope) THEN RAISE EXCEPTION 'cannot change sign scope while linked records use another scope' USING ERRCODE = '23514'; END IF;
    WHEN 'sign_sequences' THEN
      IF EXISTS (SELECT 1 FROM sign_occurrences WHERE sequence_id = OLD.id AND record_scope <> NEW.record_scope) THEN RAISE EXCEPTION 'cannot change sequence scope while linked occurrences use another scope' USING ERRCODE = '23514'; END IF;
  END CASE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER archaeological_assertions_integrity BEFORE INSERT OR UPDATE ON archaeological_assertions FOR EACH ROW EXECUTE FUNCTION validate_archaeological_assertion();
CREATE TRIGGER objects_scope_integrity BEFORE INSERT OR UPDATE ON objects FOR EACH ROW EXECUTE FUNCTION validate_phase1_child_scope();
CREATE TRIGGER inscriptions_scope_integrity BEFORE INSERT OR UPDATE ON inscriptions FOR EACH ROW EXECUTE FUNCTION validate_phase1_child_scope();
CREATE TRIGGER signs_scope_integrity BEFORE INSERT OR UPDATE ON signs FOR EACH ROW EXECUTE FUNCTION validate_phase1_child_scope();
CREATE TRIGGER sign_sequences_scope_integrity BEFORE INSERT OR UPDATE ON sign_sequences FOR EACH ROW EXECUTE FUNCTION validate_phase1_child_scope();
CREATE TRIGGER sign_occurrences_scope_integrity BEFORE INSERT OR UPDATE ON sign_occurrences FOR EACH ROW EXECUTE FUNCTION validate_phase1_child_scope();

CREATE TRIGGER sources_scope_parent_integrity BEFORE UPDATE OF record_scope ON sources FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();
CREATE TRIGGER sites_scope_parent_integrity BEFORE UPDATE OF record_scope ON sites FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();
CREATE TRIGGER objects_scope_parent_integrity BEFORE UPDATE OF record_scope ON objects FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();
CREATE TRIGGER inscriptions_scope_parent_integrity BEFORE UPDATE OF record_scope ON inscriptions FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();
CREATE TRIGGER signs_scope_parent_integrity BEFORE UPDATE OF record_scope ON signs FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();
CREATE TRIGGER sign_sequences_scope_parent_integrity BEFORE UPDATE OF record_scope ON sign_sequences FOR EACH ROW EXECUTE FUNCTION prevent_phase1_parent_scope_mismatch();

CREATE TRIGGER sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER objects_updated_at BEFORE UPDATE ON objects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inscriptions_updated_at BEFORE UPDATE ON inscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER signs_updated_at BEFORE UPDATE ON signs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sign_sequences_updated_at BEFORE UPDATE ON sign_sequences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sign_occurrences_updated_at BEFORE UPDATE ON sign_occurrences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER archaeological_assertions_updated_at BEFORE UPDATE ON archaeological_assertions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
