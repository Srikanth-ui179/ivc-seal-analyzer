"use client";

import { useMemo, useState } from "react";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { SignGlyph } from "@/components/ui/sign-glyph";
import { analysisResults, inscriptions } from "@/data/mock-research";
import { percentage } from "@/lib/utils";

export function AnalyzeWorkspace() {
  const [activeId, setActiveId] = useState(inscriptions[0].id);
  const [ran, setRan] = useState(false);
  const inscription = inscriptions.find((item) => item.id === activeId) ?? inscriptions[0];
  const result = useMemo(() => analysisResults.find((item) => item.inscriptionId === activeId) ?? analysisResults[0], [activeId]);
  const choose = (id: string) => { setActiveId(id); setRan(false); };

  return <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
    <aside className="space-y-5"><div className="panel p-5"><p className="data-label">Input image</p><label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-ink/30 bg-sandstone/15 p-5 text-center"><span className="font-display text-3xl">＋</span><span className="mt-2 text-sm font-medium">Upload inscription image</span><span className="mt-1 text-xs text-ink/55">Image handling is a UI placeholder in this prototype.</span><input type="file" accept="image/*" className="sr-only" /></label></div>
      <div className="panel p-5"><p className="data-label">Example records</p><div className="mt-3 space-y-2">{inscriptions.slice(0, 2).map((item) => <button type="button" key={item.id} onClick={() => choose(item.id)} className={`flex w-full items-center justify-between border p-3 text-left text-sm ${activeId === item.id ? "border-clay bg-clay/5" : "border-ink/10 hover:border-ink/30"}`}><span><span className="font-semibold">{item.id}</span><span className="ml-2 text-ink/60">{item.site}</span></span><span>{item.glyphs.join(" ")}</span></button>)}</div></div>
      <button type="button" onClick={() => setRan(true)} className="w-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-moss">Run mock analysis</button>
      <p className="text-xs leading-5 text-ink/55">This action displays predefined prototype data. No image recognition or translation is performed.</p></aside>
    <section className="panel p-6 sm:p-8"><div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="data-label">Selected record</p><h2 className="mt-2 font-display text-3xl">{inscription.id}</h2><p className="mt-2 text-sm text-ink/65">{inscription.objectType} · {inscription.site} · {inscription.period}</p></div><EvidenceBadge kind="Computational observation" /></div>
      {!ran ? <div className="flex min-h-80 flex-col items-center justify-center text-center"><div className="flex gap-3">{inscription.glyphs.map((glyph) => <SignGlyph key={glyph} glyph={glyph} />)}</div><p className="mt-6 font-display text-2xl">Ready for a mock observation pass</p><p className="mt-2 max-w-md text-sm leading-6 text-ink/60">Select “Run mock analysis” to reveal a fixed demonstration of the future analysis interface.</p></div> : <div className="mt-7 space-y-7"><div><p className="data-label">Detected signs</p><div className="mt-3 flex flex-wrap gap-3">{result.detected.map((item) => <div key={item.signId} className="flex items-center gap-3 border border-ink/10 p-3"><SignGlyph glyph={item.glyph} size="sm" /><div><p className="text-sm font-semibold">{item.signId}</p><p className="text-xs text-ink/60">match {percentage(item.confidence)}</p></div></div>)}</div></div><div className="rule pt-6"><p className="data-label">Observed sequence</p><p className="mt-3 font-display text-3xl tracking-wide">{result.sequence.join("  ·  ")}</p></div><div className="rule pt-6"><p className="data-label">Confidence</p><div className="mt-3 h-2 overflow-hidden bg-ink/10"><div className="h-full w-[89%] bg-clay" /></div><p className="mt-2 text-sm text-ink/65">Mean mock detection confidence: 89%</p></div><div className="rule pt-6"><p className="data-label">Statistical observations</p><ul className="mt-3 space-y-3">{result.observations.map((observation) => <li key={observation} className="border-l-2 border-clay pl-4 text-sm leading-6 text-ink/75">{observation}</li>)}</ul></div></div>}</section>
  </div>;
}
