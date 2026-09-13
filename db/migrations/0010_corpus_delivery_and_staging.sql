BEGIN;

-- These tables describe an authorized delivery and its private ingestion trail.
-- They do not contain public-upload functionality or archaeological assertions.
CREATE TYPE corpus_release_authorization_status AS ENUM ('pending', 'authorized', 'restricted', 'withdrawn');
CREATE TYPE corpus_release_file_role AS ENUM ('source_data', 'data_dictionary', 'licence_or_permission', 'documentation', 'other');
CREATE TYPE corpus_ingestion_run_state AS ENUM ('staged', 'validated', 'promoted', 'rejected');

CREATE TABLE corpus_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  release_label text NOT NULL,
  delivery_version text NOT NULL,
  provider_name text NOT NULL,
  authorization_status corpus_release_authorization_status NOT NULL DEFAULT 'pending',
  received_at timestamptz,
  permission_reference text,
  rights_summary text,
  data_dictionary_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT corpus_releases_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT corpus_releases_label_version_unique UNIQUE (source_id, release_label, delivery_version)
);

CREATE TABLE corpus_release_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_release_id uuid NOT NULL REFERENCES corpus_releases(id) ON DELETE RESTRICT,
  original_filename text NOT NULL,
  file_role corpus_release_file_role NOT NULL,
  media_type text,
  private_storage_locator text NOT NULL,
  sha256 text NOT NULL,
  byte_size bigint CHECK (byte_size IS NULL OR byte_size >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT corpus_release_files_filename_unique UNIQUE (corpus_release_id, original_filename),
  CONSTRAINT corpus_release_files_checksum_unique UNIQUE (corpus_release_id, sha256),
  CONSTRAINT corpus_release_files_sha256_check CHECK (sha256 ~ '^[0-9a-f]{64}$')
);

CREATE TABLE corpus_ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  corpus_release_id uuid NOT NULL REFERENCES corpus_releases(id) ON DELETE RESTRICT,
  state corpus_ingestion_run_state NOT NULL DEFAULT 'staged',
  importer_version text NOT NULL,
  manifest_sha256 text NOT NULL,
  validation_summary text,
  validated_at timestamptz,
  promoted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT corpus_ingestion_runs_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT corpus_ingestion_runs_manifest_sha256_check CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT corpus_ingestion_runs_state_timestamp_check CHECK (
    (state = 'staged' AND validated_at IS NULL AND promoted_at IS NULL AND rejected_at IS NULL)
    OR (state = 'validated' AND validated_at IS NOT NULL AND promoted_at IS NULL AND rejected_at IS NULL)
    OR (state = 'promoted' AND validated_at IS NOT NULL AND promoted_at IS NOT NULL AND rejected_at IS NULL)
    OR (state = 'rejected' AND rejected_at IS NOT NULL AND promoted_at IS NULL)
  )
);

-- Raw source rows are intentionally format-agnostic. JSONB is used only here to
-- retain a delivered row unchanged until it has been validated and reconciled.
CREATE TABLE corpus_staging_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_ingestion_run_id uuid NOT NULL REFERENCES corpus_ingestion_runs(id) ON DELETE RESTRICT,
  corpus_release_file_id uuid NOT NULL REFERENCES corpus_release_files(id) ON DELETE RESTRICT,
  source_row_key text NOT NULL,
  raw_payload jsonb NOT NULL,
  raw_payload_sha256 text NOT NULL,
  parse_status text NOT NULL DEFAULT 'unparsed',
  validation_errors jsonb,
  staged_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT corpus_staging_rows_source_key_unique UNIQUE (corpus_ingestion_run_id, corpus_release_file_id, source_row_key),
  CONSTRAINT corpus_staging_rows_payload_sha256_check CHECK (raw_payload_sha256 ~ '^[0-9a-f]{64}$')
);

COMMIT;
