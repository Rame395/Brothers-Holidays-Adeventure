import type {
  TripCustomSectionDTO,
  TripCustomSectionPlacement,
  TripCustomSectionStyle,
  TripPriceTierDTO,
  TripServiceGroupDTO,
  TripServiceIconKey,
} from "./types";

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const VALID_STYLES: ReadonlySet<TripCustomSectionStyle> = new Set([
  "callout",
  "note",
  "article",
  "warning",
]);

const VALID_PLACEMENTS: ReadonlySet<TripCustomSectionPlacement> = new Set([
  "overview",
  "itinerary",
  "know_before_you_go",
  "bottom",
]);

/** Safely parses Prisma Json customSections into validated DTO entries. */
export function parseCustomSections(raw: unknown): TripCustomSectionDTO[] {
  if (!Array.isArray(raw)) return [];
  const out: TripCustomSectionDTO[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const title = typeof obj.title === "string" ? obj.title.trim() : "";
    const content = typeof obj.content === "string" ? obj.content.trim() : "";
    if (!title || !content) continue;
    const rawStyle =
      typeof obj.style === "string"
        ? (obj.style as TripCustomSectionStyle)
        : "article";
    const rawPlacement =
      typeof obj.placement === "string"
        ? (obj.placement as TripCustomSectionPlacement)
        : "bottom";
    out.push({
      id:
        typeof obj.id === "string" && obj.id.trim()
          ? obj.id.trim()
          : `section-${i + 1}`,
      title,
      content,
      style: VALID_STYLES.has(rawStyle) ? rawStyle : "article",
      placement: VALID_PLACEMENTS.has(rawPlacement) ? rawPlacement : "bottom",
    });
  }
  return out;
}

const VALID_SERVICE_ICONS: ReadonlySet<TripServiceIconKey> = new Set([
  "accommodation",
  "meals",
  "transport",
  "guide",
  "equipment",
  "permits",
  "support",
  "info",
]);

/** Safely parses Prisma Json service groups (includeGroups / excludeGroups). */
export function parseServiceGroups(raw: unknown): TripServiceGroupDTO[] {
  if (!Array.isArray(raw)) return [];
  const out: TripServiceGroupDTO[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const title = typeof obj.title === "string" ? obj.title.trim() : "";
    const items = Array.isArray(obj.items)
      ? obj.items
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];
    if (!title || items.length === 0) continue;
    const rawIcon =
      typeof obj.icon === "string" ? (obj.icon as TripServiceIconKey) : "info";
    const subtitle =
      typeof obj.subtitle === "string" && obj.subtitle.trim()
        ? obj.subtitle.trim()
        : null;
    out.push({
      id:
        typeof obj.id === "string" && obj.id.trim()
          ? obj.id.trim()
          : `grp-${i + 1}`,
      title,
      icon: VALID_SERVICE_ICONS.has(rawIcon) ? rawIcon : "info",
      subtitle,
      items,
    });
  }
  return out;
}

/** Safely parses Prisma Json priceTiers and sorts ascending by minGroup. */
export function parsePriceTiers(raw: unknown): TripPriceTierDTO[] {
  if (!Array.isArray(raw)) return [];
  const out: TripPriceTierDTO[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const minGroup = Number(obj.minGroup);
    const maxGroup = Number(obj.maxGroup);
    const price = Number(obj.price);
    if (
      !Number.isFinite(minGroup) ||
      !Number.isFinite(maxGroup) ||
      !Number.isFinite(price) ||
      minGroup < 1 ||
      maxGroup < minGroup ||
      price < 0
    ) {
      continue;
    }
    const rawUsd = obj.priceUsd !== null && obj.priceUsd !== undefined ? Number(obj.priceUsd) : null;
    const label =
      typeof obj.label === "string" && obj.label.trim()
        ? obj.label.trim()
        : null;
    out.push({
      id:
        typeof obj.id === "string" && obj.id.trim()
          ? obj.id.trim()
          : `tier-${i + 1}`,
      minGroup: Math.round(minGroup),
      maxGroup: Math.round(maxGroup),
      label,
      price: Math.round(price),
      priceUsd:
        rawUsd !== null && Number.isFinite(rawUsd) && rawUsd >= 0
          ? Math.round(rawUsd)
          : null,
    });
  }
  return out.sort((a, b) => a.minGroup - b.minGroup);
}

export function formatPriceTierLabel(tier: TripPriceTierDTO): string {
  if (tier.label && tier.label.trim()) return tier.label.trim();
  if (tier.minGroup === tier.maxGroup) {
    return tier.minGroup === 1 ? "1 person" : `${tier.minGroup} people`;
  }
  return `${tier.minGroup} – ${tier.maxGroup} people`;
}

export function resolveTierPrice(
  basePrice: number,
  tiers: TripPriceTierDTO[],
  travellers: number
): { price: number; priceUsd: number | null; matchedTier: TripPriceTierDTO | null } {
  if (!tiers || tiers.length === 0) {
    return { price: basePrice, priceUsd: null, matchedTier: null };
  }
  const exact = tiers.find(
    (t) => travellers >= t.minGroup && travellers <= t.maxGroup
  );
  if (exact) {
    return {
      price: exact.price,
      priceUsd: exact.priceUsd ?? null,
      matchedTier: exact,
    };
  }
  return { price: basePrice, priceUsd: null, matchedTier: null };
}

/** Formats sorted 1..12 month numbers into compact human season ranges (e.g. Mar–May, Sep–Dec). */
export function formatSeasonRange(months: number[]): string {
  const unique = Array.from(
    new Set(months.filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))
  ).sort((a, b) => a - b);

  if (unique.length === 0) return "Year-round";
  if (unique.length === 12) return "Year-round";

  const ranges: string[] = [];
  let start = unique[0];
  let prev = unique[0];

  for (let i = 1; i < unique.length; i++) {
    const curr = unique[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      ranges.push(
        start === prev
          ? SHORT_MONTHS[start - 1]
          : `${SHORT_MONTHS[start - 1]}–${SHORT_MONTHS[prev - 1]}`
      );
      start = curr;
      prev = curr;
    }
  }
  ranges.push(
    start === prev
      ? SHORT_MONTHS[start - 1]
      : `${SHORT_MONTHS[start - 1]}–${SHORT_MONTHS[prev - 1]}`
  );
  return ranges.join(", ");
}

interface WeatherPreset {
  keywords: string[];
  label: string;
  lat: number;
  lon: number;
}

const WEATHER_PRESETS: WeatherPreset[] = [
  {
    keywords: [
      "everest",
      "khumbu",
      "kala patthar",
      "kalapatthar",
      "gokyo",
      "renjo",
      "cho la",
      "kongma",
      "lobuche",
      "island peak",
      "mera peak",
      "ama dablam",
      "jiri",
    ],
    label: "Kala Patthar & Lobuche (Khumbu)",
    lat: 27.9958,
    lon: 86.8289,
  },
  {
    keywords: ["pikey"],
    label: "Pikey Peak Ridge (Solukhumbu)",
    lat: 27.498,
    lon: 86.447,
  },
  {
    keywords: ["makalu"],
    label: "Makalu Base Camp",
    lat: 27.835,
    lon: 87.092,
  },
  {
    keywords: ["mardi"],
    label: "Mardi Himal High Camp",
    lat: 28.445,
    lon: 83.927,
  },
  {
    keywords: ["poon hill", "ghorepani"],
    label: "Ghorepani & Poon Hill",
    lat: 28.4003,
    lon: 83.6997,
  },
  {
    keywords: ["mustang", "lo manthang", "jomsom", "muktinath", "mesokanto"],
    label: "Jomsom & Upper Mustang",
    lat: 28.784,
    lon: 83.729,
  },
  {
    keywords: ["dhaulagiri"],
    label: "Dhaulagiri French Pass & Base Camp",
    lat: 28.729,
    lon: 83.489,
  },
  {
    keywords: ["annapurna", "tilicho", "thorong", "nar phu"],
    label: "Annapurna Base Camp & High Trail",
    lat: 28.53,
    lon: 83.878,
  },
  {
    keywords: ["manaslu", "tsum", "larkya"],
    label: "Samagaon & Larkya La (Manaslu)",
    lat: 28.596,
    lon: 84.64,
  },
  {
    keywords: ["ruby valley"],
    label: "Ruby Valley & Pangsang Pass",
    lat: 28.187,
    lon: 85.101,
  },
  {
    keywords: ["langtang", "kyanjin", "gosainkunda", "ganesh himal"],
    label: "Kyanjin Gompa (Langtang)",
    lat: 28.212,
    lon: 85.568,
  },
  {
    keywords: ["kanchenjunga"],
    label: "Kanchenjunga North Camp",
    lat: 27.791,
    lon: 88.067,
  },
  {
    keywords: ["api himal", "api base"],
    label: "Api Himal Base Camp (Darchula)",
    lat: 29.974,
    lon: 80.935,
  },
  {
    keywords: ["dolpo", "shey phoksundo", "rara"],
    label: "Phoksundo & Dolpo",
    lat: 29.19,
    lon: 82.95,
  },
  {
    keywords: ["chitwan", "bardiya", "safari"],
    label: "Chitwan National Park",
    lat: 27.583,
    lon: 84.495,
  },
  {
    keywords: ["lumbini"],
    label: "Lumbini Sacred Garden",
    lat: 27.4698,
    lon: 83.2757,
  },
  {
    keywords: ["bandipur"],
    label: "Bandipur Hill Town",
    lat: 27.9396,
    lon: 84.4063,
  },
  {
    keywords: ["nagarkot", "dhulikhel"],
    label: "Nagarkot Himalayan Rim",
    lat: 27.7174,
    lon: 85.5205,
  },
  {
    keywords: ["pokhara", "sarangkot"],
    label: "Pokhara Valley",
    lat: 28.2096,
    lon: 83.9856,
  },
  {
    keywords: ["lhasa", "kailash", "tibet", "shigatse", "ronbuk"],
    label: "Lhasa & Tibetan Plateau",
    lat: 29.6525,
    lon: 91.1721,
  },
  {
    keywords: [
      "bhutan",
      "paro",
      "thimphu",
      "punakha",
      "tigers nest",
      "tiger's nest",
    ],
    label: "Paro & Taktsang Valley",
    lat: 27.4305,
    lon: 89.4133,
  },
];

export interface ResolvedWeatherLocation {
  label: string;
  lat: number | null;
  lon: number | null;
  query: string;
  country: string;
  matched: "explicit" | "preset" | "geocode";
}

/** Resolves explicit admin coordinates, known Himalayan presets, or passes a live geocoding target. */
export function resolveTripWeatherLocation(trip: {
  slug: string;
  name: string;
  region?: string | null;
  area: string;
  country: string;
  weatherLocation?: string | null;
  weatherLat?: number | null;
  weatherLon?: number | null;
}): ResolvedWeatherLocation {
  if (
    typeof trip.weatherLat === "number" &&
    Number.isFinite(trip.weatherLat) &&
    typeof trip.weatherLon === "number" &&
    Number.isFinite(trip.weatherLon)
  ) {
    return {
      label: trip.weatherLocation?.trim() || trip.area,
      lat: trip.weatherLat,
      lon: trip.weatherLon,
      query: trip.weatherLocation?.trim() || trip.area,
      country: trip.country,
      matched: "explicit",
    };
  }

  const haystack =
    `${trip.slug} ${trip.name} ${trip.region ?? ""} ${trip.area} ${trip.weatherLocation ?? ""} ${trip.country}`.toLowerCase();
  for (const preset of WEATHER_PRESETS) {
    if (preset.keywords.some((kw) => haystack.includes(kw))) {
      return {
        label: trip.weatherLocation?.trim() || preset.label,
        lat: preset.lat,
        lon: preset.lon,
        query: trip.weatherLocation?.trim() || trip.area,
        country: trip.country,
        matched: "preset",
      };
    }
  }

  const query =
    trip.weatherLocation?.trim() || trip.area?.trim() || trip.name.trim();
  return {
    label: trip.weatherLocation?.trim() || trip.area || trip.name,
    lat: null,
    lon: null,
    query,
    country: trip.country,
    matched: "geocode",
  };
}
