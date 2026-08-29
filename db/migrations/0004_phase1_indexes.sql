BEGIN;

CREATE INDEX sites_name_idx ON sites (canonical_name);
CREATE INDEX objects_site_id_idx ON objects (site_id);
CREATE INDEX objects_type_material_idx ON objects (object_type, material);
CREATE INDEX inscriptions_object_id_idx ON inscriptions (object_id);
CREATE INDEX signs_namespace_code_idx ON signs (catalogue_namespace, catalogue_code);
CREATE INDEX sign_sequences_inscription_idx ON sign_sequences (inscription_id);
CREATE UNIQUE INDEX sign_sequences_one_primary_per_inscription_idx ON sign_sequences (inscription_id) WHERE is_primary = true;
CREATE INDEX sign_occurrences_sign_id_idx ON sign_occurrences (sign_id) WHERE sign_id IS NOT NULL;
CREATE INDEX sign_occurrences_sequence_position_idx ON sign_occurrences (sequence_id, position_index);
CREATE INDEX archaeological_assertions_subject_idx ON archaeological_assertions (subject_type, subject_id);
CREATE INDEX archaeological_assertions_source_idx ON archaeological_assertions (source_id);
CREATE INDEX archaeological_assertions_predicate_idx ON archaeological_assertions (predicate);

COMMIT;
