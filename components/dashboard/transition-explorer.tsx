import Link from "next/link";
import type { AdjacentSignPair, TransitionEvidenceItem } from "@/lib/db/analysis-types";

type Props = {
  allPairs: AdjacentSignPair[];
  selectedPair: AdjacentSignPair | null;
  currentPairCode: string;
  inscriptions: TransitionEvidenceItem[];
};

export function TransitionExplorer({ allPairs, selectedPair, currentPairCode, inscriptions }: Props) {
  const commonPairs = allPairs.slice(0, 8);

  const sign1 = selectedPair?.sign1Code || currentPairCode.split("-")[0] || "";
  const sign2 = selectedPair?.sign2Code || currentPairCode.split("-")[1] || "";

  return (
    <div className="space-y-8">
      {/* Transition Selector Panel */}
      <section className="panel p-5" aria-labelledby="transition-select-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="transition-select-heading" className="font-display text-lg font-bold text-ink">
              Select a Sign Transition to Inspect
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Explore adjacent sign pairs (predecessor → successor) observed across the frozen corpus.
            </p>
          </div>

          {/* Quick Selector Dropdown */}
          <form method="GET" action="/research/dashboard" className="flex items-center gap-2">
            <input type="hidden" name="tab" value="transitions" />
            <label htmlFor="pair-dropdown" className="sr-only">Choose transition</label>
            <select
              id="pair-dropdown"
              name="pair"
              defaultValue={currentPairCode}
              className="rounded border border-ink/20 bg-paper px-3 py-1.5 font-mono text-xs font-semibold text-ink focus:border-clay focus:outline-none"
            >
              {allPairs.map((p) => {
                const code = `${p.sign1Code}-${p.sign2Code}`;
                return (
                  <option key={code} value={code}>
                    #{p.rank} {p.sign1Code} → {p.sign2Code} ({p.frequency} occurrences)
                  </option>
                );
              })}
            </select>
            <button
              type="submit"
              className="rounded border border-ink bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-moss"
            >
              Select
            </button>
          </form>
        </div>

        {/* Quick Select Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-ink/10 pt-3">
          <span className="text-[11px] font-semibold text-ink/60">Top Transitions:</span>
          {commonPairs.map((p) => {
            const pairKey = `${p.sign1Code}-${p.sign2Code}`;
            const isSelected = pairKey === currentPairCode;
            return (
              <Link
                key={pairKey}
                href={`/research/dashboard?tab=transitions&pair=${pairKey}`}
                className={`rounded px-2 py-1 font-mono text-xs font-bold transition ${
                  isSelected
                    ? "bg-clay text-paper shadow-sm"
                    : "border border-ink/15 bg-sandstone/25 text-ink hover:border-clay hover:bg-sandstone/50"
                }`}
              >
                {p.sign1Code} → {p.sign2Code} ({p.frequency})
              </Link>
            );
          })}
        </div>
      </section>

      {/* Safeguard Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          What This Shows: Empirical Adjacency Only ≠ Words or Grammar
        </p>
        <p className="mt-1 text-ink/70">
          The pair <strong>{sign1} → {sign2}</strong> represents a contiguous sequence occurrence where {sign1} immediately precedes {sign2}.
          This documents formal transcription adjacency and does <strong>not</strong> imply that the sequence forms a single word, compound morpheme, grammatical phrase, or phonetic unit.
        </p>
      </div>

      {selectedPair ? (
        <div className="space-y-8">
          {/* Transition Detail Card */}
          <section className="panel p-6" aria-labelledby="transition-detail-heading">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <span className="data-label">Selected Adjacency</span>
                <h3 id="transition-detail-heading" className="mt-1 font-display text-3xl font-bold text-ink">
                  {selectedPair.sign1Code} → {selectedPair.sign2Code}
                </h3>
                <p className="mt-1 text-xs text-ink/65">
                  Catalogue Rank #{selectedPair.rank} among all qualifying adjacent pairs
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-right font-mono">
                <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
                  <span className="block text-[10px] font-sans uppercase tracking-wider text-ink/50">Total Co-occurrences</span>
                  <span className="text-base font-bold text-ink">{selectedPair.frequency}×</span>
                </div>
                <div className="rounded border border-ink/10 bg-sandstone/20 px-3 py-1.5">
                  <span className="block text-[10px] font-sans uppercase tracking-wider text-ink/50">Unique Seals</span>
                  <span className="text-base font-bold text-ink">{inscriptions.length} seals</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-ink/10 bg-sandstone/15 p-4">
                <span className="data-label block">Preceding Sign</span>
                <div className="mt-1 flex items-baseline justify-between">
                  <Link
                    href={`/research/dashboard?tab=signs&sign=${selectedPair.sign1Code}`}
                    className="font-mono text-lg font-bold text-clay hover:underline"
                  >
                    {selectedPair.sign1Code}
                  </Link>
                  <span className="text-xs text-ink/60">Position (pos)</span>
                </div>
                <p className="mt-2 text-xs text-ink/65">
                  Inspect positional skew and all occurrences for {selectedPair.sign1Code} in Sign Explorer.
                </p>
              </div>

              <div className="rounded border border-ink/10 bg-sandstone/15 p-4">
                <span className="data-label block">Succeeding Sign</span>
                <div className="mt-1 flex items-baseline justify-between">
                  <Link
                    href={`/research/dashboard?tab=signs&sign=${selectedPair.sign2Code}`}
                    className="font-mono text-lg font-bold text-clay hover:underline"
                  >
                    {selectedPair.sign2Code}
                  </Link>
                  <span className="text-xs text-ink/60">Position (pos + 1)</span>
                </div>
                <p className="mt-2 text-xs text-ink/65">
                  Inspect positional skew and all occurrences for {selectedPair.sign2Code} in Sign Explorer.
                </p>
              </div>
            </div>
          </section>

          {/* Evidence Table: Underlying Inscriptions */}
          <section className="panel p-6" aria-labelledby="transition-evidence-heading">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
              <div>
                <h3 id="transition-evidence-heading" className="font-display text-lg font-bold text-ink">
                  Underlying Inscriptions Containing {selectedPair.sign1Code} → {selectedPair.sign2Code} ({inscriptions.length} seals)
                </h3>
                <p className="text-xs text-ink/65">
                  Evidence traceability: Inspect the exact sequences with the transition highlighted in context.
                </p>
              </div>
              <span className="font-mono text-xs text-ink/50">
                {selectedPair.frequency} observed instances
              </span>
            </div>

            <div className="mt-4 max-h-[600px] overflow-y-auto rounded border border-ink/10 bg-paper">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Seals containing transition {selectedPair.sign1Code} → {selectedPair.sign2Code}</caption>
                <thead className="sticky top-0 border-b border-ink/10 bg-sandstone/30 font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-2.5">Inscription Record</th>
                    <th className="px-4 py-2.5">Surface</th>
                    <th className="px-4 py-2.5 text-center">Transition Position</th>
                    <th className="px-4 py-2.5">Transcribed Sequence (Transition Highlighted)</th>
                    <th className="px-4 py-2.5 text-right">Detail Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 font-mono">
                  {inscriptions.map((item) => {
                    const tokens = item.sequence.split(" ");
                    return (
                      <tr key={`${item.inscriptionId}-${item.pos1}`} className="hover:bg-sandstone/10">
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
                        <td className="px-4 py-2.5 text-center text-ink/80">
                          Pos {item.pos1} → {item.pos2}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {tokens.map((token, idx) => {
                              const pos = idx + 1;
                              const isFirst = pos === item.pos1;
                              const isSecond = pos === item.pos2;
                              return (
                                <span
                                  key={idx}
                                  className={`rounded px-1 py-0.5 text-[11px] ${
                                    isFirst || isSecond
                                      ? "bg-moss font-bold text-paper shadow-sm"
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
          Transition not found in active dataset snapshot. Please choose a valid transition from the selector above.
        </div>
      )}
    </div>
  );
}
