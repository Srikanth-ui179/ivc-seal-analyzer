import type { AssistantContext, RoutedIntent } from "./research-types";

/**
 * Normalizes user input for pattern matching
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/['"?,.!]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts a sign code like P324 or P122 or P086 from text
 */
function extractSignCode(text: string): string | null {
  const match = text.match(/\b(P\d{2,4}[A-Z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Extracts a sequence of sign codes like "P000 P122 P385"
 */
function extractSignSequence(text: string): string[] | null {
  const matches = text.match(/\b(P\d{2,4}[A-Z]?)\b/gi);
  if (matches && matches.length >= 2) {
    return matches.map((m) => m.toUpperCase());
  }
  return null;
}

/**
 * Extracts an inscription identifier like M-110A or INS-CISI-M-110A
 */
function extractInscriptionId(text: string): string | null {
  const insMatch = text.match(/\b(INS-CISI-[A-Z0-9-]+)\b/i);
  if (insMatch) return insMatch[1].toUpperCase();

  const cisiMatch = text.match(/\b(M-\d+[A-Z]?)\b/i);
  if (cisiMatch) return cisiMatch[1].toUpperCase();

  return null;
}

/**
 * Maps a natural-language inquiry and optional conversational context
 * to a strictly controlled research tool intent.
 */
export function routeQuestion(message: string, context?: AssistantContext): RoutedIntent {
  const norm = normalize(message);
  const explicitSign = extractSignCode(message);
  const explicitSequence = extractSignSequence(message);
  const explicitInscription = extractInscriptionId(message);

  // Contextual fallback: if user says "it", "them", "those inscriptions", or "this sign" and we have an active sign in context
  const targetSign =
    explicitSign ||
    ((/\b(it|this sign|that sign|the sign|those|these|them)\b/i.test(message) ||
      norm.includes("those inscriptions") ||
      norm.includes("these inscriptions")) && context?.activeSign
      ? context.activeSign
      : null);

  // 1. UNSUPPORTED INQUIRIES (Integrity Safeguards)
  if (
    norm.includes("translate") ||
    norm.includes("translation") ||
    norm.includes("how do you translate") ||
    norm.includes("can you translate")
  ) {
    return { type: "unsupported_inquiry", topic: "translation" };
  }

  if (
    norm.includes("what language") ||
    norm.includes("which language") ||
    norm.includes("dravidian") ||
    norm.includes("indo-aryan") ||
    norm.includes("sanskrit") ||
    norm.includes("munda") ||
    norm.includes("sumerian")
  ) {
    return { type: "unsupported_inquiry", topic: "language" };
  }

  if (
    norm.includes("what does") && norm.includes("mean") ||
    norm.includes("what is the meaning") ||
    norm.includes("meaning of")
  ) {
    return { type: "unsupported_inquiry", topic: "meaning" };
  }

  if (
    norm.includes("is it a word") ||
    norm.includes("is this a word") ||
    norm.includes("a word") && targetSign ||
    norm.includes("grammatical marker") ||
    norm.includes("prefix") && norm.includes("grammat") ||
    norm.includes("suffix") && norm.includes("grammat")
  ) {
    return { type: "unsupported_inquiry", topic: "word" };
  }

  // 2. READING DIRECTION & SEQUENCE COMPLETENESS (Question 15)
  if (
    norm.includes("physical end") ||
    norm.includes("final token definitely") ||
    norm.includes("is the final token") ||
    norm.includes("is the last sign the end") ||
    norm.includes("physical boundary") ||
    norm.includes("reading direction")
  ) {
    return { type: "reading_direction_completeness" };
  }

  // 3. TRANSITIONS & ADJACENCY (Questions 3 & 4)
  if (
    norm.includes("follows") ||
    norm.includes("follow") ||
    norm.includes("comes after") ||
    norm.includes("after") && targetSign ||
    norm.includes("succeeding") ||
    norm.includes("successor")
  ) {
    const s = targetSign || "P122";
    return { type: "transitions", signCode: s, direction: "successor" };
  }

  if (
    norm.includes("precedes") ||
    norm.includes("precede") ||
    norm.includes("comes before") ||
    norm.includes("before") && targetSign ||
    norm.includes("preceding") ||
    norm.includes("predecessor")
  ) {
    const s = targetSign || "P122";
    return { type: "transitions", signCode: s, direction: "predecessor" };
  }

  if (
    norm.includes("transition") ||
    norm.includes("adjacent pair") ||
    norm.includes("adjacent sign")
  ) {
    if (explicitSequence && explicitSequence.length >= 2) {
      return {
        type: "transitions",
        signCode: explicitSequence[0],
        targetSign: explicitSequence[1],
        direction: "both",
      };
    }
    const s = targetSign || "P122";
    return { type: "transitions", signCode: s, direction: "both" };
  }

  // 4. MOTIFS & SUBSEQUENCES (Question 5)
  if (
    norm.includes("trigram") ||
    norm.includes("three-sign") ||
    norm.includes("3-sign") ||
    norm.includes("three sign")
  ) {
    return { type: "motifs", length: 3, motifQuery: explicitSequence?.join(" ") };
  }

  if (
    norm.includes("4-gram") ||
    norm.includes("four-sign") ||
    norm.includes("four sign") ||
    norm.includes("4 sign")
  ) {
    return { type: "motifs", length: 4, motifQuery: explicitSequence?.join(" ") };
  }

  if (norm.includes("motif") || norm.includes("subsequence") || norm.includes("recurring pattern")) {
    return { type: "motifs", motifQuery: explicitSequence?.join(" ") };
  }

  if (explicitSequence && explicitSequence.length >= 3) {
    return { type: "motifs", motifQuery: explicitSequence.join(" ") };
  }

  // 5. DUPLICATES & NEAR-DUPLICATES (Question 6)
  if (
    norm.includes("near duplicate") ||
    norm.includes("near-duplicate") ||
    norm.includes("edit distance") ||
    norm.includes("levenshtein")
  ) {
    return { type: "near_duplicate_sequences" };
  }

  if (
    norm.includes("exact duplicate") ||
    norm.includes("duplicate sequence") ||
    norm.includes("duplicate inscription") ||
    norm.includes("are there duplicate") ||
    norm.includes("duplicate")
  ) {
    return { type: "duplicate_sequences" };
  }

  // 6. OUTLIERS & SEQUENCE LENGTHS (Question 7)
  if (
    norm.includes("longest sequence") ||
    norm.includes("longest inscription") ||
    norm.includes("unusually long") ||
    norm.includes("maximum length") ||
    norm.includes("length outlier")
  ) {
    return { type: "outliers", outlierType: "length" };
  }

  if (norm.includes("outlier") || norm.includes("anomaly")) {
    return { type: "outliers", outlierType: "all" };
  }

  // 7. SITES & CROSS-SITE COMPARISON (Questions 11 & 12)
  if (
    norm.includes("compare harappa") ||
    norm.includes("harappa and mohenjo") ||
    norm.includes("mohenjo-daro and harappa") ||
    norm.includes("comparison between harappa") ||
    norm.includes("can we quantitatively compare") ||
    norm.includes("can i compare harappa")
  ) {
    return { type: "site_corpus_status", siteQuery: "Harappa" };
  }

  if (norm.includes("harappa")) {
    return { type: "site_corpus_status", siteQuery: "Harappa" };
  }

  if (norm.includes("mohenjo")) {
    return { type: "site_corpus_status", siteQuery: "Mohenjo-daro" };
  }

  if (
    norm.includes("sites represented") ||
    norm.includes("which sites") ||
    norm.includes("what sites") ||
    norm.includes("corpus sites") ||
    norm.includes("archaeological sites")
  ) {
    return { type: "site_corpus_status" };
  }

  // 8. DATASET LIMITATIONS
  if (
    norm.includes("limitation") ||
    norm.includes("caveat") ||
    norm.includes("bias") ||
    norm.includes("scope of this corpus")
  ) {
    return { type: "dataset_limitations" };
  }

  // 9. SIGN OCCURRENCES / INCLUSION LIST
  if (
    (norm.includes("which inscriptions contain") ||
      norm.includes("inscriptions containing") ||
      norm.includes("show me inscriptions with") ||
      norm.includes("show me those inscriptions") ||
      norm.includes("show those inscriptions") ||
      norm.includes("show the inscriptions") ||
      norm.includes("seals containing") ||
      (norm.includes("where does") && norm.includes("occur"))) &&
    targetSign
  ) {
    return { type: "sign_occurrences", signCode: targetSign };
  }

  // 10. SIGN POSITIONAL PROFILE
  if (
    (norm.includes("positional profile") ||
      norm.includes("relative position") ||
      norm.includes("initial position") ||
      norm.includes("where does it appear") ||
      norm.includes("positional distribution")) &&
    targetSign
  ) {
    return { type: "sign_positional_profile", signCode: targetSign };
  }

  // 11. SIGN FREQUENCY (Questions 1 & 2)
  if (
    norm.includes("most common sign") ||
    norm.includes("most frequent sign") ||
    norm.includes("highest frequency sign") ||
    norm.includes("top sign")
  ) {
    return { type: "sign_frequency" };
  }

  if (
    (norm.includes("how often") ||
      norm.includes("how many times") ||
      norm.includes("frequency of") ||
      norm.includes("count of") ||
      norm.includes("occurrences of")) &&
    targetSign
  ) {
    return { type: "sign_frequency", signCode: targetSign };
  }

  if (explicitSign) {
    return { type: "sign_frequency", signCode: explicitSign };
  }

  // 12. CORPUS METRICS (Questions 8, 9, 10)
  if (
    norm.includes("how many inscriptions") ||
    norm.includes("total inscriptions") ||
    norm.includes("how many sign tokens") ||
    norm.includes("total sign tokens") ||
    norm.includes("how many tokens") ||
    norm.includes("how many distinct") ||
    norm.includes("distinct sign types") ||
    norm.includes("how many signs") ||
    norm.includes("corpus size") ||
    norm.includes("dataset size") ||
    norm.includes("overview")
  ) {
    return { type: "corpus_overview" };
  }

  // 13. DIRECT INSCRIPTION SEARCH
  if (explicitInscription) {
    return { type: "inscription_search", query: explicitInscription };
  }

  // Default fallback to corpus overview
  return { type: "corpus_overview" };
}
