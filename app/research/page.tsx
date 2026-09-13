import Link from "next/link";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { principles } from "@/data/mock-research";

export default function ResearchPage() {
  return (
    <div className="page-shell py-14 sm:py-20">
      <p className="eyebrow">Research & methodology</p>
      <h1 className="mt-3 display-title">Method before model.</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/70">
        IndusScript AI is conceived as infrastructure for careful comparison, critique, and reproducible computational study—not as an automated decipherment engine.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-7">
          {principles.map((item) => (
            <article key={item.title} className="border-l-2 border-clay pl-5">
              <h2 className="font-display text-2xl">{item.title}</h2>
              <p className="mt-2 leading-7 text-ink/70">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="panel p-6">
          <p className="data-label">Output taxonomy</p>
          <div className="mt-5 space-y-5">
            <div>
              <EvidenceBadge kind="Archaeological record" />
              <p className="mt-2 text-sm leading-6 text-ink/70">
                Descriptive information traceable to objects, contexts, and published research sources.
              </p>
            </div>
            <div>
              <EvidenceBadge kind="Computational observation" />
              <p className="mt-2 text-sm leading-6 text-ink/70">
                Measurements from a defined dataset and method, including uncertainty and parameters.
              </p>
            </div>
            <div>
              <EvidenceBadge kind="AI hypothesis" />
              <p className="mt-2 text-sm leading-6 text-ink/70">
                A clearly separated future layer for model proposals; never presented as established fact or translation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Corpus Provenance Section */}
      <section className="mt-16 border-t border-ink/10 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Corpus provenance</p>
            <h2 className="mt-2 font-display text-3xl">Active Ingested Dataset</h2>
          </div>
          <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
            Browse research records →
          </Link>
        </div>

        <div className="panel mt-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-semibold">Corpus of Indus Seals and Inscriptions (CISI)</h3>
              <p className="mt-2 text-sm text-ink/65">
                Open Community Digitization by Michael Carlson (2024)
              </p>
              <dl className="mt-4 space-y-2 text-xs">
                <div>
                  <dt className="inline font-semibold text-ink">Scholarly Authority:</dt>
                  <dd className="inline text-ink/70"> Asko Parpola, B. M. Pande, Petteri Koskikallio (eds.), 1987</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Release Identifier:</dt>
                  <dd className="inline font-mono text-ink/70"> REL-CISI-MAYIG-V1 (v2024.1)</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Licensing:</dt>
                  <dd className="inline text-ink/70"> MIT License (open use, modification, redistribution with attribution)</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Sign System:</dt>
                  <dd className="inline text-ink/70"> Parpola CISI notation (P-NNN sign codes)</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-ink/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h4 className="font-semibold text-sm text-ink">Dataset Scope & Caveats</h4>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-ink/70">
                <li className="flex items-start gap-2">
                  <span className="text-moss">✓</span>
                  <span><strong>179 artefacts:</strong> Covers Mohenjo-daro seals M-1 through M-199.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss">✓</span>
                  <span><strong>1,003 grapheme tokens:</strong> Complete character-level sign occurrences with feature vectors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clay">⚠</span>
                  <span><strong>WIP Partial Corpus:</strong> The upstream digitization is a work in progress covering a subset of Mohenjo-daro artefacts. It is not the complete CISI corpus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clay">⚠</span>
                  <span><strong>Unrecorded fields:</strong> Material, exact excavation layer, and dimensions are NULL in the source and remain unpopulated rather than fabricated.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="font-display text-3xl">Planned capabilities</h2>
            <p className="mt-2 text-sm text-ink/65">
              The first Phase 2 reproducibility building block is now available as a read-only dataset snapshot catalogue.
            </p>
          </div>
          <Link href="/research/datasets" className="text-sm font-semibold text-clay hover:text-ink">
            View dataset versions →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Image and sign annotation",
            "Versioned corpus database",
            "Sequence and network statistics",
            "Reviewable model experiments",
          ].map((item) => (
            <div key={item} className="panel p-4 text-sm">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
