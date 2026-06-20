// Brazilian Epidemiological Week (SE) — week starts on Sunday.
// SE 1 is the week containing the first Saturday of the year (equivalently,
// the week whose Saturday falls in the new year). Returns 1..53.
export function getSeNumber(date: Date): number {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
  // Saturday of the current SE week
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  // shift to the Saturday that ends this SE week
  d.setUTCDate(d.getUTCDate() + (6 - day));
  const year = d.getUTCFullYear();
  // First Saturday of that year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const firstSat = new Date(jan1);
  firstSat.setUTCDate(jan1.getUTCDate() + ((6 - jan1.getUTCDay() + 7) % 7));
  const diffDays = Math.round((d.getTime() - firstSat.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}
