BEGIN;

-- This is the stable archaeological/catalogue layer. Phase 2 and 3 outputs must
-- reference these records and must never update or reinterpret them in place.
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  source_type text NOT NULL,
  citation_key text UNIQUE,
  title text NOT NULL,
  authors text,
  publication_year integer CHECK (publication_year IS NULL OR publication_year BETWEEN 1 AND 9999),
  publisher_or_journal text,
  doi text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sources_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research')
);

CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  canonical_name text NOT NULL,
  modern_region text,
  country text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  coordinate_precision_meters integer CHECK (coordinate_precision_meters IS NULL OR coordinate_precision_meters >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sites_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT sites_coordinates_pair_check CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)),
  CONSTRAINT sites_latitude_check CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT sites_longitude_check CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE TABLE objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  site_id uuid REFERENCES sites(id) ON DELETE RESTRICT,
  object_type text NOT NULL,
  material text,
  collection_name text,
  collection_identifier text,
  current_location text,
  height_mm numeric(10, 2),
  width_mm numeric(10, 2),
  depth_mm numeric(10, 2),
  diameter_mm numeric(10, 2),
  condition_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT objects_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT objects_dimensions_nonnegative_check CHECK ((height_mm IS NULL OR height_mm >= 0) AND (width_mm IS NULL OR width_mm >= 0) AND (depth_mm IS NULL OR depth_mm >= 0) AND (diameter_mm IS NULL OR diameter_mm >= 0)),
  CONSTRAINT objects_scope_matches_site_check CHECK (site_id IS NULL OR record_scope IN ('research', 'demo'))
);

CREATE TABLE inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  object_id uuid NOT NULL REFERENCES objects(id) ON DELETE RESTRICT,
  surface_label text NOT NULL,
  image_reference text,
  image_rights_status text,
  condition_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inscriptions_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT inscriptions_object_surface_unique UNIQUE (object_id, surface_label)
);

-- Signs deliberately contain only visual/catalogue information. There are no
-- semantic, linguistic, phonetic, transliteration, or translation fields.
CREATE TABLE signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  catalogue_namespace text NOT NULL,
  catalogue_code text NOT NULL,
  visual_label text NOT NULL,
  parent_sign_id uuid REFERENCES signs(id) ON DELETE RESTRICT,
  visual_description text,
  glyph_svg text,
  image_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT signs_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT signs_catalogue_code_unique UNIQUE (catalogue_namespace, catalogue_code),
  CONSTRAINT signs_no_self_parent_check CHECK (parent_sign_id IS NULL OR parent_sign_id <> id)
);

-- Multiple sequences preserve competing source transcriptions or editorial
-- normalizations without changing the underlying inscription record.
CREATE TABLE sign_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE RESTRICT,
  sequence_basis sequence_basis NOT NULL,
  sequence_version integer NOT NULL DEFAULT 1 CHECK (sequence_version > 0),
  is_primary boolean NOT NULL DEFAULT false,
  source_id uuid REFERENCES sources(id) ON DELETE RESTRICT,
  editorial_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sign_sequences_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT sign_sequences_version_unique UNIQUE (inscription_id, sequence_basis, sequence_version)
);

CREATE TABLE sign_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  sequence_id uuid NOT NULL REFERENCES sign_sequences(id) ON DELETE CASCADE,
  sign_id uuid REFERENCES signs(id) ON DELETE RESTRICT,
  position_index integer NOT NULL,
  identification_status sign_identification_status NOT NULL,
  observed_form_note text,
  orientation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sign_occurrences_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT sign_occurrences_position_positive_check CHECK (position_index > 0),
  CONSTRAINT sign_occurrences_identified_requires_sign_check CHECK (identification_status IN ('unidentified', 'damaged') OR sign_id IS NOT NULL),
  CONSTRAINT sign_occurrences_sequence_position_unique UNIQUE (sequence_id, position_index)
);

-- Polymorphic subject references are validated by a trigger in migration 0003.
-- The trigger makes (subject_type, subject_id) act as a constrained polymorphic FK.
CREATE TABLE archaeological_assertions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type assertion_subject_type NOT NULL,
  subject_id uuid NOT NULL,
  predicate text NOT NULL,
  value_text text,
  value_jsonb jsonb,
  certainty assertion_certainty NOT NULL DEFAULT 'asserted',
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  source_locator text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  supersedes_assertion_id uuid REFERENCES archaeological_assertions(id) ON DELETE RESTRICT,
  CONSTRAINT archaeological_assertions_value_present_check CHECK (value_text IS NOT NULL OR value_jsonb IS NOT NULL),
  CONSTRAINT archaeological_assertions_one_value_representation_check CHECK (NOT (value_text IS NOT NULL AND value_jsonb IS NOT NULL))
);

COMMIT;
