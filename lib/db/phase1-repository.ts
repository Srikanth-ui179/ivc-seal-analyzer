import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type { InscriptionDetail, InscriptionSummary, ObjectDetail, ObjectSummary, Page, Pagination, ScopeFilter, SequenceSummary, SignDetail, SignOccurrence, SignSequenceDetail, SignSummary, SiteDetail, SiteSummary } from "@/lib/db/types";

type QueryOptions = Pagination & { scope?: ScopeFilter; search?: string };
type ObjectQueryOptions = QueryOptions & { siteId?: string; objectType?: string };
type InscriptionQueryOptions = QueryOptions & { siteId?: string; objectType?: string };
type SignQueryOptions = QueryOptions & { catalogueNamespace?: string };
type RawSequence = Omit<SequenceSummary, "tokens">;

function pageOptions(options: Pagination = {}) {
  return { limit: Math.min(Math.max(options.limit ?? 24, 1), 100), offset: Math.max(options.offset ?? 0, 0) };
}

function addScopeFilter(filters: string[], values: unknown[], scope: ScopeFilter | undefined, column: string) {
  if (scope && scope !== "all") {
    values.push(scope);
    filters.push(`${column} = $${values.length}::record_scope`);
  }
}

function toSequence(row: RawSequence, tokens: string[] = []): SequenceSummary {
  return { ...row, tokens };
}

function mapOccurrence(row: Record<string, unknown>): SignOccurrence {
  const hasSign = row.sign_id !== null;
  return {
    id: String(row.id), stableId: String(row.stable_id), recordScope: row.record_scope as SignOccurrence["recordScope"],
    positionIndex: Number(row.position_index), identificationStatus: row.identification_status as SignOccurrence["identificationStatus"],
    observedFormNote: row.observed_form_note as string | null, orientationNote: row.orientation_note as string | null,
    sign: hasSign ? { id: String(row.sign_id), stableId: String(row.sign_stable_id), catalogueNamespace: String(row.catalogue_namespace), catalogueCode: String(row.catalogue_code), visualLabel: String(row.visual_label), glyphSvg: row.glyph_svg as string | null } : null,
  };
}

async function countAndRows<T>(countSql: string, rowSql: string, values: unknown[], pagination: ReturnType<typeof pageOptions>): Promise<Page<T>> {
  const countResult = await databaseQuery<{ total: string }>(countSql, values);
  const pageValues = [...values, pagination.limit, pagination.offset];
  const rows = await databaseQuery<T & Record<string, unknown>>(rowSql, pageValues);
  return { items: rows.rows as T[], total: Number(countResult.rows[0]?.total ?? 0), ...pagination };
}

export async function listSites(options: QueryOptions = {}): Promise<Page<SiteSummary>> {
  const pagination = pageOptions(options); const values: unknown[] = []; const filters: string[] = [];
  addScopeFilter(filters, values, options.scope, "s.record_scope");
  if (options.search) { values.push(`%${options.search}%`); filters.push(`(s.canonical_name ILIKE $${values.length} OR s.modern_region ILIKE $${values.length} OR s.country ILIKE $${values.length})`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return countAndRows<SiteSummary>(`SELECT count(*)::text AS total FROM sites s ${where}`, `SELECT s.id, s.stable_id AS "stableId", s.record_scope AS "recordScope", s.status, s.canonical_name AS "canonicalName", s.modern_region AS "modernRegion", s.country FROM sites s ${where} ORDER BY s.canonical_name, s.stable_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, values, pagination);
}

export async function getSite(id: string): Promise<SiteDetail | null> {
  const result = await databaseQuery<SiteDetail>(`SELECT id, stable_id AS "stableId", record_scope AS "recordScope", status, canonical_name AS "canonicalName", modern_region AS "modernRegion", country, latitude::text, longitude::text, coordinate_precision_meters AS "coordinatePrecisionMeters", notes, created_at AS "createdAt", updated_at AS "updatedAt" FROM sites WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listObjects(options: ObjectQueryOptions = {}): Promise<Page<ObjectSummary>> {
  const pagination = pageOptions(options); const values: unknown[] = []; const filters: string[] = [];
  addScopeFilter(filters, values, options.scope, "o.record_scope");
  if (options.siteId) { values.push(options.siteId); filters.push(`o.site_id = $${values.length}`); }
  if (options.objectType) { values.push(options.objectType); filters.push(`o.object_type = $${values.length}`); }
  if (options.search) { values.push(`%${options.search}%`); filters.push(`(o.stable_id ILIKE $${values.length} OR o.object_type ILIKE $${values.length} OR o.material ILIKE $${values.length})`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const sql = `SELECT o.id, o.stable_id AS "stableId", o.record_scope AS "recordScope", o.status, o.object_type AS "objectType", o.material AS "material", o.collection_name AS "collectionName", o.collection_identifier AS "collectionIdentifier", CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object('id', s.id, 'stableId', s.stable_id, 'canonicalName', s.canonical_name, 'modernRegion', s.modern_region, 'country', s.country) END AS site FROM objects o LEFT JOIN sites s ON s.id = o.site_id ${where}`;
  return countAndRows<ObjectSummary>(`SELECT count(*)::text AS total FROM objects o ${where}`, `${sql} ORDER BY o.stable_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, values, pagination);
}

export async function getObject(id: string): Promise<ObjectDetail | null> {
  const result = await databaseQuery<ObjectDetail>(`SELECT o.id, o.stable_id AS "stableId", o.record_scope AS "recordScope", o.status, o.object_type AS "objectType", o.material, o.collection_name AS "collectionName", o.collection_identifier AS "collectionIdentifier", o.current_location AS "currentLocation", o.height_mm::text AS "heightMm", o.width_mm::text AS "widthMm", o.depth_mm::text AS "depthMm", o.diameter_mm::text AS "diameterMm", o.condition_notes AS "conditionNotes", o.created_at AS "createdAt", o.updated_at AS "updatedAt", CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object('id', s.id, 'stableId', s.stable_id, 'canonicalName', s.canonical_name, 'modernRegion', s.modern_region, 'country', s.country) END AS site FROM objects o LEFT JOIN sites s ON s.id = o.site_id WHERE o.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listInscriptions(options: InscriptionQueryOptions = {}): Promise<Page<InscriptionSummary>> {
  const pagination = pageOptions(options); const values: unknown[] = []; const filters: string[] = [];
  addScopeFilter(filters, values, options.scope, "i.record_scope");
  if (options.siteId) { values.push(options.siteId); filters.push(`o.site_id = $${values.length}`); }
  if (options.objectType) { values.push(options.objectType); filters.push(`o.object_type = $${values.length}`); }
  if (options.search) { values.push(`%${options.search}%`); filters.push(`(i.stable_id ILIKE $${values.length} OR o.stable_id ILIKE $${values.length} OR s.canonical_name ILIKE $${values.length})`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const select = `SELECT i.id, i.stable_id AS "stableId", i.record_scope AS "recordScope", i.status, i.surface_label AS "surfaceLabel", i.image_reference AS "imageReference", i.image_rights_status AS "imageRightsStatus", i.condition_notes AS "conditionNotes", json_build_object('id', o.id, 'stableId', o.stable_id, 'objectType', o.object_type, 'material', o.material) AS object, CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object('id', s.id, 'stableId', s.stable_id, 'canonicalName', s.canonical_name, 'modernRegion', s.modern_region, 'country', s.country) END AS site, sequence_data."primarySequence" FROM inscriptions i JOIN objects o ON o.id = i.object_id LEFT JOIN sites s ON s.id = o.site_id LEFT JOIN LATERAL (SELECT json_build_object('id', sq.id, 'stableId', sq.stable_id, 'recordScope', sq.record_scope, 'status', sq.status, 'sequenceBasis', sq.sequence_basis, 'sequenceVersion', sq.sequence_version, 'isPrimary', sq.is_primary, 'editorialNote', sq.editorial_note, 'tokens', COALESCE((SELECT json_agg(COALESCE(sg.catalogue_namespace || ':' || sg.catalogue_code, '[' || so.identification_status || ']') ORDER BY so.position_index) FROM sign_occurrences so LEFT JOIN signs sg ON sg.id = so.sign_id WHERE so.sequence_id = sq.id), '[]'::json)) AS "primarySequence" FROM sign_sequences sq WHERE sq.inscription_id = i.id ORDER BY sq.is_primary DESC, sq.sequence_basis, sq.sequence_version LIMIT 1) sequence_data ON true ${where}`;
  return countAndRows<InscriptionSummary>(`SELECT count(*)::text AS total FROM inscriptions i JOIN objects o ON o.id = i.object_id LEFT JOIN sites s ON s.id = o.site_id ${where}`, `${select} ORDER BY i.stable_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, values, pagination);
}

export async function getInscription(id: string): Promise<InscriptionDetail | null> {
  const inscriptionResult = await databaseQuery<Omit<InscriptionDetail, "sequences" | "primarySequence">>(`SELECT i.id, i.stable_id AS "stableId", i.record_scope AS "recordScope", i.status, i.surface_label AS "surfaceLabel", i.image_reference AS "imageReference", i.image_rights_status AS "imageRightsStatus", i.condition_notes AS "conditionNotes", i.created_at AS "createdAt", i.updated_at AS "updatedAt", json_build_object('id', o.id, 'stableId', o.stable_id, 'objectType', o.object_type, 'material', o.material) AS object, CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object('id', s.id, 'stableId', s.stable_id, 'canonicalName', s.canonical_name, 'modernRegion', s.modern_region, 'country', s.country) END AS site FROM inscriptions i JOIN objects o ON o.id = i.object_id LEFT JOIN sites s ON s.id = o.site_id WHERE i.id = $1`, [id]);
  const inscription = inscriptionResult.rows[0];
  if (!inscription) return null;
  const sequencesResult = await databaseQuery<RawSequence>(`SELECT id, stable_id AS "stableId", record_scope AS "recordScope", status, sequence_basis AS "sequenceBasis", sequence_version AS "sequenceVersion", is_primary AS "isPrimary", editorial_note AS "editorialNote" FROM sign_sequences WHERE inscription_id = $1 ORDER BY is_primary DESC, sequence_basis, sequence_version`, [id]);
  const sequenceIds = sequencesResult.rows.map((sequence) => sequence.id);
  const occurrenceResult = sequenceIds.length ? await databaseQuery<Record<string, unknown>>(`SELECT so.id, so.stable_id, so.record_scope, so.sequence_id, so.position_index, so.identification_status, so.observed_form_note, so.orientation_note, sg.id AS sign_id, sg.stable_id AS sign_stable_id, sg.catalogue_namespace, sg.catalogue_code, sg.visual_label, sg.glyph_svg FROM sign_occurrences so LEFT JOIN signs sg ON sg.id = so.sign_id WHERE so.sequence_id = ANY($1::uuid[]) ORDER BY so.sequence_id, so.position_index`, [sequenceIds]) : { rows: [] };
  const occurrencesBySequence = new Map<string, SignOccurrence[]>();
  for (const row of occurrenceResult.rows) { const key = String(row.sequence_id); const entries = occurrencesBySequence.get(key) ?? []; entries.push(mapOccurrence(row)); occurrencesBySequence.set(key, entries); }
  const sequences = sequencesResult.rows.map((sequence) => { const occurrences = occurrencesBySequence.get(sequence.id) ?? []; return { ...toSequence(sequence, occurrences.map((occurrence) => occurrence.sign ? `${occurrence.sign.catalogueNamespace}:${occurrence.sign.catalogueCode}` : `[${occurrence.identificationStatus}]`)), occurrences }; });
  return { ...inscription, primarySequence: sequences[0] ? toSequence(sequences[0], sequences[0].tokens) : null, sequences };
}

export async function listSigns(options: SignQueryOptions = {}): Promise<Page<SignSummary>> {
  const pagination = pageOptions(options); const values: unknown[] = []; const filters: string[] = [];
  addScopeFilter(filters, values, options.scope, "sg.record_scope");
  if (options.catalogueNamespace) { values.push(options.catalogueNamespace); filters.push(`sg.catalogue_namespace = $${values.length}`); }
  if (options.search) { values.push(`%${options.search}%`); filters.push(`(sg.stable_id ILIKE $${values.length} OR sg.catalogue_code ILIKE $${values.length} OR sg.visual_label ILIKE $${values.length})`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return countAndRows<SignSummary>(`SELECT count(*)::text AS total FROM signs sg ${where}`, `SELECT id, stable_id AS "stableId", record_scope AS "recordScope", status, catalogue_namespace AS "catalogueNamespace", catalogue_code AS "catalogueCode", visual_label AS "visualLabel", glyph_svg AS "glyphSvg" FROM signs sg ${where} ORDER BY catalogue_namespace, catalogue_code LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, values, pagination);
}

export async function getSign(id: string): Promise<SignDetail | null> {
  const result = await databaseQuery<SignDetail>(`SELECT sg.id, sg.stable_id AS "stableId", sg.record_scope AS "recordScope", sg.status, sg.catalogue_namespace AS "catalogueNamespace", sg.catalogue_code AS "catalogueCode", sg.visual_label AS "visualLabel", sg.glyph_svg AS "glyphSvg", sg.visual_description AS "visualDescription", sg.image_reference AS "imageReference", sg.created_at AS "createdAt", sg.updated_at AS "updatedAt", CASE WHEN parent.id IS NULL THEN NULL ELSE json_build_object('id', parent.id, 'stableId', parent.stable_id, 'catalogueNamespace', parent.catalogue_namespace, 'catalogueCode', parent.catalogue_code, 'visualLabel', parent.visual_label) END AS "parentSign" FROM signs sg LEFT JOIN signs parent ON parent.id = sg.parent_sign_id WHERE sg.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function getSignSequence(id: string): Promise<SignSequenceDetail | null> {
  const result = await databaseQuery<RawSequence & { inscription: SignSequenceDetail["inscription"] }>(`SELECT sq.id, sq.stable_id AS "stableId", sq.record_scope AS "recordScope", sq.status, sq.sequence_basis AS "sequenceBasis", sq.sequence_version AS "sequenceVersion", sq.is_primary AS "isPrimary", sq.editorial_note AS "editorialNote", json_build_object('id', i.id, 'stableId', i.stable_id, 'surfaceLabel', i.surface_label, 'recordScope', i.record_scope) AS inscription FROM sign_sequences sq JOIN inscriptions i ON i.id = sq.inscription_id WHERE sq.id = $1`, [id]);
  const sequence = result.rows[0];
  if (!sequence) return null;
  const occurrences = await databaseQuery<Record<string, unknown>>(`SELECT so.id, so.stable_id, so.record_scope, so.position_index, so.identification_status, so.observed_form_note, so.orientation_note, sg.id AS sign_id, sg.stable_id AS sign_stable_id, sg.catalogue_namespace, sg.catalogue_code, sg.visual_label, sg.glyph_svg FROM sign_occurrences so LEFT JOIN signs sg ON sg.id = so.sign_id WHERE so.sequence_id = $1 ORDER BY so.position_index`, [id]);
  const mapped = occurrences.rows.map(mapOccurrence);
  return { ...toSequence(sequence, mapped.map((occurrence) => occurrence.sign ? `${occurrence.sign.catalogueNamespace}:${occurrence.sign.catalogueCode}` : `[${occurrence.identificationStatus}]`)), inscription: sequence.inscription, occurrences: mapped };
}
