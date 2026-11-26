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

const optionalUrl = (max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z
      .string()
      .trim()
      .max(max)
      .refine(
        (v) =>
          v.startsWith("https://") ||
          v.startsWith("http://") ||
          v.startsWith("/"),
        "URL must start with https:// or http://"
      )
      .nullable()
      .optional()
  );

const companyPatchSchema = z.object({
  siteName: z.string().trim().min(2, "Company name is required").max(120),
  tagline: z.string().trim().min(2, "Tagline is required").max(200),
  footerDescription: z.string().trim().min(5).max(500),
  registrationNo: z.string().trim().min(2).max(200),
  contactEmail: z
    .string()
    .trim()
    .email("Valid contact email is required")
    .max(120),
  contactPhone: z.string().trim().min(4).max(60),
  whatsappNumber: z.string().trim().min(4).max(60),
  officeAddress: z.string().trim().min(3).max(200),
  officeHours: z.string().trim().min(2).max(120),
  australiaWhatsapp: optionalText(60),
  japanWhatsapp: optionalText(60),
  facebookUrl: optionalUrl(300),
  instagramUrl: optionalUrl(300),
  tiktokUrl: optionalUrl(300),
  youtubeUrl: optionalUrl(300),
  tripadvisorUrl: optionalUrl(300),
  announcementBanner: optionalText(280),
  announcementActive: z.boolean(),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "seo:write" });
  if (!auth.ok) return auth.response;

  const settings = await getSiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(request, { permission: "seo:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = companyPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsed.error.issues[0]?.message ||
            "Please check the company details and URLs.",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        siteName: d.siteName,
        tagline: d.tagline,
        footerDescription: d.footerDescription,
        registrationNo: d.registrationNo,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        whatsappNumber: d.whatsappNumber,
        officeAddress: d.officeAddress,
        officeHours: d.officeHours,
        australiaWhatsapp: d.australiaWhatsapp ?? "",
        japanWhatsapp: d.japanWhatsapp ?? "",
        facebookUrl: d.facebookUrl ?? null,
        instagramUrl: d.instagramUrl ?? null,
        tiktokUrl: d.tiktokUrl ?? null,
        youtubeUrl: d.youtubeUrl ?? null,
        tripadvisorUrl: d.tripadvisorUrl ?? null,
        announcementBanner: d.announcementBanner ?? null,
        announcementActive: d.announcementActive,
      },
      create: {
        id: "default",
        siteName: d.siteName,
        tagline: d.tagline,
        footerDescription: d.footerDescription,
        registrationNo: d.registrationNo,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        whatsappNumber: d.whatsappNumber,
        officeAddress: d.officeAddress,
        officeHours: d.officeHours,
        australiaWhatsapp: d.australiaWhatsapp ?? "",
        japanWhatsapp: d.japanWhatsapp ?? "",
        facebookUrl: d.facebookUrl ?? null,
        instagramUrl: d.instagramUrl ?? null,
        tiktokUrl: d.tiktokUrl ?? null,
        youtubeUrl: d.youtubeUrl ?? null,
        tripadvisorUrl: d.tripadvisorUrl ?? null,
        announcementBanner: d.announcementBanner ?? null,
        announcementActive: d.announcementActive,
      },
    });

    revalidateSeoAndSettings(["/contact", "/about", "/destinations", "/journal"]);

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("PATCH /api/admin/company failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save company & social settings." },
      { status: 500 }
    );
  }
}
