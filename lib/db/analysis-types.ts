export type IdentificationStatusCount = {
  status: string;
  count: number;
  percentage: number;
};

export type SequenceCompletenessCount = {
  status: string;
  count: number;
  percentage: number;
};

export type CorpusCoverage = {
  totalInscriptions: number;
  totalSequences: number;
  totalOccurrences: number;
  distinctSigns: number;
  identificationStatuses: IdentificationStatusCount[];
  completenessStatuses: SequenceCompletenessCount[];
};

export type SignFrequency = {
  signId: string;
  stableId: string;
  catalogueCode: string;
  visualLabel: string;
  frequency: number;
  percentage: number;
  rank: number;
};

export type NonIdentifiedSignCoverage = {
  status: string;
  count: number;
  percentage: number;
};

export type SignFrequencyDistribution = {
  identified: SignFrequency[];
  nonIdentified: NonIdentifiedSignCoverage[];
  totalIdentifiedTokens: number;
  totalNonIdentifiedTokens: number;
};

export type SequenceLengthStats = {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
};

export type LengthHistogramBin = {
  length: number;
  count: number;
  percentage: number;
};

export type SequenceLengthDistribution = {
  overall: SequenceLengthStats;
  complete: SequenceLengthStats;
  incomplete: SequenceLengthStats;
  notRecorded: SequenceLengthStats;
  histogram: LengthHistogramBin[];
};

export type PositionSignFrequency = {
  signId: string;
  stableId: string;
  catalogueCode: string;
  visualLabel: string;
  frequency: number;
  percentage: number;
  rank: number;
};

export type PositionalFrequencies = {
  firstPositions: PositionSignFrequency[];
  totalFirstPositionTokens: number;
  terminalPositions: PositionSignFrequency[];
  totalTerminalPositionTokens: number;
  completeSequencesCount: number;
};

export type AdjacentSignPair = {
  sign1Code: string;
  sign1Label: string;
  sign2Code: string;
  sign2Label: string;
  frequency: number;
  rank: number;
};

export type AdjacentSignPairDistribution = {
  pairs: AdjacentSignPair[];
  threshold: number;
  totalQualifyingPairs: number;
};

export type AnalysisDatasetMetadata = {
  id: string;
  stableId: string;
  name: string;
  description: string | null;
  selectionCriteria: string;
  state: "draft" | "frozen";
  frozenAt: Date | null;
  createdAt: Date;
  inscriptionCount: number;
};

// M6: Positional Profiles & Normalized Relative Position
export type SignPositionProfile = {
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
};

export type SignPositionProfileDistribution = {
  profiles: SignPositionProfile[];
  threshold: number;
  totalProfiles: number;
};

// M7: Successor & Predecessor Transition Profiles
export type SignTransitionItem = {
  neighborCode: string;
  neighborLabel: string;
  cooccurrenceCount: number;
  transitionProbability: number;
};

export type SignTransitionProfile = {
  targetCode: string;
  targetLabel: string;
  totalOccurrences: number;
  occurrencesWithSuccessor: number;
  occurrencesWithPredecessor: number;
  topSuccessors: SignTransitionItem[];
  topPredecessors: SignTransitionItem[];
};

export type SignTransitionDistribution = {
  profiles: SignTransitionProfile[];
  threshold: number;
};

// M8: Contiguous Sequence Motifs & Recurring Initial Sequences
export type SequenceMotif = {
  motif: string;
  signs: string[];
  length: number;
  occurrenceCount: number;
  inscriptionCount: number;
  exampleInscriptions: string[];
};

export type SequenceMotifsReport = {
  trigrams: SequenceMotif[];
  fourgrams: SequenceMotif[];
  initialPatterns: SequenceMotif[];
  threshold: number;
};

// M9: Diversity and Internal Repetition
export type CorpusDiversityStats = {
  totalSequences: number;
  zeroRepetitionCount: number;
  withRepetitionCount: number;
  highRepetitionCount: number;
  meanDiversityRatio: number;
  maxRepeatCount: number;
};

export type InternalSignRepetition = {
  catalogueCode: string;
  visualLabel: string;
  inscriptionsWithRepetition: number;
  maxInSingleSequence: number;
  exampleInscriptions: string[];
};

export type DiversityAndRepetitionReport = {
  diversityStats: CorpusDiversityStats;
  repeatedSigns: InternalSignRepetition[];
};

// M10: Sequence Similarity & Near Duplicates
export type ExactDuplicateSequence = {
  signSequence: string;
  length: number;
  count: number;
  inscriptions: string[];
};

export type NearDuplicateSequencePair = {
  inscription1: string;
  seq1: string;
  inscription2: string;
  seq2: string;
  length1: number;
  length2: number;
  editDistance: number;
  diffType: "insertion" | "deletion" | "substitution";
};

export type SequenceSimilarityReport = {
  exactDuplicates: ExactDuplicateSequence[];
  nearDuplicates: NearDuplicateSequencePair[];
};

// M11: Structural Outliers
export type StructuralOutlier = {
  inscriptionStableId: string;
  length: number;
  distinctSigns: number;
  repeatCount: number;
  signSequence: string;
  outlierReasons: string[];
};

export type StructuralOutliersReport = {
  outliers: StructuralOutlier[];
};

export type AnalysisReport = {
  dataset: AnalysisDatasetMetadata;
  coverage: CorpusCoverage;
  signFrequencies: SignFrequencyDistribution;
  sequenceLengths: SequenceLengthDistribution;
  positionalFrequencies: PositionalFrequencies;
  adjacentPairs: AdjacentSignPairDistribution;
  positionProfiles: SignPositionProfileDistribution;
  transitionProfiles: SignTransitionDistribution;
  motifs: SequenceMotifsReport;
  diversityAndRepetition: DiversityAndRepetitionReport;
  similarity: SequenceSimilarityReport;
  outliers: StructuralOutliersReport;
};
