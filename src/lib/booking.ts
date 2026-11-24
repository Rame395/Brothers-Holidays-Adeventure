/** Booking rules shared by the booking panel. */

export const USD_EXCHANGE_RATE = 135;

export function nprToUsd(nprAmount: number, explicitUsd?: number | null): number {
  if (typeof explicitUsd === "number" && Number.isFinite(explicitUsd) && explicitUsd > 0) {
    return Math.round(explicitUsd);
  }
  return Math.max(1, Math.round(nprAmount / USD_EXCHANGE_RATE));
}

export function formatUsd(usdAmount: number): string {
  return `$${new Intl.NumberFormat("en-US").format(Math.round(usdAmount))}`;
}

export function formatPriceUsd(nprAmount: number, explicitUsd?: number | null): string {
  return formatUsd(nprToUsd(nprAmount, explicitUsd));
}

export function formatRs(amount: number): string {
  return formatPriceUsd(amount);
}

/** Travellers are always between 1 and the trip's maximum group size. */
export function clampTravellers(n: number, groupMax: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.round(n), 1), Math.max(groupMax, 1));
}

/** Total quote = per-person price × travellers (no hidden fees). */
export function bookingTotal(pricePerPerson: number, travellers: number, groupMax: number): number {
  return pricePerPerson * clampTravellers(travellers, groupMax);
}

/**
 * Fixed departures fall on the 1st and 15th of each month inside the trip's season,
 * strictly after `from`.
 */
export function upcomingDepartures(from: Date, seasonMonths: number[], count = 6): Date[] {
  const out: Date[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let guard = 0; guard < 36 && out.length < count; guard++) {
    const month = cursor.getMonth() + 1;
    if (seasonMonths.includes(month)) {
      for (const day of [1, 15]) {
        const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
        if (d > from && out.length < count) out.push(d);
      }
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

export function bookingReference(slug: string, date: Date): string {
  const code = slug
    .split("-")
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
  const stamp = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `KH-${code}-${stamp}`;
}
