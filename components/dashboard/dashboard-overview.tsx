import Link from "next/link";
import type { AnalysisReport } from "@/lib/db/analysis-types";

type Props = {
  report: AnalysisReport;
};

export function DashboardOverview({ report }: Props) {
  const topSigns = report.signFrequencies.identified.slice(0, 15);
  const maxSignFreq = topSigns[0]?.frequency || 1;

  const lengthBins = report.sequenceLengths.histogram;
  const maxBinCount = Math.max(...lengthBins.map((b) => b.count), 1);

  const topTransitions = report.adjacentPairs.pairs.slice(0, 8);
  const maxTransFreq = topTransitions[0]?.frequency || 1;

  const topMotifs = report.motifs.trigrams.slice(0, 6);
  const maxMotifCount = topMotifs[0]?.occurrenceCount || 1;

  // Selected contrasting signs for positional profile visualization
  const positionalComparison = report.positionProfiles.profiles.filter((p) =>
    ["P324", "P050", "P145", "P086", "P122", "P385"].includes(p.catalogueCode)
  );

  return (
    <div className="space-y-12">
      {/* 4 Headline Metrics */}
      <section aria-labelledby="overview-stats">
        <h2 id="overview-stats" className="sr-only">Corpus Overview Statistics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="panel p-5">
            <span className="data-label block">Inscriptions</span>
            <span className="mt-2 block font-display text-3xl font-bold text-ink">
              {report.coverage.totalInscriptions}
            </span>
            <span className="mt-1 block text-xs text-ink/55">Mohenjo-daro research seals</span>
          </div>
          <div className="panel p-5">
            <span className="data-label block">Sign Tokens</span>
            <span className="mt-2 block font-display text-3xl font-bold text-ink">
              {report.coverage.totalOccurrences.toLocaleString()}
            </span>
            <span className="mt-1 block text-xs text-ink/55">100% epigraphically identified</span>
          </div>
          <div className="panel p-5">
            <span className="data-label block">Distinct Sign Types</span>
            <span className="mt-2 block font-display text-3xl font-bold text-ink">
              {report.coverage.distinctSigns}
            </span>
            <span className="mt-1 block text-xs text-ink/55">Parpola CISI catalogue codes</span>
          </div>
          <div className="panel p-5">
            <span className="data-label block">Zero-Repeat Sequences</span>
            <span className="mt-2 block font-display text-3xl font-bold text-ink">
              {((report.diversityAndRepetition.diversityStats.zeroRepetitionCount * 100) / report.coverage.totalInscriptions).toFixed(1)}%
            </span>
            <span className="mt-1 block text-xs text-ink/55">160/179 sequences without repetition</span>
          </div>
        </div>
      </section>

      {/* Curated Research Highlights Banner */}
      <section className="panel p-6" aria-labelledby="findings-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-4">
          <div>
            <span className="data-label">Empirical Baseline</span>
            <h2 id="findings-heading" className="mt-1 font-display text-xl font-bold text-ink">
              Key Computational Findings
            </h2>
          </div>
          <span className="text-xs text-ink/60">
            Computed from {report.dataset.name} snapshot
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/research/dashboard?tab=signs&sign=P324"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay">Dominant Sign</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              P324 (99 tokens · 9.87%)
            </p>
            <p className="mt-1 text-xs text-ink/65">
              Strong initial bias (43/99 at Position 1). Mean relative position 0.32 (early).
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Inspect P324 evidence →
            </span>
          </Link>

          <Link
            href="/research/dashboard?tab=transitions&pair=P122-P385"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-moss">Strongest Adjacency</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              P122 → P385 (29 instances)
            </p>
            <p className="mt-1 text-xs text-ink/65">
              Occurs in 29 distinct seals. Accounts for 38.2% of all occurrences of P122.
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Inspect transition evidence →
            </span>
          </Link>

          <Link
            href="/research/dashboard?tab=motifs&motifLen=3"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Top Sequence Motif</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              P000 P122 P385 (3 seals)
            </p>
            <p className="mt-1 text-xs text-ink/65">
              Found on M-110A, M-175A, and M-19A. Forms an exact full-sequence duplicate set.
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Inspect motif evidence →
            </span>
          </Link>

          <Link
            href="/research/dashboard?tab=duplicates"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay">Sequence Duplication</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              2 Exact Groups · 10 Near-Pairs
            </p>
            <p className="mt-1 text-xs text-ink/65">
              5 seals share identical complete sequences; 10 pairs differ by Levenshtein distance = 1.
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Inspect duplicates & near-pairs →
            </span>
          </Link>

          <Link
            href="/research/dashboard?tab=outliers"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Structural Outliers</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              8 Length Outliers (≥ 10 signs)
            </p>
            <p className="mt-1 text-xs text-ink/65">
              Max length is 13 signs (M-38A, M-23A; &gt;2 SD above mean). 1 seal with multiple duplicate signs.
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Inspect outlier seals →
            </span>
          </Link>

          <Link
            href="/analyze"
            className="group rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay/50 hover:bg-sandstone/25"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-moss">Methodology Baseline</span>
            <p className="mt-1 font-display text-lg font-bold text-ink group-hover:text-clay">
              Full Analysis (M1–M11)
            </p>
            <p className="mt-1 text-xs text-ink/65">
              Review full tables, standard deviations, denominators, and epigraphic distributions.
            </p>
            <span className="mt-3 block text-xs font-semibold text-clay group-hover:underline">
              Open /analyze workspace →
            </span>
          </Link>
        </div>
      </section>

      {/* Visualizations Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Viz 1: Sign Frequency Distribution Bar Chart */}
        <section className="panel p-6" aria-labelledby="viz-frequency">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <div>
              <h3 id="viz-frequency" className="font-display text-base font-bold text-ink">
                1. Sign Frequency Distribution (Top 15 Signs)
              </h3>
              <p className="text-xs text-ink/60">
                Click any sign to open its detailed exploration and underlying inscriptions.
              </p>
            </div>
            <Link
              href="/research/dashboard?tab=signs"
              className="text-xs font-semibold text-clay hover:underline"
            >
              All signs →
            </Link>
          </div>

          <div className="mt-5 space-y-2.5">
            {topSigns.map((sign) => {
              const pct = (sign.frequency * 100) / maxSignFreq;
              return (
                <Link
                  key={sign.signId}
                  href={`/research/dashboard?tab=signs&sign=${sign.catalogueCode}`}
                  className="group flex items-center gap-3 rounded p-1 hover:bg-sandstone/25"
                >
                  <span className="w-12 font-mono text-xs font-bold text-ink group-hover:text-clay">
                    {sign.catalogueCode}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-ink/5">
                    <div
                      className="h-full rounded bg-clay transition-all group-hover:bg-ink"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-bold text-ink">
                    {sign.frequency}
                  </span>
                  <span className="w-12 text-right font-mono text-[11px] text-ink/55">
                    {sign.percentage.toFixed(1)}%
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 border-t border-ink/10 pt-3 text-[11px] text-ink/55">
            Top sign P324 accounts for 9.87% of all identified tokens (99 / 1,003).
          </div>
        </section>

        {/* Viz 2: Sequence Length Distribution Histogram */}
        <section className="panel p-6" aria-labelledby="viz-lengths">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <div>
              <h3 id="viz-lengths" className="font-display text-base font-bold text-ink">
                2. Sequence Length Distribution (Histogram)
              </h3>
              <p className="text-xs text-ink/60">
                Mean: 5.60 ± 2.05 signs · Median: 5.0 signs · Range: 1–13 signs.
              </p>
            </div>
            <span className="text-xs text-ink/50">N = 179 seals</span>
          </div>

          <div className="mt-6 flex h-48 items-end gap-2 border-b border-ink/20 pb-2">
            {lengthBins.map((bin) => {
              const heightPct = (bin.count * 100) / maxBinCount;
              const isMeanBin = bin.length === 5 || bin.length === 6;
              const isOutlierBin = bin.length >= 10;
              return (
                <div key={bin.length} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isOutlierBin ? "#b45309" : isMeanBin ? "#047857" : "#a8a29e",
                    }}
                  />
                  <span className="mt-2 font-mono text-[10px] text-ink/75 group-hover:font-bold">
                    {bin.length}
                  </span>
                  <div className="absolute -top-7 hidden rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-paper group-hover:block">
                    {bin.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-ink/65">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded bg-moss" /> Modal range (5–6 signs: 72 seals)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded bg-amber-700" /> Outlier zone (≥ 10 signs: 8 seals)
            </span>
          </div>
        </section>

        {/* Viz 3: Positional Skew Profiles */}
        <section className="panel p-6" aria-labelledby="viz-positional">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <div>
              <h3 id="viz-positional" className="font-display text-base font-bold text-ink">
                3. Relative Positional Profiles (Early vs. Late Skew)
              </h3>
              <p className="text-xs text-ink/60">
                Mean relative position (0.0 = transcription start, 1.0 = transcription end).
              </p>
            </div>
            <Link
              href="/research/dashboard?tab=signs"
              className="text-xs font-semibold text-clay hover:underline"
            >
              Sign explorer →
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {positionalComparison.map((p) => {
              const relPos = p.meanRelativePosition;
              const isEarly = relPos < 0.45;
              const isLate = relPos > 0.65;
              return (
                <div key={p.signId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-ink">
                      {p.catalogueCode}{" "}
                      <span className="font-sans font-normal text-ink/55">({p.totalOccurrences} tokens)</span>
                    </span>
                    <span className="font-mono text-xs font-semibold text-ink">
                      {relPos.toFixed(2)}{" "}
                      <span className="text-[10px] text-ink/50">
                        ({isEarly ? "early skew" : isLate ? "late skew" : "medial"})
                      </span>
                    </span>
                  </div>
                  <div className="relative h-3 w-full rounded bg-ink/10">
                    <div
                      className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 rounded"
                      style={{
                        left: `${relPos * 100}%`,
                        backgroundColor: isEarly ? "#047857" : isLate ? "#b45309" : "#44403c",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-ink/10 pt-3 text-[11px] leading-relaxed text-ink/60">
            P324 appears disproportionately early (pos 1: 43 times; mean 0.32), whereas P122 appears disproportionately late (pos 4: 19 times; mean 0.69).
          </div>
        </section>

        {/* Viz 4: Top Sign Transitions */}
        <section className="panel p-6" aria-labelledby="viz-transitions">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <div>
              <h3 id="viz-transitions" className="font-display text-base font-bold text-ink">
                4. Dominant Directional Transitions (Adjacency)
              </h3>
              <p className="text-xs text-ink/60">
                Most frequent immediate successor transitions observed across sequences.
              </p>
            </div>
            <Link
              href="/research/dashboard?tab=transitions"
              className="text-xs font-semibold text-clay hover:underline"
            >
              Transition explorer →
            </Link>
          </div>

          <div className="mt-5 space-y-2.5">
            {topTransitions.map((pair) => {
              const pct = (pair.frequency * 100) / maxTransFreq;
              return (
                <Link
                  key={`${pair.sign1Code}-${pair.sign2Code}`}
                  href={`/research/dashboard?tab=transitions&pair=${pair.sign1Code}-${pair.sign2Code}`}
                  className="group flex items-center gap-3 rounded p-1 hover:bg-sandstone/25"
                >
                  <span className="w-24 font-mono text-xs font-bold text-ink group-hover:text-clay">
                    {pair.sign1Code} → {pair.sign2Code}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-ink/5">
                    <div
                      className="h-full rounded bg-moss transition-all group-hover:bg-ink"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-bold text-ink">
                    {pair.frequency}
                  </span>
                  <span className="w-14 text-right text-[10px] text-clay group-hover:underline">
                    View seals →
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 border-t border-ink/10 pt-3 text-[11px] text-ink/55">
            P122 followed immediately by P385 is the most frequent observed bigram in the corpus (29 instances).
          </div>
        </section>
      </div>

      {/* Explorer Entry Points Navigation Banner */}
      <section className="panel p-6" aria-labelledby="nav-explorers">
        <h3 id="nav-explorers" className="font-display text-lg font-bold text-ink">
          Interactive Evidence Explorers
        </h3>
        <p className="mt-1 text-xs text-ink/65">
          Select an analytical dimension below to trace computational observations directly back to the physical seals and sequences.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            href="/research/dashboard?tab=signs"
            className="flex flex-col justify-between rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay hover:bg-sandstone/25"
          >
            <div>
              <span className="text-xl">🔍</span>
              <p className="mt-2 font-display text-sm font-bold text-ink">Sign Explorer</p>
              <p className="mt-1 text-xs text-ink/60">
                Detailed profile, relative position &amp; underlying seals for any sign.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-clay">Explore signs →</span>
          </Link>

          <Link
            href="/research/dashboard?tab=transitions"
            className="flex flex-col justify-between rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay hover:bg-sandstone/25"
          >
            <div>
              <span className="text-xl">⇄</span>
              <p className="mt-2 font-display text-sm font-bold text-ink">Transition Explorer</p>
              <p className="mt-1 text-xs text-ink/60">
                Inspect predecessor &amp; successor sign transitions across all sequences.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-clay">Explore transitions →</span>
          </Link>

          <Link
            href="/research/dashboard?tab=motifs"
            className="flex flex-col justify-between rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay hover:bg-sandstone/25"
          >
            <div>
              <span className="text-xl">🧩</span>
              <p className="mt-2 font-display text-sm font-bold text-ink">Motif Explorer</p>
              <p className="mt-1 text-xs text-ink/60">
                Examine recurring trigrams, 4-grams and initial 2-sign sequences.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-clay">Explore motifs →</span>
          </Link>

          <Link
            href="/research/dashboard?tab=duplicates"
            className="flex flex-col justify-between rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay hover:bg-sandstone/25"
          >
            <div>
              <span className="text-xl">⧉</span>
              <p className="mt-2 font-display text-sm font-bold text-ink">Duplicate Explorer</p>
              <p className="mt-1 text-xs text-ink/60">
                Direct side-by-side comparison of exact duplicate &amp; near-duplicate sequences.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-clay">Explore duplicates →</span>
          </Link>

          <Link
            href="/research/dashboard?tab=outliers"
            className="flex flex-col justify-between rounded border border-ink/10 bg-sandstone/15 p-4 transition hover:border-clay hover:bg-sandstone/25"
          >
            <div>
              <span className="text-xl">⚡</span>
              <p className="mt-2 font-display text-sm font-bold text-ink">Outlier Explorer</p>
              <p className="mt-1 text-xs text-ink/60">
                Transparent inspection of statistical anomalies, long seals &amp; repetitions.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-clay">Explore outliers →</span>
          </Link>
        </div>
      </section>

      {/* Research Assistant Callout Banner */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded border border-ink/15 bg-sandstone/25 p-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-clay">Natural Language Query</span>
          <h4 className="mt-0.5 font-display text-base font-bold text-ink">Have a question about these patterns?</h4>
          <p className="mt-1 text-xs text-ink/70">
            Query sign frequencies, directional transitions, motifs, duplicates, and dataset boundaries using the Evidence-Grounded Research Assistant.
          </p>
        </div>
        <Link
          href="/research/assistant"
          className="rounded border border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper hover:bg-moss"
        >
          Ask Research Assistant →
        </Link>
      </section>
    </div>
  );
}
