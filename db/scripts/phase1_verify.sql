\set ON_ERROR_STOP on

-- The deployed database must contain no legacy synthetic fixture rows.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM sources WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM sites WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM objects WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM inscriptions WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM signs WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM sign_sequences WHERE record_scope = 'demo'
    UNION ALL SELECT 1 FROM sign_occurrences WHERE record_scope = 'demo'
  ) THEN
    RAISE EXCEPTION 'Legacy demo records remain in the database';
  END IF;
END;
$$;

BEGIN;

-- Verification-only records are transaction-scoped and are rolled back below.
INSERT INTO sources (id, stable_id, record_scope, source_type, title)
VALUES ('10000000-0000-4000-8000-000000000001', 'DEMO-VERIFY-SRC-0001', 'demo', 'verification_fixture', 'Synthetic verification source');
INSERT INTO sites (id, stable_id, record_scope, canonical_name)
VALUES ('10000000-0000-4000-8000-000000000011', 'DEMO-VERIFY-SITE-0001', 'demo', 'Synthetic verification site');

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

DO $$
BEGIN
  BEGIN
    INSERT INTO archaeological_assertions (subject_type, subject_id, predicate, value_text, source_id, source_locator)
    VALUES ('site', '11111111-1111-4111-8111-111111111111', 'test_predicate', 'test value', '10000000-0000-4000-8000-000000000001', 'verification');
    RAISE EXCEPTION 'Expected polymorphic assertion rejection';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO objects (stable_id, record_scope, site_id, object_type)
    VALUES ('TEST-SCOPE-OBJECT', 'research', '10000000-0000-4000-8000-000000000011', 'test');
    RAISE EXCEPTION 'Expected demo/research scope rejection';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

ROLLBACK;

SELECT 'Phase 1 verification passed; no persistent demo fixture records found' AS result;
