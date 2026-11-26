export type PeakBracketId = "6000-6500" | "6501-7000" | "7001-8848" | "multiple";

export interface PeakBracketSpec {
  id: PeakBracketId;
  label: string;
  shortLabel: string;
  minAlt?: number;
  maxAlt?: number;
  description: string;
}

export const PEAK_BRACKETS: PeakBracketSpec[] = [
  {
    id: "6000-6500",
    label: "6000m - 6500m Peaks",
    shortLabel: "6,000–6,500 m",
    minAlt: 6000,
    maxAlt: 6500,
    description:
      "Classic Himalayan trekking peaks like Island Peak, Mera Peak, and Lobuche East.",
  },
  {
    id: "6501-7000",
    label: "6501-7000m Peaks",
    shortLabel: "6,501–7,000 m",
    minAlt: 6501,
    maxAlt: 7000,
    description:
      "Technical alpine objectives including Ama Dablam and Baruntse.",
  },
  {
    id: "7001-8848",
    label: "7001m-8848m Peaks",
    shortLabel: "7,001–8,848 m",
    minAlt: 7001,
    maxAlt: 8848,
    description:
      "High-altitude 7,000m and 8,000m expeditions including Manaslu, Himlung, and Everest.",
  },
  {
    id: "multiple",
    label: "Multiple Peaks",
    shortLabel: "Multi-Peak",
    description:
      "Combined multi-summit itineraries and link-up climbs across Khumbu and Annapurna.",
  },
];

export function isPeakBracketId(value: string | null | undefined): value is PeakBracketId {
  return (
    value === "6000-6500" ||
    value === "6501-7000" ||
    value === "7001-8848" ||
    value === "multiple"
  );
}

export function matchesPeakBracket(
  trip: { name: string; categories: string[]; maxAltitude: number },
  bracketId: PeakBracketId
): boolean {
  const isClimb =
    trip.categories.includes("peak-climbing") ||
    trip.categories.includes("expedition") ||
    trip.categories.includes("expeditions") ||
    trip.maxAltitude >= 6000;

  if (!isClimb) return false;

  switch (bracketId) {
    case "6000-6500":
      return trip.maxAltitude >= 6000 && trip.maxAltitude <= 6500;
    case "6501-7000":
      return trip.maxAltitude >= 6501 && trip.maxAltitude <= 7000;
    case "7001-8848":
      return trip.maxAltitude >= 7001 && trip.maxAltitude <= 8848;
    case "multiple":
      return (
        trip.categories.includes("multiple-peaks") ||
        /multiple|combo|two peaks|three peaks|double|link|&.*peak|peak.*&/i.test(
          trip.name
        )
      );
  }
}

export function buildPeakBracketHref(bracketId: PeakBracketId): string {
  return `/destinations?view=all&category=peak-climbing&peakBand=${bracketId}`;
}
