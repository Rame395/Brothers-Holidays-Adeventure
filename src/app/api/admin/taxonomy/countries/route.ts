import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";

const countryCreateSchema = z.object({
  name: z.string().trim().min(2, "Country name must be at least 2 characters").max(80),
  slug: z.string().trim().max(96).optional().nullable(),
  blurb: z.string().trim().max(500).optional().default(""),
  heroImage: z.string().trim().min(1).max(300).optional().default("/images/trips/everest.jpg"),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = countryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid country payload" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const normalizedSlug = slugify(d.slug || d.name);
    if (!normalizedSlug) {
      return NextResponse.json(
        { ok: false, error: "Could not derive a valid slug from name." },
        { status: 400 }
      );
    }

    const existing = await prisma.destinationCountry.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `A country with slug "${normalizedSlug}" already exists.` },
        { status: 409 }
      );
    }

    const country = await prisma.destinationCountry.create({
      data: {
        name: d.name,
        slug: normalizedSlug,
        blurb: d.blurb,
        heroImage: d.heroImage,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
      },
    });

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, country }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/taxonomy/countries error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create country right now" },
      { status: 500 }
    );
  }
}
