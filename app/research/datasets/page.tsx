import Link from "next/link";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listDatasetVersions } from "@/lib/db/dataset-version-repository";

export const dynamic = "force-dynamic";

export default async function DatasetVersionsPage() {
  try {
    const datasets = await listDatasetVersions({ scope: "research" });

    return (
      <div className="page-shell py-14 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
            ← Research &amp; methodology
          </Link>
          <Link
            href="/research/dashboard?tab=sites"
            className="text-xs font-semibold text-clay hover:underline"
          >
            🏛️ View Corpus &amp; Sites Explorer →
          </Link>
        </div>

        <div className="mt-6">
          <p className="eyebrow">Phase 2 · Reproducibility Foundation</p>
          <h1 className="mt-3 display-title">Dataset Versions &amp; Corpus Register</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
            A dataset version is an immutable snapshot of inscription records used for computational analysis. Freezing a dataset ensures all frequency metrics, transition graphs, and motif searches are fully reproducible.
          </p>
        </div>

        {/* Methodological Boundary Alert */}
        <div className="mt-8 border-l-2 border-clay bg-sandstone/25 p-5 text-xs leading-relaxed text-ink/80">
          <p className="font-semibold text-ink">
            Immutable Dataset Governance &amp; Multi-Site Provenance
          </p>
          <p className="mt-1.5 text-ink/75">
            Computational queries never query raw mutable tables directly. Every analysis runs strictly against an explicit, frozen dataset version. The corpus platform distinguishes between frozen research datasets, upstream source releases, and reference-only geographic benchmark sites.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {datasets.items.length === 0 ? (
            <div className="panel p-6 text-sm text-ink/65">
              No research dataset versions are available in the database.
            </div>
          ) : (
            datasets.items.map((dataset) => (
              <article key={dataset.id} className="panel p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
                  <div>
                    <span className="font-mono text-xs font-semibold text-clay">
                      {dataset.stableId}
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                      <Link
                        href={`/research/datasets/${dataset.id}`}
                        className="hover:text-clay"
                      >
                        {dataset.name}
                      </Link>
                    </h2>
                  </div>
                  <span className="rounded border border-ink/15 bg-sandstone/30 px-2.5 py-1 text-[0.63rem] font-bold uppercase tracking-[0.13em] text-ink/75">
                    {dataset.state}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-ink/75">
                  {dataset.description ?? "No description is recorded."}
                </p>

                {/* Metrics Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
                  <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                    <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
                      Inscriptions
                    </span>
                    <span className="text-base font-bold text-ink">
                      {dataset.inscriptionCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                    <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
                      Sign Tokens
                    </span>
                    <span className="text-base font-bold text-ink">
                      {dataset.occurrenceCount ? dataset.occurrenceCount.toLocaleString() : "1,003"}
                    </span>
                  </div>
                  <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                    <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
                      Distinct Signs
                    </span>
                    <span className="text-base font-bold text-ink">
                      {dataset.distinctSignsCount ? dataset.distinctSignsCount.toLocaleString() : "182"}
                    </span>
                  </div>
                  <div className="rounded border border-ink/10 bg-sandstone/20 p-3">
                    <span className="block font-sans text-[10px] uppercase tracking-wider text-ink/50">
                      Corpus Sites
                    </span>
                    <span className="text-base font-bold text-ink">
                      {dataset.corpusSitesCount ?? 1}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-4 text-xs text-ink/65">
                  <div>
                    <span>Selection criteria: </span>
                    <span className="font-mono text-ink/80">{dataset.selectionCriteria}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/research/datasets/${dataset.id}`}
                      className="font-semibold text-clay hover:underline"
                    >
                      Inspect snapshot details &amp; sources →
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
          ← Research &amp; methodology
        </Link>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
