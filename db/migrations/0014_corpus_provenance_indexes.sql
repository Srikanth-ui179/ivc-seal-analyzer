BEGIN;

CREATE INDEX corpus_releases_source_idx ON corpus_releases (source_id);
CREATE INDEX corpus_releases_scope_authorization_idx ON corpus_releases (record_scope, authorization_status);
CREATE INDEX corpus_release_files_release_idx ON corpus_release_files (corpus_release_id);
CREATE INDEX corpus_ingestion_runs_release_state_idx ON corpus_ingestion_runs (corpus_release_id, state);
CREATE INDEX corpus_staging_rows_run_idx ON corpus_staging_rows (corpus_ingestion_run_id);
CREATE INDEX corpus_staging_rows_file_idx ON corpus_staging_rows (corpus_release_file_id);
CREATE INDEX catalogue_identifiers_subject_idx ON catalogue_identifiers (subject_type, subject_id);
CREATE INDEX catalogue_identifiers_source_idx ON catalogue_identifiers (source_id);
CREATE UNIQUE INDEX catalogue_identifiers_one_primary_per_subject_idx ON catalogue_identifiers (subject_type, subject_id) WHERE is_primary = true;
CREATE INDEX object_relationships_subject_idx ON object_relationships (subject_object_id);
CREATE INDEX object_relationships_related_idx ON object_relationships (related_object_id);
CREATE INDEX object_relationships_source_idx ON object_relationships (source_id);
CREATE INDEX sign_variants_source_idx ON sign_variants (source_id);
CREATE INDEX sign_variant_assignments_variant_idx ON sign_variant_assignments (variant_id);
CREATE INDEX sign_variant_assignments_sign_idx ON sign_variant_assignments (sign_id);
CREATE INDEX sign_sequences_corpus_release_idx ON sign_sequences (corpus_release_id) WHERE corpus_release_id IS NOT NULL;
CREATE INDEX sign_occurrences_variant_idx ON sign_occurrences (sign_variant_id) WHERE sign_variant_id IS NOT NULL;
CREATE INDEX sign_occurrences_source_position_idx ON sign_occurrences (sequence_id, source_position_index) WHERE source_position_index IS NOT NULL;

COMMIT;
