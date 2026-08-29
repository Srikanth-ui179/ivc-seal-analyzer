import type { EvidenceClass } from "@/data/types";

const tones: Record<EvidenceClass, string> = {
  "Archaeological record": "border-moss/25 bg-moss/10 text-moss",
  "Computational observation": "border-clay/25 bg-clay/10 text-clay",
  "AI hypothesis": "border-ink/20 bg-ink/5 text-ink/75",
};

export function EvidenceBadge({ kind }: { kind: EvidenceClass }) {
  return <span className={`inline-flex border px-2.5 py-1 text-[0.63rem] font-semibold uppercase tracking-[0.13em] ${tones[kind]}`}>{kind}</span>;
}
