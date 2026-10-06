import Link from "next/link";
import type { SequenceSimilarityReport } from "@/lib/db/analysis-types";

type Props = {
  similarity: SequenceSimilarityReport;
};

export function DuplicateExplorer({ similarity }: Props) {
  return (
    <div className="space-y-10">
      {/* Safeguard Notice */}
      <div className="border-l-2 border-moss bg-sandstone/25 p-4 text-xs leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">
          What This Shows: String Similarity ≠ Scribal Slips or Dialectal Variation
        </p>
        <p className="mt-1 text-ink/70">
          Exact duplicates document seals that share identical transcribed sign sequences across the entire line.
          Near-duplicates document sequences differing by exactly one sign substitution, insertion, or deletion (Levenshtein distance = 1).
          These reflect formal textual similarities in the catalogue and do <strong>not</strong> prove scribal error, dialectal variants, or copy lineage.
        </p>
      </div>

      {/* Part 1: Exact Duplicates */}
      <section className="space-y-4" aria-labelledby="exact-dup-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <div>
            <span className="data-label">Identical Sequences</span>
            <h2 id="exact-dup-heading" className="mt-1 font-display text-xl font-bold text-ink">
              Exact Sequence Duplicates ({similarity.exactDuplicates.length} recurring sequences)
            </h2>
          </div>
          <span className="text-xs text-ink/60">
            {similarity.exactDuplicates.reduce((acc, d) => acc + d.count, 0)} total seals involved
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {similarity.exactDuplicates.map((item) => (
            <div key={item.signSequence} className="panel p-6">
              <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-3">
                <span className="font-mono text-xs font-bold text-clay">
                  Length {item.length} Signs
                </span>
                <span className="rounded bg-moss/10 px-2 py-0.5 text-xs font-bold text-moss">
                  {item.count} Identical Seals
                </span>
              </div>

              {/* Exact Sequence Display */}
              <div className="mt-4 rounded bg-sandstone/15 p-3">
                <span className="text-[10px] uppercase tracking-wider text-ink/50">Full Transcribed Sequence</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5 font-mono">
                  {item.signSequence.split(" ").map((token, idx) => (
                    <Link
                      key={idx}
                      href={`/research/dashboard?tab=signs&sign=${token}`}
                      className="rounded bg-paper px-2 py-1 text-xs font-bold text-ink hover:bg-clay hover:text-paper"
                    >
                      {token}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Matching Inscriptions (Evidence Traceability) */}
              <div className="mt-5">
                <span className="text-xs font-semibold text-ink">
                  Underlying Seals Sharing This Sequence:
                </span>
                <div className="mt-2 space-y-2">
                  {item.inscriptions.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded border border-ink/10 bg-paper p-2 text-xs"
                    >
                      <span className="font-mono font-bold text-ink">{id}</span>
                      <Link
                        href={`/explorer/${id}`}
                        className="font-semibold text-clay hover:text-ink hover:underline"
                      >
                        Inspect seal detail →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Part 2: Near-Duplicates (Levenshtein Distance = 1) */}
      <section className="space-y-4" aria-labelledby="near-dup-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <div>
            <span className="data-label">Minimal Structural Differences</span>
            <h2 id="near-dup-heading" className="mt-1 font-display text-xl font-bold text-ink">
              Near-Duplicate Inscription Pairs (Levenshtein Edit Distance = 1)
            </h2>
            <p className="mt-1 text-xs text-ink/65">
              Pairs of inscriptions (length ≥ 3) that differ by exactly one sign substitution, insertion, or deletion.
            </p>
          </div>
          <span className="font-mono text-xs text-ink/50">
            {similarity.nearDuplicates.length} qualifying pairs
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {similarity.nearDuplicates.map((pair, idx) => (
            <div key={idx} className="panel p-5">
              <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
                <span className="rounded bg-sandstone/30 px-2 py-0.5 font-mono text-[11px] font-bold text-ink">
                  Pair #{idx + 1}
                </span>
                <span className="font-mono text-xs font-semibold capitalize text-clay">
                  {pair.diffType} (Dist = 1)
                </span>
              </div>

              {/* Side-by-Side Sequences */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                {/* Sequence 1 */}
                <div className="rounded border border-ink/10 bg-paper p-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-ink/5">
                    <Link
                      href={`/explorer/${pair.inscription1}`}
                      className="font-bold text-clay hover:underline"
                    >
                      {pair.inscription1}
                    </Link>
                    <span className="font-sans text-[11px] text-ink/50">
                      Length {pair.length1}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pair.seq1.split(" ").map((t, tIdx) => (
                      <span key={tIdx} className="rounded bg-ink/5 px-1.5 py-0.5 text-[11px] text-ink">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sequence 2 */}
                <div className="rounded border border-ink/10 bg-paper p-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-ink/5">
                    <Link
                      href={`/explorer/${pair.inscription2}`}
                      className="font-bold text-clay hover:underline"
                    >
                      {pair.inscription2}
                    </Link>
                    <span className="font-sans text-[11px] text-ink/50">
                      Length {pair.length2}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pair.seq2.split(" ").map((t, tIdx) => (
                      <span key={tIdx} className="rounded bg-ink/5 px-1.5 py-0.5 text-[11px] text-ink">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comparative Inspection Links */}
              <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs">
                <Link
                  href={`/explorer/${pair.inscription1}`}
                  className="font-semibold text-clay hover:underline"
                >
                  View {pair.inscription1.replace("INS-CISI-", "")} →
                </Link>
                <Link
                  href={`/explorer/${pair.inscription2}`}
                  className="font-semibold text-clay hover:underline"
                >
                  View {pair.inscription2.replace("INS-CISI-", "")} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
