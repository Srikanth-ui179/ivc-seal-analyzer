import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type {
  AdjacentSignPair,
  AdjacentSignPairDistribution,
  AnalysisDatasetMetadata,
  AnalysisReport,
  CorpusCoverage,
  IdentificationStatusCount,
  LengthHistogramBin,
  NonIdentifiedSignCoverage,
  PositionalFrequencies,
  PositionSignFrequency,
  SequenceCompletenessCount,
  SequenceLengthDistribution,
  SequenceLengthStats,
  SignFrequency,
  SignFrequencyDistribution,
} from "@/lib/db/analysis-types";

function calculateStats(lengths: number[]): SequenceLengthStats {
  if (lengths.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  const count = lengths.length;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const sum = lengths.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const sorted = [...lengths].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const variance =
    count > 1
      ? lengths.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1)
      : 0;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    min,
    max,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
  };
}

export async function getAnalysisDataset(
  idOrStableId?: string
): Promise<AnalysisDatasetMetadata | null> {
  const query = idOrStableId
    ? `SELECT dv.id, dv.stable_id AS "stableId", dv.name, dv.description, dv.selection_criteria AS "selectionCriteria", dv.state, dv.frozen_at AS "frozenAt", dv.created_at AS "createdAt", count(dvi.inscription_id)::int AS "inscriptionCount"
       FROM dataset_versions dv
       LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id
       WHERE (dv.id::text = $1 OR dv.stable_id = $1) AND dv.record_scope = 'research'
       GROUP BY dv.id`
    : `SELECT dv.id, dv.stable_id AS "stableId", dv.name, dv.description, dv.selection_criteria AS "selectionCriteria", dv.state, dv.frozen_at AS "frozenAt", dv.created_at AS "createdAt", count(dvi.inscription_id)::int AS "inscriptionCount"
       FROM dataset_versions dv
       LEFT JOIN dataset_version_inscriptions dvi ON dvi.dataset_version_id = dv.id
       WHERE dv.record_scope = 'research' AND dv.state = 'frozen'
       GROUP BY dv.id
       ORDER BY dv.created_at DESC
       LIMIT 1`;

  const values = idOrStableId ? [idOrStableId] : [];
  const result = await databaseQuery<AnalysisDatasetMetadata>(query, values);
  return result.rows[0] ?? null;
}

export async function getCorpusCoverage(datasetVersionId: string): Promise<CorpusCoverage> {
  const totalsResult = await databaseQuery<{
    totalInscriptions: number;
    totalSequences: number;
    totalOccurrences: number;
    distinctSigns: number;
  }>(
    `SELECT
       COUNT(DISTINCT i.id)::int AS "totalInscriptions",
       COUNT(DISTINCT seq.id)::int AS "totalSequences",
       COUNT(occ.id)::int AS "totalOccurrences",
       COUNT(DISTINCT occ.sign_id)::int AS "distinctSigns"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     LEFT JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     WHERE dvi.dataset_version_id = $1`,
    [datasetVersionId]
  );
  const totals = totalsResult.rows[0] ?? {
    totalInscriptions: 0,
    totalSequences: 0,
    totalOccurrences: 0,
    distinctSigns: 0,
  };

  const idStatusesResult = await databaseQuery<{ status: string; count: number }>(
    `SELECT
       e.enumlabel AS status,
       COALESCE(counts.cnt, 0)::int AS count
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     LEFT JOIN (
       SELECT occ.identification_status::text AS st, COUNT(*)::int AS cnt
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       WHERE dvi.dataset_version_id = $1
       GROUP BY occ.identification_status
     ) counts ON counts.st = e.enumlabel
     WHERE t.typname = 'sign_identification_status'
     ORDER BY count DESC, e.enumsortorder ASC`,
    [datasetVersionId]
  );

  const totalTokens = totals.totalOccurrences;
  const identificationStatuses: IdentificationStatusCount[] = idStatusesResult.rows.map((row) => ({
    status: row.status,
    count: row.count,
    percentage: totalTokens > 0 ? Number(((row.count * 100) / totalTokens).toFixed(2)) : 0,
  }));

  const completenessResult = await databaseQuery<{ status: string; count: number }>(
    `SELECT
       e.enumlabel AS status,
       COALESCE(counts.cnt, 0)::int AS count
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     LEFT JOIN (
       SELECT seq.source_completeness::text AS cmp, COUNT(*)::int AS cnt
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       WHERE dvi.dataset_version_id = $1
       GROUP BY seq.source_completeness
     ) counts ON counts.cmp = e.enumlabel
     WHERE t.typname = 'source_completeness_status'
     ORDER BY count DESC, e.enumsortorder ASC`,
    [datasetVersionId]
  );

  const totalSeqs = totals.totalSequences;
  const completenessStatuses: SequenceCompletenessCount[] = completenessResult.rows.map((row) => ({
    status: row.status,
    count: row.count,
    percentage: totalSeqs > 0 ? Number(((row.count * 100) / totalSeqs).toFixed(2)) : 0,
  }));

  return {
    totalInscriptions: totals.totalInscriptions,
    totalSequences: totals.totalSequences,
    totalOccurrences: totals.totalOccurrences,
    distinctSigns: totals.distinctSigns,
    identificationStatuses,
    completenessStatuses,
  };
}

export async function getSignFrequencyDistribution(
  datasetVersionId: string
): Promise<SignFrequencyDistribution> {
  const identifiedResult = await databaseQuery<{
    signId: string;
    stableId: string;
    catalogueCode: string;
    visualLabel: string;
    frequency: number;
  }>(
    `SELECT
       s.id AS "signId",
       s.stable_id AS "stableId",
       s.catalogue_code AS "catalogueCode",
       s.visual_label AS "visualLabel",
       COUNT(occ.id)::int AS frequency
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
       AND occ.identification_status = 'identified'
     GROUP BY s.id, s.stable_id, s.catalogue_code, s.visual_label
     ORDER BY frequency DESC, s.catalogue_code ASC`,
    [datasetVersionId]
  );

  const totalIdentifiedTokens = identifiedResult.rows.reduce(
    (acc, row) => acc + row.frequency,
    0
  );

  const identified: SignFrequency[] = identifiedResult.rows.map((row, index) => ({
    ...row,
    percentage:
      totalIdentifiedTokens > 0
        ? Number(((row.frequency * 100) / totalIdentifiedTokens).toFixed(2))
        : 0,
    rank: index + 1,
  }));

  const nonIdentifiedResult = await databaseQuery<{ status: string; count: number }>(
    `SELECT
       occ.identification_status::text AS status,
       COUNT(*)::int AS count
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     WHERE dvi.dataset_version_id = $1
       AND occ.identification_status <> 'identified'
     GROUP BY occ.identification_status
     ORDER BY count DESC`,
    [datasetVersionId]
  );

  const nonIdentifiedStatuses = ["tentative", "unidentified", "damaged"];
  const nonIdentifiedMap = new Map(
    nonIdentifiedResult.rows.map((row) => [row.status, row.count])
  );

  const totalNonIdentifiedTokens = nonIdentifiedResult.rows.reduce(
    (acc, row) => acc + row.count,
    0
  );

  const nonIdentified: NonIdentifiedSignCoverage[] = nonIdentifiedStatuses.map((st) => {
    const count = nonIdentifiedMap.get(st) ?? 0;
    return {
      status: st,
      count,
      percentage:
        totalNonIdentifiedTokens > 0
          ? Number(((count * 100) / totalNonIdentifiedTokens).toFixed(2))
          : 0,
    };
  });

  return {
    identified,
    nonIdentified,
    totalIdentifiedTokens,
    totalNonIdentifiedTokens,
  };
}

export async function getSequenceLengthDistribution(
  datasetVersionId: string
): Promise<SequenceLengthDistribution> {
  const lengthsResult = await databaseQuery<{
    sequenceId: string;
    completeness: string;
    length: number;
  }>(
    `SELECT
       seq.id AS "sequenceId",
       seq.source_completeness::text AS completeness,
       COUNT(occ.id)::int AS length
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     LEFT JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     WHERE dvi.dataset_version_id = $1
     GROUP BY seq.id, seq.source_completeness
     ORDER BY length ASC`,
    [datasetVersionId]
  );

  const allLengths = lengthsResult.rows.map((r) => r.length);
  const completeLengths = lengthsResult.rows
    .filter((r) => r.completeness === "complete")
    .map((r) => r.length);
  const incompleteLengths = lengthsResult.rows
    .filter((r) => r.completeness === "incomplete")
    .map((r) => r.length);
  const notRecordedLengths = lengthsResult.rows
    .filter((r) => r.completeness === "not_recorded")
    .map((r) => r.length);

  const overall = calculateStats(allLengths);
  const complete = calculateStats(completeLengths);
  const incomplete = calculateStats(incompleteLengths);
  const notRecorded = calculateStats(notRecordedLengths);

  const histMap = new Map<number, number>();
  for (const len of allLengths) {
    histMap.set(len, (histMap.get(len) ?? 0) + 1);
  }

  const totalCount = allLengths.length;
  const histogram: LengthHistogramBin[] = Array.from(histMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([length, count]) => ({
      length,
      count,
      percentage: totalCount > 0 ? Number(((count * 100) / totalCount).toFixed(2)) : 0,
    }));

  return {
    overall,
    complete,
    incomplete,
    notRecorded,
    histogram,
  };
}

export async function getPositionalFrequencies(
  datasetVersionId: string
): Promise<PositionalFrequencies> {
  const firstPosResult = await databaseQuery<{
    signId: string;
    stableId: string;
    catalogueCode: string;
    visualLabel: string;
    frequency: number;
  }>(
    `SELECT
       s.id AS "signId",
       s.stable_id AS "stableId",
       s.catalogue_code AS "catalogueCode",
       s.visual_label AS "visualLabel",
       COUNT(*)::int AS frequency
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
       AND occ.position_index = 1
       AND occ.identification_status = 'identified'
     GROUP BY s.id, s.stable_id, s.catalogue_code, s.visual_label
     ORDER BY frequency DESC, s.catalogue_code ASC`,
    [datasetVersionId]
  );

  const totalFirst = firstPosResult.rows.reduce((acc, row) => acc + row.frequency, 0);
  const firstPositions: PositionSignFrequency[] = firstPosResult.rows.map((row, index) => ({
    ...row,
    percentage: totalFirst > 0 ? Number(((row.frequency * 100) / totalFirst).toFixed(2)) : 0,
    rank: index + 1,
  }));

  const completeSeqsCountResult = await databaseQuery<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     WHERE dvi.dataset_version_id = $1
       AND seq.source_completeness = 'complete'`,
    [datasetVersionId]
  );
  const completeSequencesCount = Number(completeSeqsCountResult.rows[0]?.count ?? 0);

  const terminalPosResult = await databaseQuery<{
    signId: string;
    stableId: string;
    catalogueCode: string;
    visualLabel: string;
    frequency: number;
  }>(
    `WITH seq_terminal AS (
       SELECT
         seq.id AS sequence_id,
         MAX(occ.position_index) AS max_pos
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       WHERE dvi.dataset_version_id = $1
         AND seq.source_completeness = 'complete'
       GROUP BY seq.id
     )
     SELECT
       s.id AS "signId",
       s.stable_id AS "stableId",
       s.catalogue_code AS "catalogueCode",
       s.visual_label AS "visualLabel",
       COUNT(*)::int AS frequency
     FROM seq_terminal st
     JOIN sign_occurrences occ ON occ.sequence_id = st.sequence_id AND occ.position_index = st.max_pos
     JOIN signs s ON s.id = occ.sign_id
     WHERE occ.identification_status = 'identified'
     GROUP BY s.id, s.stable_id, s.catalogue_code, s.visual_label
     ORDER BY frequency DESC, s.catalogue_code ASC`,
    [datasetVersionId]
  );

  const totalTerminal = terminalPosResult.rows.reduce((acc, row) => acc + row.frequency, 0);
  const terminalPositions: PositionSignFrequency[] = terminalPosResult.rows.map((row, index) => ({
    ...row,
    percentage:
      totalTerminal > 0 ? Number(((row.frequency * 100) / totalTerminal).toFixed(2)) : 0,
    rank: index + 1,
  }));

  return {
    firstPositions,
    totalFirstPositionTokens: totalFirst,
    terminalPositions,
    totalTerminalPositionTokens: totalTerminal,
    completeSequencesCount,
  };
}

export async function getAdjacentPairFrequencies(
  datasetVersionId: string,
  minFrequency: number = 2
): Promise<AdjacentSignPairDistribution> {
  const result = await databaseQuery<{
    sign1Code: string;
    sign1Label: string;
    sign2Code: string;
    sign2Label: string;
    frequency: number;
  }>(
    `SELECT
       s1.catalogue_code AS "sign1Code",
       s1.visual_label AS "sign1Label",
       s2.catalogue_code AS "sign2Code",
       s2.visual_label AS "sign2Label",
       COUNT(*)::int AS frequency
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences o1 ON o1.sequence_id = seq.id
     JOIN sign_occurrences o2 ON o2.sequence_id = seq.id AND o2.position_index = o1.position_index + 1
     JOIN signs s1 ON s1.id = o1.sign_id
     JOIN signs s2 ON s2.id = o2.sign_id
     WHERE dvi.dataset_version_id = $1
       AND o1.identification_status = 'identified'
       AND o2.identification_status = 'identified'
     GROUP BY s1.catalogue_code, s1.visual_label, s2.catalogue_code, s2.visual_label
     HAVING COUNT(*) >= $2
     ORDER BY frequency DESC, s1.catalogue_code ASC, s2.catalogue_code ASC`,
    [datasetVersionId, minFrequency]
  );

  const pairs: AdjacentSignPair[] = result.rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  return {
    pairs,
    threshold: minFrequency,
    totalQualifyingPairs: pairs.length,
  };
}

export async function runDatasetAnalysis(
  datasetIdOrStableId?: string
): Promise<AnalysisReport | null> {
  const dataset = await getAnalysisDataset(datasetIdOrStableId);
  if (!dataset) return null;

  const [coverage, signFrequencies, sequenceLengths, positionalFrequencies, adjacentPairs] =
    await Promise.all([
      getCorpusCoverage(dataset.id),
      getSignFrequencyDistribution(dataset.id),
      getSequenceLengthDistribution(dataset.id),
      getPositionalFrequencies(dataset.id),
      getAdjacentPairFrequencies(dataset.id, 2),
    ]);

  return {
    dataset,
    coverage,
    signFrequencies,
    sequenceLengths,
    positionalFrequencies,
    adjacentPairs,
  };
}
