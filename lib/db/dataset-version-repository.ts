import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type { Page, Pagination, ScopeFilter } from "@/lib/db/types";
import type { DatasetVersionDetail, DatasetVersionInscription, DatasetVersionSummary } from "@/lib/db/dataset-version-types";

type DatasetVersionOptions = Pagination & { scope?: ScopeFilter; search?: string };

function pageOptions(options: Pagination = {}) {
  return { limit: Math.min(Math.max(options.limit ?? 24, 1), 100), offset: Math.max(options.offset ?? 0, 0) };
}

export async function listDatasetVersions(options: DatasetVersionOptions = {}): Promise<Page<DatasetVersionSummary>> {
  const pagination = pageOptions(options); const values: unknown[] = []; const filters: string[] = [];
  if (options.scope && options.scope !== "all") { values.push(options.scope); filters.push(`dv.record_scope = $${values.length}::record_scope`); }
  if (options.search) { values.push(`%${options.search}%`); filters.push(`(dv.stable_id ILIKE $${values.length} OR dv.name ILIKE $${values.length})`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const count = await databaseQuery<{ total: string }>(`SELECT count(*)::text AS total FROM dataset_versions dv ${where}`, values);
  const rows = await databaseQuery<DatasetVersionSummary & Record<string, unknown>>(`SELECT dv.id, dv.stable_id AS "stableId", dv.record_scope AS "recordScope", dv.name, dv.description, dv.selection_criteria AS "selectionCriteria", dv.state, dv.frozen_at AS "frozenAt", dv.created_at AS "createdAt", count(dvi.inscription_id)::int AS "inscriptionCount" FROM dataset_versions dv LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id ${where} GROUP BY dv.id ORDER BY dv.created_at DESC, dv.stable_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pagination.limit, pagination.offset]);
  return { items: rows.rows, total: Number(count.rows[0]?.total ?? 0), ...pagination };
}

export async function getDatasetVersion(id: string): Promise<DatasetVersionDetail | null> {
  const result = await databaseQuery<DatasetVersionSummary & Record<string, unknown>>(`SELECT dv.id, dv.stable_id AS "stableId", dv.record_scope AS "recordScope", dv.name, dv.description, dv.selection_criteria AS "selectionCriteria", dv.state, dv.frozen_at AS "frozenAt", dv.created_at AS "createdAt", count(dvi.inscription_id)::int AS "inscriptionCount" FROM dataset_versions dv LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id WHERE dv.id = $1 AND dv.record_scope = 'research' GROUP BY dv.id`, [id]);
  const dataset = result.rows[0];
  if (!dataset) return null;
  const inscriptions = await databaseQuery<DatasetVersionInscription>(`SELECT i.id, i.stable_id AS "stableId", i.record_scope AS "recordScope", i.surface_label AS "surfaceLabel", o.stable_id AS "objectStableId", o.object_type AS "objectType", s.canonical_name AS "siteName" FROM dataset_version_inscriptions dvi JOIN inscriptions i ON i.id = dvi.inscription_id JOIN objects o ON o.id = i.object_id LEFT JOIN sites s ON s.id = o.site_id WHERE dvi.dataset_version_id = $1 ORDER BY i.stable_id`, [id]);
  return { ...dataset, inscriptions: inscriptions.rows };
}
