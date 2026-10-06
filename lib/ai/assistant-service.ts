import "server-only";
import type { AssistantContext, AssistantResponse, RoutedIntent } from "./research-types";
import { type EvidenceObject } from "./evidence-format";
import {
  getCorpusOverview,
  getSignFrequency,
  getSignOccurrences,
  getSignPositionalProfile,
  getTransitions,
  getMotifs,
  getDuplicateSequences,
  getNearDuplicateSequences,
  getOutliers,
  getSiteCorpusStatus,
  getDatasetLimitations,
  checkReadingDirectionAndCompleteness,
  searchInscriptions,
  getUnsupportedQueryResponse,
} from "./research-tools";
import { routeQuestion } from "./research-router";

const RESEARCH_ASSISTANT_SYSTEM_PROMPT = `You are the research assistant for the IVC Seal Analyzer / IndusScript AI.

You answer questions ONLY from the structured evidence supplied by the research database and approved computational tools.

Strict Research Integrity Rules:
1. Do NOT invent archaeological or linguistic data.
2. Do NOT infer phonetic values, meanings, translations, grammatical roles, or decipherment.
3. Do NOT treat structural frequency as linguistic or cultural meaning.
4. Do NOT describe the current corpus as the complete Indus corpus. It is 179 seals from Mohenjo-daro (CISI Volume 1, M-1..M-199).
5. Distinguish clearly between:
   - directly observed corpus data,
   - computationally derived statistics,
   - methodological limitations.
6. When giving a numerical result, preserve the supplied denominator and definition (e.g. 99 occurrences / 1,003 tokens, 179 inscriptions).
7. When discussing positions, remember that the current corpus preserves source-recorded Right-to-Left sequence order and does NOT establish an independent reading direction.
8. When discussing terminal positions, remember that source completeness is currently not recorded, so the final transcribed token must NOT be described as a physically verified terminal sign.
9. When asked about Harappa, explain that Harappa is a reference-only archaeological site with 0 corpus inscriptions in this dataset, and cross-site comparison is held.
10. Never claim decipherment. Maintain an objective, concise, and academic tone.`;

/**
 * Deterministic fallback prose synthesizer that formats academic prose directly from evidence
 */
function synthesizeEvidenceProse(intent: RoutedIntent, evidence: EvidenceObject): string {
  switch (evidence.type) {
    case "corpus_overview":
      return `The active frozen dataset (${evidence.dataset.stableId}) contains 179 inscriptions, 1,003 sign tokens, and 182 distinct sign types. All 179 seals originate from Mohenjo-daro (CISI Volume 1, M-1 through M-199). In addition, 9 published archaeological sites are registered as reference-only geographic benchmarks with zero corpus inscriptions. 100% of the current 1,003 sign occurrences are catalogued as identified.`;

    case "sign_frequency": {
      if (evidence.stats && evidence.stats.length >= 4) {
        const occ = evidence.stats[0].value;
        const pct = evidence.stats[0].percentage;
        const ins = evidence.stats[1].value;
        const init = evidence.stats[2].value;
        return `${evidence.claim} Across the 179 inscriptions in the frozen dataset, it occurs in initial position (Position 1 in Right-to-Left transcription order) ${init} times. Note that structural frequency reflects formal recurrence in the sample, not linguistic or grammatical significance.`;
      }
      return `${evidence.claim} ${evidence.summary}`;
    }

    case "sign_occurrences":
      return `${evidence.claim} Each seal is catalogued from Mohenjo-daro with its Right-to-Left transcribed sign sequence. The first ${evidence.records?.length ?? 0} matching inscriptions are listed below in the evidence panel for inspection.`;

    case "sign_positional_profile":
      return `${evidence.claim} ${evidence.summary} Positional distributions represent catalogued token positions from Right-to-Left and do not establish grammatical prefix or suffix status.`;

    case "transitions":
      return `${evidence.claim} ${evidence.summary} Observed transitions represent transcribed sequence adjacency only and do not establish syntactic or grammatical dependencies.`;

    case "motifs":
      return `${evidence.claim} ${evidence.summary} Contiguous recurring motifs represent catalogued sequence co-occurrences and must not be interpreted as words or fixed idiomatic formulas.`;

    case "duplicate_sequences":
      return `${evidence.claim} ${evidence.summary} While identical sign sequences occur across distinct physical artefacts, duplication does not establish identical ownership or standardized administrative formulas without external contextual evidence.`;

    case "near_duplicate_sequences":
      return `${evidence.claim} ${evidence.summary} Near-duplicate sequence pairs offer comparative structural evidence for sign substitution patterns within the corpus.`;

    case "outliers":
      return `${evidence.claim} ${evidence.summary} Length and repetition outliers are defined by transparent mathematical criteria relative to the corpus mean length of 5.60 signs.`;

    case "site_corpus_status":
      return `${evidence.claim} ${evidence.summary}`;

    case "reading_direction_completeness":
      return `${evidence.claim} ${evidence.summary}`;

    case "dataset_limitations":
      return `${evidence.claim}\n\n${evidence.summary}`;

    case "inscription_search":
      return `${evidence.claim} ${evidence.summary}`;

    case "unsupported_inquiry":
      return `${evidence.claim} ${evidence.summary}`;

    default:
      return `${evidence.claim} ${evidence.summary}`;
  }
}

/**
 * Attempts LLM answer synthesis if GEMINI_API_KEY is configured
 */
async function generateLlmProse(
  message: string,
  evidence: EvidenceObject,
  context?: AssistantContext
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `User question: "${message}"\n\nStructured Evidence from Database:\n${JSON.stringify(evidence, null, 2)}\n\nWrite a concise, professional 2-4 sentence academic answer grounded strictly in the provided evidence. Follow all system instructions.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: RESEARCH_ASSISTANT_SYSTEM_PROMPT }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API call returned status", res.status);
      return null;
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && typeof candidateText === "string" && candidateText.trim().length > 0) {
      return candidateText.trim();
    }
    return null;
  } catch (err) {
    console.warn("Failed to generate prose via Gemini API, falling back to deterministic synthesis:", err);
    return null;
  }
}

/**
 * Main service executing the research assistant workflow:
 * 1. Question interpretation / routing
 * 2. Controlled tool execution
 * 3. Context tracking
 * 4. Evidence-grounded prose synthesis
 */
export async function askResearchAssistant(
  message: string,
  context?: AssistantContext
): Promise<AssistantResponse> {
  const intent = routeQuestion(message, context);

  let evidence: EvidenceObject;
  const newContext: AssistantContext = { ...context };

  switch (intent.type) {
    case "corpus_overview":
      evidence = await getCorpusOverview();
      newContext.lastTool = "getCorpusOverview";
      newContext.lastTopic = "overview";
      break;

    case "sign_frequency":
      evidence = await getSignFrequency(intent.signCode);
      newContext.activeSign = intent.signCode || "P324";
      newContext.lastTool = "getSignFrequency";
      newContext.lastTopic = "frequency";
      break;

    case "sign_occurrences":
      evidence = await getSignOccurrences(intent.signCode, intent.limit ?? 10);
      newContext.activeSign = intent.signCode;
      newContext.lastTool = "getSignOccurrences";
      newContext.lastTopic = "occurrences";
      break;

    case "sign_positional_profile":
      evidence = await getSignPositionalProfile(intent.signCode);
      newContext.activeSign = intent.signCode;
      newContext.lastTool = "getSignPositionalProfile";
      newContext.lastTopic = "position";
      break;

    case "transitions":
      evidence = await getTransitions(intent.signCode, intent.targetSign, intent.direction);
      newContext.activeSign = intent.signCode;
      newContext.lastTool = "getTransitions";
      newContext.lastTopic = "transitions";
      break;

    case "motifs":
      evidence = await getMotifs(intent.motifQuery, intent.length);
      newContext.lastTool = "getMotifs";
      newContext.lastTopic = "motifs";
      break;

    case "duplicate_sequences":
      evidence = await getDuplicateSequences();
      newContext.lastTool = "getDuplicateSequences";
      newContext.lastTopic = "duplicates";
      break;

    case "near_duplicate_sequences":
      evidence = await getNearDuplicateSequences();
      newContext.lastTool = "getNearDuplicateSequences";
      newContext.lastTopic = "near_duplicates";
      break;

    case "outliers":
      evidence = await getOutliers(intent.outlierType);
      newContext.lastTool = "getOutliers";
      newContext.lastTopic = "outliers";
      break;

    case "site_corpus_status":
      evidence = await getSiteCorpusStatus(intent.siteQuery);
      if (intent.siteQuery) newContext.activeSite = intent.siteQuery;
      newContext.lastTool = "getSiteCorpusStatus";
      newContext.lastTopic = "sites";
      break;

    case "dataset_limitations":
      evidence = await getDatasetLimitations();
      newContext.lastTool = "getDatasetLimitations";
      newContext.lastTopic = "limitations";
      break;

    case "reading_direction_completeness":
      evidence = await checkReadingDirectionAndCompleteness();
      newContext.lastTool = "checkReadingDirectionAndCompleteness";
      newContext.lastTopic = "completeness";
      break;

    case "inscription_search":
      evidence = await searchInscriptions(intent.query);
      newContext.lastTool = "searchInscriptions";
      newContext.lastTopic = "search";
      break;

    case "unsupported_inquiry":
      evidence = getUnsupportedQueryResponse(intent.topic, newContext.activeSign);
      newContext.lastTool = "getUnsupportedQueryResponse";
      newContext.lastTopic = "unsupported";
      break;

    default:
      evidence = await getCorpusOverview();
      break;
  }

  // Attempt LLM generation or fall back to deterministic synthesis
  const llmAnswer = await generateLlmProse(message, evidence, context);
  const answer = llmAnswer || synthesizeEvidenceProse(intent, evidence);

  return {
    answer,
    evidence,
    context: newContext,
  };
}
