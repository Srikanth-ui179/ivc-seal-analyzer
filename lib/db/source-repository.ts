import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type { Page, Pagination, ScopeFilter } from "@/lib/db/types";
import type { SourceProvenanceSummary } from "@/lib/db/dataset-version-types";

type SourceOptions = Pagination & { scope?: ScopeFilter; search?: string };

function pageOptions(options: Pagination = {}) {
  return {
    limit: Math.min(Math.max(options.limit ?? 50, 1), 100),
    offset: Math.max(options.offset ?? 0, 0),
  };
}

export async function listSources(
  options: SourceOptions = {}
): Promise<Page<SourceProvenanceSummary>> {
  const pagination = pageOptions(options);
  const values: unknown[] = [];
  const filters: string[] = [];

  if (options.scope && options.scope !== "all") {
    values.push(options.scope);
    filters.push(`s.record_scope = $${values.length}::record_scope`);
  }
  if (options.search) {
    values.push(`%${options.search}%`);
    filters.push(
      `(s.stable_id ILIKE $${values.length} OR s.title ILIKE $${values.length} OR s.authors ILIKE $${values.length})`
    );
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const count = await databaseQuery<{ total: string }>(
    `SELECT count(*)::text AS total FROM sources s ${where}`,
    values
  );

  const rows = await databaseQuery<SourceProvenanceSummary>(
    `SELECT
       s.id,
       s.stable_id AS "stableId",
       s.title,
       s.authors,
       s.publication_year AS "publicationYear",
       s.publisher_or_journal AS "publisherOrJournal",
       s.repository_or_archive AS "repositoryOrArchive",
       s.licence_name AS "licenceName",
       s.licence_url AS "licenceUrl",
       s.corpus_scope AS "corpusScope",
       s.archaeological_scope AS "archaeologicalScope",
       s.catalogue_system AS "catalogueSystem",
       s.transcription_system AS "transcriptionSystem",
       s.sign_numbering_convention AS "signNumberingConvention",
       s.limitations,
       s.notes
     FROM sources s
     ${where}
     ORDER BY s.publication_year ASC NULLS LAST, s.stable_id
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset]
  );

  return { items: rows.rows, total: Number(count.rows[0]?.total ?? 0), ...pagination };
}

export async function getSource(idOrStableId: string): Promise<SourceProvenanceSummary | null> {
  const res = await databaseQuery<SourceProvenanceSummary>(
    `SELECT
       s.id,
       s.stable_id AS "stableId",
       s.title,
       s.authors,
       s.publication_year AS "publicationYear",
       s.publisher_or_journal AS "publisherOrJournal",
       s.repository_or_archive AS "repositoryOrArchive",
       s.licence_name AS "licenceName",
       s.licence_url AS "licenceUrl",
       s.corpus_scope AS "corpusScope",
       s.archaeological_scope AS "archaeologicalScope",
       s.catalogue_system AS "catalogueSystem",
       s.transcription_system AS "transcriptionSystem",
       s.sign_numbering_convention AS "signNumberingConvention",
       s.limitations,
       s.notes
     FROM sources s
     WHERE (s.id::text = $1 OR s.stable_id = $1)
       AND s.record_scope = 'research'`,
    [idOrStableId]
  );
  return res.rows[0] ?? null;
}
