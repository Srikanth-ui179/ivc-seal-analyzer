import Link from "next/link";
import type { SignSummary } from "@/lib/db/types";

export function CatalogueGrid({ signs }: { signs: SignSummary[] }) {
  if (!signs || signs.length === 0) {
    return (
      <div className="mt-10 border-l-2 border-clay bg-sandstone/20 p-5 text-sm text-ink/70">
        No visual signs recorded in the current database view.
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {signs.map((sign) => (
        <article key={sign.id} className="bg-paper p-5 transition hover:bg-sandstone/15">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-ink/15 bg-sandstone/30 font-mono text-sm font-bold text-ink">
              {sign.catalogueCode}
            </div>
            <p className="text-right text-xs text-ink/50">{sign.catalogueNamespace}</p>
          </div>

          <div className="mt-4">
            <Link
              href={`/sign-catalogue/${sign.id}`}
              className="font-display text-lg font-semibold hover:text-clay"
            >
              {sign.catalogueNamespace}:{sign.catalogueCode}
            </Link>
            <p className="mt-1 text-xs text-ink/65">
              Label: <span className="font-semibold text-ink">{sign.visualLabel}</span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs">
            <span className="text-ink/60">
              Occurrences: <strong className="text-ink">{sign.frequency ?? 0}</strong>
            </span>
            <Link
              href={`/sign-catalogue/${sign.id}`}
              className="font-semibold text-clay hover:text-ink"
            >
              View occurrences →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
