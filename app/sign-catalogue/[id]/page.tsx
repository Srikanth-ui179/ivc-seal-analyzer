import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { Phase1RecordHeader } from "@/components/features/phase1-record-header";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getSign } from "@/lib/db/phase1-repository";
import { getSignExplorationDetails } from "@/lib/db/analysis-repository";

export const dynamic = "force-dynamic";

const FROZEN_DATASET_ID = "00000000-0000-4000-8000-000000000181";

export default async function SignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sign = await getSign(id);
    if (!sign) notFound();

    const exploration = await getSignExplorationDetails(FROZEN_DATASET_ID, sign.catalogueCode);

    return (
      <div className="page-shell py-14 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/sign-catalogue" className="text-sm font-semibold text-clay hover:text-ink">
            ← Sign catalogue
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={`/research/dashboard?tab=signs&sign=${sign.catalogueCode}`}
              className="font-semibold text-clay hover:underline"
            >
              📊 Interactive Sign Explorer →
            </Link>
            <Link
              href={`/research/assistant?q=How often does ${sign.catalogueCode} occur and what follows it?`}
              className="rounded border border-clay bg-clay px-2.5 py-1 font-semibold text-paper hover:bg-ink"
            >
              Ask Assistant →
            </Link>
          </div>
        </div>

        <div className="mt-7">
          <Phase1RecordHeader
            eyebrow="Visual sign catalogue record"
            title={`${sign.catalogueNamespace}:${sign.catalogueCode}`}
            status={sign.status}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="panel flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded border border-ink/20 bg-sandstone/30 font-mono text-2xl font-bold text-ink">
              {sign.catalogueCode}
            </div>
            <p className="mt-4 data-label">Sign code</p>
            <p className="mt-1 font-display text-2xl">{sign.visualLabel}</p>
            <p className="mt-3 text-xs text-ink/55">
              Corpus frequency: <strong className="text-ink">{sign.occurrenceCount ?? 0} occurrences</strong>
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href={`/research/dashboard?tab=signs&sign=${sign.catalogueCode}`}
                className="rounded border border-ink/20 bg-sandstone/30 px-3 py-1.5 text-xs font-semibold text-ink hover:border-clay hover:text-clay"
              >
                Sign Profile in Dashboard
              </Link>
              <Link
                href={`/explorer?signId=${sign.id}`}
                className="rounded border border-ink/20 bg-sandstone/30 px-3 py-1.5 text-xs font-semibold text-ink hover:border-clay hover:text-clay"
              >
                Filter Inscriptions
              </Link>
            </div>
          </section>

          <section className="panel p-6">
            <p className="data-label">Catalogue details</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="data-label">Catalogue Namespace</dt>
                <dd className="mt-1 font-mono font-semibold">{sign.catalogueNamespace}</dd>
              </div>
              <div>
                <dt className="data-label">Catalogue Code</dt>
                <dd className="mt-1 font-mono">{sign.catalogueCode}</dd>
              </div>
              <div>
                <dt className="data-label">Description</dt>
                <dd className="mt-1 leading-6 text-ink/75">{sign.visualDescription ?? "No descriptive commentary recorded in source."}</dd>
              </div>
              {sign.parentSign && (
                <div>
                  <dt className="data-label">Parent Sign</dt>
                  <dd className="mt-1">
                    <Link href={`/sign-catalogue/${sign.parentSign.id}`} className="font-semibold text-clay hover:text-ink">
                      {sign.parentSign.catalogueNamespace}:{sign.parentSign.catalogueCode} · {sign.parentSign.visualLabel}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 border-t border-ink/10 pt-4 text-xs text-ink/50">
              Stable record ID: {sign.stableId}
            </div>
          </section>
        </div>

        {/* Computational Evidence & Positional Profile */}
        {exploration && (
          <section className="panel mt-8 p-6" aria-labelledby="comp-evidence-heading">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <div>
                <span className="data-label">Empirical Analysis</span>
                <h2 id="comp-evidence-heading" className="font-display text-2xl font-bold text-ink">
                  Computational Profile in Frozen Dataset
                </h2>
              </div>
              <span className="font-mono text-xs text-ink/50">
                DATASET-CISI-MOHENJODARO-V1
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded border border-ink/10 bg-sandstone/15 p-4 text-center">
                <span className="block text-xs text-ink/60">Total Occurrences</span>
                <span className="font-display text-2xl font-bold text-ink">{exploration.totalOccurrences}</span>
                <span className="mt-1 block text-[10px] text-ink/50">
                  {exploration.corpusPercentage}% of 1,003 tokens
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/15 p-4 text-center">
                <span className="block text-xs text-ink/60">Inscriptions Containing</span>
                <span className="font-display text-2xl font-bold text-ink">{exploration.inscriptionCount}</span>
                <span className="mt-1 block text-[10px] text-ink/50">
                  {((exploration.inscriptionCount * 100) / 179).toFixed(1)}% of 179 seals
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/15 p-4 text-center">
                <span className="block text-xs text-ink/60">First-Position (Pos 1)</span>
                <span className="font-display text-2xl font-bold text-ink">{exploration.initialFrequency}</span>
                <span className="mt-1 block text-[10px] text-ink/50">
                  {exploration.initialPercentage}% initial rate
                </span>
              </div>
              <div className="rounded border border-ink/10 bg-sandstone/15 p-4 text-center">
                <span className="block text-xs text-ink/60">Mean Relative Pos</span>
                <span className="font-display text-2xl font-bold text-ink">
                  {exploration.meanRelativePosition != null ? exploration.meanRelativePosition.toFixed(2) : "N/A"}
                </span>
                <span className="mt-1 block text-[10px] text-ink/50">
                  0.0 = initial, 1.0 = terminal
                </span>
              </div>
            </div>

            {/* Positional Distribution Breakdown */}
            <div className="mt-6 rounded border border-ink/10 bg-sandstone/10 p-4">
              <h3 className="font-display text-sm font-semibold text-ink">
                Positional Breakdown (Right-to-Left Transcription Order)
              </h3>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
                <div className="rounded bg-sandstone/30 p-2">
                  <span className="block text-[10px] text-ink/60">Position 1</span>
                  <span className="font-mono text-sm font-bold text-ink">{exploration.pos1}</span>
                </div>
                <div className="rounded bg-sandstone/30 p-2">
                  <span className="block text-[10px] text-ink/60">Position 2</span>
                  <span className="font-mono text-sm font-bold text-ink">{exploration.pos2}</span>
                </div>
                <div className="rounded bg-sandstone/30 p-2">
                  <span className="block text-[10px] text-ink/60">Position 3</span>
                  <span className="font-mono text-sm font-bold text-ink">{exploration.pos3}</span>
                </div>
                <div className="rounded bg-sandstone/30 p-2">
                  <span className="block text-[10px] text-ink/60">Position 4</span>
                  <span className="font-mono text-sm font-bold text-ink">{exploration.pos4}</span>
                </div>
                <div className="rounded bg-sandstone/30 p-2">
                  <span className="block text-[10px] text-ink/60">Pos 5+</span>
                  <span className="font-mono text-sm font-bold text-ink">{exploration.pos5Plus}</span>
                </div>
              </div>
            </div>

            {/* Adjacency & Transitions Preview */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Predecessors */}
              <div className="rounded border border-ink/10 bg-sandstone/10 p-4">
                <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Top Preceding Signs (pos - 1)
                </h4>
                {exploration.topPredecessors && exploration.topPredecessors.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {exploration.topPredecessors.slice(0, 5).map((p) => (
                      <li key={p.neighborCode} className="flex items-center justify-between">
                        <Link
                          href={`/sign-catalogue/${p.neighborCode}`}
                          className="font-mono font-semibold text-clay hover:underline"
                        >
                          {p.neighborCode}
                        </Link>
                        <span className="text-ink/60 font-mono">
                          {p.cooccurrenceCount} times ({(p.transitionProbability * 100).toFixed(1)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-ink/50">No recurring preceding signs recorded.</p>
                )}
              </div>

              {/* Successors */}
              <div className="rounded border border-ink/10 bg-sandstone/10 p-4">
                <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Top Succeeding Signs (pos + 1)
                </h4>
                {exploration.topSuccessors && exploration.topSuccessors.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {exploration.topSuccessors.slice(0, 5).map((s) => (
                      <li key={s.neighborCode} className="flex items-center justify-between">
                        <Link
                          href={`/sign-catalogue/${s.neighborCode}`}
                          className="font-mono font-semibold text-clay hover:underline"
                        >
                          {s.neighborCode}
                        </Link>
                        <span className="text-ink/60 font-mono">
                          {s.cooccurrenceCount} times ({(s.transitionProbability * 100).toFixed(1)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-ink/50">No recurring succeeding signs recorded.</p>
                )}
              </div>
            </div>

            {/* Methodological Safeguard */}
            <div className="mt-6 border-l-2 border-clay bg-sandstone/25 p-3 text-xs leading-relaxed text-ink/70">
              <strong>Epigraphic Notice:</strong> Formal graphemic recurrence only. Positional distributions describe transcribed Right-to-Left sequence order in CISI Volume 1, not an inferred reading direction or linguistic function. Sign frequency does not indicate word status or grammatical role.
            </div>
          </section>
        )}

        {/* Occurrences in corpus */}
        <section className="panel mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Corpus Occurrences</h2>
              <p className="mt-1 text-sm text-ink/65">
                Found in {sign.occurrenceCount ?? 0} inscription sequences across the active dataset.
              </p>
            </div>
            <Link
              href={`/explorer?signId=${sign.id}`}
              className="text-xs font-semibold text-clay hover:underline"
            >
              Filter in Explorer →
            </Link>
          </div>

          {sign.occurrences && sign.occurrences.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
                    <th className="pb-3 pr-4 font-semibold">Inscription</th>
                    <th className="pb-3 pr-4 font-semibold">Object</th>
                    <th className="pb-3 pr-4 font-semibold">Surface</th>
                    <th className="pb-3 pr-4 font-semibold">Position</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {sign.occurrences.map((occ) => (
                    <tr key={occ.id} className="hover:bg-sandstone/10">
                      <td className="py-3 pr-4">
                        <Link href={`/explorer/${occ.inscriptionId}`} className="font-semibold text-clay hover:text-ink">
                          {occ.inscriptionStableId}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <Link href={`/objects/${occ.objectId}`} className="hover:text-clay">
                          {occ.objectStableId}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-ink/70">{occ.surfaceLabel}</td>
                      <td className="py-3 pr-4 font-mono">#{occ.positionIndex}</td>
                      <td className="py-3">
                        <span className="rounded bg-moss/10 px-2 py-0.5 text-xs text-moss">
                          {occ.identificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sign.occurrenceCount && sign.occurrenceCount > 50 && (
                <p className="mt-4 text-xs text-ink/50">Showing first 50 occurrences.</p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/60">No occurrence links recorded for this sign.</p>
          )}
        </section>
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/sign-catalogue" className="text-sm font-semibold text-clay hover:text-ink">
          ← Sign catalogue
        </Link>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
