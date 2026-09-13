import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { Phase1RecordHeader } from "@/components/features/phase1-record-header";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getSite } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const site = await getSite(id);
    if (!site) notFound();

    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
          ← Inscription explorer
        </Link>
        <div className="mt-7">
          <Phase1RecordHeader
            eyebrow="Site record"
            title={site.canonicalName}
            status={site.status}
          />
        </div>

        <section className="panel mt-8 max-w-3xl p-6">
          <p className="data-label">Recorded site information</p>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="data-label">Stable record ID</dt>
              <dd className="mt-1 font-mono">{site.stableId}</dd>
            </div>
            {site.modernRegion && (
              <div>
                <dt className="data-label">Modern region</dt>
                <dd className="mt-1">{site.modernRegion}</dd>
              </div>
            )}
            {site.country && (
              <div>
                <dt className="data-label">Country</dt>
                <dd className="mt-1">{site.country}</dd>
              </div>
            )}
            {site.latitude && site.longitude && (
              <div>
                <dt className="data-label">Coordinates</dt>
                <dd className="mt-1 font-mono">
                  {site.latitude}, {site.longitude}
                  {site.coordinatePrecisionMeters ? ` · precision ${site.coordinatePrecisionMeters} m` : ""}
                </dd>
              </div>
            )}
          </dl>
          {site.notes && (
            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="data-label">Record note</p>
              <p className="mt-2 leading-7 text-ink/70">{site.notes}</p>
            </div>
          )}
        </section>

        {/* Objects from this site */}
        {site.objects && site.objects.length > 0 && (
          <section className="panel mt-8 max-w-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Objects from {site.canonicalName}</h2>
              <span className="text-xs text-ink/60">{site.objectsCount} total objects</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {site.objects.map((obj) => (
                <div key={obj.id} className="rounded border border-ink/10 bg-sandstone/15 p-3 text-sm">
                  <Link href={`/objects/${obj.id}`} className="font-semibold text-clay hover:text-ink">
                    {obj.stableId}
                  </Link>
                  <p className="mt-1 text-xs text-ink/60">
                    {obj.objectType}
                    {obj.material ? ` · ${obj.material}` : ""}
                  </p>
                </div>
              ))}
            </div>
            {site.objectsCount > site.objects.length && (
              <p className="mt-4 text-xs text-ink/50">
                Showing first {site.objects.length} of {site.objectsCount} objects. Browse all in{" "}
                <Link href={`/explorer?siteId=${site.id}`} className="font-semibold text-clay hover:text-ink">
                  Explorer →
                </Link>
              </p>
            )}
          </section>
        )}
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
          ← Inscription explorer
        </Link>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
