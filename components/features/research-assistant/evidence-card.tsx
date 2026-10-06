import Link from "next/link";
import type { EvidenceObject } from "@/lib/ai/evidence-format";
import { EvidenceStat } from "./evidence-stat";
import { EvidenceInscription } from "./evidence-inscription";
import { LimitationNotice } from "./limitation-notice";

type Props = {
  evidence: EvidenceObject;
};

export function EvidenceCard({ evidence }: Props) {
  return (
    <section
      className="panel mt-4 p-5 sm:p-6"
      aria-label="Structured Database Evidence"
    >
      {/* Evidence Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="data-label text-[10px]">Database Evidence</span>
          <span className="font-mono text-xs font-semibold text-clay">
            {evidence.dataset.stableId}
          </span>
          <span className="rounded border border-moss/30 bg-moss/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-moss">
            {evidence.dataset.state}
          </span>
        </div>
        <span className="font-mono text-[11px] text-ink/50 uppercase tracking-wider">
          Type: {evidence.type.replace(/_/g, " ")}
        </span>
      </div>

      {/* Claim Banner */}
      <div className="mt-4 rounded border-l-2 border-moss bg-moss/5 p-3.5 text-xs">
        <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-moss">
          Ground Truth Computational Observation
        </span>
        <p className="mt-1 font-semibold text-ink leading-relaxed">
          {evidence.claim}
        </p>
      </div>

      {/* Statistics Grid */}
      {evidence.stats && evidence.stats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {evidence.stats.map((stat, idx) => (
            <EvidenceStat key={idx} stat={stat} />
          ))}
        </div>
      )}

      {/* Matching Evidence Records / Inscriptions */}
      {evidence.records && evidence.records.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wider">
              Underlying Inscription Evidence ({evidence.records.length} shown)
            </h4>
            <span className="text-[10px] text-ink/50">Traceable to database records</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {evidence.records.map((record) => (
              <EvidenceInscription key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}

      {/* Primary Source Attribution */}
      {evidence.source && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded bg-sandstone/15 p-3 text-[11px] text-ink/70">
          <div>
            <span className="font-semibold text-ink">Source: </span>
            <span>{evidence.source.title}</span>
            <span className="ml-1 font-mono text-[10px] text-ink/50">({evidence.source.stableId})</span>
          </div>
          {evidence.source.licenceName && (
            <span className="rounded border border-ink/10 bg-paper px-2 py-0.5 font-mono text-[10px] text-ink/75">
              {evidence.source.licenceName}
            </span>
          )}
        </div>
      )}

      {/* Limitations Notice */}
      {evidence.limitations && evidence.limitations.length > 0 && (
        <div className="mt-4">
          <LimitationNotice limitations={evidence.limitations} />
        </div>
      )}

      {/* Navigation Links */}
      {evidence.links && evidence.links.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-3 text-xs">
          <span className="text-ink/50">Related research views:</span>
          {evidence.links.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="font-semibold text-clay hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
