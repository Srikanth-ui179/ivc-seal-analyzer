type Props = {
  limitations: string[];
};

export function LimitationNotice({ limitations }: Props) {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="rounded border-l-2 border-clay bg-sandstone/20 p-4 text-xs text-ink/80">
      <div className="flex items-center gap-2">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-paper">
          !
        </span>
        <span className="font-semibold text-ink">
          Epigraphic Boundaries &amp; Methodological Limitations
        </span>
      </div>
      <ul className="mt-2.5 space-y-1.5 pl-6 list-disc text-ink/70">
        {limitations.map((lim, idx) => (
          <li key={idx} className="leading-relaxed">
            {lim}
          </li>
        ))}
      </ul>
    </div>
  );
}
