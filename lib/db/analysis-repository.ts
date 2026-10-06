import "server-only";
import { databaseQuery } from "@/lib/db/client";
import type {
  AdjacentSignPair,
  AdjacentSignPairDistribution,
  AnalysisDatasetMetadata,
  AnalysisReport,
  CorpusCoverage,
  CorpusDiversityStats,
  DiversityAndRepetitionReport,
  ExactDuplicateSequence,
  IdentificationStatusCount,
  InternalSignRepetition,
  LengthHistogramBin,
  NearDuplicateSequencePair,
  NonIdentifiedSignCoverage,
  PositionalFrequencies,
  PositionSignFrequency,
  SequenceCompletenessCount,
  SequenceLengthDistribution,
  SequenceLengthStats,
  SequenceMotif,
  SequenceMotifsReport,
  SequenceSimilarityReport,
  SignFrequency,
  SignFrequencyDistribution,
  SignPositionProfile,
  SignPositionProfileDistribution,
  SignTransitionDistribution,
  SignTransitionItem,
  SignTransitionProfile,
  StructuralOutlier,
  StructuralOutliersReport,
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

export async function getSignPositionProfiles(
  datasetVersionId: string,
  minOccurrences: number = 10
): Promise<SignPositionProfileDistribution> {
  const result = await databaseQuery<{
    signId: string;
    catalogueCode: string;
    visualLabel: string;
    totalOccurrences: number;
    pos1: number;
    pos2: number;
    pos3: number;
    pos4: number;
    pos5Plus: number;
    meanRelativePosition: number;
    stdDevRelativePosition: number;
  }>(
    `WITH seq_lengths AS (
       SELECT seq.id, COUNT(occ.id)::int AS length
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       WHERE dvi.dataset_version_id = $1
       GROUP BY seq.id
     ),
     sign_occurrences_enriched AS (
       SELECT
         s.id AS sign_id,
         s.catalogue_code,
         s.visual_label,
         occ.position_index,
         sl.length AS seq_length,
         CASE
           WHEN sl.length >= 2 THEN ROUND((occ.position_index::numeric / sl.length::numeric), 4)
           ELSE NULL
         END AS norm_pos
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       JOIN signs s ON s.id = occ.sign_id
       JOIN seq_lengths sl ON sl.id = seq.id
       WHERE dvi.dataset_version_id = $1
         AND occ.identification_status = 'identified'
     )
     SELECT
       sign_id AS "signId",
       catalogue_code AS "catalogueCode",
       visual_label AS "visualLabel",
       COUNT(*)::int AS "totalOccurrences",
       COUNT(*) FILTER (WHERE position_index = 1)::int AS "pos1",
       COUNT(*) FILTER (WHERE position_index = 2)::int AS "pos2",
       COUNT(*) FILTER (WHERE position_index = 3)::int AS "pos3",
       COUNT(*) FILTER (WHERE position_index = 4)::int AS "pos4",
       COUNT(*) FILTER (WHERE position_index >= 5)::int AS "pos5Plus",
       COALESCE(ROUND(AVG(norm_pos), 3)::float, 0) AS "meanRelativePosition",
       COALESCE(ROUND(STDDEV_SAMP(norm_pos), 3)::float, 0) AS "stdDevRelativePosition"
     FROM sign_occurrences_enriched
     GROUP BY sign_id, catalogue_code, visual_label
     HAVING COUNT(*) >= $2
     ORDER BY "totalOccurrences" DESC, catalogue_code ASC`,
    [datasetVersionId, minOccurrences]
  );

  return {
    profiles: result.rows,
    threshold: minOccurrences,
    totalProfiles: result.rows.length,
  };
}

export async function getSignTransitionProfiles(
  datasetVersionId: string,
  minOccurrences: number = 20
): Promise<SignTransitionDistribution> {
  const targetSignsResult = await databaseQuery<{
    catalogueCode: string;
    visualLabel: string;
    totalOccurrences: number;
  }>(
    `SELECT
       s.catalogue_code AS "catalogueCode",
       s.visual_label AS "visualLabel",
       COUNT(occ.id)::int AS "totalOccurrences"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
       AND occ.identification_status = 'identified'
     GROUP BY s.catalogue_code, s.visual_label
     HAVING COUNT(occ.id) >= $2
     ORDER BY "totalOccurrences" DESC, s.catalogue_code ASC`,
    [datasetVersionId, minOccurrences]
  );

  const targetCodes = targetSignsResult.rows.map((r) => r.catalogueCode);
  if (targetCodes.length === 0) {
    return { profiles: [], threshold: minOccurrences };
  }

  const predecessorsResult = await databaseQuery<{
    targetCode: string;
    neighborCode: string;
    neighborLabel: string;
    count: number;
  }>(
    `SELECT
       s2.catalogue_code AS "targetCode",
       s1.catalogue_code AS "neighborCode",
       s1.visual_label AS "neighborLabel",
       COUNT(*)::int AS count
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
       AND s2.catalogue_code = ANY($2::text[])
     GROUP BY s2.catalogue_code, s1.catalogue_code, s1.visual_label
     ORDER BY s2.catalogue_code ASC, count DESC, s1.catalogue_code ASC`,
    [datasetVersionId, targetCodes]
  );

  const successorsResult = await databaseQuery<{
    targetCode: string;
    neighborCode: string;
    neighborLabel: string;
    count: number;
  }>(
    `SELECT
       s1.catalogue_code AS "targetCode",
       s2.catalogue_code AS "neighborCode",
       s2.visual_label AS "neighborLabel",
       COUNT(*)::int AS count
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
       AND s1.catalogue_code = ANY($2::text[])
     GROUP BY s1.catalogue_code, s2.catalogue_code, s2.visual_label
     ORDER BY s1.catalogue_code ASC, count DESC, s2.catalogue_code ASC`,
    [datasetVersionId, targetCodes]
  );

  const predMap = new Map<string, Array<{ neighborCode: string; neighborLabel: string; count: number }>>();
  for (const row of predecessorsResult.rows) {
    const list = predMap.get(row.targetCode) ?? [];
    list.push({ neighborCode: row.neighborCode, neighborLabel: row.neighborLabel, count: row.count });
    predMap.set(row.targetCode, list);
  }

  const succMap = new Map<string, Array<{ neighborCode: string; neighborLabel: string; count: number }>>();
  for (const row of successorsResult.rows) {
    const list = succMap.get(row.targetCode) ?? [];
    list.push({ neighborCode: row.neighborCode, neighborLabel: row.neighborLabel, count: row.count });
    succMap.set(row.targetCode, list);
  }

  const profiles: SignTransitionProfile[] = targetSignsResult.rows.map((target) => {
    const preds = predMap.get(target.catalogueCode) ?? [];
    const succs = succMap.get(target.catalogueCode) ?? [];

    const totalPredOccurrences = preds.reduce((acc, p) => acc + p.count, 0);
    const totalSuccOccurrences = succs.reduce((acc, s) => acc + s.count, 0);

    const topPredecessors: SignTransitionItem[] = preds.slice(0, 5).map((p) => ({
      neighborCode: p.neighborCode,
      neighborLabel: p.neighborLabel,
      cooccurrenceCount: p.count,
      transitionProbability:
        totalPredOccurrences > 0
          ? Number(((p.count * 100) / totalPredOccurrences).toFixed(1))
          : 0,
    }));

    const topSuccessors: SignTransitionItem[] = succs.slice(0, 5).map((s) => ({
      neighborCode: s.neighborCode,
      neighborLabel: s.neighborLabel,
      cooccurrenceCount: s.count,
      transitionProbability:
        totalSuccOccurrences > 0
          ? Number(((s.count * 100) / totalSuccOccurrences).toFixed(1))
          : 0,
    }));

    return {
      targetCode: target.catalogueCode,
      targetLabel: target.visualLabel,
      totalOccurrences: target.totalOccurrences,
      occurrencesWithPredecessor: totalPredOccurrences,
      occurrencesWithSuccessor: totalSuccOccurrences,
      topPredecessors,
      topSuccessors,
    };
  });

  return {
    profiles,
    threshold: minOccurrences,
  };
}

export async function getSequenceMotifs(
  datasetVersionId: string,
  minFrequency: number = 2
): Promise<SequenceMotifsReport> {
  const trigramsResult = await databaseQuery<{
    motif: string;
    signs: string[];
    occurrenceCount: number;
    inscriptionCount: number;
    exampleInscriptions: string[];
  }>(
    `SELECT
       s1.catalogue_code || ' ' || s2.catalogue_code || ' ' || s3.catalogue_code AS motif,
       ARRAY[s1.catalogue_code, s2.catalogue_code, s3.catalogue_code] AS signs,
       COUNT(*)::int AS "occurrenceCount",
       COUNT(DISTINCT i.id)::int AS "inscriptionCount",
       (ARRAY_AGG(DISTINCT i.stable_id ORDER BY i.stable_id))[1:3] AS "exampleInscriptions"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences o1 ON o1.sequence_id = seq.id
     JOIN sign_occurrences o2 ON o2.sequence_id = seq.id AND o2.position_index = o1.position_index + 1
     JOIN sign_occurrences o3 ON o3.sequence_id = seq.id AND o3.position_index = o1.position_index + 2
     JOIN signs s1 ON s1.id = o1.sign_id
     JOIN signs s2 ON s2.id = o2.sign_id
     JOIN signs s3 ON s3.id = o3.sign_id
     WHERE dvi.dataset_version_id = $1
       AND o1.identification_status = 'identified'
       AND o2.identification_status = 'identified'
       AND o3.identification_status = 'identified'
     GROUP BY s1.catalogue_code, s2.catalogue_code, s3.catalogue_code
     HAVING COUNT(*) >= $2
     ORDER BY "occurrenceCount" DESC, motif ASC`,
    [datasetVersionId, minFrequency]
  );

  const fourgramsResult = await databaseQuery<{
    motif: string;
    signs: string[];
    occurrenceCount: number;
    inscriptionCount: number;
    exampleInscriptions: string[];
  }>(
    `SELECT
       s1.catalogue_code || ' ' || s2.catalogue_code || ' ' || s3.catalogue_code || ' ' || s4.catalogue_code AS motif,
       ARRAY[s1.catalogue_code, s2.catalogue_code, s3.catalogue_code, s4.catalogue_code] AS signs,
       COUNT(*)::int AS "occurrenceCount",
       COUNT(DISTINCT i.id)::int AS "inscriptionCount",
       (ARRAY_AGG(DISTINCT i.stable_id ORDER BY i.stable_id))[1:3] AS "exampleInscriptions"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences o1 ON o1.sequence_id = seq.id
     JOIN sign_occurrences o2 ON o2.sequence_id = seq.id AND o2.position_index = o1.position_index + 1
     JOIN sign_occurrences o3 ON o3.sequence_id = seq.id AND o3.position_index = o1.position_index + 2
     JOIN sign_occurrences o4 ON o4.sequence_id = seq.id AND o4.position_index = o1.position_index + 3
     JOIN signs s1 ON s1.id = o1.sign_id
     JOIN signs s2 ON s2.id = o2.sign_id
     JOIN signs s3 ON s3.id = o3.sign_id
     JOIN signs s4 ON s4.id = o4.sign_id
     WHERE dvi.dataset_version_id = $1
       AND o1.identification_status = 'identified'
       AND o2.identification_status = 'identified'
       AND o3.identification_status = 'identified'
       AND o4.identification_status = 'identified'
     GROUP BY s1.catalogue_code, s2.catalogue_code, s3.catalogue_code, s4.catalogue_code
     HAVING COUNT(*) >= $2
     ORDER BY "occurrenceCount" DESC, motif ASC`,
    [datasetVersionId, minFrequency]
  );

  const initialResult = await databaseQuery<{
    motif: string;
    signs: string[];
    occurrenceCount: number;
    inscriptionCount: number;
    exampleInscriptions: string[];
  }>(
    `SELECT
       s1.catalogue_code || ' ' || s2.catalogue_code AS motif,
       ARRAY[s1.catalogue_code, s2.catalogue_code] AS signs,
       COUNT(*)::int AS "occurrenceCount",
       COUNT(DISTINCT i.id)::int AS "inscriptionCount",
       (ARRAY_AGG(DISTINCT i.stable_id ORDER BY i.stable_id))[1:3] AS "exampleInscriptions"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences o1 ON o1.sequence_id = seq.id AND o1.position_index = 1
     JOIN sign_occurrences o2 ON o2.sequence_id = seq.id AND o2.position_index = 2
     JOIN signs s1 ON s1.id = o1.sign_id
     JOIN signs s2 ON s2.id = o2.sign_id
     WHERE dvi.dataset_version_id = $1
       AND o1.identification_status = 'identified'
       AND o2.identification_status = 'identified'
     GROUP BY s1.catalogue_code, s2.catalogue_code
     HAVING COUNT(*) >= $2
     ORDER BY "occurrenceCount" DESC, motif ASC`,
    [datasetVersionId, minFrequency]
  );

  return {
    trigrams: trigramsResult.rows.map((r) => ({ ...r, length: 3 })),
    fourgrams: fourgramsResult.rows.map((r) => ({ ...r, length: 4 })),
    initialPatterns: initialResult.rows.map((r) => ({ ...r, length: 2 })),
    threshold: minFrequency,
  };
}

export async function getDiversityAndRepetitionStats(
  datasetVersionId: string
): Promise<DiversityAndRepetitionReport> {
  const diversityResult = await databaseQuery<{
    totalSequences: number;
    zeroRepetitionCount: number;
    withRepetitionCount: number;
    highRepetitionCount: number;
    meanDiversityRatio: number;
    maxRepeatCount: number;
  }>(
    `WITH seq_metrics AS (
       SELECT
         seq.id,
         COUNT(occ.id)::int AS length,
         COUNT(DISTINCT occ.sign_id)::int AS distinct_signs,
         (COUNT(occ.id) - COUNT(DISTINCT occ.sign_id))::int AS repeat_count
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       WHERE dvi.dataset_version_id = $1
       GROUP BY seq.id
     )
     SELECT
       COUNT(*)::int AS "totalSequences",
       COUNT(*) FILTER (WHERE repeat_count = 0)::int AS "zeroRepetitionCount",
       COUNT(*) FILTER (WHERE repeat_count > 0)::int AS "withRepetitionCount",
       COUNT(*) FILTER (WHERE repeat_count >= 2)::int AS "highRepetitionCount",
       COALESCE(ROUND(AVG(distinct_signs::numeric / length::numeric), 3)::float, 0) AS "meanDiversityRatio",
       COALESCE(MAX(repeat_count)::int, 0) AS "maxRepeatCount"
     FROM seq_metrics`,
    [datasetVersionId]
  );

  const repeatedSignsResult = await databaseQuery<{
    catalogueCode: string;
    visualLabel: string;
    inscriptionsWithRepetition: number;
    maxInSingleSequence: number;
    exampleInscriptions: string[];
  }>(
    `WITH occ_counts AS (
       SELECT
         i.stable_id AS inscription_stable_id,
         s.catalogue_code,
         s.visual_label,
         COUNT(occ.id)::int AS cnt
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       JOIN signs s ON s.id = occ.sign_id
       WHERE dvi.dataset_version_id = $1
       GROUP BY i.stable_id, s.id, s.catalogue_code, s.visual_label
       HAVING COUNT(occ.id) > 1
     )
     SELECT
       catalogue_code AS "catalogueCode",
       visual_label AS "visualLabel",
       COUNT(DISTINCT inscription_stable_id)::int AS "inscriptionsWithRepetition",
       MAX(cnt)::int AS "maxInSingleSequence",
       (ARRAY_AGG(inscription_stable_id ORDER BY inscription_stable_id))[1:5] AS "exampleInscriptions"
     FROM occ_counts
     GROUP BY catalogue_code, visual_label
     ORDER BY "inscriptionsWithRepetition" DESC, catalogue_code ASC`,
    [datasetVersionId]
  );

  return {
    diversityStats: diversityResult.rows[0] ?? {
      totalSequences: 0,
      zeroRepetitionCount: 0,
      withRepetitionCount: 0,
      highRepetitionCount: 0,
      meanDiversityRatio: 0,
      maxRepeatCount: 0,
    },
    repeatedSigns: repeatedSignsResult.rows,
  };
}

function signSequenceLevenshtein(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export async function getSequenceDuplicatesAndNearDuplicates(
  datasetVersionId: string
): Promise<SequenceSimilarityReport> {
  const exactResult = await databaseQuery<{
    signSequence: string;
    length: number;
    count: number;
    inscriptions: string[];
  }>(
    `WITH seq_strings AS (
       SELECT
         i.stable_id AS inscription_stable_id,
         COUNT(occ.id)::int AS seq_length,
         STRING_AGG(s.catalogue_code, ' ' ORDER BY occ.position_index) AS sign_seq
       FROM dataset_version_inscriptions dvi
       JOIN inscriptions i ON i.id = dvi.inscription_id
       JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
       JOIN sign_occurrences occ ON occ.sequence_id = seq.id
       JOIN signs s ON s.id = occ.sign_id
       WHERE dvi.dataset_version_id = $1
       GROUP BY i.stable_id, seq.id
     )
     SELECT
       sign_seq AS "signSequence",
       MAX(seq_length)::int AS length,
       COUNT(*)::int AS count,
       ARRAY_AGG(inscription_stable_id ORDER BY inscription_stable_id) AS inscriptions
     FROM seq_strings
     GROUP BY sign_seq
     HAVING COUNT(*) > 1
     ORDER BY count DESC, length DESC`,
    [datasetVersionId]
  );

  const sequencesResult = await databaseQuery<{
    inscriptionStableId: string;
    signs: string[];
  }>(
    `SELECT
       i.stable_id AS "inscriptionStableId",
       ARRAY_AGG(s.catalogue_code ORDER BY occ.position_index) AS signs
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
     GROUP BY i.stable_id, seq.id
     ORDER BY i.stable_id ASC`,
    [datasetVersionId]
  );

  const seqs = sequencesResult.rows;
  const nearDuplicates: NearDuplicateSequencePair[] = [];

  for (let i = 0; i < seqs.length; i++) {
    for (let j = i + 1; j < seqs.length; j++) {
      const s1 = seqs[i].signs;
      const s2 = seqs[j].signs;
      if (s1.length >= 3 && s2.length >= 3 && Math.abs(s1.length - s2.length) <= 1) {
        const dist = signSequenceLevenshtein(s1, s2);
        if (dist === 1) {
          const diffType: "insertion" | "deletion" | "substitution" =
            s1.length === s2.length
              ? "substitution"
              : s1.length < s2.length
              ? "insertion"
              : "deletion";
          nearDuplicates.push({
            inscription1: seqs[i].inscriptionStableId,
            seq1: s1.join(" "),
            inscription2: seqs[j].inscriptionStableId,
            seq2: s2.join(" "),
            length1: s1.length,
            length2: s2.length,
            editDistance: 1,
            diffType,
          });
        }
      }
    }
  }

  return {
    exactDuplicates: exactResult.rows,
    nearDuplicates,
  };
}

export async function getStructuralOutliers(
  datasetVersionId: string
): Promise<StructuralOutliersReport> {
  const hapaxResult = await databaseQuery<{ catalogueCode: string }>(
    `SELECT s.catalogue_code AS "catalogueCode"
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
       AND occ.identification_status = 'identified'
     GROUP BY s.catalogue_code
     HAVING COUNT(occ.id) = 1`,
    [datasetVersionId]
  );
  const hapaxSet = new Set(hapaxResult.rows.map((r) => r.catalogueCode));

  const seqsResult = await databaseQuery<{
    inscriptionStableId: string;
    length: number;
    distinctSigns: number;
    repeatCount: number;
    signSequence: string;
    signs: string[];
  }>(
    `SELECT
       i.stable_id AS "inscriptionStableId",
       COUNT(occ.id)::int AS length,
       COUNT(DISTINCT occ.sign_id)::int AS "distinctSigns",
       (COUNT(occ.id) - COUNT(DISTINCT occ.sign_id))::int AS "repeatCount",
       STRING_AGG(s.catalogue_code, ' ' ORDER BY occ.position_index) AS "signSequence",
       ARRAY_AGG(s.catalogue_code ORDER BY occ.position_index) AS signs
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     JOIN signs s ON s.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
     GROUP BY i.stable_id, seq.id
     ORDER BY length DESC, "repeatCount" DESC`,
    [datasetVersionId]
  );

  const outliers: StructuralOutlier[] = [];

  for (const row of seqsResult.rows) {
    const reasons: string[] = [];
    if (row.length >= 10) {
      reasons.push(
        `Unusually long sequence (length ${row.length} ≥ 10; >2 standard deviations above corpus mean of 5.60)`
      );
    }
    if (row.repeatCount >= 2) {
      reasons.push(
        `Multiple internal sign repetitions (${row.repeatCount} duplicate occurrences in a single sequence)`
      );
    }
    const hapaxCount = row.signs.filter((code) => hapaxSet.has(code)).length;
    if (row.length >= 3 && hapaxCount >= 2) {
      reasons.push(
        `High density of corpus-unique signs (${hapaxCount} hapax legomena signs occurring only once across all 179 inscriptions)`
      );
    }

    if (reasons.length > 0) {
      outliers.push({
        inscriptionStableId: row.inscriptionStableId,
        length: row.length,
        distinctSigns: row.distinctSigns,
        repeatCount: row.repeatCount,
        signSequence: row.signSequence,
        outlierReasons: reasons,
      });
    }
  }

  return { outliers };
}

export async function runDatasetAnalysis(
  datasetIdOrStableId?: string
): Promise<AnalysisReport | null> {
  const dataset = await getAnalysisDataset(datasetIdOrStableId);
  if (!dataset) return null;

  const [
    coverage,
    signFrequencies,
    sequenceLengths,
    positionalFrequencies,
    adjacentPairs,
    positionProfiles,
    transitionProfiles,
    motifs,
    diversityAndRepetition,
    similarity,
    outliers,
  ] = await Promise.all([
    getCorpusCoverage(dataset.id),
    getSignFrequencyDistribution(dataset.id),
    getSequenceLengthDistribution(dataset.id),
    getPositionalFrequencies(dataset.id),
    getAdjacentPairFrequencies(dataset.id, 2),
    getSignPositionProfiles(dataset.id, 10),
    getSignTransitionProfiles(dataset.id, 20),
    getSequenceMotifs(dataset.id, 2),
    getDiversityAndRepetitionStats(dataset.id),
    getSequenceDuplicatesAndNearDuplicates(dataset.id),
    getStructuralOutliers(dataset.id),
  ]);

  return {
    dataset,
    coverage,
    signFrequencies,
    sequenceLengths,
    positionalFrequencies,
    adjacentPairs,
    positionProfiles,
    transitionProfiles,
    motifs,
    diversityAndRepetition,
    similarity,
    outliers,
  };
}
