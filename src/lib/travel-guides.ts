export interface TravelGuideSummaryDTO {
  slug: string;
  title: string;
  location: string;
  focusKeyword: string | null;
}

const GENERIC_PLACE_WORDS = new Set([
  "nepal",
  "bhutan",
  "tibet",
  "india",
  "himalaya",
  "himalayas",
  "trek",
  "trekking",
  "guide",
  "travel",
  "complete",
  "attractions",
  "culture",
  "things",
  "expedition",
  "tour",
  "route",
]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractPlaceCandidates(guide: TravelGuideSummaryDTO): string[] {
  const rawCandidates: string[] = [];

  const locationFirst = guide.location.split(",")[0]?.trim();
  if (locationFirst) {
    rawCandidates.push(locationFirst);
  }

  const beforeColon = guide.title.split(":")[0]?.trim();
  if (beforeColon) {
    const strippedCountry = beforeColon
      .replace(/,\s*(nepal|bhutan|tibet|india)\b/gi, "")
      .trim();
    if (strippedCountry) {
      rawCandidates.push(strippedCountry);
    }
    const titleFirst = beforeColon.split(/[,-–—]/)[0]?.trim();
    if (titleFirst) {
      rawCandidates.push(titleFirst);
    }
  }

  const deduped = new Set<string>();
  for (const item of rawCandidates) {
    const normalized = item.toLowerCase().replace(/\s+/g, " ").trim();
    if (normalized.length < 4) continue;
    if (GENERIC_PLACE_WORDS.has(normalized)) continue;
    deduped.add(normalized);
  }

  return Array.from(deduped).sort((a, b) => b.length - a.length);
}

export function matchTravelGuideForDayTitle(
  dayTitle: string,
  guides: TravelGuideSummaryDTO[]
): TravelGuideSummaryDTO | null {
  if (!dayTitle.trim() || guides.length === 0) return null;

  const scoredMatches: Array<{ guide: TravelGuideSummaryDTO; length: number }> =
    [];

  for (const guide of guides) {
    const candidates = extractPlaceCandidates(guide);
    for (const phrase of candidates) {
      const pattern = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i");
      if (pattern.test(dayTitle)) {
        scoredMatches.push({ guide, length: phrase.length });
        break;
      }
    }
  }

  if (scoredMatches.length === 0) return null;
  scoredMatches.sort((a, b) => b.length - a.length);
  return scoredMatches[0]!.guide;
}
