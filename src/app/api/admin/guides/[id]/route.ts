import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

const guidePatchSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  slug: z.string().trim().max(96).optional(),
  subtitle: z.string().trim().max(500).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  heroImage: z.string().trim().min(1).max(300).optional(),
  content: z.string().max(250000).optional(),
  focusKeyword: z.string().trim().max(120).optional().nullable(),
  metaTitle: z.string().trim().max(180).optional().nullable(),
  metaDescription: z.string().trim().max(320).optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.travelGuide.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Travel guide not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = guidePatchSchema.safeParse(body);
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
    const nextSlug =
      d.slug !== undefined ? slugify(d.slug) : existing.slug;
    if (!nextSlug) {
      return NextResponse.json(
        { ok: false, error: "Slug cannot be empty." },
        { status: 400 }
      );
    }

    if (nextSlug !== existing.slug) {
      const conflict = await prisma.travelGuide.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict && conflict.id !== existing.id) {
        return NextResponse.json(
          {
            ok: false,
            error: `Another travel guide already uses slug "${nextSlug}".`,
          },
          { status: 409 }
        );
      }
    }

    const guide = await prisma.travelGuide.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        slug: nextSlug,
        ...(d.subtitle !== undefined ? { subtitle: d.subtitle } : {}),
        ...(d.location !== undefined ? { location: d.location } : {}),
        ...(d.heroImage !== undefined ? { heroImage: d.heroImage } : {}),
        ...(d.content !== undefined
          ? { content: sanitizeRichHtml(d.content) }
          : {}),
        ...(d.focusKeyword !== undefined
          ? { focusKeyword: d.focusKeyword?.trim() || null }
          : {}),
        ...(d.metaTitle !== undefined
          ? { metaTitle: d.metaTitle?.trim() || null }
          : {}),
        ...(d.metaDescription !== undefined
          ? { metaDescription: d.metaDescription?.trim() || null }
          : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
      },
    });

    revalidatePublicCatalog([
      `/guides/${existing.slug}`,
      `/guides/${guide.slug}`,
    ]);
    revalidatePath("/guides");

    return NextResponse.json({ ok: true, guide });
  } catch (err) {
    console.error("Failed to update travel guide:", err);
    return NextResponse.json(
      { ok: false, error: "Could not update travel guide." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.travelGuide.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Travel guide not found." },
        { status: 404 }
      );
    }

    await prisma.travelGuide.delete({ where: { id } });

    revalidatePublicCatalog([`/guides/${existing.slug}`]);
    revalidatePath("/guides");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete travel guide:", err);
    return NextResponse.json(
      { ok: false, error: "Could not delete travel guide." },
      { status: 500 }
    );
  }
}
