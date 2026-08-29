BEGIN;

-- These rows are synthetic fixtures for local development only. They are not
-- archaeological evidence, do not identify real sites or objects, and must not
-- be displayed as research records.
INSERT INTO sources (id, stable_id, record_scope, source_type, title, authors)
VALUES ('00000000-0000-4000-8000-000000000001', 'DEMO-SRC-0001', 'demo', 'demo_fixture', 'Synthetic demonstration source — not archaeological evidence', 'IndusScript AI development fixture')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO sites (id, stable_id, record_scope, canonical_name, notes)
VALUES ('00000000-0000-4000-8000-000000000011', 'DEMO-SITE-0001', 'demo', 'Demo Site Alpha', 'Synthetic development record. Not an archaeological site.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO objects (id, stable_id, record_scope, site_id, object_type, material, condition_notes)
VALUES ('00000000-0000-4000-8000-000000000021', 'DEMO-OBJ-0001', 'demo', '00000000-0000-4000-8000-000000000011', 'Synthetic seal-like object', 'Synthetic test material', 'Synthetic development record. Not an archaeological object.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO inscriptions (id, stable_id, record_scope, object_id, surface_label, condition_notes)
VALUES ('00000000-0000-4000-8000-000000000031', 'DEMO-INS-0001', 'demo', '00000000-0000-4000-8000-000000000021', 'face-a', 'Synthetic development record. Not an archaeological inscription.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO signs (id, stable_id, record_scope, catalogue_namespace, catalogue_code, visual_label, visual_description)
VALUES ('00000000-0000-4000-8000-000000000041', 'DEMO-SIGN-0001', 'demo', 'demo', 'D-001', 'Synthetic forked form', 'Synthetic visual catalogue fixture; it has no assigned meaning, language, phonetic value, or translation.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO sign_sequences (id, stable_id, record_scope, inscription_id, sequence_basis, is_primary, source_id, editorial_note)
VALUES ('00000000-0000-4000-8000-000000000051', 'DEMO-SEQ-0001', 'demo', '00000000-0000-4000-8000-000000000031', 'source_transcription', true, '00000000-0000-4000-8000-000000000001', 'Synthetic sequence used only to test schema relationships.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO sign_occurrences (id, stable_id, record_scope, sequence_id, sign_id, position_index, identification_status, observed_form_note)
VALUES ('00000000-0000-4000-8000-000000000061', 'DEMO-OCC-0001', 'demo', '00000000-0000-4000-8000-000000000051', '00000000-0000-4000-8000-000000000041', 1, 'identified', 'Synthetic occurrence for local development testing.')
ON CONFLICT (stable_id) DO NOTHING;

INSERT INTO archaeological_assertions (id, subject_type, subject_id, predicate, value_text, certainty, source_id, source_locator, note)
VALUES ('00000000-0000-4000-8000-000000000071', 'inscription', '00000000-0000-4000-8000-000000000031', 'record_classification', 'Synthetic demonstration record', 'asserted', '00000000-0000-4000-8000-000000000001', 'Development fixture', 'This assertion is synthetic and is not archaeological evidence.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
