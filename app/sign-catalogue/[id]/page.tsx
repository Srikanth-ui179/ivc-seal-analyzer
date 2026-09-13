import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { Phase1RecordHeader } from "@/components/features/phase1-record-header";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getSign } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

export default async function SignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sign = await getSign(id);
    if (!sign) notFound();

    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/sign-catalogue" className="text-sm font-semibold text-clay hover:text-ink">
          ← Sign catalogue
        </Link>
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

        {/* Occurrences in corpus */}
        <section className="panel mt-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl">Corpus Occurrences</h2>
              <p className="mt-1 text-sm text-ink/65">
                Found in {sign.occurrenceCount ?? 0} inscription sequences across the active dataset.
              </p>
            </div>
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
