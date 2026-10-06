import type { EvidenceStatItem } from "@/lib/ai/evidence-format";

type Props = {
  stat: EvidenceStatItem;
};

export function EvidenceStat({ stat }: Props) {
  return (
    <div className="rounded border border-ink/10 bg-sandstone/25 p-3 text-xs">
      <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/60">
        {stat.label}
      </span>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-base font-bold text-ink">
          {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
        </span>
        {stat.denominator !== undefined && (
          <span className="font-mono text-[11px] text-ink/50">
            / {typeof stat.denominator === "number" ? stat.denominator.toLocaleString() : stat.denominator}
          </span>
        )}
        {stat.percentage !== undefined && (
          <span className="rounded bg-moss/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-moss">
            {stat.percentage}%
          </span>
        )}
      </div>
      {stat.note && (
        <span className="mt-1 block text-[10px] text-ink/55">{stat.note}</span>
      )}
    </div>
  );
}
