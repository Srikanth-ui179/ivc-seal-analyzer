import { Suspense } from "react";
import Link from "next/link";
import { ResearchAssistant } from "@/components/features/research-assistant/research-assistant";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Evidence-Grounded AI Research Assistant | IndusScript AI",
  description:
    "Ask evidence-grounded questions about Indus script signs, transitions, motifs, duplicates, and archaeological provenance.",
};

export default function ResearchAssistantPage() {
  return (
    <div className="page-shell py-14 sm:py-20">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/research"
          className="text-sm font-semibold text-clay hover:text-ink"
        >
          ← Research &amp; methodology
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/research/dashboard"
            className="font-semibold text-clay hover:underline"
          >
            📊 Visual Dashboard →
          </Link>
          <Link
            href="/analyze"
            className="font-semibold text-clay hover:underline"
          >
            📈 Numerical Analysis (M1–M11) →
          </Link>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="mt-6">
        <p className="eyebrow">Phase 2 / V2.6 · Evidence-Grounded AI Research Assistant</p>
        <h1 className="mt-3 display-title">Research Assistant</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
          Ask questions about the verified corpus and computational analyses. Every response is synthesized exclusively from structured database queries and empirical analysis results.
        </p>
      </div>

      {/* Research Integrity Safeguard Notice */}
      <div className="mt-8 border-l-2 border-clay bg-sandstone/25 p-5 text-sm leading-6 text-ink/80">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-bold text-paper">
            !
          </span>
          <div>
            <p className="font-semibold text-ink">
              Architectural Principle: DATA → COMPUTATION → EVIDENCE → AI EXPLANATION
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink/75">
              <strong>The AI is not an authority or decipherer.</strong> The assistant has no direct SQL generation ability; all facts derive from parameterized queries against the frozen dataset (<code>DATASET-CISI-MOHENJODARO-V1</code>: 179 Mohenjo-daro seals, 1,003 tokens, 182 distinct signs). The assistant will never claim phonetic readings, translations, grammatical roles, word boundaries, or decipherment.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 border-t border-ink/10 pt-2.5 text-xs text-ink/65">
              <span><strong>Corpus Scope:</strong> Mohenjo-daro M-1..M-199 (1 corpus site, 9 reference benchmarks)</span>
              <span><strong>Completeness:</strong> Source completeness unrecorded</span>
              <span><strong>Direction:</strong> Right-to-Left catalogue order (no reading direction asserted)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Research Assistant Workspace */}
      <div className="mt-10">
        <Suspense fallback={<div className="panel p-8 text-center text-sm text-ink/60">Loading Research Assistant...</div>}>
          <ResearchAssistant />
        </Suspense>
      </div>
    </div>
  );
}
