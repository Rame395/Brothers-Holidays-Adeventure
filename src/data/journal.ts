export interface JournalStory {
  id: string;
  slug: string;
  dispatchNo: string;
  rating: string;
  ratingCount: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  badgeType: "safety" | "location" | "new" | "archive";
  telemetryWarning?: string;
  telemetryIcon?: string;
  telemetryColor?: "primary" | "tertiary" | "error";
  duration: string;
  metricLabel: string;
  metricValue: string;
  tariff: string;
  logisticsBadge: string;
  mirrored?: boolean;
}

export const JOURNAL_STORIES: JournalStory[] = [
  {
    id: "story-1",
    slug: "langtang-valley-traverse",
    dispatchNo: "Dispatch #031",
    rating: "4.9",
    ratingCount: "38 logged",
    title: "Langtang Valley Traverse",
    subtitle: "Spring wildflower migration across the Gosainkunda ridge",
    description:
      "Ascending from the temperate oak belts into high sacred alpine tarns. Documenting the seasonal return of highland pasturage, monastery reconstruction notes at Kyanjin Gompa, and frost cycles at the sacred lake line.",
    image: "/images/trips/langtang.jpg",
    badge: "Seasonal Dispatch",
    badgeType: "location",
    duration: "14 Days",
    metricLabel: "Max Peak",
    metricValue: "4,773m",
    tariff: "$2,100",
    logisticsBadge: "Lodge & Wild Camp Mixed",
    telemetryWarning: "Early Snow Thaw at Laurebina Pass",
    telemetryIcon: "cloud",
    telemetryColor: "primary",
    mirrored: false,
  },
  {
    id: "story-2",
    slug: "khumbu-icefall-logistics",
    dispatchNo: "Dispatch #088",
    rating: "5.0",
    ratingCount: "64 logged",
    title: "Khumbu Icefall Logistics",
    subtitle: "Technical route rigging, daily serac drift, and crevasse rescue",
    description:
      "An operational post-mortem on navigating the shifting labyrinth beneath the Western Cwm. Detailing Icefall Doctor rope anchoring, anchor inspection cycles at 03:00 hours, and rapid-response safety caches.",
    image: "/images/trips/everest.jpg",
    badge: "Safety Protocol",
    badgeType: "safety",
    duration: "8 Days",
    metricLabel: "Danger Index",
    metricValue: "Class V",
    tariff: "$2,450",
    logisticsBadge: "Alpine Crampon & Ascender Req.",
    telemetryWarning: "Active Glacier Movement: 1.2m/day",
    telemetryIcon: "warning",
    telemetryColor: "primary",
    mirrored: true,
  },
  {
    id: "story-3",
    slug: "manaslu-circuit-notes",
    dispatchNo: "Dispatch #044",
    rating: "5.0",
    ratingCount: "53 logged",
    title: "Manaslu Circuit Notes",
    subtitle: "Navigating the Larkya La pass in late autumn conditions",
    description:
      "A circumambulation of the eighth highest summit on Earth. Observations on pre-winter wind patterns, moraine stabilization at Samdo, and acclimatization profiles through Nubri valley stone settlements.",
    image: "/images/trips/manaslu.jpg",
    badge: "Archive Log",
    badgeType: "archive",
    duration: "18 Days",
    metricLabel: "Distance",
    metricValue: "177 km",
    tariff: "$2,900",
    logisticsBadge: "Restricted Area Permit Included",
    telemetryWarning: "Verglas on North Face Descent",
    telemetryIcon: "ac_unit",
    telemetryColor: "tertiary",
    mirrored: false,
  },
  {
    id: "story-4",
    slug: "makalu-base-camp-field-log",
    dispatchNo: "Dispatch #102",
    rating: "4.8",
    ratingCount: "29 logged",
    title: "Makalu Base Camp Field Log",
    subtitle: "Granite walls and cloud forest ecology of the remote Barun gorge",
    description:
      "Field chronicle from the untracked wilderness of eastern Nepal. Navigating Shipton La in driving sleet, high-altitude bouldering routes above Hillary Base Camp, and recording wildlife return in pristine alpine bioclimates.",
    image: "/images/trips/kanchenjunga.jpg",
    badge: "✦ New Dispatch",
    badgeType: "new",
    duration: "22 Days",
    metricLabel: "Pack Weight",
    metricValue: "24 kg avg",
    tariff: "$3,400",
    logisticsBadge: "Wilderness Bivouac Gear Required",
    telemetryWarning: "Satellite Comm Check: 100% Signal",
    telemetryIcon: "satellite_alt",
    telemetryColor: "tertiary",
    mirrored: true,
  },
];
