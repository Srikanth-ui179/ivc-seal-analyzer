BEGIN;

CREATE TYPE source_token_order_basis AS ENUM ('source_recorded', 'editorial_normalized');
CREATE TYPE recorded_direction AS ENUM ('right_to_left', 'left_to_right', 'top_to_bottom', 'bottom_to_top', 'boustrophedon', 'radial', 'symmetrical', 'unknown', 'not_recorded');
CREATE TYPE inscription_layout_type AS ENUM ('linear', 'multiline', 'radial', 'boustrophedon', 'symmetrical', 'other', 'not_recorded');
CREATE TYPE source_completeness_status AS ENUM ('complete', 'incomplete', 'damaged_or_lost', 'uncertain', 'not_recorded');

ALTER TABLE sign_sequences
  ADD COLUMN corpus_release_id uuid REFERENCES corpus_releases(id) ON DELETE RESTRICT,
  ADD COLUMN source_locator text,
  ADD COLUMN source_line_label text,
  ADD COLUMN source_transcription text,
  ADD COLUMN source_token_order source_token_order_basis NOT NULL DEFAULT 'source_recorded',
  ADD COLUMN recorded_direction recorded_direction NOT NULL DEFAULT 'not_recorded',
  ADD COLUMN presentation_orientation recorded_direction NOT NULL DEFAULT 'not_recorded',
  ADD COLUMN layout_type inscription_layout_type NOT NULL DEFAULT 'not_recorded',
  ADD COLUMN source_completeness source_completeness_status NOT NULL DEFAULT 'not_recorded',
  ADD CONSTRAINT sign_sequences_source_locator_nonempty_check CHECK (source_locator IS NULL OR btrim(source_locator) <> ''),
  ADD CONSTRAINT sign_sequences_source_transcription_nonempty_check CHECK (source_transcription IS NULL OR btrim(source_transcription) <> ''),
  ADD CONSTRAINT sign_sequences_research_source_transcription_provenance_check CHECK (
    sequence_basis <> 'source_transcription'
    OR record_scope = 'demo'
    OR (source_id IS NOT NULL AND corpus_release_id IS NOT NULL AND source_locator IS NOT NULL AND source_transcription IS NOT NULL)
  );

-- Sign variants are visual/catalogue records only. Assignment retains a source's
-- mapping to a canonical catalogue sign without implying a meaning or reading.
CREATE TABLE sign_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  catalogue_namespace text NOT NULL,
  variant_code text NOT NULL,
  visual_label text NOT NULL,
  glyph_svg text,
  image_reference text,
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  corpus_release_id uuid REFERENCES corpus_releases(id) ON DELETE RESTRICT,
  source_locator text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sign_variants_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT sign_variants_namespace_code_unique UNIQUE (catalogue_namespace, variant_code),
  CONSTRAINT sign_variants_source_locator_nonempty_check CHECK (btrim(source_locator) <> '')
);

CREATE TABLE sign_variant_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_scope record_scope NOT NULL DEFAULT 'research',
  variant_id uuid NOT NULL REFERENCES sign_variants(id) ON DELETE RESTRICT,
  sign_id uuid NOT NULL REFERENCES signs(id) ON DELETE RESTRICT,
  status record_status NOT NULL DEFAULT 'active',
  certainty assertion_certainty NOT NULL DEFAULT 'asserted',
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  source_locator text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sign_variant_assignments_source_locator_nonempty_check CHECK (btrim(source_locator) <> ''),
  CONSTRAINT sign_variant_assignments_unique UNIQUE (variant_id, sign_id, source_id)
);

ALTER TABLE sign_occurrences
  ADD COLUMN sign_variant_id uuid REFERENCES sign_variants(id) ON DELETE RESTRICT,
  ADD COLUMN source_position_index integer,
  ADD COLUMN source_token_text text,
  ADD COLUMN source_marker text,
  ADD CONSTRAINT sign_occurrences_source_position_positive_check CHECK (source_position_index IS NULL OR source_position_index > 0),
  ADD CONSTRAINT sign_occurrences_source_token_nonempty_check CHECK (source_token_text IS NULL OR btrim(source_token_text) <> ''),
  ADD CONSTRAINT sign_occurrences_source_marker_nonempty_check CHECK (source_marker IS NULL OR btrim(source_marker) <> '');

COMMIT;
