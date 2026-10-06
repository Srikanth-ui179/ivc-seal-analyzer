import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type { DatasetSiteBreakdown, SourceProvenanceSummary } from "@/lib/db/dataset-version-types";

export type SiteComparativeMetrics = {
  siteId: string;
  siteStableId: string;
  siteName: string;
  country: string | null;
  inscriptionCount: number;
  occurrenceCount: number;
  distinctSignsCount: number;
  meanSequenceLength: number;
  topSigns: Array<{ signCode: string; count: number; percentage: number }>;
  topInitialSigns: Array<{ signCode: string; count: number; percentage: number }>;
  recurringMotifs: Array<{ sequence: string; count: number }>;
};

export type MultiSiteReport = {
  datasetId: string;
  datasetStableId: string;
  datasetName: string;
  isMultiSite: boolean;
  corpusSitesCount: number;
  referenceSitesCount: number;
  corpusSites: DatasetSiteBreakdown[];
  referenceSites: DatasetSiteBreakdown[];
  sources: SourceProvenanceSummary[];
  comparativeAnalysisStatus: {
    ready: boolean;
    reason: string;
  };
  // Detailed comparative metrics when isMultiSite is true
  siteMetrics?: SiteComparativeMetrics[];
  vocabularyComparison?: {
    sharedSigns: string[];
    siteSpecificSigns: Record<string, string[]>;
  };
};

export async function getMultiSiteReport(
  datasetVersionId: string
): Promise<MultiSiteReport> {
  // 1. Dataset metadata
  const dsRes = await databaseQuery<{
    id: string;
    stable_id: string;
    name: string;
  }>(
    `SELECT id, stable_id, name
     FROM dataset_versions
     WHERE (id::text = $1 OR stable_id = $1)
       AND record_scope = 'research'`,
    [datasetVersionId]
  );

  const dataset = dsRes.rows[0];
  const actualDatasetId = dataset ? dataset.id : datasetVersionId;
  const datasetStableId = dataset ? dataset.stable_id : datasetVersionId;
  const datasetName = dataset ? dataset.name : "Active Dataset";

  // 2. Query all sites categorized into corpus sites (in dataset) vs reference-only
  const sitesRes = await databaseQuery<DatasetSiteBreakdown>(
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
       AND i.id IN (
         SELECT inscription_id
         FROM dataset_version_inscriptions
         WHERE dataset_version_id = $1
       )
     LEFT JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
     LEFT JOIN sign_occurrences so ON so.sequence_id = ss.id
     WHERE s.record_scope = 'research'
     GROUP BY s.id, s.stable_id, s.canonical_name, s.modern_region, s.country, s.latitude, s.longitude
     ORDER BY "isCorpusSite" DESC, "inscriptionCount" DESC, s.canonical_name`,
    [actualDatasetId]
  );

  const corpusSites = sitesRes.rows.filter((s) => s.isCorpusSite);
  const referenceSites = sitesRes.rows.filter((s) => !s.isCorpusSite);

  // 3. Provenance sources for dataset
  const sourcesRes = await databaseQuery<SourceProvenanceSummary>(
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
    [actualDatasetId]
  );

  const isMultiSite = corpusSites.length >= 2;

  if (!isMultiSite) {
    return {
      datasetId: actualDatasetId,
      datasetStableId,
      datasetName,
      isMultiSite: false,
      corpusSitesCount: corpusSites.length,
      referenceSitesCount: referenceSites.length,
      corpusSites,
      referenceSites,
      sources: sourcesRes.rows,
      comparativeAnalysisStatus: {
        ready: false,
        reason:
          "Single-site dataset: Current frozen dataset DATASET-CISI-MOHENJODARO-V1 contains inscriptions exclusively from Mohenjo-daro (179 seals, 1,003 sign tokens). Cross-site statistical comparative distributions are held until a second verified archaeological site is ingested under open machine-readable provenance.",
      },
    };
  }

  // If 2 or more corpus sites exist, compute comparative metrics across sites
  const siteMetrics: SiteComparativeMetrics[] = [];
  const siteSignVocabularies: Record<string, Set<string>> = {};

  for (const site of corpusSites) {
    // Mean sequence length
    const lenRes = await databaseQuery<{ meanLength: string }>(
      `SELECT coalesce(avg(seq_len), 0)::text as "meanLength"
       FROM (
         SELECT count(so.id) as seq_len
         FROM dataset_version_inscriptions dvi
         JOIN inscriptions i ON i.id = dvi.inscription_id
         JOIN objects o ON o.id = i.object_id
         JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
         JOIN sign_occurrences so ON so.sequence_id = ss.id
         WHERE dvi.dataset_version_id = $1
           AND o.site_id = $2
         GROUP BY ss.id
       ) sub`,
      [actualDatasetId, site.siteId]
    );

    // Top signs
    const signsRes = await databaseQuery<{ signCode: string; count: number; total: number }>(
      `SELECT
         s.catalogue_code as "signCode",
         count(so.id)::int as count,
         (SELECT count(*) FROM sign_occurrences so2
          JOIN sign_sequences ss2 ON ss2.id = so2.sequence_id
          JOIN inscriptions i2 ON i2.id = ss2.inscription_id
          JOIN objects o2 ON o2.id = i2.object_id
          WHERE i2.id IN (SELECT inscription_id FROM dataset_version_inscriptions WHERE dataset_version_id = $1)
            AND o2.site_id = $2
         )::int as total
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN objects o ON o.id = i.object_id
       JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
       JOIN sign_occurrences so ON so.sequence_id = ss.id
       JOIN signs s ON s.id = so.sign_id
       WHERE dvi.dataset_version_id = $1
         AND o.site_id = $2
         AND so.identification_status = 'identified'
       GROUP BY s.catalogue_code
       ORDER BY count DESC
       LIMIT 10`,
      [actualDatasetId, site.siteId]
    );

    // Top initial signs
    const initRes = await databaseQuery<{ signCode: string; count: number; total: number }>(
      `SELECT
         s.catalogue_code as "signCode",
         count(so.id)::int as count,
         (SELECT count(*) FROM sign_occurrences so2
          JOIN sign_sequences ss2 ON ss2.id = so2.sequence_id
          JOIN inscriptions i2 ON i2.id = ss2.inscription_id
          JOIN objects o2 ON o2.id = i2.object_id
          WHERE i2.id IN (SELECT inscription_id FROM dataset_version_inscriptions WHERE dataset_version_id = $1)
            AND o2.site_id = $2
            AND so2.position_index = 1
         )::int as total
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN objects o ON o.id = i.object_id
       JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
       JOIN sign_occurrences so ON so.sequence_id = ss.id
       JOIN signs s ON s.id = so.sign_id
       WHERE dvi.dataset_version_id = $1
         AND o.site_id = $2
         AND so.position_index = 1
         AND so.identification_status = 'identified'
       GROUP BY s.catalogue_code
       ORDER BY count DESC
       LIMIT 10`,
      [actualDatasetId, site.siteId]
    );

    // Distinct signs for vocabulary overlap
    const vocabRes = await databaseQuery<{ signCode: string }>(
      `SELECT DISTINCT s.catalogue_code as "signCode"
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN objects o ON o.id = i.object_id
       JOIN sign_sequences ss ON ss.inscription_id = i.id AND ss.is_primary = true
       JOIN sign_occurrences so ON so.sequence_id = ss.id
       JOIN signs s ON s.id = so.sign_id
       WHERE dvi.dataset_version_id = $1
         AND o.site_id = $2`,
      [actualDatasetId, site.siteId]
    );

    siteSignVocabularies[site.canonicalName] = new Set(
      vocabRes.rows.map((r) => r.signCode)
    );

    siteMetrics.push({
      siteId: site.siteId,
      siteStableId: site.siteStableId,
      siteName: site.canonicalName,
      country: site.country,
      inscriptionCount: site.inscriptionCount,
      occurrenceCount: site.occurrenceCount,
      distinctSignsCount: site.distinctSignsCount,
      meanSequenceLength: parseFloat(lenRes.rows[0]?.meanLength ?? "0"),
      topSigns: signsRes.rows.map((r) => ({
        signCode: r.signCode,
        count: r.count,
        percentage: r.total > 0 ? (r.count * 100) / r.total : 0,
      })),
      topInitialSigns: initRes.rows.map((r) => ({
        signCode: r.signCode,
        count: r.count,
        percentage: r.total > 0 ? (r.count * 100) / r.total : 0,
      })),
      recurringMotifs: [],
    });
  }

  // Calculate shared vs site-specific sign vocabulary
  const siteNames = Object.keys(siteSignVocabularies);
  let sharedSigns: string[] = [];
  const siteSpecificSigns: Record<string, string[]> = {};

  if (siteNames.length >= 2) {
    const firstSet = siteSignVocabularies[siteNames[0]];
    sharedSigns = Array.from(firstSet).filter((sign) =>
      siteNames.every((name) => siteSignVocabularies[name].has(sign))
    );

    for (const name of siteNames) {
      const otherNames = siteNames.filter((n) => n !== name);
      siteSpecificSigns[name] = Array.from(siteSignVocabularies[name]).filter(
        (sign) => !otherNames.some((other) => siteSignVocabularies[other].has(sign))
      );
    }
  }

  return {
    datasetId: actualDatasetId,
    datasetStableId,
    datasetName,
    isMultiSite: true,
    corpusSitesCount: corpusSites.length,
    referenceSitesCount: referenceSites.length,
    corpusSites,
    referenceSites,
    sources: sourcesRes.rows,
    comparativeAnalysisStatus: {
      ready: true,
      reason: `Multi-site dataset with ${corpusSites.length} verified corpus sites.`,
    },
    siteMetrics,
    vocabularyComparison: {
      sharedSigns,
      siteSpecificSigns,
    },
  };
}
