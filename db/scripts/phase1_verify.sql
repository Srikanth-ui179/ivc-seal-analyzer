\set ON_ERROR_STOP on

-- Verify the synthetic fixture exists and remains visibly marked as demo-only.
DO $$
BEGIN
  IF (SELECT count(*) FROM inscriptions WHERE record_scope = 'demo') = 0 THEN
    RAISE EXCEPTION 'Expected at least one synthetic demo inscription';
  END IF;
  IF EXISTS (SELECT 1 FROM sources WHERE record_scope = 'demo' AND stable_id NOT LIKE 'DEMO-%') THEN
    RAISE EXCEPTION 'Demo source without DEMO- stable ID found';
  END IF;
END;
$$;

-- Foreign key enforcement: an object cannot reference an unknown site.
DO $$
BEGIN
  BEGIN
    INSERT INTO objects (stable_id, record_scope, site_id, object_type)
    VALUES ('TEST-FK-OBJECT', 'research', '11111111-1111-4111-8111-111111111111', 'test');
    RAISE EXCEPTION 'Expected foreign-key rejection';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

-- Polymorphic integrity: a declared site subject must actually exist in sites.
DO $$
BEGIN
  BEGIN
    INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
    VALUES ('site', '11111111-1111-4111-8111-111111111111', 'test_predicate', 'test value', '00000000-0000-4000-8000-000000000001', 'test');
    RAISE EXCEPTION 'Expected polymorphic assertion rejection';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

-- Scope integrity: research records cannot attach to demo records.
DO $$
BEGIN
  BEGIN
    INSERT INTO objects (stable_id, record_scope, site_id, object_type)
    VALUES ('TEST-SCOPE-OBJECT', 'research', '00000000-0000-4000-8000-000000000011', 'test');
    RAISE EXCEPTION 'Expected demo/research scope rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

SELECT 'Phase 1 verification passed' AS result;
