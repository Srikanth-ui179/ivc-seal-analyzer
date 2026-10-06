import Link from "next/link";
import type { EvidenceRecord } from "@/lib/ai/evidence-format";

type Props = {
  record: EvidenceRecord;
};

export function EvidenceInscription({ record }: Props) {
  return (
    <article className="rounded border border-ink/10 bg-paper p-3 text-xs transition hover:border-ink/25">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-2">
        <Link
          href={record.href}
          className="font-display text-sm font-bold text-ink hover:text-clay"
        >
          {record.stableId}
          {record.cisiId && <span className="ml-1.5 font-mono text-[10px] text-ink/50">({record.cisiId})</span>}
        </Link>
        <span className="font-mono text-[10px] text-ink/50">
          {record.siteName ?? "Mohenjo-daro"}
        </span>
      </div>

      {record.sequence && record.sequence.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {record.sequence.map((sign, idx) => {
            const isHighlighted = record.highlightSign === sign;
            return (
              <span
                key={`${record.id}-${sign}-${idx}`}
                className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                  isHighlighted
                    ? "border border-clay bg-clay/15 text-clay font-bold ring-1 ring-clay/30"
                    : "border border-ink/10 bg-sandstone/20 text-ink/80"
                }`}
              >
                {sign}
              </span>
            );
          })}
        </div>
      )}

      {record.description && (
        <p className="mt-2 text-[11px] text-ink/65 italic">{record.description}</p>
      )}

      <div className="mt-2.5 flex items-center justify-between pt-1 text-[10px] text-ink/50">
        <span>Object: {record.objectStableId ?? record.cisiId ?? "M-Series"}</span>
        <Link href={record.href} className="font-semibold text-clay hover:underline">
          View seal in Explorer →
        </Link>
      </div>
    </article>
  );
}
