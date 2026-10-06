BEGIN;

-- Migration 0017: Seed frozen research dataset DATASET-CISI-MOHENJODARO-V1
--
-- Idempotently and safely creates the frozen research dataset version snapshot
-- for the 179 Mohenjo-daro inscriptions from CISI / Mayig release REL-CISI-MAYIG-V1.
-- Follows Phase 2 integrity rules: insert as draft, populate membership,
-- then freeze with frozen_at timestamp.

DO $$
DECLARE
  v_dataset_id CONSTANT uuid := '00000000-0000-4000-8000-000000000181'::uuid;
  v_stable_id CONSTANT text := 'DATASET-CISI-MOHENJODARO-V1';
  v_count integer;
BEGIN
  -- Insert draft dataset version if not already present
  IF NOT EXISTS (SELECT 1 FROM dataset_versions WHERE id = v_dataset_id OR stable_id = v_stable_id) THEN
    INSERT INTO dataset_versions (
      id,
      stable_id,
      record_scope,
      name,
      description,
      selection_criteria,
      state,
      frozen_at,
      created_at
    ) VALUES (
      v_dataset_id,
      v_stable_id,
      'research',
      'CISI Mohenjo-daro Seals (M-1..M-199)',
      'Complete machine-readable research dataset snapshot of 179 Mohenjo-daro seals from the CISI open digitization by Michael Carlson.',
      'All 179 verified research inscriptions from release REL-CISI-MAYIG-V1.',
      'draft',
      NULL,
      now()
    );

    -- Insert all 179 research inscriptions from Mohenjo-daro
    INSERT INTO dataset_version_inscriptions (dataset_version_id, inscription_id, included_at)
    SELECT
      v_dataset_id,
      i.id,
      now()
    FROM inscriptions i
    JOIN objects o ON o.id = i.object_id
    JOIN sites s ON s.id = o.site_id
    WHERE s.stable_id = 'SITE-MOHENJO-DARO'
      AND i.record_scope = 'research'
    ON CONFLICT (dataset_version_id, inscription_id) DO NOTHING;

    -- Freeze the dataset version now that membership is populated
    UPDATE dataset_versions
    SET state = 'frozen',
        frozen_at = now()
    WHERE id = v_dataset_id;
  END IF;

  -- Verify exact membership count inside transaction
  SELECT count(*) INTO v_count
  FROM dataset_version_inscriptions
  WHERE dataset_version_id = v_dataset_id;

  IF v_count <> 179 THEN
    RAISE EXCEPTION 'Expected 179 inscriptions in dataset %, found %', v_stable_id, v_count;
  END IF;
END;
$$;

COMMIT;
