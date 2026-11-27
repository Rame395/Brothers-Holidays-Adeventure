import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z.string().trim().max(max).nullable().optional()
  );

const validDateStringSchema = z
  .string()
  .trim()
  .min(4, "Date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date value");

const optionalDateStringSchema = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? null : val),
  z
    .string()
    .trim()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date value")
    .nullable()
    .optional()
);

export const itineraryDayInputSchema = z.object({
  dayLabel: z.string().trim().min(1, "Day label is required").max(32),
  title: z.string().trim().min(2, "Day title is required").max(200),
  altitude: z.coerce.number().int().min(0).max(9000).default(0),
  note: optionalTrimmedString(4000),
  meals: optionalTrimmedString(120),
  accommodation: optionalTrimmedString(160),
  distanceKm: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().min(0).max(500).nullable().optional()
  ),
  durationHrs: optionalTrimmedString(60),
  transport: optionalTrimmedString(120),
  image: optionalTrimmedString(300),
  guideLabel: optionalTrimmedString(200),
  guideUrl: optionalTrimmedString(300),
});

export const departureInputSchema = z.object({
  id: z.string().trim().min(1).nullable().optional(),
  startDate: validDateStringSchema,
  endDate: optionalDateStringSchema,
  priceOverride: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().int().min(0).max(50000000).nullable().optional()
  ),
  seatsTotal: z.coerce.number().int().min(1).max(100).default(8),
  seatsBooked: z.coerce.number().int().min(0).max(100).default(0),
  status: z
    .enum(["OPEN", "LIMITED", "GUARANTEED", "SOLD_OUT", "CANCELLED"])
    .default("OPEN"),
  notes: optionalTrimmedString(500),
});

export const faqInputSchema = z.object({
  question: z.string().trim().min(3, "FAQ question is required").max(300),
  answer: z.string().trim().min(3, "FAQ answer is required").max(4000),
});

export const reviewInputSchema = z.object({
  authorName: z.string().trim().min(2, "Reviewer name is required").max(120),
  authorCountry: optionalTrimmedString(80),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  title: optionalTrimmedString(160),
  comment: z.string().trim().min(5, "Review comment is required").max(3000),
  tripDate: optionalDateStringSchema,
  verified: z.boolean().optional().default(true),
  isPublished: z.boolean().optional().default(true),
});

export const customSectionInputSchema = z.object({
  id: z.string().trim().min(1).max(64),
  title: z.string().trim().min(2, "Section title is required").max(160),
  content: z
    .string()
    .trim()
    .min(5, "Section content must be at least 5 characters")
    .max(24000),
  style: z.enum(["callout", "note", "article", "warning"]).default("article"),
  placement: z
    .enum(["overview", "itinerary", "know_before_you_go", "bottom"])
    .default("bottom"),
});

export const serviceGroupInputSchema = z.object({
  id: z.string().trim().min(1).max(64),
  title: z.string().trim().min(2, "Category title is required").max(160),
  icon: z
    .enum([
      "accommodation",
      "meals",
      "transport",
      "guide",
      "equipment",
      "permits",
      "support",
      "info",
    ])
    .default("info"),
  subtitle: optionalTrimmedString(240),
  items: z
    .array(z.string().trim().min(1).max(500))
    .min(1, "Add at least one bullet item to each category"),
});

export const priceTierInputSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    minGroup: z.coerce.number().int().min(1).max(100),
    maxGroup: z.coerce.number().int().min(1).max(100),
    label: optionalTrimmedString(100),
    price: z.coerce.number().int().min(1000).max(50000000),
    priceUsd: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : val),
      z.coerce.number().int().min(0).max(500000).nullable().optional()
    ),
  })
  .refine((t) => t.maxGroup >= t.minGroup, {
    message: "Max group size must be >= min group size",
  });

export const tripCreateSchema = z.object({
  name: z.string().trim().min(2, "Trip name is required").max(160),
  slug: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().min(1, "Country is required").max(96),
  categories: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one category"),
  region: optionalTrimmedString(96),
  area: z
    .string()
    .trim()
    .min(2, "Area / region display label is required")
    .max(120),
  image: z.string().trim().min(1).max(300).default("/images/trips/everest.jpg"),
  gallery: z.array(z.string().trim().min(1)).optional().default([]),
  mapImage: optionalTrimmedString(300),
  videoUrl: optionalTrimmedString(300),
  days: z.coerce.number().int().min(1).max(120),
  maxAltitude: z.coerce.number().int().min(0).max(9000),
  difficulty: z.string().trim().min(2).max(60).default("Moderate"),
  price: z.coerce.number().int().min(1000).max(50000000),
  priceUsd: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().int().min(0).max(500000).nullable().optional()
  ),
  groupMax: z.coerce.number().int().min(1).max(50).default(8),
  seasonMonths: z
    .array(z.coerce.number().int().min(1).max(12))
    .optional()
    .default([3, 4, 5, 10, 11]),
  startPoint: z.string().trim().min(2).max(120).default("Kathmandu"),
  endPoint: z.string().trim().min(2).max(120).default("Kathmandu"),
  tagline: z.string().trim().min(2, "Tagline is required").max(240),
  overview: z.string().trim().min(10, "Overview must be at least 10 characters").max(12000),
  itineraryIntro: optionalTrimmedString(6000),
  highlights: z.array(z.string().trim().min(1)).optional().default([]),
  includes: z.array(z.string().trim().min(1)).optional().default([]),
  excludes: z.array(z.string().trim().min(1)).optional().default([]),
  gearList: z.array(z.string().trim().min(1)).optional().default([]),
  accommodationSummary: optionalTrimmedString(240),
  mealsSummary: optionalTrimmedString(240),
  transportSummary: optionalTrimmedString(240),
  weatherLocation: optionalTrimmedString(160),
  weatherLat: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().min(-90).max(90).nullable().optional()
  ),
  weatherLon: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().min(-180).max(180).nullable().optional()
  ),
  customSections: z.array(customSectionInputSchema).max(30).optional().default([]),
  includeGroups: z.array(serviceGroupInputSchema).max(20).optional().default([]),
  excludeGroups: z.array(serviceGroupInputSchema).max(20).optional().default([]),
  priceTiers: z.array(priceTierInputSchema).max(15).optional().default([]),
  badge: optionalTrimmedString(60),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isTopTrek: z.boolean().optional().default(false),
  featuredOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  metaTitle: optionalTrimmedString(160),
  metaDescription: optionalTrimmedString(320),
  itinerary: z.array(itineraryDayInputSchema).optional().default([]),
  departures: z.array(departureInputSchema).optional().default([]),
  faqs: z.array(faqInputSchema).optional().default([]),
  reviews: z.array(reviewInputSchema).optional().default([]),
});

export const tripPatchSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(96).optional(),
  categories: z.array(z.string().trim().min(1)).min(1).optional(),
  region: optionalTrimmedString(96),
  area: z.string().trim().min(2).max(120).optional(),
  image: z.string().trim().min(1).max(300).optional(),
  gallery: z.array(z.string().trim().min(1)).optional(),
  mapImage: optionalTrimmedString(300),
  videoUrl: optionalTrimmedString(300),
  days: z.coerce.number().int().min(1).max(120).optional(),
  maxAltitude: z.coerce.number().int().min(0).max(9000).optional(),
  difficulty: z.string().trim().min(2).max(60).optional(),
  price: z.coerce.number().int().min(1000).max(50000000).optional(),
  priceUsd: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().int().min(0).max(500000).nullable().optional()
  ),
  groupMax: z.coerce.number().int().min(1).max(50).optional(),
  seasonMonths: z.array(z.coerce.number().int().min(1).max(12)).optional(),
  startPoint: z.string().trim().min(2).max(120).optional(),
  endPoint: z.string().trim().min(2).max(120).optional(),
  tagline: z.string().trim().min(2).max(240).optional(),
  overview: z.string().trim().min(10).max(12000).optional(),
  itineraryIntro: optionalTrimmedString(6000),
  highlights: z.array(z.string().trim().min(1)).optional(),
  includes: z.array(z.string().trim().min(1)).optional(),
  excludes: z.array(z.string().trim().min(1)).optional(),
  gearList: z.array(z.string().trim().min(1)).optional(),
  accommodationSummary: optionalTrimmedString(240),
  mealsSummary: optionalTrimmedString(240),
  transportSummary: optionalTrimmedString(240),
  weatherLocation: optionalTrimmedString(160),
  weatherLat: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().min(-90).max(90).nullable().optional()
  ),
  weatherLon: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.number().min(-180).max(180).nullable().optional()
  ),
  customSections: z.array(customSectionInputSchema).max(30).optional(),
  includeGroups: z.array(serviceGroupInputSchema).max(20).optional(),
  excludeGroups: z.array(serviceGroupInputSchema).max(20).optional(),
  priceTiers: z.array(priceTierInputSchema).max(15).optional(),
  badge: optionalTrimmedString(60),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTopTrek: z.boolean().optional(),
  featuredOrder: z.coerce.number().int().min(0).max(999).optional(),
  metaTitle: optionalTrimmedString(160),
  metaDescription: optionalTrimmedString(320),
  itinerary: z.array(itineraryDayInputSchema).optional(),
  departures: z.array(departureInputSchema).optional(),
  faqs: z.array(faqInputSchema).optional(),
  reviews: z.array(reviewInputSchema).optional(),
});
