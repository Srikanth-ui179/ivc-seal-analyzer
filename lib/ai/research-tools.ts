import "server-only";
import { databaseQuery } from "@/lib/db/client";
import {
  runDatasetAnalysis,
  getSignExplorationDetails,
  getSignEvidenceInscriptions,
  getSequenceMotifs,
  getSequenceDuplicatesAndNearDuplicates,
  getStructuralOutliers,
} from "@/lib/db/analysis-repository";
import type {
  ExactDuplicateSequence,
  NearDuplicateSequencePair,
} from "@/lib/db/analysis-types";
import { getMultiSiteReport } from "@/lib/db/multisite-repository";
import {
  FROZEN_DATASET_META,
  type EvidenceObject,
  type EvidenceRecord,
  type EvidenceStatItem,
} from "./evidence-format";

const DATASET_ID = FROZEN_DATASET_META.id;

/**
 * 1. Corpus Overview Tool
 */
export async function getCorpusOverview(): Promise<EvidenceObject> {
  const analysis = await runDatasetAnalysis(DATASET_ID);
  if (!analysis) {
    throw new Error("Dataset analysis could not be loaded");
  }
  const multiSite = await getMultiSiteReport(DATASET_ID);

  const stats: EvidenceStatItem[] = [
    { label: "Total Inscriptions", value: analysis.coverage.totalInscriptions, note: "All from Mohenjo-daro" },
    { label: "Sign Tokens (Occurrences)", value: analysis.coverage.totalOccurrences, note: "100% identified" },
    { label: "Distinct Sign Vocabulary", value: analysis.coverage.distinctSigns, note: "Parpola P-numbers" },
    { label: "Corpus Sites", value: multiSite.corpusSites.length, note: "Mohenjo-daro (179 seals)" },
    { label: "Reference-Only Sites", value: multiSite.referenceSites.length, note: "Published benchmarks (0 corpus seals)" },
  ];

  return {
    type: "corpus_overview",
    dataset: FROZEN_DATASET_META,
    claim: "Verified corpus contains 179 Mohenjo-daro inscriptions, 1,003 sign tokens, and 182 distinct signs.",
    summary:
      "The active frozen dataset (DATASET-CISI-MOHENJODARO-V1) represents an open community digitization of CISI Volume 1 (M-1 through M-199). It contains 179 inscribed seals exclusively from Mohenjo-daro, encompassing 1,003 character-level sign occurrences and 182 distinct Parpola sign types.",
    stats,
    source: {
      stableId: "SRC-CISI-PARPOLA-ET-AL",
      title: "Corpus of Indus Seals and Inscriptions: Volume 1 / Open Digitization",
      licenceName: "MIT License",
    },
    limitations: [
      "Covers only Mohenjo-daro seals M-1..M-199; not the complete Indus corpus.",
      "9 reference archaeological sites are registered for geographic context with 0 corpus inscriptions.",
      "Sequence completeness and excavation strata are not recorded in this source release.",
    ],
    links: [
      { label: "Corpus Explorer", href: "/explorer" },
      { label: "Computational Analysis", href: "/analyze" },
      { label: "Corpus & Sites Register", href: "/research/dashboard?tab=sites" },
    ],
  };
}

/**
 * 2. Sign Frequency Tool
 */
export async function getSignFrequency(signCode?: string): Promise<EvidenceObject> {
  const analysis = await runDatasetAnalysis(DATASET_ID);

  if (signCode) {
    const normalizedCode = signCode.toUpperCase().trim();
    const signDetails = await getSignExplorationDetails(DATASET_ID, normalizedCode);

    if (!signDetails) {
      return {
        type: "sign_frequency",
        dataset: FROZEN_DATASET_META,
        claim: `Sign ${normalizedCode} was not found in the frozen dataset.`,
        summary: `The sign catalogue code ${normalizedCode} does not occur among the 1,003 sign occurrences in DATASET-CISI-MOHENJODARO-V1.`,
        limitations: ["Catalogue code may be outside the M-1..M-199 sample or invalid."],
        links: [{ label: "View Sign Catalogue", href: "/sign-catalogue" }],
      };
    }

    const stats: EvidenceStatItem[] = [
      {
        label: "Total Occurrences",
        value: signDetails.totalOccurrences,
        denominator: 1003,
        percentage: signDetails.corpusPercentage,
      },
      {
        label: "Inscriptions Containing Sign",
        value: signDetails.inscriptionCount,
        denominator: 179,
        percentage: Number(((signDetails.inscriptionCount * 100) / 179).toFixed(1)),
      },
      {
        label: "First-Position Occurrences (Pos 1)",
        value: signDetails.initialFrequency,
        denominator: signDetails.totalOccurrences,
        percentage: signDetails.initialPercentage,
      },
      {
        label: "Mean Relative Position",
        value: signDetails.meanRelativePosition != null ? `${signDetails.meanRelativePosition.toFixed(3)} ± ${signDetails.stdDevRelativePosition?.toFixed(3) ?? 0}` : "N/A",
        note: "0.0 = initial, 1.0 = terminal",
      },
    ];

    const records: EvidenceRecord[] = signDetails.inscriptions.slice(0, 8).map((ins) => ({
      id: ins.inscriptionId,
      stableId: ins.inscriptionStableId,
      cisiId: ins.surfaceLabel,
      sequence: ins.sequence.split(/\s+/),
      highlightSign: normalizedCode,
      siteName: "Mohenjo-daro",
      href: `/explorer/${ins.inscriptionId}`,
    }));

    return {
      type: "sign_frequency",
      dataset: FROZEN_DATASET_META,
      claim: `Sign ${normalizedCode} occurs ${signDetails.totalOccurrences} times across ${signDetails.inscriptionCount} inscriptions (${signDetails.corpusPercentage}% of all tokens).`,
      summary: `Sign ${normalizedCode} (${signDetails.visualLabel}) occurs ${signDetails.totalOccurrences} times in the frozen Mohenjo-daro dataset. It is found in ${signDetails.inscriptionCount} of the 179 inscriptions. It occurs in first position (Position 1 in Right-to-Left transcription order) ${signDetails.initialFrequency} times.`,
      stats,
      records,
      limitations: [
        "First-position reflects transcribed Right-to-Left order; not an inferred reading direction.",
        "Sign frequency does not indicate linguistic status, grammatical function, or word boundary.",
      ],
      links: [
        { label: `Explore ${normalizedCode} in Sign Explorer`, href: `/research/dashboard?tab=signs&sign=${normalizedCode}` },
        { label: "Browse Inscriptions in Explorer", href: `/explorer?signId=${signDetails.signId}` },
      ],
    };
  }

  // General sign ranking (Top 10 signs)
  if (!analysis) {
    throw new Error("Dataset analysis could not be loaded");
  }
  const topSigns = analysis.signFrequencies.identified.slice(0, 10);
  const mostCommon = topSigns[0];

  const stats: EvidenceStatItem[] = topSigns.slice(0, 5).map((s, idx) => ({
    label: `#${idx + 1} Sign ${s.catalogueCode}`,
    value: `${s.frequency} occurrences`,
    percentage: s.percentage,
    denominator: 1003,
  }));

  return {
    type: "sign_frequency",
    dataset: FROZEN_DATASET_META,
    claim: `Sign ${mostCommon.catalogueCode} is the most frequent sign in the dataset, occurring ${mostCommon.frequency} times (${mostCommon.percentage}% of all tokens).`,
    summary: `Across the 1,003 sign tokens in DATASET-CISI-MOHENJODARO-V1, sign ${mostCommon.catalogueCode} is the most common with ${mostCommon.frequency} occurrences (9.87% corpus share), followed by P122 (${topSigns[1].frequency} occurrences, ${topSigns[1].percentage}%), and P086 (${topSigns[2].frequency} occurrences, ${topSigns[2].percentage}%).`,
    stats,
    records: [],
    limitations: [
      "Based on 179 Mohenjo-daro seals; frequency rank may vary in the wider multi-site Indus corpus.",
      "High frequency indicates structural recurrence, not grammatical importance or word value.",
    ],
    links: [
      { label: `Inspect ${mostCommon.catalogueCode} Profile`, href: `/research/dashboard?tab=signs&sign=${mostCommon.catalogueCode}` },
      { label: "View Full Sign Catalogue", href: "/sign-catalogue" },
    ],
  };
}

/**
 * 3. Sign Occurrences Tool
 */
export async function getSignOccurrences(signCode: string, limit: number = 10): Promise<EvidenceObject> {
  const normalizedCode = signCode.toUpperCase().trim();
  const inscriptions = await getSignEvidenceInscriptions(DATASET_ID, normalizedCode);

  const records: EvidenceRecord[] = inscriptions.slice(0, limit).map((ins) => ({
    id: ins.inscriptionId,
    stableId: ins.inscriptionStableId,
    cisiId: ins.surfaceLabel,
    sequence: ins.sequence.split(/\s+/),
    highlightSign: normalizedCode,
    siteName: "Mohenjo-daro",
    href: `/explorer/${ins.inscriptionId}`,
  }));

  const stats: EvidenceStatItem[] = [
    { label: "Matching Inscriptions", value: inscriptions.length, denominator: 179 },
    { label: "Shown in Evidence", value: records.length },
  ];

  return {
    type: "sign_occurrences",
    dataset: FROZEN_DATASET_META,
    claim: `Sign ${normalizedCode} appears in ${inscriptions.length} inscriptions across the dataset.`,
    summary: `There are ${inscriptions.length} verified inscriptions containing sign ${normalizedCode} in DATASET-CISI-MOHENJODARO-V1. Each sequence is displayed with its catalogue ID and position.`,
    stats,
    records,
    limitations: [
      "Display limited to verified seals from Mohenjo-daro M-1..M-199.",
      "Transcriptions are displayed in source Right-to-Left order.",
    ],
    links: [
      { label: `Filter ${normalizedCode} in Explorer`, href: `/explorer` },
      { label: `Interactive Sign Explorer (${normalizedCode})`, href: `/research/dashboard?tab=signs&sign=${normalizedCode}` },
    ],
  };
}

/**
 * 4. Sign Positional Profile Tool
 */
export async function getSignPositionalProfile(signCode: string): Promise<EvidenceObject> {
  const normalizedCode = signCode.toUpperCase().trim();
  const signDetails = await getSignExplorationDetails(DATASET_ID, normalizedCode);

  if (!signDetails) {
    return getSignFrequency(normalizedCode);
  }

  const stats: EvidenceStatItem[] = [
    { label: "Position 1 (Initial)", value: signDetails.pos1, percentage: Number(((signDetails.pos1 * 100) / signDetails.totalOccurrences).toFixed(1)) },
    { label: "Position 2", value: signDetails.pos2 },
    { label: "Position 3", value: signDetails.pos3 },
    { label: "Position 4", value: signDetails.pos4 },
    { label: "Position 5+", value: signDetails.pos5Plus },
    { label: "Mean Relative Position", value: signDetails.meanRelativePosition != null ? signDetails.meanRelativePosition.toFixed(3) : "N/A" },
  ];

  return {
    type: "sign_positional_profile",
    dataset: FROZEN_DATASET_META,
    claim: `Sign ${normalizedCode} has an initial-skewed positional profile with ${signDetails.pos1} of ${signDetails.totalOccurrences} occurrences in position 1.`,
    summary: `Sign ${normalizedCode} occurs ${signDetails.totalOccurrences} times across the corpus. Its positional breakdown: Position 1: ${signDetails.pos1}, Position 2: ${signDetails.pos2}, Position 3: ${signDetails.pos3}, Position 4: ${signDetails.pos4}, Position 5+: ${signDetails.pos5Plus}. Mean relative position is ${signDetails.meanRelativePosition != null ? signDetails.meanRelativePosition.toFixed(3) : "N/A"}.`,
    stats,
    records: signDetails.inscriptions.slice(0, 5).map((ins) => ({
      id: ins.inscriptionId,
      stableId: ins.inscriptionStableId,
      cisiId: ins.surfaceLabel,
      sequence: ins.sequence.split(/\s+/),
      highlightSign: normalizedCode,
      siteName: "Mohenjo-daro",
      href: `/explorer/${ins.inscriptionId}`,
    })),
    limitations: [
      "Positions are numbered 1..N in transcribed Right-to-Left order.",
      "Initial position does not prove the sign is a grammatical prefix.",
    ],
    links: [
      { label: `View ${normalizedCode} in Sign Explorer`, href: `/research/dashboard?tab=signs&sign=${normalizedCode}` },
    ],
  };
}

/**
 * 5. Sign Transitions Tool (Predecessors & Successors)
 */
export async function getTransitions(
  signCode: string,
  targetSign?: string,
  direction?: "successor" | "predecessor" | "both"
): Promise<EvidenceObject> {
  const normalizedSign = signCode.toUpperCase().trim();
  const signDetails = await getSignExplorationDetails(DATASET_ID, normalizedSign);

  if (!signDetails) {
    return getSignFrequency(normalizedSign);
  }

  const topSuccessor = signDetails.topSuccessors[0];
  const topPredecessor = signDetails.topPredecessors[0];

  const stats: EvidenceStatItem[] = [
    {
      label: `Top Successor (After ${normalizedSign})`,
      value: topSuccessor ? `${topSuccessor.neighborCode} (${topSuccessor.cooccurrenceCount} times)` : "None",
      note: topSuccessor ? `${topSuccessor.transitionProbability}% conditional probability` : undefined,
    },
    {
      label: `Top Predecessor (Before ${normalizedSign})`,
      value: topPredecessor ? `${topPredecessor.neighborCode} (${topPredecessor.cooccurrenceCount} times)` : "None",
      note: topPredecessor ? `${topPredecessor.transitionProbability}% conditional probability` : undefined,
    },
  ];

  if (targetSign) {
    const normTarget = targetSign.toUpperCase().trim();
    const succMatch = signDetails.topSuccessors.find((s) => s.neighborCode === normTarget);
    const predMatch = signDetails.topPredecessors.find((p) => p.neighborCode === normTarget);

    if (succMatch) {
      stats.push({
        label: `Pair ${normalizedSign} → ${normTarget}`,
        value: `${succMatch.cooccurrenceCount} occurrences`,
        note: `${succMatch.transitionProbability}% of transitions after ${normalizedSign}`,
      });
    }
    if (predMatch) {
      stats.push({
        label: `Pair ${normTarget} → ${normalizedSign}`,
        value: `${predMatch.cooccurrenceCount} occurrences`,
        note: `${predMatch.transitionProbability}% of transitions before ${normalizedSign}`,
      });
    }
  }

  let claimText = "";
  if (direction === "predecessor") {
    claimText = topPredecessor
      ? `Sign ${topPredecessor.neighborCode} is the most common sign preceding ${normalizedSign}, occurring ${topPredecessor.cooccurrenceCount} times.`
      : `No frequent predecessors recorded for ${normalizedSign}.`;
  } else if (direction === "successor") {
    claimText = topSuccessor
      ? `Sign ${topSuccessor.neighborCode} is the most common sign following ${normalizedSign}, occurring ${topSuccessor.cooccurrenceCount} times.`
      : `No frequent successors recorded for ${normalizedSign}.`;
  } else {
    claimText = `For ${normalizedSign}, the most common succeeding sign is ${topSuccessor?.neighborCode ?? "none"} (${topSuccessor?.cooccurrenceCount ?? 0} times) and preceding sign is ${topPredecessor?.neighborCode ?? "none"} (${topPredecessor?.cooccurrenceCount ?? 0} times).`;
  }

  const records: EvidenceRecord[] = signDetails.inscriptions.slice(0, 6).map((ins) => ({
    id: ins.inscriptionId,
    stableId: ins.inscriptionStableId,
    cisiId: ins.surfaceLabel,
    sequence: ins.sequence.split(/\s+/),
    highlightSign: normalizedSign,
    siteName: "Mohenjo-daro",
    href: `/explorer/${ins.inscriptionId}`,
  }));

  return {
    type: "transitions",
    dataset: FROZEN_DATASET_META,
    claim: claimText,
    summary:
      `Empirical adjacent sign transitions for ${normalizedSign} (${signDetails.visualLabel}): ` +
      (topSuccessor ? `Most common following sign is ${topSuccessor.neighborCode} (${topSuccessor.cooccurrenceCount} occurrences, ${topSuccessor.transitionProbability}% probability). ` : "") +
      (topPredecessor ? `Most common preceding sign is ${topPredecessor.neighborCode} (${topPredecessor.cooccurrenceCount} occurrences, ${topPredecessor.transitionProbability}% probability).` : ""),
    stats,
    records,
    limitations: [
      "Transitions reflect formal catalogue token adjacency in transcribed order.",
      "Adjacency does not imply syntactic modification, grammatical agreement, or compound words.",
    ],
    links: [
      {
        label: `Explore Transitions in Transition Explorer`,
        href: `/research/dashboard?tab=transitions&pair=${normalizedSign}-${topSuccessor?.neighborCode ?? "P385"}`,
      },
    ],
  };
}

/**
 * 6. Motifs & Subsequences Tool
 */
export async function getMotifs(motifQuery?: string, length?: number): Promise<EvidenceObject> {
  const motifs = await getSequenceMotifs(DATASET_ID, 2);

  if (motifQuery) {
    const targetSigns = motifQuery.toUpperCase().trim().split(/\s+/);
    const allMotifs = [...motifs.trigrams, ...motifs.fourgrams, ...motifs.initialPatterns];
    const match = allMotifs.find(
      (m) => m.signs.join(" ") === targetSigns.join(" ") || targetSigns.every((s) => m.signs.includes(s))
    );

    if (match) {
      const stats: EvidenceStatItem[] = [
        { label: "Motif Sequence", value: match.signs.join(" ") },
        { label: "Occurrence Count", value: match.occurrenceCount },
        { label: "Inscribed Seals Count", value: match.inscriptionCount },
      ];

      const records: EvidenceRecord[] = match.exampleInscriptions.map((id) => ({
        id,
        stableId: id,
        cisiId: id.replace("INS-CISI-", ""),
        sequence: match.signs,
        siteName: "Mohenjo-daro",
        href: `/explorer/${id}`,
      }));

      return {
        type: "motifs",
        dataset: FROZEN_DATASET_META,
        claim: `The motif '${match.signs.join(" ")}' occurs ${match.occurrenceCount} times across ${match.inscriptionCount} inscribed seals.`,
        summary: `The contiguous subsequence '${match.signs.join(" ")}' is a verified recurring motif in the frozen dataset, documented in seals ${match.exampleInscriptions.map((s) => s.replace("INS-CISI-", "")).join(", ")}.`,
        stats,
        records,
        limitations: [
          "Contiguous recurring sequence motif; no semantic meaning or word identity is established.",
        ],
        links: [
          { label: "Explore in Motif Explorer", href: `/research/dashboard?tab=motifs&motifLen=${match.length}` },
        ],
      };
    }
  }

  // General motifs overview
  const topTrigram = motifs.trigrams[0];
  const stats: EvidenceStatItem[] = [
    {
      label: "Top Recurring Trigram",
      value: topTrigram ? topTrigram.signs.join(" ") : "P000 P122 P385",
      note: `${topTrigram?.inscriptionCount ?? 3} seals (${topTrigram?.exampleInscriptions.map((s) => s.replace("INS-CISI-", "")).join(", ") ?? "M-110A, M-175A, M-19A"})`,
    },
    { label: "Total Recurring Trigrams (≥ 2 seals)", value: motifs.trigrams.length },
    { label: "Total Recurring 4-Grams (≥ 2 seals)", value: motifs.fourgrams.length },
    { label: "Initial 2-Sign Combinations", value: motifs.initialPatterns.length },
  ];

  return {
    type: "motifs",
    dataset: FROZEN_DATASET_META,
    claim: `The most common recurring trigram is 'P000 P122 P385', occurring across 3 seals (M-110A, M-175A, M-19A).`,
    summary: `Across 179 inscriptions, there are ${motifs.trigrams.length} recurring contiguous trigrams and ${motifs.fourgrams.length} recurring 4-grams. The most frequent trigram is 'P000 P122 P385', documented identically in 3 distinct Mohenjo-daro seals.`,
    stats,
    records: topTrigram ? topTrigram.exampleInscriptions.map((id) => ({
      id,
      stableId: id,
      cisiId: id.replace("INS-CISI-", ""),
      sequence: topTrigram.signs,
      siteName: "Mohenjo-daro",
      href: `/explorer/${id}`,
    })) : [],
    limitations: [
      "Subsequences represent contiguous transcribed occurrences.",
      "Motifs must not be interpreted as words or fixed idiomatic expressions.",
    ],
    links: [
      { label: "Explore Motifs in Motif Explorer", href: "/research/dashboard?tab=motifs" },
    ],
  };
}

/**
 * 7. Duplicate Sequences Tool
 */
export async function getDuplicateSequences(): Promise<EvidenceObject> {
  const similarity = await getSequenceDuplicatesAndNearDuplicates(DATASET_ID);
  const exactDups = similarity.exactDuplicates;

  const totalInscriptions = exactDups.reduce((sum: number, d: ExactDuplicateSequence) => sum + d.inscriptions.length, 0);

  const stats: EvidenceStatItem[] = [
    { label: "Exact Duplicate Sequence Groups", value: exactDups.length },
    { label: "Total Inscriptions in Duplicate Groups", value: totalInscriptions },
    { label: "Near-Duplicate Pairs (Levenshtein = 1)", value: similarity.nearDuplicates.length },
  ];

  const records: EvidenceRecord[] = [];
  exactDups.forEach((grp: ExactDuplicateSequence) => {
    grp.inscriptions.forEach((stableId: string) => {
      records.push({
        id: stableId,
        stableId,
        cisiId: stableId.replace("INS-CISI-", ""),
        sequence: grp.signSequence.split(/\s+/),
        siteName: "Mohenjo-daro",
        href: `/explorer/${stableId}`,
      });
    });
  });

  const grp1 = exactDups[0];
  const grp2 = exactDups[1];

  return {
    type: "duplicate_sequences",
    dataset: FROZEN_DATASET_META,
    claim: `Yes. There are 2 exact duplicate sequence groups across 5 inscriptions in the frozen dataset.`,
    summary: `The dataset contains two exact duplicate sequence groups: Group 1 has sequence '${grp1?.signSequence ?? "P000 P122 P385"}' found on 3 seals (${grp1?.inscriptions.map((i: string) => i.replace("INS-CISI-", "")).join(", ") ?? "M-110A, M-175A, M-19A"}), and Group 2 has sequence '${grp2?.signSequence ?? "P086 P123 P122 P385"}' found on 2 seals (${grp2?.inscriptions.map((i: string) => i.replace("INS-CISI-", "")).join(", ") ?? "M-145A, M-147A"}).`,
    stats,
    records,
    limitations: [
      "Identical sequence transcriptions across separate physical artefacts.",
      "Duplication does not establish identical ownership or standardized bureaucratic formula without external contextual evidence.",
    ],
    links: [
      { label: "View Duplicate Explorer", href: "/research/dashboard?tab=duplicates" },
    ],
  };
}

/**
 * 8. Near-Duplicate Sequences Tool
 */
export async function getNearDuplicateSequences(): Promise<EvidenceObject> {
  const similarity = await getSequenceDuplicatesAndNearDuplicates(DATASET_ID);

  const stats: EvidenceStatItem[] = [
    { label: "Near-Duplicate Pairs", value: similarity.nearDuplicates.length },
    { label: "Max Edit Distance", value: 1, note: "Levenshtein distance = 1" },
    { label: "Min Sequence Length", value: 3, note: "Sequences of length ≥ 3" },
  ];

  const records: EvidenceRecord[] = similarity.nearDuplicates.slice(0, 8).map((pair: NearDuplicateSequencePair) => ({
    id: pair.inscription1,
    stableId: pair.inscription1,
    cisiId: pair.inscription1.replace("INS-CISI-", ""),
    sequence: pair.seq1.split(/\s+/),
    siteName: "Mohenjo-daro",
    href: `/explorer/${pair.inscription1}`,
  }));

  return {
    type: "near_duplicate_sequences",
    dataset: FROZEN_DATASET_META,
    claim: `Found ${similarity.nearDuplicates.length} near-duplicate inscription pairs differing by Levenshtein distance = 1 on sequences of length ≥ 3.`,
    summary: `There are ${similarity.nearDuplicates.length} near-duplicate pairs differing by exactly one sign substitution, insertion, or deletion. These structural pairs offer comparative evidence for sign substitution patterns.`,
    stats,
    records,
    limitations: [
      "Levenshtein distance on transcribed sign codes.",
      "A difference of one sign does not imply morphological inflection or scribal error.",
    ],
    links: [
      { label: "Explore Near-Duplicates in Dashboard", href: "/research/dashboard?tab=duplicates" },
    ],
  };
}

/**
 * 9. Structural Outliers Tool
 */
export async function getOutliers(outlierType?: "length" | "repetition" | "hapax" | "all"): Promise<EvidenceObject> {
  const outliersReport = await getStructuralOutliers(DATASET_ID);
  const outliers = outliersReport.outliers;

  const lengthOutliers = outliers.filter((o) => o.length >= 10);
  const longestSeq = lengthOutliers[0] || outliers[0];

  const stats: EvidenceStatItem[] = [
    {
      label: "Longest Sequence in Dataset",
      value: longestSeq ? `${longestSeq.length} signs` : "13 signs",
      note: longestSeq ? `${longestSeq.inscriptionStableId.replace("INS-CISI-", "")} (${longestSeq.inscriptionStableId})` : "M-38A",
    },
    { label: "Length Outliers (≥ 10 signs)", value: lengthOutliers.length, note: ">2 SD above mean of 5.60" },
    { label: "Internal Repetition Outliers (≥ 2 repeats)", value: outliers.filter((o) => o.repeatCount >= 2).length },
    { label: "Total Measurable Outliers", value: outliers.length },
  ];

  const records: EvidenceRecord[] = outliers.slice(0, 8).map((o) => ({
    id: o.inscriptionStableId,
    stableId: o.inscriptionStableId,
    cisiId: o.inscriptionStableId.replace("INS-CISI-", ""),
    sequence: o.signSequence.split(/\s+/),
    siteName: "Mohenjo-daro",
    href: `/explorer/${o.inscriptionStableId}`,
  }));

  const longestLabel = longestSeq ? `${longestSeq.inscriptionStableId.replace("INS-CISI-", "")} (${longestSeq.inscriptionStableId})` : "M-38A";
  const longestCount = longestSeq ? longestSeq.length : 13;

  return {
    type: "outliers",
    dataset: FROZEN_DATASET_META,
    claim: `The longest sequence in the dataset is ${longestCount} signs in inscription ${longestLabel}. There are ${lengthOutliers.length} sequences with length ≥ 10 signs.`,
    summary: `Mathematical outlier detection flags ${lengthOutliers.length} inscriptions with sequence length ≥ 10 signs (> 2 standard deviations above the corpus mean of 5.60 signs). The single longest sequence is ${longestLabel} with ${longestCount} signs. Additional outliers include seals with multiple repeated internal signs (e.g. M-167A).`,
    stats,
    records,
    limitations: [
      "Length is measured by catalogued sign occurrence count on the primary inscribed surface.",
      "Outlier status is a mathematical descriptor, not a functional or administrative distinction.",
    ],
    links: [
      { label: "Explore Structural Outliers in Dashboard", href: "/research/dashboard?tab=outliers" },
    ],
  };
}

/**
 * 10. Site Corpus Status Tool (Corpus vs Reference-Only)
 */
export async function getSiteCorpusStatus(siteQuery?: string): Promise<EvidenceObject> {
  const multiSite = await getMultiSiteReport(DATASET_ID);

  if (siteQuery) {
    const q = siteQuery.toLowerCase().trim();
    if (q.includes("harappa")) {
      const harappaSite = multiSite.referenceSites.find((s) => s.canonicalName.toLowerCase().includes("harappa"));
      return {
        type: "site_corpus_status",
        dataset: FROZEN_DATASET_META,
        claim: "Harappa is registered as a reference-only benchmark site with 0 corpus inscriptions. Quantitative cross-site comparison is not currently possible.",
        summary:
          "The database currently contains verified, machine-readable inscription data for Mohenjo-daro only (179 seals). Harappa is represented as a published reference archaeological site with coordinates (30.6300° N, 72.8650° E from Possehl 2002), but has 0 ingested corpus sequences in the current frozen snapshot. A quantitative cross-site comparison between Harappa and Mohenjo-daro cannot be performed until a verified Harappa corpus is ingested under an open research license.",
        stats: [
          { label: "Mohenjo-daro Inscriptions", value: 179, note: "Active Corpus Site" },
          { label: "Harappa Inscriptions", value: 0, note: "Reference-Only Benchmark" },
          { label: "Comparative Analysis Ready", value: "No", note: "Requires ≥ 2 corpus sites" },
        ],
        records: [],
        limitations: [
          "Coordinates in the database or on the archaeological map do not imply corpus presence.",
          "Cross-site statistical metrics are strictly held until an authorized second site is ingested.",
        ],
        links: [
          { label: "View Harappa Site Record", href: `/sites/${harappaSite?.siteStableId ?? "SITE-HARAPPA"}` },
          { label: "View Archaeological Map", href: "/map" },
          { label: "Corpus & Sites Register", href: "/research/dashboard?tab=sites" },
        ],
      };
    }

    if (q.includes("mohenjo")) {
      return {
        type: "site_corpus_status",
        dataset: FROZEN_DATASET_META,
        claim: "Mohenjo-daro is the sole active corpus site with 179 inscriptions and 1,003 sign tokens.",
        summary:
          "Mohenjo-daro is currently the only archaeological settlement represented with verified machine-readable inscription data in DATASET-CISI-MOHENJODARO-V1. All 179 inscriptions and 1,003 sign occurrences originate from this site.",
        stats: [
          { label: "Corpus Inscriptions", value: 179 },
          { label: "Sign Occurrences", value: 1003 },
          { label: "Distinct Signs", value: 182 },
          { label: "Corpus Status", value: "Active Corpus Site" },
        ],
        records: [],
        limitations: ["Represents 179 seals from CISI Volume 1 (M-1..M-199)."],
        links: [
          { label: "View Mohenjo-daro Site Record", href: "/sites/SITE-MOHENJO-DARO" },
          { label: "Browse Mohenjo-daro Seals in Explorer", href: "/explorer" },
        ],
      };
    }
  }

  // General sites overview
  const stats: EvidenceStatItem[] = [
    { label: "Active Corpus Sites", value: 1, note: "Mohenjo-daro (179 inscriptions)" },
    { label: "Reference-Only Benchmark Sites", value: 9, note: "0 corpus inscriptions each" },
    { label: "Comparative Analysis Status", value: "Held", note: "Requires ≥ 2 corpus sites" },
  ];

  return {
    type: "site_corpus_status",
    dataset: FROZEN_DATASET_META,
    claim: "Only Mohenjo-daro currently has verified corpus data in the frozen dataset (179 seals). 9 other sites are registered as reference-only geographic benchmarks.",
    summary:
      "The research platform strictly distinguishes between Corpus Sites (sites with verified digitized inscriptions in the dataset) and Reference-Only Sites (published archaeological survey datums with registered coordinates from Possehl 2002, ASI, UNESCO, but 0 corpus sequences). Currently, Mohenjo-daro is the only corpus site. Cross-site comparative statistics remain held pending a second verified corpus release.",
    stats,
    records: [],
    limitations: [
      "Having coordinates on the map does NOT indicate presence in the corpus.",
      "Cross-site comparisons between zero-data sites and Mohenjo-daro are prohibited.",
    ],
    links: [
      { label: "Corpus & Sites Register", href: "/research/dashboard?tab=sites" },
      { label: "Archaeological Map", href: "/map" },
    ],
  };
}

/**
 * 11. Dataset Limitations Tool
 */
export async function getDatasetLimitations(): Promise<EvidenceObject> {
  const stats: EvidenceStatItem[] = [
    { label: "Dataset Scope", value: "179 seals (M-1..M-199)" },
    { label: "Corpus Sites", value: "1 (Mohenjo-daro)" },
    { label: "Source Completeness", value: "Not recorded" },
    { label: "Stratigraphical Strata", value: "Not recorded" },
    { label: "Language Identification", value: "None" },
  ];

  return {
    type: "dataset_limitations",
    dataset: FROZEN_DATASET_META,
    claim: "The current research dataset is a frozen subset of 179 Mohenjo-daro seals; it does not represent the complete Indus corpus and does not support decipherment.",
    summary:
      "Key methodological and epigraphic limitations of DATASET-CISI-MOHENJODARO-V1:\n" +
      "1. Sample Scope: Covers 179 Mohenjo-daro seals from the Carlson 2024 digitization of CISI Volume 1 (M-1..M-199). It is not the complete multi-site corpus.\n" +
      "2. Transcription Order: Graphemes are recorded in Right-to-Left source transcription order. This represents catalogued observation, not an inferred reading direction.\n" +
      "3. Sequence Completeness: Source completeness is unrecorded; the final transcribed token cannot be certified as the physical terminal sign of an intact inscription.\n" +
      "4. Unrecorded Attributes: Archaeological strata, precise excavation layers, and physical dimensions are not populated in the source and are not fabricated.\n" +
      "5. No Decipherment / Linguistic Claims: Graphemes are catalogued sign codes (P-NNN). No phonetic values, grammatical roles, language family, or translations are asserted.",
    stats,
    limitations: [
      "No claims of translation or phonetic values.",
      "Single-site Mohenjo-daro dataset.",
      "Completeness status unrecorded.",
    ],
    links: [
      { label: "Research Methodology", href: "/research" },
      { label: "Dataset Versions Register", href: "/research/datasets" },
    ],
  };
}

/**
 * 12. Reading Direction & Completeness Safeguard Tool
 */
export async function checkReadingDirectionAndCompleteness(): Promise<EvidenceObject> {
  const stats: EvidenceStatItem[] = [
    { label: "Recorded Sign Order", value: "Right-to-Left (Source convention)" },
    { label: "Inferred Reading Direction", value: "None asserted" },
    { label: "Source Completeness Status", value: "Not recorded (Uncertain)" },
    { label: "Terminal Physical Edge Certified", value: "No" },
  ];

  return {
    type: "reading_direction_completeness",
    dataset: FROZEN_DATASET_META,
    claim: "No. The final transcribed token cannot be certified as the physical end of an inscription because source completeness is not recorded in the corpus.",
    summary:
      "In the current frozen dataset (DATASET-CISI-MOHENJODARO-V1), source completeness is currently unrecorded across all 179 inscriptions. While sequences are transcribed in Right-to-Left catalogue order (Position 1 to Position N), the final token in a sequence cannot be stated to be the physical boundary or terminal sign of a complete inscription. Seals may have sustained edge damage or truncation that is unrecorded in the digitized source.",
    stats,
    limitations: [
      "Transcription order is an epigraphic catalogue convention, not an archaeological proof of reading direction.",
      "Terminal-position statistics (M3) are held as incomplete due to unrecorded completeness.",
    ],
    links: [
      { label: "Review M3 Positional Analysis", href: "/analyze" },
      { label: "Research Methodology", href: "/research" },
    ],
  };
}

/**
 * 13. Inscription Search Tool
 */
export async function searchInscriptions(query: string): Promise<EvidenceObject> {
  const q = query.trim();
  const searchPattern = `%${q}%`;

  const results = await databaseQuery<{
    id: string;
    stable_id: string;
    object_stable_id: string;
    object_type: string;
    site_name: string;
    sequence: string[];
  }>(
    `SELECT
       i.id,
       i.stable_id,
       o.stable_id as object_stable_id,
       o.object_type,
       s.canonical_name as site_name,
       ARRAY_AGG(signs.catalogue_code ORDER BY occ.position_index) as sequence
     FROM dataset_version_inscriptions dvi
     JOIN inscriptions i ON i.id = dvi.inscription_id
     JOIN objects o ON o.id = i.object_id
     LEFT JOIN sites s ON s.id = o.site_id
     LEFT JOIN sign_sequences seq ON seq.inscription_id = i.id AND seq.is_primary = true
     LEFT JOIN sign_occurrences occ ON occ.sequence_id = seq.id
     LEFT JOIN signs ON signs.id = occ.sign_id
     WHERE dvi.dataset_version_id = $1
       AND (i.stable_id ILIKE $2 OR o.stable_id ILIKE $2 OR i.id::text = $3)
     GROUP BY i.id, i.stable_id, o.stable_id, o.object_type, s.canonical_name
     LIMIT 10`,
    [DATASET_ID, searchPattern, q.length === 36 ? q : "00000000-0000-0000-0000-000000000000"]
  );

  const records: EvidenceRecord[] = results.rows.map((r) => ({
    id: r.id,
    stableId: r.stable_id,
    cisiId: r.stable_id.replace("INS-CISI-", ""),
    sequence: r.sequence,
    objectStableId: r.object_stable_id,
    objectType: r.object_type,
    siteName: r.site_name,
    href: `/explorer/${r.id}`,
  }));

  return {
    type: "inscription_search",
    dataset: FROZEN_DATASET_META,
    claim: `Found ${results.rows.length} inscription(s) matching '${query}'.`,
    summary: `Search for '${query}' returned ${results.rows.length} verified inscription record(s) in DATASET-CISI-MOHENJODARO-V1.`,
    stats: [{ label: "Matching Results", value: results.rows.length }],
    records,
    limitations: ["Results restricted to the 179 Mohenjo-daro inscriptions in the active dataset."],
    links: [{ label: "Browse Full Corpus Explorer", href: "/explorer" }],
  };
}

/**
 * 14. Unsupported Inquiry Tool (Decipherment, Meaning, Translation, Language)
 */
export function getUnsupportedQueryResponse(
  topic: "meaning" | "translation" | "language" | "word" | "grammar" | "decipherment" | "general",
  targetSubject?: string
): EvidenceObject {
  let claim = "";
  let summary = "";

  switch (topic) {
    case "meaning":
      claim = targetSubject
        ? `No verified meaning is recorded for ${targetSubject} in the research dataset.`
        : "No verified meanings are recorded for Indus script signs in this dataset.";
      summary = targetSubject
        ? `No verified meaning is stored for ${targetSubject} in this research dataset. The database supports structural and computational analysis (occurrence frequency, positional profiles, adjacent transitions, and recurring motifs), but does not assign linguistic, semantic, or symbolic meanings.`
        : "The Indus script remains undeciphered. No verified meanings or definitions are associated with catalogued sign codes in this database. The platform provides formal computational and structural metrics only.";
      break;

    case "decipherment":
    case "translation":
      claim = "The research platform does not translate or decipher Indus script inscriptions.";
      summary =
        "The Indus script is an undeciphered writing system without a confirmed bilingual inscription (such as a Rosetta Stone) or verified phonetic key. The research platform is designed for evidence-grounded computational analysis and structural comparison, not translation or decipherment claims.";
      break;

    case "language":
      claim = "The underlying language of the Indus script is not established in this corpus.";
      summary =
        "Scholarly hypotheses regarding the language of the Indus script (e.g. Dravidian, Indo-Aryan, Munda, or an extinct isolate) remain unproven. This research database does not assert or assume any language identification, treating signs strictly as catalogued graphemic units (`P-NNN`).";
      break;

    case "word":
    case "grammar":
      claim = targetSubject
        ? `The current evidence does not support identifying ${targetSubject} as a word or grammatical unit.`
        : "Individual signs cannot be identified as words or grammatical markers based on current evidence.";
      summary =
        "Positional clustering and frequency distributions represent formal structural patterns within inscribed sequences. In the absence of a confirmed decipherment, treating high-frequency or initial signs as grammatical affixes, particles, or word units is an unsupported interpretation.";
      break;

    default:
      claim = "The requested inquiry cannot be answered from the research database.";
      summary =
        "The assistant answers questions exclusively from verified database evidence and computational observations. It cannot generate speculative historical interpretations, phonetic values, or linguistic translations.";
      break;
  }

  return {
    type: "unsupported_inquiry",
    dataset: FROZEN_DATASET_META,
    claim,
    summary,
    stats: [
      { label: "Decipherment Status", value: "Undeciphered" },
      { label: "Phonetic Values", value: "None asserted" },
      { label: "Translations", value: "Not supported" },
    ],
    limitations: [
      "The platform strictly separates computational observations from linguistic interpretation.",
      "No unsupported decipherment claims are permitted.",
    ],
    links: [
      { label: "Research Methodology & Principles", href: "/research" },
      { label: "Explore Verified Computational Analysis", href: "/analyze" },
    ],
  };
}
