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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-H6_xG4e_G4cM9_Qe5H5qU9p5JvYmN9rO1t2wXy4z6B8C0D2E4F6G8H0J2K4L6M8N0P2Q4R6S8T0U2V4W6X8Y0Z2a4b6c8d0e2f4g6h8j0k2l4m6n8p0q2r4s6t8u0v2w4x6y8z0A2B4C6D8E0F2G4H6J8K0L2M4N6P8Q0R2S4T6U8V0W2X4Y6Z",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASbVG-ktyRigwj8HXE9xDmlIOZEjiJMEvNzIV8wuUx6Y1RFtWvMXZHndb6l4MsFOR9s1uVCVAV4YVCEp6lDw5fstEFvTMW1Sun44B11Co4MGT5cd8n6CxRBTdALXg-_fAnfo3U6tw7nx8NopEGH17Z9yLmESdjTftliXhbUwb9Hi4Be3iIlahvHXP_ArwYH4eSyKvmx0yt0C24hDZ8phfzt2j2CSgu8enD2UuVIoM",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzQPmz-74q06zZc57wqTtzBRsfIy5OQBh2-056P3TkKDaYtidhdJwgE6tpj4cqM5K2UqHH7rNCqUEX9ymPSlMNRLUZFSNqmmUsAZ8LvxSeP1t5ioohNh9teu2RdaO4ir4WOz7TXMcpW4V6Or6gJvCAtKtvDGskrZ4OVNxdXounxpP8mLd84MlobeMZ3g4Qg8S83BgpmX3MrFivpGBe4uw-VZvSX3wFlGvVl53CwB8",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0IJaoRBIzT0MJXAV71KIuon9iMh32hvVfRucP-ZdcTfmhA306V-zy0ZxeAaSQL6Nu-uGMh97c0AljakYckG6f5Dlk-oaLZuOEGge7exwo8aT4xkk52YWeVeubMmEVZiJ297bLTXYGySLaEXc4vIFUDR2ercq4n2lf7NtjX_V135D1cQVhimbIqXwRcfQ5ptZCm2DhACOa2p0WJs9Wge0OFzh-x22_p4eVBqeOAE",
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
