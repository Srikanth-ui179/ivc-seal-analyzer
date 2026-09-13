BEGIN;

CREATE INDEX dataset_versions_scope_state_idx ON dataset_versions (record_scope, state);
CREATE INDEX dataset_version_inscriptions_inscription_idx ON dataset_version_inscriptions (inscription_id);

COMMIT;
