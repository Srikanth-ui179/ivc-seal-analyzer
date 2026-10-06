import type { EvidenceObject } from "./evidence-format";

export type Role = "user" | "assistant" | "system";

export type AssistantMessage = {
  id: string;
  role: Role;
  content: string;
  evidence?: EvidenceObject;
  createdAt: string;
};

export type AssistantContext = {
  activeSign?: string;
  activeSequence?: string[];
  activeSite?: string;
  lastTool?: string;
  lastTopic?: string;
};

export type RoutedIntent =
  | { type: "corpus_overview" }
  | { type: "sign_frequency"; signCode?: string }
  | { type: "sign_occurrences"; signCode: string; limit?: number }
  | { type: "sign_positional_profile"; signCode: string }
  | { type: "transitions"; signCode: string; targetSign?: string; direction?: "successor" | "predecessor" | "both" }
  | { type: "motifs"; motifQuery?: string; length?: number }
  | { type: "duplicate_sequences" }
  | { type: "near_duplicate_sequences" }
  | { type: "outliers"; outlierType?: "length" | "repetition" | "hapax" | "all" }
  | { type: "sequence_search"; sequence: string[] }
  | { type: "site_corpus_status"; siteQuery?: string }
  | { type: "dataset_limitations" }
  | { type: "reading_direction_completeness" }
  | { type: "inscription_search"; query: string }
  | { type: "unsupported_inquiry"; topic: "meaning" | "translation" | "language" | "word" | "grammar" | "decipherment" | "general" };

export type AssistantResponse = {
  answer: string;
  evidence: EvidenceObject;
  context: AssistantContext;
};
