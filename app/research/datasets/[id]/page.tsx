import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getDatasetVersion } from "@/lib/db/dataset-version-repository";

export const dynamic = "force-dynamic";

export default async function DatasetVersionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const dataset = await getDatasetVersion(id);
    if (!dataset) notFound();

    return (
      <div className="page-shell py-14 sm:py-20">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/research/datasets"
            className="text-sm font-semibold text-clay hover:text-ink"
          >
            ← Dataset versions &amp; corpus register
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/research/dashboard?tab=sites"
              className="text-xs font-semibold text-clay hover:underline"
            >
              🏛️ Multi-Site Dashboard →
            </Link>
            <Link
              href="/analyze"
              className="text-xs font-semibold text-clay hover:underline"
            >
              📊 Numerical Analysis (M1–M11) →
            </Link>
          </div>
        </div>

        {/* Dataset Header */}
        <div className="mt-8 border-b border-ink/10 pb-8">
          <p className="eyebrow">Phase 2 / V2.5 · Frozen Corpus Snapshot</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {dataset.name}
            </h1>
            <span className="rounded border border-moss/30 bg-moss/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-moss">
              {dataset.state}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-ink/65">
            <span>
              <strong>Stable ID:</strong> {dataset.stableId}
            </span>
            <span>
              <strong>UUID:</strong> {dataset.id}
            </span>
            {dataset.frozenAt && (
              <span>
                <strong>Frozen:</strong> {new Date(dataset.frozenAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {dataset.description && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/75">
              {dataset.description}
            </p>
          )}
        </div>

        {/* Snapshot Summary Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 font-mono text-xs">
          <div className="rounded border border-ink/10 bg-sandstone/20 p-4">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
              Inscriptions
            </span>
            <span className="text-xl font-bold text-ink">
              {dataset.inscriptionCount.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-ink/10 bg-sandstone/20 p-4">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
              Sign Tokens
            </span>
            <span className="text-xl font-bold text-ink">
              {dataset.occurrenceCount.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-ink/10 bg-sandstone/20 p-4">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
              Distinct Signs
            </span>
            <span className="text-xl font-bold text-ink">
              {dataset.distinctSignsCount.toLocaleString()}
            </span>
          </div>
          <div className="rounded border border-ink/10 bg-sandstone/20 p-4">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
              Corpus Sites
            </span>
            <span className="text-xl font-bold text-ink">
              {dataset.corpusSitesCount}
            </span>
          </div>
          <div className="rounded border border-ink/10 bg-sandstone/20 p-4">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
              Primary Sources
            </span>
            <span className="text-xl font-bold text-ink">
              {dataset.sources.length}
            </span>
          </div>
        </div>

        {/* Methodological Safeguard Callout */}
        <div className="mt-8 border-l-2 border-moss bg-sandstone/25 p-5 text-xs leading-relaxed text-ink/80">
          <p className="font-semibold text-ink">
            Reproducibility &amp; Epigraphic Provenance Principle
          </p>
          <p className="mt-1 text-ink/75">
            Every computational measurement, frequency distribution, transition probability, and motif extraction executed in V2.2–V2.5 is bound to this explicit snapshot. If new inscriptions or additional archaeological sites are incorporated in future releases, a new immutable dataset version must be created. The current snapshot remains permanently intact.
          </p>
        </div>

        {/* Represented Sites Section */}
        <section className="mt-10 panel p-6" aria-labelledby="dataset-sites-heading">
          <div className="border-b border-ink/10 pb-3">
            <h2 id="dataset-sites-heading" className="font-display text-xl font-bold text-ink">
              Site Attribution &amp; Geographical Composition
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Archaeological site origins for all {dataset.inscriptionCount} inscribed objects included in this dataset.
            </p>
          </div>

          <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-paper">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink/10 bg-sandstone/30 font-display text-[11px] uppercase tracking-wider text-ink/70">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Site Name</th>
                  <th scope="col" className="px-3 py-2.5">Region &amp; Country</th>
                  <th scope="col" className="px-3 py-2.5">Coordinates</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Inscriptions</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Tokens</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Distinct Signs</th>
                  <th scope="col" className="px-3 py-2.5 text-center">Corpus Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-sans">
                {dataset.sites.map((site) => (
                  <tr key={site.siteId} className="hover:bg-sandstone/10">
                    <td className="px-4 py-3 font-semibold text-ink">
                      <Link
                        href={`/sites/${site.siteStableId}`}
                        className="text-clay hover:underline"
                      >
                        {site.canonicalName}
                      </Link>
                      <span className="block font-mono text-[10px] text-ink/50">
                        {site.siteStableId}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/70">
                      {site.modernRegion}, {site.country}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink/60">
                      {site.latitude}° N, {site.longitude}° E
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-ink">
                      {site.inscriptionCount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-ink/80">
                      {site.occurrenceCount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-ink/80">
                      {site.distinctSignsCount}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="rounded bg-moss/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-moss">
                        Active Corpus Site
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Source Registry & Bibliographic Provenance */}
        <section className="mt-10 panel p-6" aria-labelledby="sources-heading">
          <div className="border-b border-ink/10 pb-3">
            <h2 id="sources-heading" className="font-display text-xl font-bold text-ink">
              Primary Sources &amp; Ingestion Provenance
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Documented source archives, transcription conventions, and licensing frameworks for records in this dataset.
            </p>
          </div>

          <div className="mt-5 space-y-6">
            {dataset.sources.map((src) => (
              <div
                key={src.id}
                className="rounded border border-ink/10 bg-sandstone/15 p-5 text-xs text-ink/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-semibold text-clay">
                      {src.stableId}
                    </span>
                    <h3 className="mt-1 font-display text-base font-bold text-ink">
                      {src.title}
                    </h3>
                    <p className="mt-0.5 text-ink/65">
                      {src.authors} ({src.publicationYear ?? "n.d."}) · {src.publisherOrJournal}
                    </p>
                  </div>
                  {src.licenceName && (
                    <div className="rounded border border-ink/15 bg-paper px-2.5 py-1 text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-ink/50">
                        Licence
                      </span>
                      {src.licenceUrl ? (
                        <a
                          href={src.licenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-semibold text-clay hover:underline"
                        >
                          {src.licenceName} ↗
                        </a>
                      ) : (
                        <span className="font-mono font-semibold text-ink">
                          {src.licenceName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded bg-paper p-3 border border-ink/10">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-ink/50">
                      Catalogue System
                    </span>
                    <p className="mt-1 font-mono text-[11px] text-ink">
                      {src.catalogueSystem ?? "Not recorded"}
                    </p>
                  </div>
                  <div className="rounded bg-paper p-3 border border-ink/10">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-ink/50">
                      Transcription System
                    </span>
                    <p className="mt-1 font-mono text-[11px] text-ink">
                      {src.transcriptionSystem ?? "Not recorded"}
                    </p>
                  </div>
                  <div className="rounded bg-paper p-3 border border-ink/10">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-ink/50">
                      Sign Numbering
                    </span>
                    <p className="mt-1 font-mono text-[11px] text-ink">
                      {src.signNumberingConvention ?? "Not recorded"}
                    </p>
                  </div>
                </div>

                {src.limitations && (
                  <div className="mt-4 rounded border border-ink/10 bg-paper p-3 text-ink/75">
                    <span className="font-semibold text-ink">Known Limitations: </span>
                    {src.limitations}
                  </div>
                )}

                {src.notes && (
                  <p className="mt-2 text-ink/65 text-[11px] italic">
                    Note: {src.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Selection Criteria & Governance */}
        <section className="mt-10 panel p-6">
          <p className="data-label">Selection Criteria &amp; Scope</p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-ink/80 bg-sandstone/20 p-4 rounded border border-ink/10">
            {dataset.selectionCriteria}
          </p>
        </section>

        {/* Inscription Records Roster */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <p className="data-label">Membership Roster</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                Included Inscriptions ({dataset.inscriptions.length})
              </h2>
            </div>
            <Link
              href="/explorer"
              className="text-xs font-semibold text-clay hover:underline"
            >
              Search &amp; filter in Corpus Explorer →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dataset.inscriptions.slice(0, 60).map((inscription) => (
              <article
                key={inscription.id}
                className="panel p-4 transition hover:border-ink/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/explorer/${inscription.id}`}
                    className="font-display text-base font-bold text-ink hover:text-clay"
                  >
                    {inscription.stableId}
                  </Link>
                  <span className="font-mono text-[10px] text-ink/50">
                    {inscription.objectType}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/65">
                  Object: <span className="font-mono text-ink/80">{inscription.objectStableId}</span>
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-ink/55 border-t border-ink/10 pt-2">
                  <span>Site: {inscription.siteName ?? "Mohenjo-daro"}</span>
                  <span>Surface: {inscription.surfaceLabel}</span>
                </div>
              </article>
            ))}
          </div>

          {dataset.inscriptions.length > 60 && (
            <div className="mt-6 text-center text-xs text-ink/60">
              Showing first 60 of {dataset.inscriptions.length} inscriptions. Explore the full corpus in the{" "}
              <Link href="/explorer" className="font-semibold text-clay hover:underline">
                Corpus Explorer
              </Link>.
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <Link
          href="/research/datasets"
          className="text-sm font-semibold text-clay hover:text-ink"
        >
          ← Dataset versions
        </Link>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
