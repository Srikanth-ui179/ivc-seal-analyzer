import Link from "next/link";
import { ArchaeologicalMapWrapper } from "@/components/features/archaeological-map-wrapper";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listSitesForMap } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

function formatCoordinates(latitude: string, longitude: string) {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    !Number.isFinite(parsedLatitude) ||
    !Number.isFinite(parsedLongitude) ||
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    return "Unavailable";
  }

  return `${Math.abs(parsedLatitude).toFixed(4)}°${parsedLatitude >= 0 ? "N" : "S"}, ${Math.abs(parsedLongitude).toFixed(4)}°${parsedLongitude >= 0 ? "E" : "W"}`;
}

export default async function ArchaeologicalMapPage() {
  try {
    const sites = await listSitesForMap();
    const corpusSites = sites.filter((s) => s.isCorpusSite);
    const corpusSitesCount = corpusSites.length;
    const referenceSitesCount = sites.length - corpusSitesCount;
    const corpusInscriptionsCount = corpusSites.reduce(
      (total, site) => total + site.inscriptionsCount,
      0
    );

    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
          ← Inscription explorer
        </Link>

        <div className="mt-6">
          <p className="eyebrow">Geographic Provenance · Archaeological Cartography</p>
          <h1 className="mt-3 display-title">
            Indus Valley Archaeological Sites
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
            An interactive geographic distribution of major Bronze Age Indus urban centers across modern Pakistan and India.
          </p>
        </div>

        {/* Provenance & Methodological Boundary Notice */}
        <div className="mt-8 border-l-2 border-moss bg-sandstone/25 p-5 text-sm leading-6 text-ink/80">
          <p className="font-semibold text-ink">
            Archaeological Provenance & Spatial Method
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/70">
            Coordinates represent published <strong>site-level mound datums (centroids)</strong> established in official archaeological survey and excavation reports (Archaeological Survey of India, UNESCO, Marshall 1931, Mackay 1943, Possehl 2002).
            Coordinates <strong>do not</strong> represent individual seal or inscription findspots. Micro-spatial trenches are not fabricated.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-800"></span>
              {corpusSitesCount} corpus {corpusSitesCount === 1 ? "site" : "sites"} ({corpusInscriptionsCount} inscriptions)
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink/70">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-800"></span>
              {referenceSitesCount} reference-only {referenceSitesCount === 1 ? "site" : "sites"} (0 corpus records)
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="mt-8">
          <ArchaeologicalMapWrapper sites={sites} />
        </div>

        {/* Mapped Sites Directory Table */}
        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink">Site Register & Geodetic Datums</h2>
          <p className="mt-1 text-xs text-ink/60">
            Published site-level coordinates, precision where recorded, and research-corpus coverage. Each site record is available without using the map.
          </p>

          <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-paper">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Site register with site-level coordinates, coordinate precision, research-corpus coverage, and site record links.
              </caption>
              <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                <tr>
                  <th className="px-4 py-3">Site Name</th>
                  <th className="px-4 py-3">Modern Region & Country</th>
                  <th className="px-4 py-3 font-mono">Coordinates (WGS84)</th>
                  <th className="px-4 py-3 font-mono">Precision</th>
                  <th className="px-4 py-3">Research-corpus coverage</th>
                  <th className="px-4 py-3 text-right">Site Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-sandstone/10">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{site.canonicalName}</div>
                      <div className="font-mono text-[10px] text-ink/50">{site.stableId}</div>
                    </td>
                    <td className="px-4 py-3 text-ink/75">
                      {site.modernRegion ? `${site.modernRegion}, ` : ""}
                      {site.country}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink/80">
                      {formatCoordinates(site.latitude, site.longitude)}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink/65">
                      {site.coordinatePrecisionMeters ? `±${site.coordinatePrecisionMeters} m` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={site.isCorpusSite ? "inline-block rounded bg-emerald-800/10 px-2 py-0.5 font-bold text-emerald-800" : "text-ink/60"}>
                        {site.isCorpusSite
                          ? `Corpus site: ${site.inscriptionsCount} inscriptions · ${site.objectsCount} objects`
                          : "Reference-only: 0 inscriptions · 0 objects"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sites/${site.id}`}
                        className="font-semibold text-clay hover:text-ink"
                      >
                        <span className="sr-only">View site record for </span>
                        {site.canonicalName} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
