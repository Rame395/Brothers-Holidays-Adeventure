import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";

const regionPatchSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  countryId: z.string().trim().min(1).optional(),
  slug: z.string().trim().max(96).optional(),
  blurb: z.string().trim().max(500).optional(),
  heroImage: z.string().trim().min(1).max(300).optional(),
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
    const existing = await prisma.destinationRegion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Region not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = regionPatchSchema.safeParse(body);
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
      const conflict = await prisma.destinationRegion.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { ok: false, error: `Another region already uses slug "${nextSlug}".` },
          { status: 409 }
        );
      }
    }

    let nextCountryId = existing.countryId;
    let nextCountrySlug = existing.countrySlug;
    if (d.countryId !== undefined && d.countryId !== existing.countryId) {
      const targetCountry = await prisma.destinationCountry.findUnique({
        where: { id: d.countryId },
        select: { id: true, slug: true },
      });
      if (!targetCountry) {
        return NextResponse.json(
          { ok: false, error: "Target parent country was not found." },
          { status: 404 }
        );
      }
      nextCountryId = targetCountry.id;
      nextCountrySlug = targetCountry.slug;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const region = await tx.destinationRegion.update({
        where: { id },
        data: {
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.slug !== undefined ? { slug: nextSlug } : {}),
          ...(nextCountryId !== existing.countryId
            ? { countryId: nextCountryId, countrySlug: nextCountrySlug }
            : {}),
          ...(d.blurb !== undefined ? { blurb: d.blurb } : {}),
          ...(d.heroImage !== undefined ? { heroImage: d.heroImage } : {}),
          ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
          ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
        },
      });

      if (nextSlug !== existing.slug || nextCountrySlug !== existing.countrySlug) {
        await tx.trip.updateMany({
          where: { region: existing.slug },
          data: {
            region: nextSlug,
            country: nextCountrySlug,
          },
        });
      }

      return region;
    });

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, region: updated });
  } catch (err) {
    console.error("PATCH /api/admin/taxonomy/regions/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update region" },
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
    const existing = await prisma.destinationRegion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Region not found" },
        { status: 404 }
      );
    }

    const tripCount = await prisma.trip.count({
      where: { region: existing.slug },
    });
    if (tripCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot delete "${existing.name}" because ${tripCount} trip(s) still reference it. Reassign those trips first or mark the region inactive.`,
        },
        { status: 409 }
      );
    }

    await prisma.destinationRegion.delete({ where: { id } });
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/taxonomy/regions/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to delete region" },
      { status: 500 }
    );
  }
}
