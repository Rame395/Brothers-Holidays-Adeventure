import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";

const categoryPatchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().max(96).optional(),
  blurb: z.string().trim().max(500).optional(),
  heroImage: z.string().trim().min(1).max(300).optional(),
  groupByRegion: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.tripCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = categoryPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid update payload" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const nextSlug =
      d.slug !== undefined ? slugify(d.slug) : existing.slug;
    if (!nextSlug) {
      return NextResponse.json(
        { ok: false, error: "Slug cannot be empty" },
        { status: 400 }
      );
    }

    if (nextSlug !== existing.slug) {
      const conflict = await prisma.tripCategory.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { ok: false, error: `Another category already uses slug "${nextSlug}".` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const category = await tx.tripCategory.update({
        where: { id },
        data: {
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.slug !== undefined ? { slug: nextSlug } : {}),
          ...(d.blurb !== undefined ? { blurb: d.blurb } : {}),
          ...(d.heroImage !== undefined ? { heroImage: d.heroImage } : {}),
          ...(d.groupByRegion !== undefined ? { groupByRegion: d.groupByRegion } : {}),
          ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
          ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
        },
      });

      if (nextSlug !== existing.slug) {
        const affectedTrips = await tx.trip.findMany({
          where: { categories: { has: existing.slug } },
          select: { id: true, categories: true },
        });
        for (const t of affectedTrips) {
          const nextCats = Array.from(
            new Set(t.categories.map((c) => (c === existing.slug ? nextSlug : c)))
          );
          await tx.trip.update({
            where: { id: t.id },
            data: { categories: nextCats },
          });
        }
      }

      return category;
    });

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, category: updated });
  } catch (err) {
    console.error("PATCH /api/admin/taxonomy/categories/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update category" },
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
    const existing = await prisma.tripCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const tripCount = await prisma.trip.count({
      where: { categories: { has: existing.slug } },
    });
    if (tripCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot delete "${existing.name}" because ${tripCount} trip(s) still belong to it. Remove this category from those trips first or mark it inactive.`,
        },
        { status: 409 }
      );
    }

    await prisma.tripCategory.delete({ where: { id } });
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/taxonomy/categories/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to delete category" },
      { status: 500 }
    );
  }
}
