import { z } from "zod";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

export const blogPostBodySchema = z.object({
  title: z.string().trim().min(2, "Blog title must be at least 2 characters.").max(220),
  slug: z.string().trim().max(120).optional(),
  subtitle: z.string().trim().max(500).optional(),
  excerpt: z.string().trim().max(800).optional(),
  content: z.string().max(300000).optional(),
  image: z.string().trim().max(500).optional(),
  category: z.string().trim().max(80).optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(25).optional(),
  authorName: z.string().trim().max(120).optional(),
  authorRole: z.string().trim().max(120).optional(),
  badge: z.string().trim().max(60).optional(),
  dispatchNo: z.string().trim().max(40).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  focusKeyword: z.string().trim().max(120).optional().nullable(),
  metaTitle: z.string().trim().max(180).optional().nullable(),
  metaDescription: z.string().trim().max(320).optional().nullable(),
  metaKeywords: z.array(z.string().trim().min(1).max(80)).max(25).optional(),
  ogImage: z.string().trim().max(500).optional().nullable(),
  canonicalUrl: z.string().trim().max(500).optional().nullable(),
});

export const blogPostPatchSchema = blogPostBodySchema.partial();

/** Strip HTML tags and normalize whitespace for word counts & excerpt fallback. */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Estimate reading time in minutes at ~200 words per minute (minimum 1 min). */
export function computeReadingTimeMin(html: string): number {
  const text = stripHtmlToText(html);
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Return explicit excerpt or extract a clean summary from HTML content. */
export function resolveBlogExcerpt(
  explicitExcerpt: string | undefined,
  sanitizedHtml: string,
  fallbackTitle: string
): string {
  const cleaned = (explicitExcerpt ?? "").trim();
  if (cleaned) return cleaned;
  const plain = stripHtmlToText(sanitizedHtml);
  if (!plain) return fallbackTitle.trim();
  if (plain.length <= 200) return plain;
  return `${plain.slice(0, 197).trimEnd()}...`;
}

export function sanitizeBlogContent(raw: string | undefined): string {
  return sanitizeRichHtml(raw ?? "");
}
