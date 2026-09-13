import Link from "next/link";
import { CatalogueGrid } from "@/components/features/catalogue-grid";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listSigns } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CataloguePage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;

  try {
    const signs = await listSigns({
      scope: "research",
      search,
      limit: 200,
      sortByFrequency: true,
    });

    return (
      <div className="page-shell py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Visual sign catalogue</p>
            <h1 className="mt-3 display-title">Sign forms in context.</h1>
            <p className="mt-5 max-w-2xl leading-7 text-ink/70">
              A visual index of database-backed sign types, corpus frequencies, and occurrence linkages from the Corpus of Indus Seals and Inscriptions (CISI).
            </p>
          </div>
          <EvidenceBadge kind="Archaeological record" />
        </div>

        {/* Source citation */}
        <div className="mt-8 border-l-2 border-moss bg-sandstone/25 p-5 text-sm leading-6 text-ink/75">
          <p className="font-semibold text-ink">Sign Catalogue: Parpola / CISI Notation (P-NNN)</p>
          <p className="mt-1 text-ink/65">
            Signs are identified by their canonical Parpola catalogue codes (e.g. <code>cisi_parpola:P121</code>). Occurrence counts reflect the currently imported research corpus ({signs.total} distinct sign types). No semantic or phonetic reading is implied.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <form method="GET" className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search sign code (e.g. P121)..."
              className="border border-ink/20 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-clay focus:outline-none"
            />
            <button
              type="submit"
              className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-moss"
            >
              Search
            </button>
            {search && (
              <Link
              href="/sign-catalogue"
                className="text-xs font-semibold text-clay hover:text-ink"
              >
                Clear search
              </Link>
            )}
          </form>

          <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
            Research corpus ({signs.total} sign types)
          </span>
        </div>

        <CatalogueGrid signs={signs.items} />
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <p className="eyebrow">Visual sign catalogue</p>
        <h1 className="mt-3 display-title">Sign forms in context.</h1>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
