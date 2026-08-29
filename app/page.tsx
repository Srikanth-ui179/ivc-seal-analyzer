import Link from "next/link";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { SignGlyph } from "@/components/ui/sign-glyph";
import { inscriptions, principles, signs } from "@/data/mock-research";

export default function HomePage() {
  return <>
    <section className="page-shell grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
      <div className="max-w-3xl">
        <p className="eyebrow">Computational archaeology · Prototype 01</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">A careful interface for studying an undeciphered script.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/72">IndusScript AI brings inscription records, sign catalogues, and transparent computational observations into one research workspace—without treating patterns as translations.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/analyze" className="bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-moss">Analyze an inscription</Link><Link href="/explorer" className="border border-ink/30 px-5 py-3 text-sm font-semibold hover:border-clay hover:text-clay">Explore the corpus</Link></div>
      </div>
      <div className="panel relative overflow-hidden p-6 sm:p-8">
        <p className="data-label">Reference fragment · H-202</p>
        <div className="my-9 flex items-center gap-3 border-y border-ink/10 py-8 sm:gap-6">{inscriptions[0].glyphs.map((glyph) => <SignGlyph key={glyph} glyph={glyph} size="lg" />)}</div>
        <div className="grid grid-cols-2 gap-5 text-sm"><div><p className="data-label">Object</p><p className="mt-1">Stamp seal · Steatite</p></div><div><p className="data-label">Site</p><p className="mt-1">Harappa · Punjab</p></div></div>
        <div className="absolute -right-12 -top-10 h-40 w-40 rounded-full border border-clay/25" />
      </div>
    </section>

    <section className="border-y border-ink/10 bg-sandstone/25 py-14"><div className="page-shell grid gap-8 md:grid-cols-3">{principles.map((principle, index) => <article key={principle.title} className="border-l border-clay/60 pl-5"><p className="data-label">0{index + 1}</p><h2 className="mt-3 font-display text-2xl">{principle.title}</h2><p className="mt-3 leading-7 text-ink/70">{principle.text}</p></article>)}</div></section>

    <section className="page-shell py-20"><SectionHeading eyebrow="Research workspace" title="Built around distinct kinds of evidence." description="A practical frontend foundation for a future research database and machine-learning pipeline." /><div className="mt-10 grid gap-4 md:grid-cols-3"><article className="panel p-6"><EvidenceBadge kind="Archaeological record" /><h3 className="mt-5 font-display text-2xl">Object records</h3><p className="mt-3 text-sm leading-6 text-ink/70">Preserve archaeological context and source-linked metadata alongside every inscription.</p></article><article className="panel p-6"><EvidenceBadge kind="Computational observation" /><h3 className="mt-5 font-display text-2xl">Pattern analysis</h3><p className="mt-3 text-sm leading-6 text-ink/70">Inspect frequency, sign position, sequence length, and co-occurrence without overclaiming.</p></article><article className="panel p-6"><EvidenceBadge kind="AI hypothesis" /><h3 className="mt-5 font-display text-2xl">Future hypothesis layer</h3><p className="mt-3 text-sm leading-6 text-ink/70">Reserve a separate, reviewable space for model suggestions and scholarly critique.</p></article></div></section>

    <section className="page-shell pb-4"><div className="rule py-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow">Catalogue preview</p><h2 className="mt-2 font-display text-3xl">Frequently observed sign forms</h2></div><Link href="/sign-catalogue" className="text-sm font-semibold text-clay hover:text-ink">View sign catalogue →</Link></div><div className="mt-7 grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-6">{signs.map((sign) => <div key={sign.id} className="bg-paper p-4"><SignGlyph glyph={sign.glyph} size="sm" /><p className="mt-4 data-label">{sign.id}</p><p className="mt-1 text-sm">{sign.frequency} occurrences</p></div>)}</div></div></section>
  </>;
}
