import Link from "next/link";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listDatasetVersions } from "@/lib/db/dataset-version-repository";

export const dynamic = "force-dynamic";

export default async function DatasetVersionsPage() {
  try {
    const datasets = await listDatasetVersions({ scope: "research" });
    return <div className="page-shell py-14 sm:py-20"><Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">← Research & methodology</Link><p className="mt-8 eyebrow">Phase 2 · Reproducibility foundation</p><h1 className="mt-3 display-title">Dataset versions</h1><p className="mt-5 max-w-2xl leading-7 text-ink/70">A dataset version is a frozen selection of Phase 1 inscription records for a future reproducible analysis. It is not an archaeological interpretation, computational result, or model output.</p><div className="mt-10 space-y-4">{datasets.items.length === 0 ? <div className="panel p-6 text-sm text-ink/65">No research dataset versions are available.</div> : datasets.items.map((dataset) => <article key={dataset.id} className="panel p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="data-label">{dataset.stableId}</p><h2 className="mt-2 font-display text-2xl"><Link href={`/research/datasets/${dataset.id}`} className="hover:text-clay">{dataset.name}</Link></h2></div><span className="border border-ink/15 px-2.5 py-1 text-[0.63rem] font-semibold uppercase tracking-[0.13em] text-ink/65">{dataset.state}</span></div><p className="mt-3 text-sm leading-6 text-ink/70">{dataset.description ?? "No description is recorded."}</p><p className="mt-4 text-sm text-ink/60">{dataset.inscriptionCount} inscription{dataset.inscriptionCount === 1 ? "" : "s"} in this snapshot</p></article>)}</div></div>;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return <div className="page-shell py-14 sm:py-20"><Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">← Research & methodology</Link><DatabaseUnavailableNotice /></div>;
  }
}
