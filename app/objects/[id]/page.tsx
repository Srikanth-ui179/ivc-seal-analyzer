import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { Phase1RecordHeader } from "@/components/features/phase1-record-header";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getObject } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

const dimensionRows = (object: {
  heightMm: string | null;
  widthMm: string | null;
  depthMm: string | null;
  diameterMm: string | null;
}) =>
  [
    ["Height", object.heightMm],
    ["Width", object.widthMm],
    ["Depth", object.depthMm],
    ["Diameter", object.diameterMm],
  ].filter((entry): entry is [string, string] => entry[1] !== null);

export default async function ObjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const object = await getObject(id);
    if (!object) notFound();

    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
          ← Inscription explorer
        </Link>
        <div className="mt-7">
          <Phase1RecordHeader
            eyebrow="Object record"
            title={object.stableId}
            status={object.status}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Object Information */}
          <section className="panel p-6">
            <p className="data-label">Object information</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="data-label">Type</dt>
                <dd className="mt-1">{object.objectType}</dd>
              </div>
              {object.material && (
                <div>
                  <dt className="data-label">Material</dt>
                  <dd className="mt-1">{object.material}</dd>
                </div>
              )}
              {object.site && (
                <div>
                  <dt className="data-label">Site</dt>
                  <dd className="mt-1">
                    <Link href={`/sites/${object.site.id}`} className="font-semibold text-clay hover:text-ink">
                      {object.site.canonicalName}
                    </Link>
                    {object.site.modernRegion ? ` · ${object.site.modernRegion}` : ""}
                    {object.site.country ? ` (${object.site.country})` : ""}
                  </dd>
                </div>
              )}
              {object.conditionNotes && (
                <div>
                  <dt className="data-label">Condition note</dt>
                  <dd className="mt-1 leading-6 text-ink/70">{object.conditionNotes}</dd>
                </div>
              )}
            </dl>

            {/* Catalogue Identifiers */}
            {object.catalogueIdentifiers && object.catalogueIdentifiers.length > 0 && (
              <div className="mt-6 border-t border-ink/10 pt-5">
                <p className="data-label mb-3">Catalogue Identifiers</p>
                <div className="space-y-2 text-sm">
                  {object.catalogueIdentifiers.map((ci, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{ci.identifierText}</span>
                      <span className="text-xs text-ink/50">({ci.catalogueNamespace})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Collection & Dimensions */}
          <section className="panel p-6">
            <p className="data-label">Collection and dimensions</p>
            <dl className="mt-5 space-y-4 text-sm">
              {object.collectionName && (
                <div>
                  <dt className="data-label">Collection</dt>
                  <dd className="mt-1">
                    {object.collectionName}
                    {object.collectionIdentifier ? ` · ${object.collectionIdentifier}` : ""}
                  </dd>
                </div>
              )}
              {object.currentLocation && (
                <div>
                  <dt className="data-label">Current location</dt>
                  <dd className="mt-1">{object.currentLocation}</dd>
                </div>
              )}
              {dimensionRows(object).map(([label, value]) => (
                <div key={label}>
                  <dt className="data-label">{label}</dt>
                  <dd className="mt-1">{value} mm</dd>
                </div>
              ))}
              {dimensionRows(object).length === 0 && (
                <p className="text-sm text-ink/60">No dimensions are recorded in source.</p>
              )}
            </dl>
          </section>
        </div>

        {/* Inscriptions on this object */}
        {object.inscriptions && object.inscriptions.length > 0 && (
          <section className="panel mt-8 p-6">
            <h2 className="font-display text-2xl">Inscriptions on this Artefact</h2>
            <div className="mt-4 divide-y divide-ink/10">
              {object.inscriptions.map((ins) => (
                <div key={ins.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link href={`/explorer/${ins.id}`} className="font-semibold text-clay hover:text-ink">
                        {ins.stableId}
                      </Link>
                      <span className="ml-2 text-xs text-ink/55">Surface: {ins.surfaceLabel}</span>
                    </div>
                    {ins.primarySequence && (
                      <span className="font-mono text-xs text-ink/70">
                        {ins.primarySequence.tokens.join(" · ") || "No tokens"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
