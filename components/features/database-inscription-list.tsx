import Link from "next/link";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import type { InscriptionSummary } from "@/lib/db/types";

export function DatabaseInscriptionList({ inscriptions }: { inscriptions: InscriptionSummary[] }) {
  if (inscriptions.length === 0) {
    return (
      <div className="mt-9 border-l-2 border-clay bg-sandstone/20 p-5 text-sm leading-6 text-ink/70">
        No inscriptions match this database view.
      </div>
    );
  }

  return (
    <div className="mt-9 space-y-4">
      {inscriptions.map((item) => (
        <article key={item.id} className="panel grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl">
                <Link href={`/explorer/${item.id}`} className="hover:text-clay">
                  {item.stableId}
                </Link>
              </h2>
              <EvidenceBadge kind="Archaeological record" />
              <span className="border border-moss/30 bg-moss/10 px-2.5 py-1 text-[0.63rem] font-semibold uppercase tracking-[0.13em] text-moss">
                Research Corpus
              </span>
            </div>

            <p className="mt-2 text-sm text-ink/70">
              <Link href={`/objects/${item.object.id}`} className="font-semibold text-clay hover:text-ink">
                {item.object.stableId}
              </Link>
              {" · "}
              {item.object.objectType}
              {item.object.material ? ` · ${item.object.material}` : ""}
              {item.site ? (
                <>
                  {" · "}
                  <Link href={`/sites/${item.site.id}`} className="hover:text-clay">
                    {item.site.canonicalName}
                  </Link>
                </>
              ) : (
                ""
              )}
            </p>

            <p className="mt-2 text-sm leading-6 text-ink/58">
              Surface: {item.surfaceLabel}
              {item.conditionNotes ? ` · ${item.conditionNotes}` : ""}
            </p>
          </div>

          <div className="sm:max-w-md sm:text-right">
            <p className="data-label">Recorded Sign Sequence</p>
            {item.primarySequence && item.primarySequence.tokens.length > 0 ? (
              <div className="mt-2">
                <div className="flex flex-wrap items-center justify-start gap-1 sm:justify-end">
                  {item.primarySequence.tokens.map((token, idx) => {
                    const cleanToken = token.includes(":") ? token.split(":")[1] : token;
                    return (
                      <span
                        key={idx}
                        className="rounded border border-ink/15 bg-sandstone/30 px-2 py-0.5 font-mono text-xs font-semibold text-ink"
                        title={token}
                      >
                        {cleanToken}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-ink/55">
                  {item.primarySequence.sequenceBasis.replaceAll("_", " ")} ({item.primarySequence.tokens.length} signs, R-to-L)
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink/55">No sequence record</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
