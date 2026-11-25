import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

const regionCreateSchema = z.object({
  name: z.string().trim().min(2, "Region name must be at least 2 characters").max(100),
  countryId: z.string().trim().min(1, "Parent country is required"),
  slug: z.string().trim().max(96).optional().nullable(),
  blurb: z.string().trim().max(500).optional().default(""),
  heroImage: z.string().trim().min(1).max(300).optional().default("/images/trips/everest.jpg"),
  seoContent: z.string().max(150000).optional().default(""),
  metaTitle: z.string().trim().max(160).optional().nullable(),
  metaDescription: z.string().trim().max(320).optional().nullable(),
  focusKeyword: z.string().trim().max(100).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = regionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid region payload" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const country = await prisma.destinationCountry.findUnique({
      where: { id: d.countryId },
      select: { id: true, slug: true },
    });
    if (!country) {
      return NextResponse.json(
        { ok: false, error: "Selected parent country was not found." },
        { status: 404 }
      );
    }

    const normalizedSlug = slugify(d.slug || d.name);
    if (!normalizedSlug) {
      return NextResponse.json(
        { ok: false, error: "Could not derive a valid slug from name." },
        { status: 400 }
      );
    }

    const existing = await prisma.destinationRegion.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `A region with slug "${normalizedSlug}" already exists.` },
        { status: 409 }
      );
    }

    const region = await prisma.destinationRegion.create({
      data: {
        name: d.name,
        slug: normalizedSlug,
        countryId: country.id,
        countrySlug: country.slug,
        blurb: d.blurb,
        heroImage: d.heroImage,
        seoContent: sanitizeRichHtml(d.seoContent),
        metaTitle: d.metaTitle?.trim() || null,
        metaDescription: d.metaDescription?.trim() || null,
        focusKeyword: d.focusKeyword?.trim() || null,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
      },
    });

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, region }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/taxonomy/regions error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create region right now" },
      { status: 500 }
    );
  }
}
