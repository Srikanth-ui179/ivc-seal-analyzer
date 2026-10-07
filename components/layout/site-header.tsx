"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/research/dashboard" },
  { label: "Assistant", href: "/research/assistant" },
  { label: "Analyze", href: "/analyze" },
  { label: "Explorer", href: "/explorer" },
  { label: "Sign Catalogue", href: "/sign-catalogue" },
  { label: "Map", href: "/map" },
  { label: "Datasets", href: "/research/datasets" },
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="page-shell flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center border border-ink/30 font-display text-lg">𐄪</span>
          <span>
            <span className="block font-display text-lg leading-none">IndusScript AI</span>
            <span className="mt-1 block text-[0.57rem] font-semibold uppercase tracking-[0.16em] text-ink/55">Research platform</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 xl:gap-2 lg:flex" aria-label="Primary navigation">
          {links.map(({ label, href }) => {
            const active = isLinkActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded px-2.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-sandstone/30 font-semibold text-clay"
                    : "text-ink/70 hover:text-clay hover:bg-sandstone/15"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="hidden sm:inline-block border border-ink bg-ink px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper hover:bg-moss"
          >
            Workspace
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded border border-ink/20 text-ink hover:bg-sandstone/20 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-lg leading-none">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-ink/10 bg-paper px-6 py-4 shadow-lg lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {links.map(({ label, href }) => {
              const active = isLinkActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded p-2.5 text-xs font-medium transition ${
                    active
                      ? "bg-sandstone/30 font-semibold text-clay"
                      : "text-ink/75 hover:bg-sandstone/15 hover:text-clay"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 border-t border-ink/10 pt-3 flex justify-between items-center text-xs">
            <span className="text-ink/50 font-mono">Dataset CISI-V1</span>
            <Link
              href="/research/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="font-semibold text-clay hover:underline"
            >
              Ask Assistant →
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
