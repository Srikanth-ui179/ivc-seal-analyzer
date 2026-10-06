import Link from "next/link";
import type { MultiSiteReport } from "@/lib/db/multisite-repository";

type Props = {
  report: MultiSiteReport;
};

export function SitesExplorer({ report }: Props) {
  const { corpusSites, referenceSites, sources, comparativeAnalysisStatus } = report;

  return (
    <div className="space-y-8">
      {/* Safeguard & Scope Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-5 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          Archaeological Principle: Corpus Site vs. Reference-Only Benchmark Site
        </p>
        <p className="mt-1.5 text-ink/75 leading-relaxed">
          The research platform maintains a strict boundary between <strong>Corpus Sites</strong> (archaeological sites with verified, digitized inscription records in the active dataset snapshot) and <strong>Reference-Only Sites</strong> (published geographic benchmarks from archaeological gazetteers with registered coordinates, but <em>zero</em> ingested corpus sequences in the current release).
        </p>
        <p className="mt-1 text-ink/65">
          Having coordinates on the map or in the database does <strong>not</strong> imply that seals from that site are present in the computational analysis.
        </p>
      </div>

      {/* Dataset Composition Overview */}
      <section className="panel p-6" aria-labelledby="sites-overview-heading">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <span className="data-label">Active Dataset Composition</span>
            <h2 id="sites-overview-heading" className="mt-1 font-display text-2xl font-bold text-ink">
              {report.datasetName}
            </h2>
            <p className="mt-1 font-mono text-xs text-ink/60">
              Identifier: {report.datasetStableId} · State: Frozen
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-right font-mono">
            <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
              <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">Corpus Sites</span>
              <span className="text-base font-bold text-ink">{corpusSites.length}</span>
            </div>
            <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
              <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">Reference Benchmarks</span>
              <span className="text-base font-bold text-ink">{referenceSites.length}</span>
            </div>
            <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
              <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">Primary Sources</span>
              <span className="text-base font-bold text-ink">{sources.length}</span>
            </div>
          </div>
        </div>

        {/* Status Callout */}
        <div className="mt-5 rounded border border-ink/10 bg-sandstone/15 p-4 text-xs leading-relaxed text-ink/80">
          <span className="font-semibold text-ink">Cross-Site Comparative Status: </span>
          <span>{comparativeAnalysisStatus.reason}</span>
        </div>
      </section>

      {/* Active Corpus Sites Table */}
      <section className="panel p-6" aria-labelledby="corpus-sites-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <div>
            <h3 id="corpus-sites-heading" className="font-display text-lg font-bold text-ink">
              1. Active Corpus Sites ({corpusSites.length})
            </h3>
            <p className="text-xs text-ink/65">
              Sites with verified machine-readable inscription sequences in the frozen dataset snapshot.
            </p>
          </div>
          <span className="font-mono text-xs text-moss font-semibold">
            100% of active corpus tokens
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-paper">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Active Corpus Sites</caption>
            <thead className="border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
              <tr>
                <th className="px-4 py-2.5">Site Name</th>
                <th className="px-4 py-2.5">Modern Region &amp; Country</th>
                <th className="px-4 py-2.5 text-right font-mono">Inscriptions</th>
                <th className="px-4 py-2.5 text-right font-mono">Sign Tokens</th>
                <th className="px-4 py-2.5 text-right font-mono">Distinct Signs</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {corpusSites.map((site) => (
                <tr key={site.siteId} className="hover:bg-sandstone/10">
                  <td className="px-4 py-3 font-bold text-ink">
                    <Link href={`/sites/${site.siteStableId}`} className="text-clay hover:underline">
                      {site.canonicalName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/75">
                    {site.modernRegion ? `${site.modernRegion}, ` : ""}{site.country}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                    {site.inscriptionCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                    {site.occurrenceCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                    {site.distinctSignsCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded bg-moss/10 px-2 py-0.5 font-sans text-[10px] font-bold text-moss">
                      Active Corpus
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/explorer?siteId=${site.siteId}`}
                      className="text-xs font-semibold text-clay hover:underline"
                    >
                      Browse seals →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Registered Reference-Only Archaeological Sites */}
      <section className="panel p-6" aria-labelledby="reference-sites-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <div>
            <h3 id="reference-sites-heading" className="font-display text-lg font-bold text-ink">
              2. Registered Reference-Only Sites ({referenceSites.length})
            </h3>
            <p className="text-xs text-ink/65">
              Archaeological settlements registered with published survey datums (Possehl 2002, ASI, UNESCO). No inscriptions currently ingested.
            </p>
          </div>
          <span className="font-mono text-xs text-ink/50">
            0 corpus tokens
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-paper">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Reference-Only Archaeological Sites</caption>
            <thead className="border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
              <tr>
                <th className="px-4 py-2.5">Site Name</th>
                <th className="px-4 py-2.5">Modern Region &amp; Country</th>
                <th className="px-4 py-2.5">Coordinates (Benchmark)</th>
                <th className="px-4 py-2.5 text-center">Corpus Inscriptions</th>
                <th className="px-4 py-2.5 text-center">Gazetteer Status</th>
                <th className="px-4 py-2.5 text-right">Site Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {referenceSites.map((site) => (
                <tr key={site.siteId} className="hover:bg-sandstone/10">
                  <td className="px-4 py-2.5 font-bold text-ink">
                    <Link href={`/sites/${site.siteStableId}`} className="text-clay hover:underline">
                      {site.canonicalName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink/75">
                    {site.modernRegion ? `${site.modernRegion}, ` : ""}{site.country}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink/65 text-[11px]">
                    {site.latitude && site.longitude
                      ? `${parseFloat(site.latitude).toFixed(4)}°N, ${parseFloat(site.longitude).toFixed(4)}°E`
                      : "Unrecorded"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-ink/50">
                    0
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="rounded bg-sandstone/30 px-2 py-0.5 font-sans text-[10px] font-semibold text-ink/65">
                      Reference Only
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/sites/${site.siteStableId}`}
                      className="text-xs font-semibold text-clay hover:underline"
                    >
                      View datum →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Multi-Site Cross-Analysis Readiness Specification */}
      <section className="panel p-6" aria-labelledby="readiness-heading">
        <h3 id="readiness-heading" className="font-display text-lg font-bold text-ink">
          3. Multi-Site Comparative Architecture &amp; Safeguards
        </h3>
        <p className="mt-1 text-xs text-ink/65">
          V2.5 established the typed database queries and comparative dimensions ready for multi-site execution:
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded border border-ink/10 bg-sandstone/15 p-4">
            <span className="font-mono text-xs font-bold text-clay">Dimension 1–3</span>
            <p className="mt-1 font-display text-sm font-bold text-ink">Corpus &amp; Vocabulary Scale</p>
            <p className="mt-1.5 text-xs text-ink/70">
              Comparative inscription counts, token occurrences, and distinct sign vocabulary size per site.
            </p>
          </div>

          <div className="rounded border border-ink/10 bg-sandstone/15 p-4">
            <span className="font-mono text-xs font-bold text-clay">Dimension 4–6</span>
            <p className="mt-1 font-display text-sm font-bold text-ink">Positional &amp; Sign Distributions</p>
            <p className="mt-1.5 text-xs text-ink/70">
              Top signs per site, mean sequence length per site, and initial-position (Position 1) distributions.
            </p>
          </div>

          <div className="rounded border border-ink/10 bg-sandstone/15 p-4">
            <span className="font-mono text-xs font-bold text-clay">Dimension 7–10</span>
            <p className="mt-1 font-display text-sm font-bold text-ink">Vocabulary Overlap &amp; Motifs</p>
            <p className="mt-1.5 text-xs text-ink/70">
              Intersection of shared signs, site-specific sign lists, and recurring contiguous sequence motifs.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/70 leading-relaxed">
          <strong>Methodological Safeguard:</strong> Differences in sign frequency between sites must <em>not</em> be casually interpreted as regional dialects, ethnic identities, or administrative hierarchies without independent stratigraphical and material evidence. All comparisons report empirical distributions of transcribed records.
        </div>
      </section>

      {/* Provenance & Source Registry Section */}
      <section className="panel p-6" aria-labelledby="sources-heading">
        <h3 id="sources-heading" className="font-display text-lg font-bold text-ink">
          4. Registered Bibliographic &amp; Corpus Sources ({sources.length})
        </h3>
        <p className="mt-1 text-xs text-ink/65">
          Verifiable scholarly publications and machine-readable data releases underpinning the active dataset.
        </p>

        <div className="mt-4 space-y-4">
          {sources.map((src) => (
            <article key={src.id} className="rounded border border-ink/10 bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-ink/10 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-clay">{src.stableId}</span>
                  <h4 className="mt-1 font-display text-base font-bold text-ink">{src.title}</h4>
                  {src.authors && (
                    <p className="text-xs text-ink/75">{src.authors}{src.publicationYear ? ` (${src.publicationYear})` : ""}</p>
                  )}
                </div>
                {src.licenceName && (
                  <span className="rounded bg-sandstone/30 px-2.5 py-1 text-[10px] font-semibold text-ink">
                    {src.licenceName}
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                {src.catalogueSystem && (
                  <div>
                    <span className="font-bold text-ink/60 block">Catalogue System:</span>
                    <span className="text-ink/80">{src.catalogueSystem}</span>
                  </div>
                )}
                {src.signNumberingConvention && (
                  <div>
                    <span className="font-bold text-ink/60 block">Sign Convention:</span>
                    <span className="text-ink/80">{src.signNumberingConvention}</span>
                  </div>
                )}
                {src.transcriptionSystem && (
                  <div>
                    <span className="font-bold text-ink/60 block">Transcription System:</span>
                    <span className="text-ink/80">{src.transcriptionSystem}</span>
                  </div>
                )}
                {src.repositoryOrArchive && (
                  <div>
                    <span className="font-bold text-ink/60 block">Archive / Repository:</span>
                    <span className="text-ink/80">{src.repositoryOrArchive}</span>
                  </div>
                )}
              </div>

              {src.limitations && (
                <div className="mt-3 border-t border-ink/10 pt-2 text-[11px] text-ink/65">
                  <span className="font-bold">Documented Limitations:</span> {src.limitations}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
