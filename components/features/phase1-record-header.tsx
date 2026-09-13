import { EvidenceBadge } from "@/components/ui/evidence-badge";

export function Phase1RecordHeader({ eyebrow, title, status }: { eyebrow: string; title: string; status: string }) {
  return <div className="border-b border-ink/10 pb-7"><p className="eyebrow">{eyebrow}</p><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl tracking-[-0.035em] sm:text-5xl">{title}</h1><EvidenceBadge kind="Archaeological record" /></div><p className="mt-3 text-sm text-ink/60">Status: {status}</p></div>;
}
