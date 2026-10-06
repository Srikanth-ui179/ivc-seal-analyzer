import type { EvidenceObject } from "@/lib/ai/evidence-format";
import { EvidenceCard } from "./evidence-card";

type Props = {
  content: string;
  evidence?: EvidenceObject;
};

export function Answer({ content, evidence }: Props) {
  return (
    <div className="space-y-4">
      {/* Response Narrative Bubble */}
      <div className="rounded border border-ink/10 bg-sandstone/15 p-5 text-ink leading-relaxed">
        <div className="flex items-center justify-between border-b border-ink/10 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-paper">
              AI
            </span>
            <span className="font-display text-xs font-bold text-ink uppercase tracking-wider">
              Research Assistant Explanation
            </span>
          </div>
          <span className="rounded bg-sandstone/30 px-2 py-0.5 text-[10px] font-mono text-ink/60">
            Grounded in Database
          </span>
        </div>

        {/* Formatted Text */}
        <div className="text-sm leading-relaxed text-ink/85 whitespace-pre-line font-sans">
          {content}
        </div>

        {/* Observation vs Interpretation Safeguard Footnote */}
        <div className="mt-4 border-t border-ink/10 pt-2.5 text-[11px] text-ink/60 flex items-center justify-between">
          <span>
            <strong>Distinction:</strong> Computational observation ≠ linguistic or historical interpretation.
          </span>
          <span className="font-mono text-[10px] text-ink/40">Zero decipherment claims</span>
        </div>
      </div>

      {/* Grounded Evidence Box */}
      {evidence && <EvidenceCard evidence={evidence} />}
    </div>
  );
}
