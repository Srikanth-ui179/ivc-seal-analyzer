export type EvidenceType =
  | "corpus_overview"
  | "sign_frequency"
  | "sign_occurrences"
  | "sign_positional_profile"
  | "transitions"
  | "motifs"
  | "duplicate_sequences"
  | "near_duplicate_sequences"
  | "outliers"
  | "sequence_search"
  | "site_corpus_status"
  | "dataset_limitations"
  | "reading_direction_completeness"
  | "inscription_search"
  | "unsupported_inquiry";

export type EvidenceDataset = {
  id: string;
  stableId: string;
  name: string;
  state: "frozen";
};

export type EvidenceRecord = {
  id: string;
  stableId: string;
  cisiId?: string;
  sequence?: string[];
  objectStableId?: string;
  objectType?: string;
  siteName?: string;
  highlightSign?: string;
  description?: string;
  href: string;
};

export type EvidenceStatItem = {
  label: string;
  value: string | number;
  denominator?: string | number;
  percentage?: number;
  note?: string;
};

export type EvidenceObject = {
  type: EvidenceType;
  dataset: EvidenceDataset;
  claim: string;
  summary: string;
  stats?: EvidenceStatItem[];
  records?: EvidenceRecord[];
  source?: {
    stableId: string;
    title: string;
    licenceName: string | null;
  };
  limitations: string[];
  links?: Array<{
    label: string;
    href: string;
  }>;
};

export const FROZEN_DATASET_META: EvidenceDataset = {
  id: "00000000-0000-4000-8000-000000000181",
  stableId: "DATASET-CISI-MOHENJODARO-V1",
  name: "CISI Mohenjo-daro Seals (M-1..M-199)",
  state: "frozen",
};
