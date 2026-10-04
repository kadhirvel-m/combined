/** `helpers.js formatYearRange()`: "2022 – 2026", one year, or an em dash. */
export function formatYearRange(fromYear?: string | number | null, toYear?: string | number | null): string {
  if (!fromYear && !toYear) return "—";
  if (!fromYear) return `${toYear}`;
  if (!toYear) return `${fromYear}`;
  return `${fromYear} – ${toYear}`;
}
