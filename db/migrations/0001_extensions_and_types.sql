BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE record_scope AS ENUM ('research', 'demo');
CREATE TYPE record_status AS ENUM ('active', 'provisional', 'deprecated');
CREATE TYPE assertion_subject_type AS ENUM ('site', 'object', 'inscription', 'sign_occurrence');
CREATE TYPE assertion_certainty AS ENUM ('asserted', 'probable', 'possible', 'disputed');
CREATE TYPE sign_identification_status AS ENUM ('identified', 'tentative', 'unidentified', 'damaged');
CREATE TYPE sequence_basis AS ENUM ('source_transcription', 'editorial_normalization', 'alternative_reading');

COMMIT;
