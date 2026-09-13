import Link from "next/link";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { principles } from "@/data/mock-research";
import { getCorpusStatistics, listSigns } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats = null;
  let topSigns: Array<{ id: string; code: string; label: string; frequency: number }> = [];

  try {
    stats = await getCorpusStatistics();
    const signsRes = await listSigns({ limit: 6, sortByFrequency: true });
    topSigns = signsRes.items.map((s) => ({
      id: s.id,
      code: s.catalogueCode,
      label: s.visualLabel,
      frequency: s.frequency ?? 0,
    }));
  } catch {
    // Graceful fallback if database is not reachable
  }

  return (
    <>
      <section className="page-shell grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">Computational archaeology · Research Platform</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            A careful interface for studying an undeciphered script.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/72">
            IndusScript AI brings verified machine-readable inscription records, sign catalogues, and transparent computational observations into one research workspace—without treating patterns as translations.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/explorer" className="bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-moss">
              Explore the corpus ({stats?.researchInscriptions ?? 179} records)
            </Link>
            <Link href="/sign-catalogue" className="border border-ink/30 px-5 py-3 text-sm font-semibold hover:border-clay hover:text-clay">
              Sign catalogue ({stats?.totalDistinctSigns ?? 182} signs)
            </Link>
          </div>
        </div>

        {/* Live Corpus Overview Panel */}
        <div className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="data-label">Active Research Dataset</p>
            <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
              CISI Parpola et al.
            </span>
          </div>

          <div className="my-6 space-y-4 border-y border-ink/10 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                <span className="data-label block text-xs">Research Objects</span>
                <span className="mt-1 block font-display text-2xl font-bold text-ink">
                  {stats ? stats.totalObjects : "179"}
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                <span className="data-label block text-xs">Research Inscriptions</span>
                <span className="mt-1 block font-display text-2xl font-bold text-ink">
                  {stats ? stats.researchInscriptions : "179"}
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                <span className="data-label block text-xs">Distinct Sign Types</span>
                <span className="mt-1 block font-display text-2xl font-bold text-ink">
                  {stats ? stats.totalDistinctSigns : "182"}
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                <span className="data-label block text-xs">Sign Occurrences</span>
                <span className="mt-1 block font-display text-2xl font-bold text-ink">
                  {stats ? stats.totalSignOccurrences.toLocaleString() : "1,003"}
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                <span className="data-label block text-xs">Research Sites</span>
                <span className="mt-1 block font-display text-lg font-bold text-ink">
                  {stats ? stats.totalSites : "1"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-ink/60">
            <p>
              <strong>Corpus:</strong> CISI Open Digitization (M-1..M-199) · MIT License
            </p>
            <p className="mt-1">
              Digitized by Michael Carlson from Corpus of Indus Seals and Inscriptions (Parpola et al.).
            </p>
            <p className="mt-1">{stats ? stats.totalSources : "1"} source record{stats && stats.totalSources === 1 ? "" : "s"} and {stats ? stats.releases.length : "1"} authorized corpus release are recorded for provenance.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sandstone/25 py-14">
        <div className="page-shell grid gap-8 md:grid-cols-3">
          {principles.map((principle, index) => (
            <article key={principle.title} className="border-l border-clay/60 pl-5">
              <p className="data-label">0{index + 1}</p>
              <h2 className="mt-3 font-display text-2xl">{principle.title}</h2>
              <p className="mt-3 leading-7 text-ink/70">{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell py-20">
        <SectionHeading
          eyebrow="Research workspace"
          title="Built around distinct kinds of evidence."
          description="A principled database-backed foundation for machine-readable Indus inscriptions, reproducible measurements, and verifiable AI research."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="panel p-6">
            <EvidenceBadge kind="Archaeological record" />
            <h3 className="mt-5 font-display text-2xl">Archaeological context</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Preserve provenance, site coordinates, object types, and publication catalogue identifiers alongside every inscription record.
            </p>
          </article>
          <article className="panel p-6">
            <EvidenceBadge kind="Computational observation" />
            <h3 className="mt-5 font-display text-2xl">Sign sequences & statistics</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Inspect sign frequencies, co-occurrences, n-gram positional entropy, and sequence lengths with exact database provenance.
            </p>
          </article>
          <article className="panel p-6">
            <EvidenceBadge kind="AI hypothesis" />
            <h3 className="mt-5 font-display text-2xl">Reproducible evaluation</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Reserve an explicit, versioned space for computational hypotheses with uncertainty metrics, never mistaking patterns for decipherment.
            </p>
          </article>
        </div>
      </section>

      {/* Catalogue preview from real database */}
      <section className="page-shell pb-16">
        <div className="rule py-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Catalogue preview</p>
              <h2 className="mt-2 font-display text-3xl">Frequently observed sign forms</h2>
              <p className="mt-1 text-sm text-ink/65">
                Top sign types ranked by occurrence frequency in the active CISI research corpus.
              </p>
            </div>
            <Link href="/sign-catalogue" className="text-sm font-semibold text-clay hover:text-ink">
              View all {stats?.totalDistinctSigns ?? 182} signs →
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-6">
            {topSigns.length > 0
              ? topSigns.map((sign) => (
                  <Link
                    key={sign.id}
                    href={`/sign-catalogue/${sign.id}`}
                    className="bg-paper p-4 transition hover:bg-sandstone/20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded border border-ink/15 bg-sandstone/30 font-mono text-sm font-bold text-ink">
                      {sign.code}
                    </div>
                    <p className="mt-3 font-mono text-xs font-semibold text-ink">{sign.label}</p>
                    <p className="mt-1 text-xs text-ink/60">{sign.frequency} occurrences</p>
                  </Link>
                ))
              : [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-paper p-4">
                    <div className="h-10 w-10 bg-ink/5" />
                    <p className="mt-4 data-label">P-Sign</p>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
