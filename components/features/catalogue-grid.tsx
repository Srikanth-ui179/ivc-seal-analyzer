import Link from "next/link";
import { SignGlyph } from "@/components/ui/sign-glyph";
import { signs } from "@/data/mock-research";
import { percentage } from "@/lib/utils";

export function CatalogueGrid() {
  return <div className="mt-10 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">{signs.map((sign) => <article key={sign.id} className="bg-paper p-6"><div className="flex items-start justify-between gap-4"><SignGlyph glyph={sign.glyph} /><div className="text-right"><p className="data-label">Sign ID</p><p className="mt-1 font-semibold">{sign.id}</p></div></div><p className="mt-5 text-sm leading-6 text-ink/68">{sign.description}</p><div className="mt-5 grid grid-cols-3 border-y border-ink/10 py-4 text-center text-xs"><div><p className="data-label">Initial</p><p className="mt-1">{percentage(sign.initial)}</p></div><div className="border-x border-ink/10"><p className="data-label">Medial</p><p className="mt-1">{percentage(sign.medial)}</p></div><div><p className="data-label">Final</p><p className="mt-1">{percentage(sign.final)}</p></div></div><div className="mt-4 flex items-center justify-between text-sm"><span><span className="text-ink/55">Frequency </span>{sign.frequency}</span><span className="text-ink/55">Related: {sign.related.join(", ")}</span></div></article>)}</div>;
}
