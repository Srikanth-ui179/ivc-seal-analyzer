export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="max-w-2xl">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] sm:text-4xl">{title}</h2>
    {description && <p className="mt-4 leading-7 text-ink/70">{description}</p>}
  </div>;
}
