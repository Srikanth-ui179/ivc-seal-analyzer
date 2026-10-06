import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type { Page, Pagination, ScopeFilter } from "@/lib/db/types";
import type {
  DatasetVersionDetail,
  DatasetVersionInscription,
  DatasetVersionSummary,
  SourceProvenanceSummary,
  DatasetSiteBreakdown,
} from "@/lib/db/dataset-version-types";

type DatasetVersionOptions = Pagination & { scope?: ScopeFilter; search?: string };

function pageOptions(options: Pagination = {}) {
  return {
    limit: Math.min(Math.max(options.limit ?? 24, 1), 100),
    offset: Math.max(options.offset ?? 0, 0),
  };
}

export async function listDatasetVersions(
  options: DatasetVersionOptions = {}
): Promise<Page<DatasetVersionSummary>> {
  const pagination = pageOptions(options);
  const values: unknown[] = [];
  const filters: string[] = [];

  if (options.scope && options.scope !== "all") {
    values.push(options.scope);
    filters.push(`dv.record_scope = $${values.length}::record_scope`);
  }
  if (options.search) {
    values.push(`%${options.search}%`);
    filters.push(
      `(dv.stable_id ILIKE $${values.length} OR dv.name ILIKE $${values.length})`
    );
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const count = await databaseQuery<{ total: string }>(
    `SELECT count(*)::text AS total FROM dataset_versions dv ${where}`,
    values
  );

  const rows = await databaseQuery<DatasetVersionSummary & Record<string, unknown>>(
    `SELECT
       dv.id,
       dv.stable_id AS "stableId",
       dv.record_scope AS "recordScope",
       dv.name,
       dv.description,
       dv.selection_criteria AS "selectionCriteria",
       dv.state,
       dv.frozen_at AS "frozenAt",
       dv.created_at AS "createdAt",
       count(DISTINCT dvi.inscription_id)::int AS "inscriptionCount",
       count(so.id)::int AS "occurrenceCount",
       count(DISTINCT so.sign_id)::int AS "distinctSignsCount",
       count(DISTINCT o.site_id)::int AS "corpusSitesCount"
     FROM dataset_versions dv
     LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id
     LEFT JOIN inscriptions i ON i.id = dvi.inscription_id
     LEFT JOIN objects o ON o.id = i.object_id
     LEFT JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
     LEFT JOIN sign_occurrences so ON so.sequence_id = ss.id
     ${where}
     GROUP BY dv.id
     ORDER BY dv.created_at DESC, dv.stable_id
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset]
  );

  return { items: rows.rows, total: Number(count.rows[0]?.total ?? 0), ...pagination };
}

export async function getDatasetVersion(
  id: string
): Promise<DatasetVersionDetail | null> {
  // 1. Core summary and aggregate counts
  const result = await databaseQuery<DatasetVersionSummary & {
    occurrenceCount: number;
    distinctSignsCount: number;
    corpusSitesCount: number;
  } & Record<string, unknown>>(
    `SELECT
       dv.id,
       dv.stable_id AS "stableId",
       dv.record_scope AS "recordScope",
       dv.name,
       dv.description,
       dv.selection_criteria AS "selectionCriteria",
       dv.state,
       dv.frozen_at AS "frozenAt",
       dv.created_at AS "createdAt",
       count(DISTINCT dvi.inscription_id)::int AS "inscriptionCount",
       count(so.id)::int AS "occurrenceCount",
       count(DISTINCT so.sign_id)::int AS "distinctSignsCount",
       count(DISTINCT o.site_id)::int AS "corpusSitesCount"
     FROM dataset_versions dv
     LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id
     LEFT JOIN inscriptions i ON i.id = dvi.inscription_id
     LEFT JOIN objects o ON o.id = i.object_id
     LEFT JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
     LEFT JOIN sign_occurrences so ON so.sequence_id = ss.id
     WHERE (dv.id::text = $1 OR dv.stable_id = $1)
       AND dv.record_scope = 'research'
     GROUP BY dv.id`,
    [id]
  );

  const dataset = result.rows[0];
  if (!dataset) return null;

  // 2. Inscriptions membership snapshot
  const inscriptions = await databaseQuery<DatasetVersionInscription>(
    `SELECT
       i.id,
       i.stable_id AS "stableId",
       i.record_scope AS "recordScope",
       i.surface_label AS "surfaceLabel",
       o.stable_id AS "objectStableId",
       o.object_type AS "objectType",
       s.canonical_name AS "siteName",
       s.stable_id AS "siteStableId"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN objects o ON o.id = i.object_id
     LEFT JOIN sites s ON s.id = o.site_id
     WHERE dvi.dataset_version_id = $1
     ORDER BY i.stable_id`,
    [dataset.id]
  );

  // 3. Provenance sources linked through dataset sequence membership
  const sources = await databaseQuery<SourceProvenanceSummary>(
    `SELECT DISTINCT
       src.id,
       src.stable_id AS "stableId",
       src.title,
       src.authors,
       src.publication_year AS "publicationYear",
       src.publisher_or_journal AS "publisherOrJournal",
       src.repository_or_archive AS "repositoryOrArchive",
       src.licence_name AS "licenceName",
       src.licence_url AS "licenceUrl",
       src.corpus_scope AS "corpusScope",
       src.archaeological_scope AS "archaeologicalScope",
       src.catalogue_system AS "catalogueSystem",
       src.transcription_system AS "transcriptionSystem",
       src.sign_numbering_convention AS "signNumberingConvention",
       src.limitations,
       src.notes
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences ss ON ss.inscription_id = i.id
     JOIN sources src ON src.id = ss.source_id
     WHERE dvi.dataset_version_id = $1
     ORDER BY src.title`,
    [dataset.id]
  );

  // 4. Site breakdown: active corpus sites vs registered reference-only sites
  const sites = await databaseQuery<DatasetSiteBreakdown>(
    `SELECT
       s.id AS "siteId",
       s.stable_id AS "siteStableId",
       s.canonical_name AS "canonicalName",
       s.modern_region AS "modernRegion",
       s.country,
       s.latitude::text,
       s.longitude::text,
       count(DISTINCT i.id)::int AS "inscriptionCount",
       count(so.id)::int AS "occurrenceCount",
       count(DISTINCT so.sign_id)::int AS "distinctSignsCount",
       (count(DISTINCT i.id) > 0) AS "isCorpusSite"
     FROM sites s
     LEFT JOIN objects o ON o.site_id = s.id
     LEFT JOIN inscriptions i ON i.object_id = o.id
       AND i.id IN (SELECT inscription_id FROM dataset_version_inscriptions WHERE dataset_version_id = $1)
     LEFT JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
     LEFT JOIN sign_occurrences so ON so.sequence_id = ss.id
     WHERE s.record_scope = 'research'
     GROUP BY s.id, s.stable_id, s.canonical_name, s.modern_region, s.country, s.latitude, s.longitude
     ORDER BY "isCorpusSite" DESC, "inscriptionCount" DESC, s.canonical_name`,
    [dataset.id]
  );

  const corpusSitesCount = dataset.corpusSitesCount ?? 1;

  return {
    ...dataset,
    occurrenceCount: dataset.occurrenceCount ?? 0,
    distinctSignsCount: dataset.distinctSignsCount ?? 0,
    corpusSitesCount,
    isMultiSite: corpusSitesCount >= 2,
    sources: sources.rows,
    sites: sites.rows,
    inscriptions: inscriptions.rows,
  };
}
