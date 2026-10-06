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

export type AnalysisReport = {
  dataset: AnalysisDatasetMetadata;
  coverage: CorpusCoverage;
  signFrequencies: SignFrequencyDistribution;
  sequenceLengths: SequenceLengthDistribution;
  positionalFrequencies: PositionalFrequencies;
  adjacentPairs: AdjacentSignPairDistribution;
};
