import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { getDatasetVersion } from "@/lib/db/dataset-version-repository";

export const dynamic = "force-dynamic";

export default async function DatasetVersionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const dataset = await getDatasetVersion(id);
    if (!dataset) notFound();
    return <div className="page-shell py-14 sm:py-20"><Link href="/research/datasets" className="text-sm font-semibold text-clay hover:text-ink">← Dataset versions</Link><div className="mt-8 border-b border-ink/10 pb-7"><p className="eyebrow">Phase 2 · Frozen corpus snapshot</p><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl tracking-[-0.035em] sm:text-5xl">{dataset.name}</h1><span className="border border-ink/15 px-2.5 py-1 text-[0.63rem] font-semibold uppercase tracking-[0.13em] text-ink/65">{dataset.state}</span></div><p className="mt-3 text-sm text-ink/60">{dataset.stableId} · {dataset.inscriptionCount} recorded inscription{dataset.inscriptionCount === 1 ? "" : "s"}</p></div><div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className="panel p-6"><p className="data-label">Selection definition</p><p className="mt-4 leading-7 text-ink/75">{dataset.selectionCriteria}</p>{dataset.description && <><p className="mt-6 data-label">Dataset note</p><p className="mt-3 leading-7 text-ink/70">{dataset.description}</p></>}{dataset.frozenAt && <p className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink/60">Frozen {dataset.frozenAt.toLocaleString()}</p>}</section><section><p className="data-label">Included inscription records</p><div className="mt-4 space-y-3">{dataset.inscriptions.map((inscription) => <article key={inscription.id} className="panel p-5"><Link href={`/explorer/${inscription.id}`} className="font-display text-xl hover:text-clay">{inscription.stableId}</Link><p className="mt-2 text-sm text-ink/65">{inscription.objectType} · {inscription.objectStableId}{inscription.siteName ? ` · ${inscription.siteName}` : ""}</p><p className="mt-1 text-sm text-ink/55">Surface: {inscription.surfaceLabel}</p></article>)}</div></section></div></div>;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return <div className="page-shell py-14 sm:py-20"><Link href="/research/datasets" className="text-sm font-semibold text-clay hover:text-ink">← Dataset versions</Link><DatabaseUnavailableNotice /></div>;
  }
}
