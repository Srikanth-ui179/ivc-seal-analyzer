BEGIN;

CREATE TYPE catalogue_identifier_subject_type AS ENUM ('site', 'object', 'inscription', 'sign', 'sign_variant');
CREATE TYPE object_relationship_type AS ENUM ('impression_of', 'possible_same_die_as', 'physical_duplicate_of', 'cast_of', 'other_source_described');

-- Verbatim external identifiers remain separate from internal stable IDs. Their
-- polymorphic subject is validated by a trigger in migration 0013.
CREATE TABLE catalogue_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_scope record_scope NOT NULL DEFAULT 'research',
  subject_type catalogue_identifier_subject_type NOT NULL,
  subject_id uuid NOT NULL,
  catalogue_namespace text NOT NULL,
  identifier_text text NOT NULL,
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  corpus_release_id uuid REFERENCES corpus_releases(id) ON DELETE RESTRICT,
  source_locator text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalogue_identifiers_text_nonempty_check CHECK (btrim(identifier_text) <> ''),
  CONSTRAINT catalogue_identifiers_unique UNIQUE (catalogue_namespace, identifier_text, subject_type)
);

CREATE TABLE object_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id text NOT NULL UNIQUE,
  record_scope record_scope NOT NULL DEFAULT 'research',
  status record_status NOT NULL DEFAULT 'active',
  subject_object_id uuid NOT NULL REFERENCES objects(id) ON DELETE RESTRICT,
  related_object_id uuid NOT NULL REFERENCES objects(id) ON DELETE RESTRICT,
  relationship_type object_relationship_type NOT NULL,
  certainty assertion_certainty NOT NULL DEFAULT 'asserted',
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  source_locator text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT object_relationships_demo_stable_id_check CHECK ((record_scope = 'demo' AND stable_id LIKE 'DEMO-%') OR record_scope = 'research'),
  CONSTRAINT object_relationships_not_self_check CHECK (subject_object_id <> related_object_id),
  CONSTRAINT object_relationships_source_locator_nonempty_check CHECK (btrim(source_locator) <> ''),
  CONSTRAINT object_relationships_unique UNIQUE (subject_object_id, related_object_id, relationship_type, source_id)
);

COMMIT;
