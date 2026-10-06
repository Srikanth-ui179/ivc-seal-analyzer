import Link from "next/link";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { isDatabaseUnavailable } from "@/lib/db/client";
import { runDatasetAnalysis } from "@/lib/db/analysis-repository";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ datasetId?: string }>;
};

export default async function AnalyzePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedDatasetId = resolvedParams.datasetId;

  try {
    const report = await runDatasetAnalysis(requestedDatasetId);

    if (!report) {
      return (
        <div className="page-shell py-14 sm:py-20">
          <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
            ← Research & methodology
          </Link>
          <div className="mt-8 panel p-8">
            <h1 className="font-display text-3xl text-ink">No Frozen Dataset Available</h1>
            <p className="mt-3 text-sm text-ink/70">
              No frozen research dataset version was found to parameterize the analysis.
              Please verify that a frozen dataset exists in the database.
            </p>
            <div className="mt-6">
              <Link
                href="/research/datasets"
                className="inline-block bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-moss"
              >
                View dataset versions →
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const {
      dataset,
      coverage,
      signFrequencies,
      sequenceLengths,
      positionalFrequencies,
      adjacentPairs,
      positionProfiles,
      transitionProfiles,
      motifs,
      diversityAndRepetition,
      similarity,
      outliers,
    } = report;

    return (
      <div className="page-shell py-14 sm:py-20">
        {/* Navigation & Provenance Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
            ← Research & methodology
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink/60">
            <span>Parameterized by:</span>
            <Link
              href={`/research/datasets/${dataset.id}`}
              className="font-mono font-semibold text-clay hover:text-ink hover:underline"
            >
              {dataset.stableId}
            </Link>
            <span className="rounded border border-ink/15 bg-sandstone/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/75">
              {dataset.state}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow">Phase 2 · Reproducible Computational Sign Analysis</p>
          <h1 className="mt-3 display-title">Corpus Sign Analysis & Empirical Distributions</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
            Descriptive statistical observations computed directly from frozen dataset snapshots.
            Measurements describe observed formal distributions across machine-readable catalogue
            transcriptions without semantic, phonetic, or decipherment claims.
          </p>
        </div>

        {/* Methodological Boundary Safeguard */}
        <div className="mt-8 border-l-2 border-clay bg-sandstone/25 p-5 text-sm leading-6 text-ink/80">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-bold text-paper">
              !
            </span>
            <div>
              <p className="font-semibold text-ink">
                Research Transparency & Methodological Safeguards
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                <strong>Computational observations ≠ historical or linguistic interpretation.</strong>{" "}
                All statistics below are empirical counts of catalogue glyph codes and transcribed
                positions. They do not constitute translation, decipherment, language identification,
                phonetic values, or grammatical assignments.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/10 pt-2.5 text-xs text-ink/65">
                <span>
                  <strong>Dataset snapshot:</strong> {dataset.name} ({dataset.stableId})
                </span>
                <span>
                  <strong>Selection criteria:</strong> {dataset.selectionCriteria}
                </span>
                {dataset.frozenAt && (
                  <span>
                    <strong>Frozen timestamp:</strong>{" "}
                    {new Date(dataset.frozenAt).toISOString().split("T")[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Research Dashboard Callout */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded border border-ink/15 bg-sandstone/15 p-4 text-xs">
          <div>
            <span className="font-semibold text-ink">Interactive Visual Exploration Available:</span>{" "}
            <span className="text-ink/75">
              Explore signs, directional transitions, motifs, duplicates, and outliers with direct seal-by-seal evidence traceability in the Research Dashboard.
            </span>
          </div>
          <Link
            href="/research/dashboard"
            className="rounded border border-ink bg-ink px-3 py-1.5 font-semibold text-paper hover:bg-moss"
          >
            Open Research Dashboard →
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* M5. CORPUS COVERAGE (MUST APPEAR FIRST ON THE ANALYSIS PAGE)              */}
        {/* ========================================================================= */}
        <section className="mt-14" aria-labelledby="coverage-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="coverage-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                1. Corpus & Identification Coverage
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M5
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Coverage must be established before presenting distributional metrics. Identifies
              the proportion of tokens usable for primary analysis versus tentative, unidentified,
              or damaged forms.
            </p>
          </div>

          {/* Headline Metric Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="panel p-5">
              <span className="data-label block">Inscriptions</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {coverage.totalInscriptions.toLocaleString()}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Inscribed surfaces</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Primary Sequences</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {coverage.totalSequences.toLocaleString()}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Transcribed lines</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Sign Tokens</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {coverage.totalOccurrences.toLocaleString()}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Total character occurrences</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Distinct Sign Types</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {coverage.distinctSigns.toLocaleString()}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Parpola/CISI codes</span>
            </div>
          </div>

          {/* Coverage Tables */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Token Identification Status */}
            <div className="panel p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Token Identification Status
              </h3>
              <p className="mt-1 text-xs text-ink/65">
                Distribution of sign occurrences by epigraphic certainty status.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Sign occurrence identification status coverage</caption>
                  <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Occurrences</th>
                      <th className="px-3 py-2 text-right">Coverage</th>
                      <th className="px-3 py-2">Analysis Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {coverage.identificationStatuses.map((row) => (
                      <tr key={row.status} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2.5 font-mono font-medium capitalize text-ink">
                          {row.status}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-ink/75">
                          {row.percentage.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2.5 text-ink/65">
                          {row.status === "identified"
                            ? "Included in primary distributions"
                            : "Excluded from primary distributions"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sequence Completeness Status */}
            <div className="panel p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Sequence Completeness Coverage
              </h3>
              <p className="mt-1 text-xs text-ink/65">
                Catalogue recording of sequence boundary integrity.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Sequence completeness coverage breakdown</caption>
                  <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Completeness Status</th>
                      <th className="px-3 py-2 text-right">Sequences</th>
                      <th className="px-3 py-2 text-right">Coverage</th>
                      <th className="px-3 py-2">Impact on Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {coverage.completenessStatuses.map((row) => (
                      <tr key={row.status} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2.5 font-mono font-medium capitalize text-ink">
                          {row.status.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-ink/75">
                          {row.percentage.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2.5 text-ink/65">
                          {row.status === "complete"
                            ? "Eligible for terminal-position frequency"
                            : "Excluded from terminal-position frequency"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M1. SIGN FREQUENCY DISTRIBUTION                                           */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m1-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m1-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                2. Sign Frequency Distribution
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M1
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Ranked frequency of verified sign types across the dataset. Primary distribution is
              restricted strictly to <code>identification_status = &apos;identified&apos;</code> tokens
              ({signFrequencies.totalIdentifiedTokens.toLocaleString()} tokens).
            </p>
          </div>

          {/* Primary Identified Distribution Table */}
          <div className="mt-6 panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Identified Signs ({signFrequencies.identified.length} distinct types)
                </h3>
                <p className="mt-1 text-xs text-ink/60">
                  Total identified tokens: {signFrequencies.totalIdentifiedTokens.toLocaleString()}
                </p>
              </div>
              <div className="text-xs text-ink/60">
                Top sign accounts for{" "}
                <strong className="text-ink">
                  {signFrequencies.identified[0]?.percentage.toFixed(2)}%
                </strong>{" "}
                of all identified occurrences
              </div>
            </div>

            <div className="mt-4 max-h-[500px] overflow-y-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Ranked sign frequency distribution for identified signs
                </caption>
                <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3">Catalogue Code</th>
                    <th className="px-4 py-3">Visual Label</th>
                    <th className="px-4 py-3 text-right">Occurrences</th>
                    <th className="px-4 py-3 text-right">Corpus Share</th>
                    <th className="px-4 py-3 text-right">Catalogue Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {signFrequencies.identified.map((sign) => (
                    <tr key={sign.signId} className="hover:bg-sandstone/10">
                      <td className="px-4 py-2.5 text-center font-mono text-ink/60">
                        #{sign.rank}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-ink">
                        {sign.catalogueCode}
                      </td>
                      <td className="px-4 py-2.5 font-display text-sm text-ink/80">
                        {sign.visualLabel}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-ink">
                        {sign.frequency.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-ink/75">
                        {sign.percentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/sign-catalogue/${sign.signId}`}
                          className="font-semibold text-clay hover:text-ink hover:underline"
                        >
                          View sign →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Identified Tokens Separate Coverage Panel */}
          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Non-Identified Token Coverage (Separate Record)
            </h3>
            <p className="mt-1 text-xs text-ink/65">
              Tokens excluded from the primary frequency distribution due to epigraphic uncertainty,
              breakage, or incomplete preservation.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Coverage of non-identified tokens</caption>
                <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2 text-right">Count</th>
                    <th className="px-3 py-2 text-right">Share of Non-Identified Tokens</th>
                    <th className="px-3 py-2">Status in Current Dataset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {signFrequencies.nonIdentified.map((cat) => (
                    <tr key={cat.status} className="hover:bg-sandstone/10">
                      <td className="px-3 py-2 font-mono font-medium capitalize text-ink">
                        {cat.status}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                        {cat.count}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/75">
                        {cat.percentage.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-ink/65">
                        {cat.count === 0
                          ? "0 recorded occurrences in this snapshot"
                          : "Excluded from primary counts"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M2. SEQUENCE LENGTH DISTRIBUTION                                          */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m2-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m2-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                3. Sequence Length Distribution
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M2
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Statistical summary of inscription line lengths (number of sign occurrences per primary
              sequence). Separates complete, incomplete, and unrecorded sequences.
            </p>
          </div>

          {/* Descriptive Statistics Metric Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="panel p-5">
              <span className="data-label block">Minimum Length</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {sequenceLengths.overall.min}
              </span>
              <span className="mt-1 block text-xs text-ink/55">signs</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Maximum Length</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {sequenceLengths.overall.max}
              </span>
              <span className="mt-1 block text-xs text-ink/55">signs</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Median Length</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {sequenceLengths.overall.median}
              </span>
              <span className="mt-1 block text-xs text-ink/55">50th percentile</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Mean Length</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {sequenceLengths.overall.mean.toFixed(2)}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Arithmetic mean</span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Std. Deviation</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {sequenceLengths.overall.stdDev.toFixed(2)}
              </span>
              <span className="mt-1 block text-xs text-ink/55">Sample standard deviation</span>
            </div>
          </div>

          {/* Completeness Separation Table */}
          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Sequence Length by Completeness Category
            </h3>
            <p className="mt-1 text-xs text-ink/65">
              Comparison across complete, incomplete, and unrecorded sequence subsets.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Sequence length statistics by completeness</caption>
                <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2 text-right">Sequences</th>
                    <th className="px-3 py-2 text-right">Min</th>
                    <th className="px-3 py-2 text-right">Max</th>
                    <th className="px-3 py-2 text-right">Median</th>
                    <th className="px-3 py-2 text-right">Mean</th>
                    <th className="px-3 py-2 text-right">Std Dev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  <tr className="hover:bg-sandstone/10">
                    <td className="px-3 py-2.5 font-medium text-ink">Complete Sequences</td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count > 0 ? sequenceLengths.complete.min : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count > 0 ? sequenceLengths.complete.max : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count > 0 ? sequenceLengths.complete.median : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count > 0 ? sequenceLengths.complete.mean : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.complete.count > 0 ? sequenceLengths.complete.stdDev : "—"}
                    </td>
                  </tr>
                  <tr className="hover:bg-sandstone/10">
                    <td className="px-3 py-2.5 font-medium text-ink">Incomplete Sequences</td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count > 0 ? sequenceLengths.incomplete.min : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count > 0 ? sequenceLengths.incomplete.max : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count > 0 ? sequenceLengths.incomplete.median : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count > 0 ? sequenceLengths.incomplete.mean : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.incomplete.count > 0 ? sequenceLengths.incomplete.stdDev : "—"}
                    </td>
                  </tr>
                  <tr className="hover:bg-sandstone/10">
                    <td className="px-3 py-2.5 font-medium text-ink">
                      Completeness Unrecorded (Current Dataset)
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                      {sequenceLengths.notRecorded.count}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.notRecorded.min}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.notRecorded.max}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.notRecorded.median}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.notRecorded.mean.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink">
                      {sequenceLengths.notRecorded.stdDev.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {sequenceLengths.complete.count === 0 && (
              <p className="mt-3 text-[11px] leading-relaxed text-ink/60">
                <em>Note:</em> All {sequenceLengths.overall.count} sequences in this dataset snapshot
                have completeness designated <code>not_recorded</code> in the source digitization.
              </p>
            )}
          </div>

          {/* Histogram Table */}
          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Sequence Length Frequency Table
            </h3>
            <p className="mt-1 text-xs text-ink/65">
              Counts and percentages for each observed inscription length.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Histogram of sequence lengths</caption>
                <thead className="border-b border-ink/10 bg-sandstone/20 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-2.5">Length (Signs)</th>
                    <th className="px-4 py-2.5 text-right">Sequences</th>
                    <th className="px-4 py-2.5 text-right">Percentage</th>
                    <th className="px-4 py-2.5">Relative Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {sequenceLengths.histogram.map((bin) => (
                    <tr key={bin.length} className="hover:bg-sandstone/10">
                      <td className="px-4 py-2 font-mono font-bold text-ink">
                        {bin.length} {bin.length === 1 ? "sign" : "signs"}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-ink">
                        {bin.count}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-ink/75">
                        {bin.percentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 max-w-[200px] overflow-hidden rounded bg-ink/10">
                            <div
                              className="h-full bg-clay"
                              style={{ width: `${Math.min(bin.percentage * 3.5, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-ink/50">
                            {bin.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M3. FIRST-POSITION AND TERMINAL-POSITION FREQUENCY                        */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m3-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m3-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                4. Positional Frequency: First & Terminal Positions
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M3
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Frequency of signs occurring at sequence boundaries. First-position is based on
              source-recorded <code>position_index = 1</code>. Terminal-position is gated strictly to
              complete sequences.
            </p>
          </div>

          {/* Epigraphic Safeguard on Reading Direction */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              Methodological Guardrail: Source-Recorded Order ≠ Inferred Reading Direction
            </p>
            <p className="mt-1 text-ink/70">
              In this database, <strong>Position 1</strong> represents the first sign recorded in the
              source catalogue transcription (Right-to-Left order as recorded in CISI/Parpola).
              It does <strong>not</strong> establish an archaeological or linguistic reading direction.
              Positional indices reflect catalogue recording sequence only.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* First-Position Signs Table */}
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    First-Position Signs ({positionalFrequencies.firstPositions.length} distinct types)
                  </h3>
                  <p className="mt-1 text-xs text-ink/60">
                    Source-recorded position_index = 1 ({positionalFrequencies.totalFirstPositionTokens} total)
                  </p>
                </div>
              </div>

              <div className="mt-4 max-h-[400px] overflow-y-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">First-position sign frequency distribution</caption>
                  <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2 text-center">Rank</th>
                      <th className="px-3 py-2">Sign Code</th>
                      <th className="px-3 py-2">Label</th>
                      <th className="px-3 py-2 text-right">Count</th>
                      <th className="px-3 py-2 text-right">Initial Share</th>
                      <th className="px-3 py-2 text-right">Sign Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {positionalFrequencies.firstPositions.map((sign) => (
                      <tr key={sign.signId} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2 text-center font-mono text-ink/60">
                          #{sign.rank}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-ink">
                          {sign.catalogueCode}
                        </td>
                        <td className="px-3 py-2 font-display text-ink/75">
                          {sign.visualLabel}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                          {sign.frequency}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-ink/75">
                          {sign.percentage.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            href={`/sign-catalogue/${sign.signId}`}
                            className="font-semibold text-clay hover:text-ink hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terminal-Position Safeguarded Panel */}
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Terminal-Position Frequency
                  </h3>
                  <p className="mt-1 text-xs text-ink/60">
                    Gated strictly to source_completeness = &apos;complete&apos;
                  </p>
                </div>
                <span className="rounded bg-sandstone/40 px-2 py-0.5 text-[10px] font-mono text-ink/70">
                  {positionalFrequencies.completeSequencesCount} complete sequences
                </span>
              </div>

              {positionalFrequencies.completeSequencesCount > 0 ? (
                <div className="mt-4 max-h-[400px] overflow-y-auto rounded border border-ink/10 bg-paper">
                  <table className="w-full text-left text-xs">
                    <caption className="sr-only">Terminal-position sign frequency distribution</caption>
                    <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                      <tr>
                        <th className="px-3 py-2 text-center">Rank</th>
                        <th className="px-3 py-2">Sign Code</th>
                        <th className="px-3 py-2">Label</th>
                        <th className="px-3 py-2 text-right">Count</th>
                        <th className="px-3 py-2 text-right">Terminal Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {positionalFrequencies.terminalPositions.map((sign) => (
                        <tr key={sign.signId} className="hover:bg-sandstone/10">
                          <td className="px-3 py-2 text-center font-mono text-ink/60">
                            #{sign.rank}
                          </td>
                          <td className="px-3 py-2 font-mono font-bold text-ink">
                            {sign.catalogueCode}
                          </td>
                          <td className="px-3 py-2 font-display text-ink/75">
                            {sign.visualLabel}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                            {sign.frequency}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-ink/75">
                            {sign.percentage.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded border border-ink/10 bg-sandstone/20 p-5 text-xs leading-relaxed text-ink/75">
                  <p className="font-semibold text-ink">
                    Measurement Unavailable: No Sequences Marked &apos;complete&apos; in Current Snapshot
                  </p>
                  <p className="mt-2 text-ink/70">
                    Terminal-position analysis is unavailable because the corpus currently has no sequences
                    marked <code>source_completeness = &apos;complete&apos;</code>.
                  </p>
                  <p className="mt-2 text-ink/70">
                    Under V2.2 research safeguards, terminal sign frequency is strictly gated to verified complete
                    inscriptions to prevent truncated or broken seal edges from skewing terminal sign statistics.
                    In this dataset snapshot (<code>{dataset.stableId}</code>), all {sequenceLengths.overall.count}{" "}
                    sequences currently have completeness recorded as <code>not_recorded</code> in the source digitization.
                  </p>
                  <p className="mt-2 text-ink/70">
                    <em>Methodological note:</em> This does not indicate that inscriptions lack terminal signs; rather,
                    terminal-position frequencies are deliberately withheld from reporting until epigraphic completeness
                    is verified in a future corpus release.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M4. ADJACENT SIGN-PAIR FREQUENCY                                          */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m4-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m4-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                5. Adjacent Sign-Pair Frequency
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M4
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Empirical co-occurrence counts of directly adjacent sign positions (
              <code>pos</code> followed immediately by <code>pos + 1</code>). Both signs must be
              identified. A gap or damaged sign breaks the pair.
            </p>
          </div>

          {/* Threshold Specification Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded border border-ink/10 bg-sandstone/15 p-4 text-xs">
            <div>
              <span className="font-semibold text-ink">Filtering Threshold:</span>{" "}
              <span className="text-ink/70">
                Displaying only adjacent sign pairs occurring at least {adjacentPairs.threshold} times
                (frequency ≥ {adjacentPairs.threshold}).
              </span>
            </div>
            <div className="font-mono text-ink/75">
              {adjacentPairs.totalQualifyingPairs} qualifying pairs meeting threshold
            </div>
          </div>

          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Frequent Adjacent Sign Pairs (Frequency ≥ {adjacentPairs.threshold})
            </h3>
            <p className="mt-1 text-xs text-ink/60">
              Ordered by empirical occurrence frequency. Represents contiguous transcription bigrams,
              not grammatical or lexical compounds.
            </p>

            <div className="mt-4 max-h-[500px] overflow-y-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Frequency table of adjacent sign pairs occurring at least twice
                </caption>
                <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3">Preceding Sign (pos)</th>
                    <th className="px-4 py-3">Succeeding Sign (pos + 1)</th>
                    <th className="px-4 py-3 text-right">Co-occurrence Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {adjacentPairs.pairs.map((pair) => (
                    <tr
                      key={`${pair.sign1Code}-${pair.sign2Code}`}
                      className="hover:bg-sandstone/10"
                    >
                      <td className="px-4 py-2.5 text-center font-mono text-ink/60">
                        #{pair.rank}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-ink">
                        {pair.sign1Code}
                        {pair.sign1Label && pair.sign1Label !== pair.sign1Code && (
                          <span className="ml-1.5 font-sans font-normal text-ink/60">
                            ({pair.sign1Label})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-ink">
                        {pair.sign2Code}
                        {pair.sign2Label && pair.sign2Label !== pair.sign2Code && (
                          <span className="ml-1.5 font-sans font-normal text-ink/60">
                            ({pair.sign2Label})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-ink">
                        {pair.frequency.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M6. SIGN POSITIONAL PROFILES & NORMALIZED RELATIVE POSITION               */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m6-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m6-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                6. Sign Positional Profiles & Relative Distributions
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M6
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Empirical distribution of sign occurrences across transcription positions. Evaluates
              whether signs concentrate near the beginning, middle, or end of source sequences.
            </p>
          </div>

          {/* Research Guardrail: Positional Descriptive Statistics */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              What This Shows: Formal Structural Positions ≠ Grammatical Roles
            </p>
            <p className="mt-1 text-ink/70">
              This analysis describes where signs occur within source-recorded sequences.
              Normalized relative position is calculated as{" "}
              <code>position_index / sequence_length</code> for sequences of length ≥ 2.
              Values near 0 indicate a tendency to appear early in the catalogue transcription;
              values near 1 indicate a tendency to appear near sequence termination.
              This is a descriptive mathematical property of catalogue transcriptions and does{" "}
              <strong>not</strong> imply grammatical function (such as &quot;prefix&quot; or
              &quot;suffix&quot; status).
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded border border-ink/10 bg-sandstone/15 p-4 text-xs">
            <div>
              <span className="font-semibold text-ink">Filtering Threshold:</span>{" "}
              <span className="text-ink/70">
                Displaying signs with at least {positionProfiles.threshold} identified occurrences
                across the dataset snapshot.
              </span>
            </div>
            <div className="font-mono text-ink/75">
              {positionProfiles.totalProfiles} qualifying sign types meeting threshold
            </div>
          </div>

          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Positional Distribution Table (Threshold ≥ {positionProfiles.threshold} occurrences)
            </h3>
            <p className="mt-1 text-xs text-ink/60">
              Absolute position counts (positions 1 through 5+) and normalized relative position
              statistics (mean ± sample standard deviation).
            </p>

            <div className="mt-4 max-h-[500px] overflow-y-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Sign positional distribution and normalized relative position summary
                </caption>
                <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-3 py-2.5">Sign Code</th>
                    <th className="px-3 py-2.5">Label</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                    <th className="px-3 py-2.5 text-right">Pos 1</th>
                    <th className="px-3 py-2.5 text-right">Pos 2</th>
                    <th className="px-3 py-2.5 text-right">Pos 3</th>
                    <th className="px-3 py-2.5 text-right">Pos 4</th>
                    <th className="px-3 py-2.5 text-right">Pos 5+</th>
                    <th className="px-3 py-2.5">Relative Position (0.0=Start → 1.0=End)</th>
                    <th className="px-3 py-2.5 text-right">Catalogue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {positionProfiles.profiles.map((profile) => (
                    <tr key={profile.signId} className="hover:bg-sandstone/10">
                      <td className="px-3 py-2 font-mono font-bold text-ink">
                        {profile.catalogueCode}
                      </td>
                      <td className="px-3 py-2 font-display text-ink/75">
                        {profile.visualLabel}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                        {profile.totalOccurrences}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/70">
                        {profile.pos1}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/70">
                        {profile.pos2}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/70">
                        {profile.pos3}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/70">
                        {profile.pos4}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-ink/70">
                        {profile.pos5Plus}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 w-28 overflow-hidden rounded bg-ink/10">
                            <div
                              className="absolute top-0 bottom-0 w-2.5 rounded-full bg-clay"
                              style={{
                                left: `${Math.min(
                                  Math.max(profile.meanRelativePosition * 100 - 4, 0),
                                  90
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs text-ink/80">
                            {profile.meanRelativePosition.toFixed(3)}
                          </span>
                          <span className="font-mono text-[10px] text-ink/45">
                            (±{profile.stdDevRelativePosition.toFixed(3)})
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/sign-catalogue/${profile.signId}`}
                          className="font-semibold text-clay hover:text-ink hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M7. SIGN TRANSITION PROFILES: SUCCESSORS & PREDECESSORS                   */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m7-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m7-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                7. Sign Transition Profiles: Immediate Predecessors & Successors
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M7
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Empirical direct adjacency transitions for high-frequency signs across the dataset.
              Reports the most frequent immediately preceding signs and succeeding signs.
            </p>
          </div>

          {/* Research Guardrail: Transitions */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              What This Shows: Immediate Transcription Transitions ≠ Syntax
            </p>
            <p className="mt-1 text-ink/70">
              For each high-frequency sign (frequency ≥ {transitionProfiles.threshold}), this panel
              displays the most common immediate predecessors (pos - 1) and successors (pos + 1).
              Transition shares are conditioned strictly on positions where a transition is
              possible (excluding boundary positions where no predecessor or successor exists).
              These observe transcribed co-occurrences and do <strong>not</strong> establish
              grammatical dependency, phonetic ligature, or morphological compounding.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {transitionProfiles.profiles.map((profile) => (
              <div key={profile.targetCode} className="panel p-5">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <div>
                    <span className="font-mono text-base font-bold text-ink">
                      {profile.targetCode}
                    </span>
                    {profile.targetLabel && profile.targetLabel !== profile.targetCode && (
                      <span className="ml-2 font-display text-xs text-ink/65">
                        ({profile.targetLabel})
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-ink/60">
                    {profile.totalOccurrences} total occurrences
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* Immediate Predecessors */}
                  <div>
                    <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70">
                      Preceding Signs (pos - 1)
                    </h4>
                    <p className="text-[10px] text-ink/50">
                      Denominator: {profile.occurrencesWithPredecessor} non-initial occurrences
                    </p>
                    <div className="mt-2 overflow-hidden rounded border border-ink/10 bg-paper">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-ink/10 bg-sandstone/20 text-[10px] font-semibold text-ink">
                          <tr>
                            <th className="px-2 py-1.5">Sign</th>
                            <th className="px-2 py-1.5 text-right">Count</th>
                            <th className="px-2 py-1.5 text-right">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                          {profile.topPredecessors.length > 0 ? (
                            profile.topPredecessors.map((pred) => (
                              <tr key={pred.neighborCode}>
                                <td className="px-2 py-1.5 font-mono text-ink">
                                  {pred.neighborCode}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono font-bold text-ink">
                                  {pred.cooccurrenceCount}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono text-ink/70">
                                  {pred.transitionProbability}%
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-2 py-2 text-center text-ink/50">
                                No observed predecessors
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Immediate Successors */}
                  <div>
                    <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70">
                      Succeeding Signs (pos + 1)
                    </h4>
                    <p className="text-[10px] text-ink/50">
                      Denominator: {profile.occurrencesWithSuccessor} non-terminal occurrences
                    </p>
                    <div className="mt-2 overflow-hidden rounded border border-ink/10 bg-paper">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-ink/10 bg-sandstone/20 text-[10px] font-semibold text-ink">
                          <tr>
                            <th className="px-2 py-1.5">Sign</th>
                            <th className="px-2 py-1.5 text-right">Count</th>
                            <th className="px-2 py-1.5 text-right">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                          {profile.topSuccessors.length > 0 ? (
                            profile.topSuccessors.map((succ) => (
                              <tr key={succ.neighborCode}>
                                <td className="px-2 py-1.5 font-mono text-ink">
                                  {succ.neighborCode}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono font-bold text-ink">
                                  {succ.cooccurrenceCount}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono text-ink/70">
                                  {succ.transitionProbability}%
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-2 py-2 text-center text-ink/50">
                                No observed successors
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M8. CONTIGUOUS SEQUENCE MOTIFS & RECURRING INITIAL SEQUENCES              */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m8-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m8-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                8. Contiguous Sequence Motifs & Recurring Initial Combinations
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M8
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Contiguous multi-sign combinations occurring repeatedly across the corpus.
              Identifies structural bigrams, trigrams, and 4-grams with frequency ≥ {motifs.threshold}.
            </p>
          </div>

          {/* Research Guardrail: Motifs */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              What This Shows: Multi-Sign Formal Motifs ≠ Words or Compounds
            </p>
            <p className="mt-1 text-ink/70">
              Recurring subsequences are formal transcription patterns observed across multiple
              inscribed artefacts. They do <strong>not</strong> demonstrate words, morphemes,
              or fixed lexical entries. Contiguous motifs require verified identified tokens across
              all positions.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Recurring Initial Combinations */}
            <div className="panel p-5">
              <div className="border-b border-ink/10 pb-2">
                <h3 className="font-display text-base font-bold text-ink">
                  Recurring Initial Combinations (Pos 1 → 2)
                </h3>
                <p className="text-[11px] text-ink/60">
                  {motifs.initialPatterns.length} patterns occurring ≥ {motifs.threshold} times
                </p>
              </div>
              <div className="mt-3 max-h-[400px] overflow-y-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Pattern</th>
                      <th className="px-3 py-2 text-right">Occurrences</th>
                      <th className="px-3 py-2">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {motifs.initialPatterns.map((pat) => (
                      <tr key={pat.motif} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2 font-mono font-bold text-ink">
                          {pat.motif}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                          {pat.occurrenceCount}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {pat.exampleInscriptions.map((id) => (
                              <Link
                                key={id}
                                href={`/explorer/${id}`}
                                className="rounded bg-sandstone/30 px-1 py-0.5 font-mono text-[10px] text-clay hover:underline"
                              >
                                {id.replace("INS-CISI-", "")}
                              </Link>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recurring Contiguous Trigrams */}
            <div className="panel p-5">
              <div className="border-b border-ink/10 pb-2">
                <h3 className="font-display text-base font-bold text-ink">
                  Recurring Trigrams (Length 3)
                </h3>
                <p className="text-[11px] text-ink/60">
                  {motifs.trigrams.length} 3-sign motifs occurring ≥ {motifs.threshold} times
                </p>
              </div>
              <div className="mt-3 max-h-[400px] overflow-y-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Motif</th>
                      <th className="px-3 py-2 text-right">Count</th>
                      <th className="px-3 py-2">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {motifs.trigrams.map((tri) => (
                      <tr key={tri.motif} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2 font-mono font-bold text-ink">
                          {tri.motif}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                          {tri.occurrenceCount}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {tri.exampleInscriptions.map((id) => (
                              <Link
                                key={id}
                                href={`/explorer/${id}`}
                                className="rounded bg-sandstone/30 px-1 py-0.5 font-mono text-[10px] text-clay hover:underline"
                              >
                                {id.replace("INS-CISI-", "")}
                              </Link>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recurring Contiguous 4-Grams */}
            <div className="panel p-5">
              <div className="border-b border-ink/10 pb-2">
                <h3 className="font-display text-base font-bold text-ink">
                  Recurring 4-Grams (Length 4)
                </h3>
                <p className="text-[11px] text-ink/60">
                  {motifs.fourgrams.length} 4-sign motifs occurring ≥ {motifs.threshold} times
                </p>
              </div>
              <div className="mt-3 max-h-[400px] overflow-y-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Motif</th>
                      <th className="px-3 py-2 text-right">Count</th>
                      <th className="px-3 py-2">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {motifs.fourgrams.map((four) => (
                      <tr key={four.motif} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2 font-mono font-bold text-ink">
                          {four.motif}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-ink">
                          {four.occurrenceCount}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {four.exampleInscriptions.map((id) => (
                              <Link
                                key={id}
                                href={`/explorer/${id}`}
                                className="rounded bg-sandstone/30 px-1 py-0.5 font-mono text-[10px] text-clay hover:underline"
                              >
                                {id.replace("INS-CISI-", "")}
                              </Link>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Completeness Restriction on Terminal Patterns */}
          <div className="mt-6 rounded border border-ink/10 bg-sandstone/20 p-4 text-xs leading-relaxed text-ink/75">
            <p className="font-semibold text-ink">
              Methodological Note on Terminal-Pattern Analysis:
            </p>
            <p className="mt-1 text-ink/70">
              Terminal-pattern analysis cannot be treated as complete because sequence boundary
              completeness is designated <code>not_recorded</code> across all 179 sequences in this
              dataset snapshot. While initial combinations (starting at position 1) are preserved,
              terminal patterns are not isolated as certified sequence endings until source completeness
              is verified in future corpus releases.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M9. SEQUENCE DIVERSITY & INTERNAL SIGN REPETITION                         */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m9-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m9-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                9. Sequence Diversity & Internal Sign Repetition
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurement M9
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Structural analysis of sign variety and internal repetition within individual inscription sequences.
            </p>
          </div>

          {/* Research Guardrail: Diversity */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              What This Shows: Structural Repetition ≠ Grammatical Reduplication
            </p>
            <p className="mt-1 text-ink/70">
              Measures the degree to which individual sequences contain repeated instances of the same
              sign. The majority of Indus inscriptions in this snapshot exhibit high sign variety
              (zero internal repeats). Signs that repeat within a single sequence are documented as
              formal structural features, without asserting grammatical reduplication or semantic emphasis.
            </p>
          </div>

          {/* Headline Diversity Metric Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="panel p-5">
              <span className="data-label block">Unique-Sign Sequences</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {diversityAndRepetition.diversityStats.zeroRepetitionCount}
              </span>
              <span className="mt-1 block text-xs text-ink/55">
                {(
                  (diversityAndRepetition.diversityStats.zeroRepetitionCount * 100) /
                  diversityAndRepetition.diversityStats.totalSequences
                ).toFixed(1)}
                % of sequences (zero repeats)
              </span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Sequences with Repetition</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {diversityAndRepetition.diversityStats.withRepetitionCount}
              </span>
              <span className="mt-1 block text-xs text-ink/55">
                {(
                  (diversityAndRepetition.diversityStats.withRepetitionCount * 100) /
                  diversityAndRepetition.diversityStats.totalSequences
                ).toFixed(1)}
                % contain repeated signs
              </span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Multiple Duplicate Signs</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {diversityAndRepetition.diversityStats.highRepetitionCount}
              </span>
              <span className="mt-1 block text-xs text-ink/55">
                Sequence with ≥ 2 duplicate tokens
              </span>
            </div>
            <div className="panel p-5">
              <span className="data-label block">Mean Diversity Ratio</span>
              <span className="mt-2 block font-display text-3xl font-bold text-ink">
                {diversityAndRepetition.diversityStats.meanDiversityRatio.toFixed(3)}
              </span>
              <span className="mt-1 block text-xs text-ink/55">
                Distinct signs / sequence length
              </span>
            </div>
          </div>

          {/* Signs with Internal Repetition Table */}
          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Signs Exhibiting Internal Repetition Within Individual Sequences
            </h3>
            <p className="mt-1 text-xs text-ink/60">
              Signs that occur more than once on the same inscribed surface.
            </p>

            <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Signs occurring multiple times within individual inscriptions
                </caption>
                <thead className="border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-3">Sign Code</th>
                    <th className="px-4 py-3">Visual Label</th>
                    <th className="px-4 py-3 text-right">Inscriptions with Repetition</th>
                    <th className="px-4 py-3 text-right">Max Repeats in One Sequence</th>
                    <th className="px-4 py-3">Example Inscriptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {diversityAndRepetition.repeatedSigns.map((sign) => (
                    <tr key={sign.catalogueCode} className="hover:bg-sandstone/10">
                      <td className="px-4 py-2.5 font-mono font-bold text-ink">
                        {sign.catalogueCode}
                      </td>
                      <td className="px-4 py-2.5 font-display text-ink/75">
                        {sign.visualLabel}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-ink">
                        {sign.inscriptionsWithRepetition}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-ink/70">
                        {sign.maxInSingleSequence}×
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {sign.exampleInscriptions.map((id) => (
                            <Link
                              key={id}
                              href={`/explorer/${id}`}
                              className="rounded bg-sandstone/30 px-1.5 py-0.5 font-mono text-[10px] text-clay hover:underline"
                            >
                              {id.replace("INS-CISI-", "")}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* M10 & M11. SEQUENCE SIMILARITY, DUPLICATES & STRUCTURAL OUTLIERS          */}
        {/* ========================================================================= */}
        <section className="mt-16" aria-labelledby="m10-heading">
          <div className="border-b border-ink/15 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="m10-heading" className="font-display text-2xl font-bold text-ink sm:text-3xl">
                10. Sequence Duplicates, Near-Duplicates & Structural Outliers
              </h2>
              <span className="rounded bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                Measurements M10 & M11
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">
              Empirical identification of identical sequences, near-duplicates (Levenshtein edit
              distance = 1 on sequences of length ≥ 3), and measurable mathematical outliers.
            </p>
          </div>

          {/* Research Guardrail: Similarity and Outliers */}
          <div className="mt-6 border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">
              What This Shows: String Similarity & Statistical Outliers ≠ Scribal Errors
            </p>
            <p className="mt-1 text-ink/70">
              Exact duplicates document inscribed surfaces sharing the identical recorded sequence.
              Near-duplicates document sequences differing by exactly one sign substitution,
              insertion, or deletion under Levenshtein edit distance. These represent formal textual
              similarities in published transcriptions, not proven dialectal variations or scribal
              slips. All outliers are classified by transparent, measurable criteria.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Exact Duplicate Sequences */}
            <div className="panel p-5">
              <h3 className="font-display text-base font-bold text-ink">
                Exact Sequence Duplicates ({similarity.exactDuplicates.length} recurring sequences)
              </h3>
              <p className="mt-1 text-xs text-ink/60">
                Inscriptions containing completely identical sign sequences.
              </p>

              <div className="mt-3 overflow-x-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Identical Sequence</th>
                      <th className="px-3 py-2 text-right">Length</th>
                      <th className="px-3 py-2 text-right">Count</th>
                      <th className="px-3 py-2">Matching Inscriptions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {similarity.exactDuplicates.map((dupe) => (
                      <tr key={dupe.signSequence} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2.5 font-mono font-bold text-ink">
                          {dupe.signSequence}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                          {dupe.length}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                          {dupe.count}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {dupe.inscriptions.map((id) => (
                              <Link
                                key={id}
                                href={`/explorer/${id}`}
                                className="rounded bg-sandstone/30 px-1.5 py-0.5 font-mono text-[10px] text-clay hover:underline"
                              >
                                {id.replace("INS-CISI-", "")}
                              </Link>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Near-Duplicate Sequence Pairs */}
            <div className="panel p-5">
              <h3 className="font-display text-base font-bold text-ink">
                Near-Duplicate Sequences (Levenshtein Distance = 1, Length ≥ 3)
              </h3>
              <p className="mt-1 text-xs text-ink/60">
                {similarity.nearDuplicates.length} pairs differing by exactly one sign substitution,
                insertion, or deletion.
              </p>

              <div className="mt-3 max-h-[350px] overflow-y-auto rounded border border-ink/10 bg-paper">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                    <tr>
                      <th className="px-3 py-2">Pair</th>
                      <th className="px-3 py-2">Sequences</th>
                      <th className="px-3 py-2 text-right">Edit Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {similarity.nearDuplicates.map((pair, idx) => (
                      <tr key={idx} className="hover:bg-sandstone/10">
                        <td className="px-3 py-2 font-mono text-[11px] text-ink">
                          <Link
                            href={`/explorer/${pair.inscription1}`}
                            className="text-clay hover:underline"
                          >
                            {pair.inscription1.replace("INS-CISI-", "")}
                          </Link>{" "}
                          ↔{" "}
                          <Link
                            href={`/explorer/${pair.inscription2}`}
                            className="text-clay hover:underline"
                          >
                            {pair.inscription2.replace("INS-CISI-", "")}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-ink/80">
                          <div>1: {pair.seq1}</div>
                          <div className="text-ink/60">2: {pair.seq2}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="rounded bg-sandstone/40 px-1.5 py-0.5 font-mono text-[10px] capitalize text-ink/70">
                            {pair.diffType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Structural Outliers Table */}
          <div className="mt-6 panel p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Measurable Structural Outliers ({outliers.outliers.length} flagged sequences)
            </h3>
            <p className="mt-1 text-xs text-ink/60">
              Sequences meeting explicit mathematical criteria: length ≥ 10 (&gt;2 SD above corpus
              mean of 5.60), multiple duplicate signs (repeat count ≥ 2), or high concentration of
              corpus-unique signs (≥2 hapax legomena).
            </p>

            <div className="mt-4 overflow-x-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Structural outliers meeting explicit measurable criteria
                </caption>
                <thead className="border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-3 py-2.5">Inscription</th>
                    <th className="px-3 py-2.5 text-right">Length</th>
                    <th className="px-3 py-2.5 text-right">Distinct Signs</th>
                    <th className="px-3 py-2.5 text-right">Duplicates</th>
                    <th className="px-3 py-2.5">Sign Sequence</th>
                    <th className="px-3 py-2.5">Measurable Outlier Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {outliers.outliers.map((outlier) => (
                    <tr key={outlier.inscriptionStableId} className="hover:bg-sandstone/10">
                      <td className="px-3 py-2.5 font-mono font-bold text-ink">
                        <Link
                          href={`/explorer/${outlier.inscriptionStableId}`}
                          className="text-clay hover:underline"
                        >
                          {outlier.inscriptionStableId}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-ink">
                        {outlier.length}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                        {outlier.distinctSigns}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                        {outlier.repeatCount}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-ink/80 max-w-xs truncate">
                        {outlier.signSequence}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="space-y-1">
                          {outlier.outlierReasons.map((reason, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-block rounded bg-moss/10 px-1.5 py-0.5 text-[10px] font-medium text-moss mr-1"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* Footer Notes on Scientific Scope */}
        <div className="mt-16 border-t border-ink/10 pt-8 text-xs leading-relaxed text-ink/60">
          <p>
            <strong>Research Methodology Note:</strong> IndusScript AI Phase 2 computational analysis
            is fully reproducible and parameterized by frozen dataset version snapshots. For full
            dataset selection criteria and provenance chain of custody, visit the{" "}
            <Link href={`/research/datasets/${dataset.id}`} className="font-semibold text-clay hover:underline">
              {dataset.name} dataset record
            </Link>{" "}
            or the{" "}
            <Link href="/research" className="font-semibold text-clay hover:underline">
              Corpus Provenance & Methodology overview
            </Link>
            .
          </p>
        </div>
      </div>
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return (
      <div className="page-shell py-14 sm:py-20">
        <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
          ← Research & methodology
        </Link>
        <DatabaseUnavailableNotice />
      </div>
    );
  }
}
