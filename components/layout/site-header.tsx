import Link from "next/link";

const links = [
  ["Analyze", "/analyze"], ["Sign Catalogue", "/sign-catalogue"], ["Explorer", "/explorer"], ["Research", "/research"], ["About", "/about"],
];

export function SiteHeader() {
  return <header className="border-b border-ink/10 bg-paper/95">
    <div className="page-shell flex min-h-20 items-center justify-between gap-6">
      <Link href="/" className="group flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center border border-ink/30 font-display text-lg">𐄪</span>
        <span><span className="block font-display text-lg leading-none">IndusScript AI</span><span className="mt-1 block text-[0.57rem] font-semibold uppercase tracking-[0.16em] text-ink/55">Research platform</span></span>
      </Link>
      <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
        {links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-ink/70 hover:text-clay">{label}</Link>)}
      </nav>
      <Link href="/analyze" className="border border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper hover:bg-moss">Open workspace</Link>
    </div>
  </header>;
}
