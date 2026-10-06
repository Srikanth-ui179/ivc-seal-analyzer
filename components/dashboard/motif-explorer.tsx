import Link from "next/link";
import type { SequenceMotifsReport, SequenceMotif } from "@/lib/db/analysis-types";

type Props = {
  motifs: SequenceMotifsReport;
  currentLen: string;
};

export function MotifExplorer({ motifs, currentLen }: Props) {
  const activeTab = currentLen === "4" ? "4" : currentLen === "initial" ? "initial" : "3";

  let activeList: SequenceMotif[] = [];
  let tabTitle = "";
  let tabDesc = "";

  if (activeTab === "4") {
    activeList = motifs.fourgrams;
    tabTitle = "4-Grams (Subsequences of Length 4)";
    tabDesc = "Recurring contiguous combinations of 4 consecutive signs occurring at least twice.";
  } else if (activeTab === "initial") {
    activeList = motifs.initialPatterns;
    tabTitle = "Initial 2-Sign Patterns (Prefix-like Positions)";
    tabDesc = "Recurring 2-sign sequences occurring specifically at Positions 1 and 2 of transcribed lines.";
  } else {
    activeList = motifs.trigrams;
    tabTitle = "Trigrams (Subsequences of Length 3)";
    tabDesc = "Recurring contiguous combinations of 3 consecutive signs occurring at least twice.";
  }

  return (
    <div className="space-y-8">
      {/* Motif Sub-category Selector */}
      <section className="panel p-5" aria-labelledby="motif-types-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="motif-types-heading" className="font-display text-lg font-bold text-ink">
              Contiguous Sequence Motifs
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Select motif category to inspect recurring sign combinations and trace them back to seals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/research/dashboard?tab=motifs&motifLen=3"
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "3"
                  ? "bg-clay text-paper shadow-sm"
                  : "border border-ink/15 bg-sandstone/25 text-ink hover:border-clay hover:bg-sandstone/50"
              }`}
            >
              Trigrams ({motifs.trigrams.length} motifs)
            </Link>

            <Link
              href="/research/dashboard?tab=motifs&motifLen=4"
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "4"
                  ? "bg-clay text-paper shadow-sm"
                  : "border border-ink/15 bg-sandstone/25 text-ink hover:border-clay hover:bg-sandstone/50"
              }`}
            >
              4-Grams ({motifs.fourgrams.length} motifs)
            </Link>

            <Link
              href="/research/dashboard?tab=motifs&motifLen=initial"
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "initial"
                  ? "bg-clay text-paper shadow-sm"
                  : "border border-ink/15 bg-sandstone/25 text-ink hover:border-clay hover:bg-sandstone/50"
              }`}
            >
              Initial 2-Sign Patterns ({motifs.initialPatterns.length} motifs)
            </Link>
          </div>
        </div>
      </section>

      {/* Safeguard Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          What This Shows: Contiguous Subsequences ≠ Words, Phrases, or Lexical Items
        </p>
        <p className="mt-1 text-ink/70">
          These patterns represent contiguous substrings of sign codes that occur repeatedly in the catalogue.
          They document formal structural recurrence across inscribed surfaces and do <strong>not</strong> identify words, names, titles, deity designations, or grammatical phrases.
        </p>
      </div>

      {/* Motifs Grid */}
      <section className="space-y-4" aria-labelledby="motifs-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 id="motifs-list-heading" className="font-display text-xl font-bold text-ink">
              {tabTitle}
            </h3>
            <p className="text-xs text-ink/65">{tabDesc}</p>
          </div>
          <span className="font-mono text-xs text-ink/50">
            {activeList.length} recurring patterns (frequency ≥ {motifs.threshold})
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeList.map((m) => (
            <div
              key={m.motif}
              className="panel flex flex-col justify-between p-5 transition hover:border-clay/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
                  <span className="data-label">
                    {m.length}-Sign Motif
                  </span>
                  <div className="flex items-center gap-1.5 text-right font-mono">
                    <span className="rounded bg-sandstone/40 px-1.5 py-0.5 text-[11px] font-bold text-ink">
                      {m.occurrenceCount}× occurrences
                    </span>
                    <span className="text-[10px] text-ink/55">
                      ({m.inscriptionCount} seals)
                    </span>
                  </div>
                </div>

                {/* Sign Token Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 font-mono">
                  {m.signs.map((sign, idx) => (
                    <Link
                      key={idx}
                      href={`/research/dashboard?tab=signs&sign=${sign}`}
                      className="rounded bg-ink/5 px-2 py-1 text-xs font-bold text-ink hover:bg-clay hover:text-paper"
                      title={`Inspect sign ${sign} in Sign Explorer`}
                    >
                      {sign}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Underlying Inscriptions (Evidence Traceability) */}
              <div className="mt-5 border-t border-ink/10 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink/50">
                  Matching Seals ({m.exampleInscriptions.length}):
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.exampleInscriptions.map((id) => (
                    <Link
                      key={id}
                      href={`/explorer/${id}`}
                      className="rounded border border-ink/10 bg-sandstone/25 px-2 py-0.5 font-mono text-[11px] font-semibold text-clay transition hover:border-clay hover:bg-sandstone/50 hover:underline"
                    >
                      {id.replace("INS-CISI-", "")}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
