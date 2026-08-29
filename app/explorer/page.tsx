import { DatabaseInscriptionList } from "@/components/features/database-inscription-list";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listInscriptions } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

export default async function ExplorerPage() {
  try {
    // `all` is deliberate here: demo fixtures are shown only when explicitly labelled.
    const inscriptions = await listInscriptions({ scope: "all", limit: 24 });
    return <div className="page-shell py-14 sm:py-20"><p className="eyebrow">Inscription explorer</p><h1 className="mt-3 display-title">Browse records before patterns.</h1><p className="mt-5 max-w-2xl leading-7 text-ink/70">Explore database-backed inscription records with their object, site, material, and recorded sign-sequence context.</p><div className="mt-10 grid gap-4 border-y border-ink/10 py-5 text-sm sm:grid-cols-3"><p><span className="data-label block">Records returned</span><span className="mt-1 block">{inscriptions.total}</span></p><p><span className="data-label block">Data layer</span><span className="mt-1 block">PostgreSQL Phase 1</span></p><p><span className="data-label block">Interpretive status</span><span className="mt-1 block">Archaeological/catalogue records only</span></p></div><DatabaseInscriptionList inscriptions={inscriptions.items} /></div>;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return <div className="page-shell py-14 sm:py-20"><p className="eyebrow">Inscription explorer</p><h1 className="mt-3 display-title">Browse records before patterns.</h1><div className="mt-10 max-w-2xl border-l-2 border-clay bg-sandstone/20 p-6"><p className="font-display text-2xl">Database connection unavailable</p><p className="mt-3 text-sm leading-6 text-ink/70">Configure the server-only <code>DATABASE_URL</code>, start PostgreSQL, and apply the Phase 1 migrations. No mock archaeological records are substituted when the database is unavailable.</p></div></div>;
  }
}
