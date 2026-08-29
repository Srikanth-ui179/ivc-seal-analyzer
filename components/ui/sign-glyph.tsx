export function SignGlyph({ glyph, size = "md" }: { glyph: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-11 w-11 text-xl", md: "h-16 w-16 text-3xl", lg: "h-28 w-28 text-5xl" };
  return <div className={`${sizes[size]} flex shrink-0 items-center justify-center border border-ink/15 bg-sandstone/20 font-display text-ink`}>{glyph}</div>;
}
