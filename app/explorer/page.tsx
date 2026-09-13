import Link from "next/link";
import { DatabaseInscriptionList } from "@/components/features/database-inscription-list";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { listInscriptions } from "@/lib/db/phase1-repository";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    objectType?: string;
  }>;
};

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const limit = 24;
  const offset = (currentPage - 1) * limit;

  try {
    const inscriptions = await listInscriptions({
      scope: "research",
      search,
      objectType: params.objectType || undefined,
      limit,
      offset,
    });

    const totalPages = Math.ceil(inscriptions.total / limit);

    return (
      <div className="page-shell py-14 sm:py-20">
        <p className="eyebrow">Inscription explorer</p>
        <h1 className="mt-3 display-title">Browse records before patterns.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-ink/70">
          Explore database-backed inscription records with their object, site, and recorded sign-sequence context from the Corpus of Indus Seals and Inscriptions (CISI).
        </p>

        {/* Corpus provenance notice */}
        <div className="mt-8 border-l-2 border-moss bg-sandstone/25 p-5 text-sm leading-6 text-ink/75">
          <p className="font-semibold text-ink">Active Research Corpus: CISI Open Digitization (Parpola et al., M-1..M-199)</p>
          <p className="mt-1 text-ink/65">
            179 Mohenjo-daro artefact records with canonical Parpola sign sequences (MIT License, Michael Carlson digitization).
          </p>
        </div>

        {/* Filters & Search bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <form method="GET" className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by ID (e.g. M-1, P121)..."
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
                href="/explorer"
                className="text-xs font-semibold text-clay hover:text-ink"
              >
                Clear search
              </Link>
            )}
          </form>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded bg-moss/10 px-2.5 py-1 font-semibold text-moss">
              Research Corpus ({inscriptions.total} records)
            </span>
          </div>
        </div>

        {/* Metadata summary */}
        <div className="mt-6 grid gap-4 border-y border-ink/10 py-5 text-sm sm:grid-cols-3">
          <p>
            <span className="data-label block">Matching records</span>
            <span className="mt-1 block font-semibold">{inscriptions.total} inscriptions</span>
          </p>
          <p>
            <span className="data-label block">Data layer</span>
            <span className="mt-1 block">PostgreSQL Phase 1 (Research Corpus)</span>
          </p>
          <p>
            <span className="data-label block">Page</span>
            <span className="mt-1 block">{currentPage} of {Math.max(1, totalPages)}</span>
          </p>
        </div>

        <DatabaseInscriptionList inscriptions={inscriptions.items} />

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">
            {currentPage > 1 ? (
              <Link
                href={`/explorer?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="font-semibold text-clay hover:text-ink"
              >
                ← Previous page
              </Link>
            ) : (
              <span className="text-ink/30">← Previous page</span>
            )}
            <span className="text-xs text-ink/60">
              Showing {offset + 1}–{Math.min(offset + limit, inscriptions.total)} of {inscriptions.total}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={`/explorer?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="font-semibold text-clay hover:text-ink"
              >
                Next page →
              </Link>
            ) : (
              <span className="text-ink/30">Next page →</span>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <p className="eyebrow">Inscription explorer</p>
        <h1 className="mt-3 display-title">Browse records before patterns.</h1>
        <div className="mt-10 max-w-2xl border-l-2 border-clay bg-sandstone/20 p-6">
          <p className="font-display text-2xl">Database connection unavailable</p>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Configure the server-only <code>DATABASE_URL</code>, start PostgreSQL, and apply the Phase 1 migrations. No mock archaeological records are substituted when the database is unavailable.
          </p>
        </div>
      </div>
    );
  }
}
