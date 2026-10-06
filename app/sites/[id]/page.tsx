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

        {/* Corpus Site vs. Reference Benchmark Status Callout */}
        <div className={`mt-6 border-l-2 p-4 text-xs leading-relaxed ${
          site.objectsCount > 0
            ? "border-moss bg-moss/5 text-ink/85"
            : "border-sandstone bg-sandstone/25 text-ink/80"
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <span className={`inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${
              site.objectsCount > 0
                ? "bg-moss/20 text-moss"
                : "bg-ink/10 text-ink/70"
            }`}>
              {site.objectsCount > 0 ? "Active Corpus Site" : "Reference-Only Geographic Benchmark"}
            </span>
          </div>
          <p className="mt-2 text-ink/75">
            {site.objectsCount > 0
              ? `This archaeological site has ${site.objectsCount} inscribed object(s) in the database and is represented in the frozen research dataset.`
              : `This archaeological site is registered as a published reference datum (coordinates and regional classification), but has 0 digitized inscription sequences in the current corpus snapshot. Its coordinates provide geographic context on the archaeological map, but its material is not included in computational sign analysis.`}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
            <Link href="/map" className="text-clay hover:underline">
              🗺️ Locate on Archaeological Map →
            </Link>
            <Link href="/research/dashboard?tab=sites" className="text-clay hover:underline">
              🏛️ Corpus &amp; Sites Register →
            </Link>
          </div>
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

        {/* If 0 objects, show an explicit notice */}
        {site.objectsCount === 0 && (
          <section className="panel mt-8 max-w-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Corpus Inscriptions</h2>
              <span className="font-mono text-xs text-ink/50">0 records</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/70">
              No machine-readable inscription sequences from {site.canonicalName} have been ingested or verified under an open research licence. When legitimate, licensed transcriptions become available, this site can be promoted to an active corpus site via a new dataset version.
            </p>
          </section>
        )}

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
