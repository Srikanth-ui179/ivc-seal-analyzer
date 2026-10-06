import Link from "next/link";
import type { StructuralOutlier } from "@/lib/db/analysis-types";

type Props = {
  outliers: StructuralOutlier[];
};

export function OutlierExplorer({ outliers }: Props) {
  // Categorized counts
  const lengthOutliers = outliers.filter((o) => o.length >= 10);
  const repetitionOutliers = outliers.filter((o) => o.repeatCount >= 2);
  const hapaxOutliers = outliers.filter((o) =>
    o.outlierReasons.some((r) => r.includes("hapax legomena"))
  );

  return (
    <div className="space-y-8">
      {/* Safeguard Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          What This Shows: Transparent Rule-Based Outliers ≠ Ritual or Royal Inscriptions
        </p>
        <p className="mt-1 text-ink/70">
          Every classification below is determined by an explicit, measurable rule (such as length ≥ 10 signs, which is &gt;2 standard deviations above the corpus mean of 5.60, or containing multiple internal duplicates).
          These are formal structural anomalies in the catalogue; they do <strong>not</strong> signify royal decrees, sacred formulas, foreign languages, or special administrative status.
        </p>
      </div>

      {/* Summary Banner */}
      <section className="panel p-5" aria-labelledby="outlier-summary-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-3">
          <div>
            <h2 id="outlier-summary-heading" className="font-display text-lg font-bold text-ink">
              Structural Outlier Distribution
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Outliers identified using formal mathematical rules against the 179-inscription baseline.
            </p>
          </div>
          <span className="font-mono text-xs text-ink/50">
            {outliers.length} qualifying outlier seals
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded border border-ink/10 bg-sandstone/15 p-3 text-center">
            <span className="block text-xs text-ink/60">Length Outliers (≥ 10 signs)</span>
            <span className="font-display text-2xl font-bold text-ink">{lengthOutliers.length}</span>
            <span className="mt-1 block text-[10px] text-ink/50">&gt;2 SD above mean (5.60)</span>
          </div>

          <div className="rounded border border-ink/10 bg-sandstone/15 p-3 text-center">
            <span className="block text-xs text-ink/60">Multiple Repeated Signs</span>
            <span className="font-display text-2xl font-bold text-ink">{repetitionOutliers.length}</span>
            <span className="mt-1 block text-[10px] text-ink/50">≥ 2 duplicate occurrences</span>
          </div>

          <div className="rounded border border-ink/10 bg-sandstone/15 p-3 text-center">
            <span className="block text-xs text-ink/60">Hapax Legomena Dense</span>
            <span className="font-display text-2xl font-bold text-ink">{hapaxOutliers.length}</span>
            <span className="mt-1 block text-[10px] text-ink/50">≥ 2 corpus-unique signs</span>
          </div>
        </div>
      </section>

      {/* Outlier Inscriptions List */}
      <section className="space-y-4" aria-labelledby="outliers-list-heading">
        <h3 id="outliers-list-heading" className="font-display text-xl font-bold text-ink">
          Detailed Outlier Inspection ({outliers.length} seals)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {outliers.map((item) => (
            <div
              key={item.inscriptionStableId}
              className="panel flex flex-col justify-between p-5 transition hover:border-clay/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-3">
                  <Link
                    href={`/explorer/${item.inscriptionStableId}`}
                    className="font-mono text-base font-bold text-clay hover:underline"
                  >
                    {item.inscriptionStableId}
                  </Link>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="rounded bg-sandstone/30 px-2 py-0.5 font-bold text-ink">
                      Length {item.length}
                    </span>
                    <span className="text-ink/60">
                      ({item.distinctSigns} distinct)
                    </span>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink/50">
                    Classification Rules Met:
                  </span>
                  <ul className="space-y-1 text-xs text-ink/75">
                    {item.outlierReasons.map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <span className="text-clay">●</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sequence Tokens */}
                <div className="mt-4 rounded bg-sandstone/15 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-ink/50">Transcribed Sequence</span>
                  <div className="mt-1.5 flex flex-wrap gap-1 font-mono">
                    {item.signSequence.split(" ").map((token, tIdx) => (
                      <Link
                        key={tIdx}
                        href={`/research/dashboard?tab=signs&sign=${token}`}
                        className="rounded bg-paper px-1.5 py-0.5 text-[11px] font-bold text-ink hover:bg-clay hover:text-paper"
                      >
                        {token}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs">
                <span className="text-ink/55 font-mono">
                  {item.repeatCount > 0 ? `${item.repeatCount} duplicate token(s)` : "Zero internal repeats"}
                </span>
                <Link
                  href={`/explorer/${item.inscriptionStableId}`}
                  className="font-semibold text-clay hover:text-ink hover:underline"
                >
                  Inspect seal &amp; findspot →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
