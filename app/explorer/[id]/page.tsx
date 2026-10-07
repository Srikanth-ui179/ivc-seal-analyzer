import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { Phase1RecordHeader } from "@/components/features/phase1-record-header";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getInscription } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

export default async function InscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const inscription = await getInscription(id);
    if (!inscription) notFound();

    return (
      <div className="page-shell py-14 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/explorer" className="text-sm font-semibold text-clay hover:text-ink">
            ← Inscription explorer
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={`/research/dashboard?tab=duplicates`}
              className="font-semibold text-clay hover:underline"
            >
              📊 Duplicates &amp; Motifs →
            </Link>
            <Link
              href={`/research/assistant?q=Tell me about inscription ${inscription.stableId}`}
              className="rounded border border-clay bg-clay px-2.5 py-1 font-semibold text-paper hover:bg-ink"
            >
              Ask Assistant →
            </Link>
          </div>
        </div>

        <div className="mt-7">
          <Phase1RecordHeader
            eyebrow="Inscription record"
            title={inscription.stableId}
            status={inscription.status}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="space-y-6">
            {/* Object & Site context */}
            <div className="panel p-6">
              <p className="data-label">Object and site context</p>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="data-label">Object</dt>
                  <dd className="mt-1">
                    <Link href={`/objects/${inscription.object.id}`} className="font-semibold text-clay hover:text-ink">
                      {inscription.object.stableId}
                    </Link>{" "}
                    · {inscription.object.objectType}
                    {inscription.object.material ? ` · ${inscription.object.material}` : ""}
                  </dd>
                </div>
                {inscription.site && (
                  <div>
                    <dt className="data-label">Site</dt>
                    <dd className="mt-1">
                      <Link href={`/sites/${inscription.site.id}`} className="font-semibold text-clay hover:text-ink">
                        {inscription.site.canonicalName}
                      </Link>
                      {inscription.site.modernRegion ? ` · ${inscription.site.modernRegion}` : ""}
                      {inscription.site.country ? ` (${inscription.site.country})` : ""}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="data-label">Surface</dt>
                  <dd className="mt-1">{inscription.surfaceLabel}</dd>
                </div>
                {inscription.conditionNotes && (
                  <div>
                    <dt className="data-label">Condition note</dt>
                    <dd className="mt-1 leading-6 text-ink/70">{inscription.conditionNotes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Catalogue Identifiers */}
            {inscription.catalogueIdentifiers && inscription.catalogueIdentifiers.length > 0 && (
              <div className="panel p-6">
                <p className="data-label">Catalogue Identifiers</p>
                <div className="mt-4 space-y-3 text-sm">
                  {inscription.catalogueIdentifiers.map((ci, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-ink/5 pb-2">
                      <div>
                        <span className="font-mono font-semibold text-ink">{ci.identifierText}</span>
                        <span className="ml-2 text-xs text-ink/50">({ci.catalogueNamespace})</span>
                      </div>
                      {ci.isPrimary && (
                        <span className="rounded bg-sandstone/40 px-2 py-0.5 text-xs text-ink/60">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corpus Release & Provenance */}
            {inscription.sourceRelease && (
              <div className="panel p-6 text-xs text-ink/70">
                <p className="data-label">Corpus Provenance</p>
                <p className="mt-3 font-semibold text-ink">{inscription.sourceRelease.releaseLabel}</p>
                <p className="mt-1">Source: {inscription.sourceRelease.sourceTitle}</p>
                {inscription.sourceRelease.rightsSummary && (
                  <p className="mt-2 text-ink/55">{inscription.sourceRelease.rightsSummary}</p>
                )}
                <div className="mt-4 border-t border-ink/10 pt-3">
                  <Link
                    href="/research/datasets/DATASET-CISI-MOHENJODARO-V1"
                    className="font-semibold text-clay hover:underline"
                  >
                    View Frozen Dataset Record →
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Recorded sign sequences */}
          <section className="space-y-4">
            <p className="data-label">Recorded sign sequences</p>
            {inscription.sequences.length === 0 ? (
              <div className="panel p-6 text-sm text-ink/65">
                No sequence records are available for this inscription.
              </div>
            ) : (
              inscription.sequences.map((sequence) => (
                <article key={sequence.id} className="panel p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
                    <p className="font-semibold text-base">{sequence.isPrimary ? "Primary sequence" : "Alternative sequence"}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-ink/55">
                      {sequence.sequenceBasis.replaceAll("_", " ")} · v{sequence.sequenceVersion}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="data-label">Grapheme Sequence ({sequence.occurrences.length} signs):</p>
                      <span className="text-[11px] text-ink/50 font-mono">Right-to-Left recorded order</span>
                    </div>

                    <ol className="flex flex-wrap items-center gap-2">
                      {sequence.occurrences.map((occurrence, idx) => (
                        <li key={occurrence.id} className="flex items-center gap-2">
                          <div className="flex flex-col items-center rounded border border-ink/15 bg-sandstone/25 px-3.5 py-2 text-sm shadow-xs transition hover:border-clay/60 hover:bg-sandstone/40">
                            {occurrence.sign ? (
                              <Link
                                href={`/sign-catalogue/${occurrence.sign.id}`}
                                className="font-mono font-bold text-clay hover:underline"
                                title={`Inspect sign ${occurrence.sign.catalogueCode}`}
                              >
                                {occurrence.sign.catalogueCode}
                              </Link>
                            ) : (
                              <span className="font-mono text-ink/60">[{occurrence.identificationStatus}]</span>
                            )}
                            <span className="mt-0.5 text-[0.65rem] font-mono text-ink/45">#{occurrence.positionIndex}</span>
                          </div>
                          {idx < sequence.occurrences.length - 1 && (
                            <span className="font-bold text-ink/25 text-xs select-none" aria-hidden="true">→</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {sequence.occurrences.length === 0 && (
                    <p className="mt-4 text-sm text-ink/60">No sign occurrences are recorded in this sequence.</p>
                  )}
                  {sequence.editorialNote && (
                    <p className="mt-4 border-l-2 border-clay pl-3 text-sm leading-6 text-ink/70">
                      {sequence.editorialNote}
                    </p>
                  )}

                  <div className="mt-6 border-l-2 border-moss bg-sandstone/20 p-3 text-xs leading-relaxed text-ink/70">
                    <strong>Epigraphic Safeguard:</strong> The sequence is displayed in source-recorded Right-to-Left order (Position 1 through {sequence.occurrences.length}). This represents catalogued transcription order in CISI Volume 1, not an inferred reading direction or linguistic syntax.
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
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
