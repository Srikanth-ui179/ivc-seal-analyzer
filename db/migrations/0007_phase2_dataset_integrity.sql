BEGIN;

CREATE FUNCTION validate_dataset_version_inscription() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  dataset_scope record_scope;
  inscription_scope record_scope;
  dataset_state dataset_version_state;
  target_dataset_version_id uuid;
  target_inscription_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_dataset_version_id := OLD.dataset_version_id;
    target_inscription_id := OLD.inscription_id;
  ELSE
    target_dataset_version_id := NEW.dataset_version_id;
    target_inscription_id := NEW.inscription_id;
  END IF;

  SELECT record_scope, state INTO dataset_scope, dataset_state FROM dataset_versions WHERE id = target_dataset_version_id;
  SELECT record_scope INTO inscription_scope FROM inscriptions WHERE id = target_inscription_id;

  IF dataset_scope IS NULL OR inscription_scope IS NULL THEN
    RAISE EXCEPTION 'dataset version or inscription does not exist' USING ERRCODE = '23503';
  END IF;
  IF dataset_state <> 'draft' THEN
    RAISE EXCEPTION 'cannot modify membership of a frozen dataset version' USING ERRCODE = '23514';
  END IF;
  IF dataset_scope <> inscription_scope THEN
    RAISE EXCEPTION 'dataset version scope must match inscription scope' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION validate_dataset_version_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.state = 'frozen' THEN
    RAISE EXCEPTION 'frozen dataset versions are immutable; create a new version instead' USING ERRCODE = '23514';
  END IF;
  IF NEW.state = 'frozen' THEN
    IF NEW.frozen_at IS NULL THEN
      RAISE EXCEPTION 'frozen dataset versions require frozen_at' USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM dataset_version_inscriptions WHERE dataset_version_id = NEW.id) THEN
      RAISE EXCEPTION 'cannot freeze a dataset version without inscriptions' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION prevent_dataset_version_scope_mismatch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.record_scope <> OLD.record_scope
     AND EXISTS (SELECT 1 FROM dataset_version_inscriptions dvi JOIN inscriptions i ON i.id = dvi.inscription_id WHERE dvi.dataset_version_id = OLD.id AND i.record_scope <> NEW.record_scope) THEN
    RAISE EXCEPTION 'cannot change dataset version scope while membership has another scope' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER dataset_version_inscriptions_integrity BEFORE INSERT OR UPDATE OR DELETE ON dataset_version_inscriptions FOR EACH ROW EXECUTE FUNCTION validate_dataset_version_inscription();
CREATE TRIGGER dataset_versions_immutable_when_frozen BEFORE UPDATE ON dataset_versions FOR EACH ROW EXECUTE FUNCTION validate_dataset_version_update();
CREATE TRIGGER dataset_versions_scope_integrity BEFORE UPDATE OF record_scope ON dataset_versions FOR EACH ROW EXECUTE FUNCTION prevent_dataset_version_scope_mismatch();

COMMIT;
