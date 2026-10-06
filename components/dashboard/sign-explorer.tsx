import Link from "next/link";
import type { SignExplorationDetails, SignFrequency } from "@/lib/db/analysis-types";

type Props = {
  allSigns: SignFrequency[];
  selectedSign: SignExplorationDetails | null;
  currentSignCode: string;
};

export function SignExplorer({ allSigns, selectedSign, currentSignCode }: Props) {
  // Frequently explored sign shortcuts
  const commonSigns = ["P324", "P122", "P086", "P385", "P050", "P145", "P230", "P120", "P062", "P060", "P000", "P316"];

  return (
    <div className="space-y-8">
      {/* Sign Selector Bar */}
      <section className="panel p-5" aria-labelledby="sign-select-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="sign-select-heading" className="font-display text-lg font-bold text-ink">
              Select a Sign to Inspect
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Choose from high-frequency signs or search across all {allSigns.length} identified sign types.
            </p>
          </div>

          {/* Quick Selector Dropdown */}
          <form method="GET" action="/research/dashboard" className="flex items-center gap-2">
            <input type="hidden" name="tab" value="signs" />
            <label htmlFor="sign-dropdown" className="sr-only">Choose sign</label>
            <select
              id="sign-dropdown"
              name="sign"
              defaultValue={currentSignCode}
              className="rounded border border-ink/20 bg-paper px-3 py-1.5 font-mono text-xs font-semibold text-ink focus:border-clay focus:outline-none"
            >
              {allSigns.map((s) => (
                <option key={s.catalogueCode} value={s.catalogueCode}>
                  {s.catalogueCode} ({s.frequency} occurrences · {s.percentage.toFixed(1)}%)
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded border border-ink bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-moss"
            >
              Select
            </button>
          </form>
        </div>

        {/* Quick-Select Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-ink/10 pt-3">
          <span className="text-[11px] font-semibold text-ink/60">Quick Select:</span>
          {commonSigns.map((code) => {
            const isSelected = code === currentSignCode;
            return (
              <Link
                key={code}
                href={`/research/dashboard?tab=signs&sign=${code}`}
                className={`rounded px-2 py-1 font-mono text-xs font-bold transition ${
                  isSelected
                    ? "bg-clay text-paper shadow-sm"
                    : "border border-ink/15 bg-sandstone/25 text-ink hover:border-clay hover:bg-sandstone/50"
                }`}
              >
                {code}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Safeguard Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          What This Shows: Positional &amp; Adjacency Distributions ≠ Linguistic Roles
        </p>
        <p className="mt-1 text-ink/70">
          This explorer displays where <strong>{currentSignCode}</strong> occurs within transcribed sequences.
          Tendencies toward early or late positions reflect formal transcriptions in the catalogue, not grammatical roles (such as prefixes, suffixes, or declensions).
        </p>
      </div>

      {selectedSign ? (
        <div className="space-y-8">
          {/* Sign Profile Card */}
          <section className="panel p-6" aria-labelledby="sign-profile-heading">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <span className="data-label">Selected Sign Profile</span>
                <div className="mt-1 flex items-baseline gap-3">
                  <h3 id="sign-profile-heading" className="font-display text-3xl font-bold text-ink">
                    {selectedSign.signCode}
                  </h3>
                  {selectedSign.visualLabel !== selectedSign.signCode && (
                    <span className="text-sm font-medium text-ink/60">
                      ({selectedSign.visualLabel})
                    </span>
                  )}
                  <Link
                    href={`/sign-catalogue/${selectedSign.signId}`}
                    className="text-xs font-semibold text-clay hover:underline"
                  >
                    View in catalogue →
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-right">
                <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
                  <span className="block text-[10px] uppercase tracking-wider text-ink/50">Total Tokens</span>
                  <span className="font-mono text-base font-bold text-ink">{selectedSign.totalOccurrences}</span>
                </div>
                <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
                  <span className="block text-[10px] uppercase tracking-wider text-ink/50">Corpus Share</span>
                  <span className="font-mono text-base font-bold text-ink">{selectedSign.corpusPercentage.toFixed(2)}%</span>
                </div>
                <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
                  <span className="block text-[10px] uppercase tracking-wider text-ink/50">Inscriptions</span>
                  <span className="font-mono text-base font-bold text-ink">{selectedSign.inscriptionCount} seals</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Positional Skew & Relative Position */}
              <div className="space-y-3 rounded border border-ink/10 bg-sandstone/15 p-4">
                <span className="data-label block">Normalized Relative Position</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-ink">
                    {selectedSign.meanRelativePosition.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs text-ink/60">
                    ± {selectedSign.stdDevRelativePosition.toFixed(2)} SD
                  </span>
                </div>
                <div className="relative h-2 w-full rounded bg-ink/10">
                  <div
                    className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 rounded bg-clay"
                    style={{ left: `${Math.min(Math.max(selectedSign.meanRelativePosition * 100, 2), 98)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-ink/50">
                  <span>0.0 (Initial)</span>
                  <span>0.5 (Medial)</span>
                  <span>1.0 (Terminal)</span>
                </div>
                <p className="text-[11px] text-ink/65">
                  {selectedSign.meanRelativePosition < 0.4
                    ? "Tends to occur early in source-recorded sequence lines."
                    : selectedSign.meanRelativePosition > 0.65
                    ? "Tends to occur late in source-recorded sequence lines."
                    : "Evenly distributed or concentrated medially."}
                </p>
              </div>

              {/* Initial Position Counts */}
              <div className="space-y-3 rounded border border-ink/10 bg-sandstone/15 p-4">
                <span className="data-label block">Initial-Position Distribution</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-ink">
                    {selectedSign.initialFrequency}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {selectedSign.initialPercentage.toFixed(1)}% of occurrences
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-ink/10">
                  <div
                    className="h-full bg-moss"
                    style={{ width: `${selectedSign.initialPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-ink/65">
                  Occurs at Position 1 in {selectedSign.initialFrequency} out of {selectedSign.inscriptionCount} distinct sequences containing this sign.
                </p>
              </div>

              {/* Absolute Positions Breakdown */}
              <div className="space-y-2 rounded border border-ink/10 bg-sandstone/15 p-4">
                <span className="data-label block">Occurrence Counts by Position</span>
                <div className="grid grid-cols-5 gap-1 pt-1 text-center font-mono">
                  <div className="rounded bg-paper p-1.5 border border-ink/5">
                    <span className="block text-[9px] text-ink/50">Pos 1</span>
                    <span className="text-sm font-bold text-ink">{selectedSign.pos1}</span>
                  </div>
                  <div className="rounded bg-paper p-1.5 border border-ink/5">
                    <span className="block text-[9px] text-ink/50">Pos 2</span>
                    <span className="text-sm font-bold text-ink">{selectedSign.pos2}</span>
                  </div>
                  <div className="rounded bg-paper p-1.5 border border-ink/5">
                    <span className="block text-[9px] text-ink/50">Pos 3</span>
                    <span className="text-sm font-bold text-ink">{selectedSign.pos3}</span>
                  </div>
                  <div className="rounded bg-paper p-1.5 border border-ink/5">
                    <span className="block text-[9px] text-ink/50">Pos 4</span>
                    <span className="text-sm font-bold text-ink">{selectedSign.pos4}</span>
                  </div>
                  <div className="rounded bg-paper p-1.5 border border-ink/5">
                    <span className="block text-[9px] text-ink/50">Pos 5+</span>
                    <span className="text-sm font-bold text-ink">{selectedSign.pos5Plus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transitions & Motifs Dual Column */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Immediate Neighbors (Predecessors & Successors) */}
              <div className="rounded border border-ink/10 bg-paper p-4">
                <h4 className="font-display text-sm font-bold text-ink">
                  Frequent Adjacencies (Predecessors &amp; Successors)
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-bold text-ink/60">Preceded By:</span>
                    {selectedSign.topPredecessors.length > 0 ? (
                      <ul className="mt-1.5 space-y-1.5 text-xs">
                        {selectedSign.topPredecessors.map((p) => (
                          <li key={p.neighborCode} className="flex items-center justify-between font-mono">
                            <Link
                              href={`/research/dashboard?tab=signs&sign=${p.neighborCode}`}
                              className="font-bold text-clay hover:underline"
                            >
                              {p.neighborCode}
                            </Link>
                            <span className="text-ink/65">
                              {p.cooccurrenceCount}× ({p.transitionProbability.toFixed(1)}%)
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-ink/40">No frequent predecessors (mostly initial).</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-ink/60">Followed By:</span>
                    {selectedSign.topSuccessors.length > 0 ? (
                      <ul className="mt-1.5 space-y-1.5 text-xs">
                        {selectedSign.topSuccessors.map((s) => (
                          <li key={s.neighborCode} className="flex items-center justify-between font-mono">
                            <Link
                              href={`/research/dashboard?tab=signs&sign=${s.neighborCode}`}
                              className="font-bold text-clay hover:underline"
                            >
                              {s.neighborCode}
                            </Link>
                            <span className="text-ink/65">
                              {s.cooccurrenceCount}× ({s.transitionProbability.toFixed(1)}%)
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-ink/40">No frequent successors (mostly terminal).</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recurring Motifs Containing Sign */}
              <div className="rounded border border-ink/10 bg-paper p-4">
                <h4 className="font-display text-sm font-bold text-ink">
                  Recurring Motifs Containing {selectedSign.signCode}
                </h4>
                {selectedSign.motifs.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {selectedSign.motifs.slice(0, 4).map((m) => (
                      <div
                        key={m.motif}
                        className="flex flex-wrap items-center justify-between gap-2 rounded bg-sandstone/15 p-2 text-xs"
                      >
                        <span className="font-mono font-bold text-ink">{m.motif}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-ink/60">{m.occurrenceCount} occurrences</span>
                          <div className="flex gap-1">
                            {m.exampleInscriptions.map((id) => (
                              <Link
                                key={id}
                                href={`/explorer/${id}`}
                                className="rounded bg-sandstone/30 px-1 py-0.5 font-mono text-[10px] text-clay hover:underline"
                              >
                                {id.replace("INS-CISI-", "")}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink/50">
                    No recurring multi-sign motifs (threshold ≥ 2) contain this sign.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Evidence Traceability Table: Underlying Inscriptions */}
          <section className="panel p-6" aria-labelledby="evidence-heading">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
              <div>
                <h3 id="evidence-heading" className="font-display text-lg font-bold text-ink">
                  Underlying Inscriptions Containing {selectedSign.signCode} ({selectedSign.inscriptions.length} seals)
                </h3>
                <p className="text-xs text-ink/65">
                  Direct evidentiary trace: Click any inscription to view archaeological findspot and object context.
                </p>
              </div>
              <span className="font-mono text-xs text-ink/50">
                {selectedSign.totalOccurrences} total occurrences
              </span>
            </div>

            <div className="mt-4 max-h-[600px] overflow-y-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Inscriptions containing {selectedSign.signCode}</caption>
                <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-2.5">Inscription Record</th>
                    <th className="px-4 py-2.5">Surface</th>
                    <th className="px-4 py-2.5 text-center">Length</th>
                    <th className="px-4 py-2.5">Positions in Sequence</th>
                    <th className="px-4 py-2.5">Full Sequence (Target Sign Highlighted)</th>
                    <th className="px-4 py-2.5 text-right">Detail Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 font-mono">
                  {selectedSign.inscriptions.map((item) => {
                    const tokens = item.sequence.split(" ");
                    return (
                      <tr key={item.inscriptionId} className="hover:bg-sandstone/10">
                        <td className="px-4 py-2.5 font-bold text-ink">
                          <Link
                            href={`/explorer/${item.inscriptionStableId}`}
                            className="text-clay hover:underline"
                          >
                            {item.inscriptionStableId}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 font-sans capitalize text-ink/70">
                          {item.surfaceLabel}
                        </td>
                        <td className="px-4 py-2.5 text-center text-ink/70">
                          {item.sequenceLength}
                        </td>
                        <td className="px-4 py-2.5 text-ink/80">
                          {item.positions.map((p) => `Pos ${p}`).join(", ")}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {tokens.map((token, idx) => {
                              const isTarget = token === selectedSign.signCode;
                              return (
                                <span
                                  key={idx}
                                  className={`rounded px-1 py-0.5 text-[11px] ${
                                    isTarget
                                      ? "bg-clay font-bold text-paper shadow-sm"
                                      : "bg-ink/5 text-ink/75"
                                  }`}
                                >
                                  {token}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-sans">
                          <Link
                            href={`/explorer/${item.inscriptionStableId}`}
                            className="font-semibold text-clay hover:text-ink hover:underline"
                          >
                            Inspect seal →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="panel p-8 text-center text-sm text-ink/60">
          Sign not found in active dataset snapshot. Please choose a valid sign code above.
        </div>
      )}
    </div>
  );
}
