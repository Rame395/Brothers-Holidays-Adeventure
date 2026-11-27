import { z } from "zod";
import type { ReviewSource, TripReviewDTO } from "@/lib/types";

export function normalizeReviewSource(raw?: string | null): ReviewSource {
  const lower = (raw || "").trim().toLowerCase();
  if (lower === "google") return "google";
  if (lower === "tripadvisor") return "tripadvisor";
  return "website";
}

const IGNORED_NAME_CONNECTORS = new Set(["&", "and", "+", "-", "/"]);

/**
 * Extracts uppercase First + Last Name initials for the circular avatar fallback.
 * - "Sarah Miller" -> "SM"
 * - "David & Lisa" -> "DL"
 * - "Emma L." -> "EL"
 * - "Pemba" -> "PE"
 */
export function getReviewerInitials(name: string): string {
  const cleanedTokens = (name || "")
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-zA-Z0-9\u00C0-\u024F]+|[^a-zA-Z0-9\u00C0-\u024F]+$/g, ""))
    .filter((token) => token.length > 0 && !IGNORED_NAME_CONNECTORS.has(token.toLowerCase()));

  if (cleanedTokens.length >= 2) {
    const firstChar = cleanedTokens[0].charAt(0);
    const lastChar = cleanedTokens[cleanedTokens.length - 1].charAt(0);
    return `${firstChar}${lastChar}`.toUpperCase();
  }

  if (cleanedTokens.length === 1) {
    return cleanedTokens[0].slice(0, 2).toUpperCase();
  }

  return "BH";
}

/**
 * Hydration-safe month/year formatting pinned to UTC so SSR and client match.
 */
export function formatReviewDateUTC(isoOrDate?: string | null): string | null {
  if (!isoOrDate) return null;
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(parsed)
    .toUpperCase();
}

const optionalTrimmedString = (maxLen: number) =>
  z
    .string()
    .trim()
    .max(maxLen)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null));

const optionalAvatarUrl = z
  .string()
  .trim()
  .max(600)
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) =>
      v === null ||
      v.startsWith("/api/uploads/") ||
      v.startsWith("/images/") ||
      v.startsWith("https://") ||
      v.startsWith("http://"),
    { message: "Avatar URL must be a valid upload path or http(s) URL." }
  );

const optionalTripDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), {
    message: "Invalid trip date format.",
  });

export const createReviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Reviewer name must be at least 2 characters.")
    .max(100, "Reviewer name cannot exceed 100 characters."),
  authorCountry: optionalTrimmedString(80),
  avatarUrl: optionalAvatarUrl,
  rating: z.coerce.number().int().min(1).max(5).default(5),
  title: optionalTrimmedString(140),
  comment: z
    .string()
    .trim()
    .min(10, "Review comment must be at least 10 characters.")
    .max(1400, "Review comment cannot exceed 1400 characters."),
  source: z.enum(["google", "tripadvisor", "website"]).default("website"),
  tripId: optionalTrimmedString(64),
  tripName: optionalTrimmedString(140),
  tripDate: optionalTripDate,
  verified: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  showOnHome: z.boolean().default(true),
});

export const patchReviewSchema = createReviewSchema.partial();

export function parseReviewDateInput(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00.000Z`
    : trimmed;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function serializeReviewRow(r: {
  id: string;
  tripId: string | null;
  tripName: string | null;
  authorName: string;
  authorCountry: string | null;
  avatarUrl: string | null;
  rating: number;
  title: string | null;
  comment: string;
  source?: string | null;
  tripDate: Date | null;
  verified: boolean;
  isPublished: boolean;
  showOnHome: boolean;
  trip?: { id: string; name: string; slug: string } | null;
}): TripReviewDTO {
  return {
    id: r.id,
    tripId: r.tripId ?? null,
    tripName: r.trip?.name ?? r.tripName ?? null,
    tripSlug: r.trip?.slug ?? null,
    authorName: r.authorName,
    authorCountry: r.authorCountry ?? null,
    avatarUrl: r.avatarUrl ?? null,
    rating: r.rating,
    title: r.title ?? null,
    comment: r.comment,
    source: normalizeReviewSource(r.source),
    tripDate: r.tripDate ? r.tripDate.toISOString() : null,
    verified: Boolean(r.verified),
    isPublished: Boolean(r.isPublished),
    showOnHome: Boolean(r.showOnHome),
  };
}
