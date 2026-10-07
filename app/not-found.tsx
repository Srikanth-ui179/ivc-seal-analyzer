import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-ink/20 bg-sandstone/30 font-mono text-2xl font-bold text-ink">
        𐄪
      </div>
      <p className="mt-6 eyebrow">404 · Record Not Found</p>
      <h1 className="mt-2 display-title">Resource or Record Unavailable</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/70">
        The requested identifier does not match any verified record in the active dataset (<code>DATASET-CISI-MOHENJODARO-V1</code>), or the page route has moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
        <Link
          href="/explorer"
          className="rounded border border-ink bg-ink px-4 py-2 font-semibold uppercase tracking-[0.1em] text-paper hover:bg-moss"
        >
          Corpus Explorer
        </Link>
        <Link
          href="/sign-catalogue"
          className="rounded border border-ink/20 bg-sandstone/30 px-4 py-2 font-semibold uppercase tracking-[0.1em] text-ink hover:border-clay hover:text-clay"
        >
          Sign Catalogue
        </Link>
        <Link
          href="/research/dashboard"
          className="rounded border border-ink/20 bg-sandstone/30 px-4 py-2 font-semibold uppercase tracking-[0.1em] text-ink hover:border-clay hover:text-clay"
        >
          Research Dashboard
        </Link>
        <Link
          href="/"
          className="rounded border border-ink/20 bg-sandstone/30 px-4 py-2 font-semibold uppercase tracking-[0.1em] text-ink hover:border-clay hover:text-clay"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
