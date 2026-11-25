import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

const guideCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Guide title must be at least 2 characters")
    .max(180),
  slug: z.string().trim().max(96).optional().nullable(),
  subtitle: z.string().trim().max(500).optional().default(""),
  location: z.string().trim().min(1).max(120).optional().default("Nepal"),
  heroImage: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .optional()
    .default("/images/trips/kathmandu.jpg"),
  content: z.string().max(250000).optional().default(""),
  focusKeyword: z.string().trim().max(120).optional().nullable(),
  metaTitle: z.string().trim().max(180).optional().nullable(),
  metaDescription: z.string().trim().max(320).optional().nullable(),
  isPublished: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  try {
    const guides = await prisma.travelGuide.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ ok: true, guides });
  } catch (err) {
    console.error("Failed to list travel guides:", err);
    return NextResponse.json(
      { ok: false, error: "Could not load travel guides." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = guideCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsed.error.issues[0]?.message || "Invalid travel guide payload.",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const normalizedSlug = slugify(d.slug || d.title);
    if (!normalizedSlug) {
      return NextResponse.json(
        { ok: false, error: "Could not derive a valid slug from title." },
        { status: 400 }
      );
    }

    const existing = await prisma.travelGuide.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: `A travel guide with slug "${normalizedSlug}" already exists.`,
        },
        { status: 409 }
      );
    }

    const guide = await prisma.travelGuide.create({
      data: {
        title: d.title,
        slug: normalizedSlug,
        subtitle: d.subtitle,
        location: d.location,
        heroImage: d.heroImage,
        content: sanitizeRichHtml(d.content),
        focusKeyword: d.focusKeyword?.trim() || null,
        metaTitle: d.metaTitle?.trim() || null,
        metaDescription: d.metaDescription?.trim() || null,
        isPublished: d.isPublished,
      },
    });

    revalidatePublicCatalog([`/guides/${guide.slug}`]);
    revalidatePath("/guides");

    return NextResponse.json({ ok: true, guide }, { status: 201 });
  } catch (err) {
    console.error("Failed to create travel guide:", err);
    return NextResponse.json(
      { ok: false, error: "Could not create travel guide." },
      { status: 500 }
    );
  }
}
