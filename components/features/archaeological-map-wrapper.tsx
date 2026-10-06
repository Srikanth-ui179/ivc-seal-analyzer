"use client";

import dynamic from "next/dynamic";
import type { SiteMapPoint } from "@/lib/db/types";

const DynamicArchaeologicalMap = dynamic(
  () =>
    import("@/components/features/archaeological-map").then(
      (mod) => mod.ArchaeologicalMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] w-full flex-col items-center justify-center rounded border border-ink/15 bg-sandstone/25 p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent" />
        <p className="mt-4 font-display text-lg text-ink">
          Loading archaeological cartography...
        </p>
        <p className="mt-1 text-xs text-ink/60">
          Preparing Indus Valley coordinates and geodetic reference datums.
        </p>
      </div>
    ),
  }
);

export function ArchaeologicalMapWrapper({ sites }: { sites: SiteMapPoint[] }) {
  return <DynamicArchaeologicalMap sites={sites} />;
}
