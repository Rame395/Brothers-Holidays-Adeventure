export type Country = string;
export type Category = string;
export type Region = string;
export type Difficulty = "Easy" | "Moderate" | "Challenging" | "Strenuous" | "Extreme";

export interface DestinationCountryDTO {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  heroImage: string;
  sortOrder: number;
  isActive: boolean;
}

export interface TripCategoryDTO {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  heroImage: string;
  groupByRegion: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface DestinationRegionDTO {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  countrySlug: string;
  blurb: string;
  heroImage: string;
  seoContent?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface DestinationTaxonomyDTO {
  countries: DestinationCountryDTO[];
  categories: TripCategoryDTO[];
  regions: DestinationRegionDTO[];
}

export interface TripItineraryDayDTO {
  id?: string;
  dayOrder: number;
  day: string;
  title: string;
  altitude: number;
  note?: string | null;
  meals?: string | null;
  accommodation?: string | null;
  distanceKm?: number | null;
  durationHrs?: string | null;
  transport?: string | null;
  image?: string | null;
  guideLabel?: string | null;
  guideUrl?: string | null;
}

export interface TripDepartureDTO {
  id: string;
  startDate: string;
  endDate?: string | null;
  priceOverride?: number | null;
  seatsTotal: number;
  seatsBooked: number;
  status: string;
  notes?: string | null;
}

export interface TripFaqDTO {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface TripReviewDTO {
  id: string;
  authorName: string;
  authorCountry?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  tripDate?: string | null;
  verified: boolean;
}

export type TripCustomSectionStyle = "callout" | "note" | "article" | "warning";
export type TripCustomSectionPlacement =
  | "overview"
  | "itinerary"
  | "know_before_you_go"
  | "bottom";

export interface TripCustomSectionDTO {
  id: string;
  title: string;
  content: string;
  style: TripCustomSectionStyle;
  placement: TripCustomSectionPlacement;
}

export type TripServiceIconKey =
  | "accommodation"
  | "meals"
  | "transport"
  | "guide"
  | "equipment"
  | "permits"
  | "support"
  | "info";

export interface TripServiceGroupDTO {
  id: string;
  title: string;
  icon: TripServiceIconKey;
  subtitle?: string | null;
  items: string[];
}

export interface TripPriceTierDTO {
  id: string;
  minGroup: number;
  maxGroup: number;
  label?: string | null;
  price: number;
  priceUsd?: number | null;
}

export interface TripDTO {
  id: string;
  slug: string;
  name: string;
  country: string;
  categories: string[];
  region?: string | null;
  area: string;
  image: string;
  gallery: string[];
  mapImage?: string | null;
  videoUrl?: string | null;
  days: number;
  maxAltitude: number;
  difficulty: string;
  price: number;
  priceUsd?: number | null;
  groupMax: number;
  seasonMonths: number[];
  start: string;
  end: string;
  tagline: string;
  overview: string;
  itineraryIntro?: string | null;
  highlights: string[];
  includes: string[];
  excludes: string[];
  gearList: string[];
  accommodationSummary?: string | null;
  mealsSummary?: string | null;
  transportSummary?: string | null;
  weatherLocation?: string | null;
  weatherLat?: number | null;
  weatherLon?: number | null;
  customSections: TripCustomSectionDTO[];
  includeGroups: TripServiceGroupDTO[];
  excludeGroups: TripServiceGroupDTO[];
  priceTiers: TripPriceTierDTO[];
  badge?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  focusKeyword?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  updatedAt: string;
  itinerary: TripItineraryDayDTO[];
  departures: TripDepartureDTO[];
  faqs: TripFaqDTO[];
  reviews: TripReviewDTO[];
}

export interface NavTripDTO {
  slug: string;
  name: string;
  country: string;
  categories: string[];
  region?: string | null;
  area: string;
  image: string;
  days: number;
  maxAltitude: number;
  price: number;
}

export interface TrekRouteDTO {
  id: string;
  code: string;
  slug: string;
  name: string;
  range: string;
  region: string;
  district: string;
  difficulty: string;
  duration: number;
  startPoint: string;
  highestPoint: number;
  highestPointName: string;
  priceFrom: number;
  season: string;
  seasonLabel: string;
  statusBadge: string;
  statusColor: string;
  description: string;
  image: string;
  elevationPoints: {
    start: string;
    mid: string;
    peak: string;
    svgPath: string;
    peakCoords: { x: number; y: number };
  };
  linkedTripSlug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string;
}

export interface ExpeditionObjectiveDTO {
  id: string;
  slug: string;
  name: string;
  region: string;
  permit: string;
  band: string;
  bandType: string;
  elevation: number;
  elevationFt: string;
  season: string;
  seasonSub: string;
  route: string;
  specs: string;
  guideRatio: string;
  guideSpecs: string;
  image?: string | null;
  icon?: string | null;
}

export interface JournalPostDTO {
  id: string;
  slug: string;
  dispatchNo: string;
  title: string;
  subtitle: string;
  excerpt: string;
  description: string;
  content: string;
  image: string;
  authorName: string;
  authorRole: string;
  category: string;
  tags: string[];
  badge: string;
  badgeType: string;
  rating: string;
  ratingCount: string;
  duration: string;
  metricLabel: string;
  metricValue: string;
  tariff: string;
  logisticsBadge: string;
  telemetryWarning?: string | null;
  telemetryIcon?: string | null;
  telemetryColor?: string | null;
  mirrored: boolean;
  readingTimeMin: number;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords: string[];
  ogImage?: string | null;
  canonicalUrl?: string | null;
}

export interface ArchiveEntryDTO {
  id: string;
  slug: string;
  year: number;
  decade: string;
  name: string;
  region: string;
  subRegion: string;
  passDetail: string;
  status: string;
  altitude: number;
  altitudeFt: string;
  icon: string;
  summary: string;
}

export interface SiteSettingDTO {
  id: string;
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  officeAddress: string;
  registrationNo: string;
  defaultCurrency: string;
  usdExchangeRate: number;
  announcementBanner?: string | null;
  announcementActive: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tripadvisorUrl?: string | null;
  gaMeasurementId?: string | null;
  gtmContainerId?: string | null;
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
  facebookPixelId?: string | null;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
}

export interface PageSeoDTO {
  routePath: string;
  pageLabel: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  structuredDataJson?: string | null;
}
