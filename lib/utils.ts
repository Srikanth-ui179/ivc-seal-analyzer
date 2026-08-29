export function percentage(value: number) {
  return new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 0 }).format(value);
}
