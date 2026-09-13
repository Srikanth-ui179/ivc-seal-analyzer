BEGIN;

-- Dataset versions are Phase 2 reproducibility metadata. They reference the
-- stable Phase 1 corpus but never modify archaeological/catalogue records.
CREATE TYPE dataset_version_state AS ENUM ('draft', 'frozen');

CREATE TABLE dataset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  name text NOT NULL,
  description text,
  selection_criteria text NOT NULL,
  state dataset_version_state NOT NULL DEFAULT 'draft',
  frozen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dataset_versions_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT dataset_versions_state_timestamp_check CHECK ((state = 'draft' AND frozen_at IS NULL) OR (state = 'frozen' AND frozen_at IS NOT NULL))
);

-- Membership is the explicit corpus snapshot used by a future analysis. A new
-- dataset version, rather than an update to a frozen one, records any change.
CREATE TABLE dataset_version_inscriptions (
  dataset_version_id uuid NOT NULL REFERENCES dataset_versions(id) ON DELETE RESTRICT,
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE RESTRICT,
  included_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (dataset_version_id, inscription_id)
);

COMMIT;
