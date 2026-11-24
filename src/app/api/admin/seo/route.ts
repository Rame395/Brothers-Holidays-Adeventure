import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/data";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidateSeoAndSettings } from "@/lib/admin-cache";

const optionalText = (max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z.string().trim().max(max).nullable().optional()
  );

const settingsPatchSchema = z.object({
  type: z.literal("settings"),
  siteName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(200),
  contactEmail: z.string().trim().email("Valid contact email is required").max(120),
  contactPhone: z.string().trim().min(4).max(60),
  whatsappNumber: z.string().trim().min(4).max(60),
  officeAddress: z.string().trim().min(3).max(200),
  registrationNo: z.string().trim().min(2).max(200),
  defaultMetaTitle: z.string().trim().min(5).max(160),
  defaultMetaDescription: z.string().trim().min(10).max(320),
  defaultOgImage: z.string().trim().min(1).max(300),
  googleSiteVerification: optionalText(160),
  bingSiteVerification: optionalText(160),
  gaMeasurementId: optionalText(60),
  gtmContainerId: optionalText(60),
  facebookPixelId: optionalText(60),
  instagramUrl: optionalText(300),
  facebookUrl: optionalText(300),
  youtubeUrl: optionalText(300),
  tripadvisorUrl: optionalText(300),
});

const pageSeoPatchSchema = z.object({
  type: z.literal("pageSeo"),
  routePath: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .refine((p) => p.startsWith("/"), "Route path must start with '/'"),
  pageLabel: z.string().trim().min(1).max(120),
  metaTitle: z.string().trim().min(3).max(160),
  metaDescription: z.string().trim().min(10).max(320),
  metaKeywords: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  ogTitle: optionalText(160),
  ogDescription: optionalText(320),
  ogImage: optionalText(300),
  canonicalUrl: optionalText(300),
  noIndex: z.boolean().default(false),
});

const seoPatchSchema = z.discriminatedUnion("type", [
  settingsPatchSchema,
  pageSeoPatchSchema,
]);

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "seo:write" });
  if (!auth.ok) return auth.response;

  const [settings, pageSeos] = await Promise.all([
    getSiteSettings(),
    prisma.pageSeo.findMany({ orderBy: { routePath: "asc" } }),
  ]);

  return NextResponse.json({ ok: true, settings, pageSeos });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(request, { permission: "seo:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = seoPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid SEO payload",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (d.type === "settings") {
      const settings = await prisma.siteSetting.upsert({
        where: { id: "default" },
        update: {
          siteName: d.siteName,
          tagline: d.tagline,
          contactEmail: d.contactEmail,
          contactPhone: d.contactPhone,
          whatsappNumber: d.whatsappNumber,
          officeAddress: d.officeAddress,
          registrationNo: d.registrationNo,
          defaultMetaTitle: d.defaultMetaTitle,
          defaultMetaDescription: d.defaultMetaDescription,
          defaultOgImage: d.defaultOgImage,
          googleSiteVerification: d.googleSiteVerification ?? null,
          bingSiteVerification: d.bingSiteVerification ?? null,
          gaMeasurementId: d.gaMeasurementId ?? null,
          gtmContainerId: d.gtmContainerId ?? null,
          facebookPixelId: d.facebookPixelId ?? null,
          instagramUrl: d.instagramUrl ?? null,
          facebookUrl: d.facebookUrl ?? null,
          youtubeUrl: d.youtubeUrl ?? null,
          tripadvisorUrl: d.tripadvisorUrl ?? null,
        },
        create: {
          id: "default",
          siteName: d.siteName,
          tagline: d.tagline,
          contactEmail: d.contactEmail,
          contactPhone: d.contactPhone,
          whatsappNumber: d.whatsappNumber,
          officeAddress: d.officeAddress,
          registrationNo: d.registrationNo,
          defaultMetaTitle: d.defaultMetaTitle,
          defaultMetaDescription: d.defaultMetaDescription,
          defaultOgImage: d.defaultOgImage,
          googleSiteVerification: d.googleSiteVerification ?? null,
          bingSiteVerification: d.bingSiteVerification ?? null,
          gaMeasurementId: d.gaMeasurementId ?? null,
          gtmContainerId: d.gtmContainerId ?? null,
          facebookPixelId: d.facebookPixelId ?? null,
          instagramUrl: d.instagramUrl ?? null,
          facebookUrl: d.facebookUrl ?? null,
          youtubeUrl: d.youtubeUrl ?? null,
          tripadvisorUrl: d.tripadvisorUrl ?? null,
        },
      });

      revalidateSeoAndSettings();
      return NextResponse.json({ ok: true, settings });
    }

    const pageSeo = await prisma.pageSeo.upsert({
      where: { routePath: d.routePath },
      update: {
        pageLabel: d.pageLabel,
        metaTitle: d.metaTitle,
        metaDescription: d.metaDescription,
        metaKeywords: d.metaKeywords,
        ogTitle: d.ogTitle ?? null,
        ogDescription: d.ogDescription ?? null,
        ogImage: d.ogImage ?? null,
        canonicalUrl: d.canonicalUrl ?? null,
        noIndex: d.noIndex,
      },
      create: {
        routePath: d.routePath,
        pageLabel: d.pageLabel,
        metaTitle: d.metaTitle,
        metaDescription: d.metaDescription,
        metaKeywords: d.metaKeywords,
        ogTitle: d.ogTitle ?? null,
        ogDescription: d.ogDescription ?? null,
        ogImage: d.ogImage ?? null,
        canonicalUrl: d.canonicalUrl ?? null,
        noIndex: d.noIndex,
      },
    });

    revalidateSeoAndSettings([d.routePath]);
    return NextResponse.json({ ok: true, pageSeo });
  } catch (err) {
    console.error("PATCH /api/admin/seo error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to save SEO settings right now" },
      { status: 500 }
    );
  }
}
