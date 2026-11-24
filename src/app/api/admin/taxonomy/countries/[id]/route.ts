import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";

const countryPatchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
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
    const existing = await prisma.destinationCountry.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Country not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = countryPatchSchema.safeParse(body);
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
      const conflict = await prisma.destinationCountry.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { ok: false, error: `Another country already uses slug "${nextSlug}".` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const country = await tx.destinationCountry.update({
        where: { id },
        data: {
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.slug !== undefined ? { slug: nextSlug } : {}),
          ...(d.blurb !== undefined ? { blurb: d.blurb } : {}),
          ...(d.heroImage !== undefined ? { heroImage: d.heroImage } : {}),
          ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
          ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
        },
      });

      if (nextSlug !== existing.slug) {
        await tx.destinationRegion.updateMany({
          where: { countryId: id },
          data: { countrySlug: nextSlug },
        });
        await tx.trip.updateMany({
          where: { country: existing.slug },
          data: { country: nextSlug },
        });
      }

      return country;
    });

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, country: updated });
  } catch (err) {
    console.error("PATCH /api/admin/taxonomy/countries/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update country" },
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
    const existing = await prisma.destinationCountry.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Country not found" },
        { status: 404 }
      );
    }

    const tripCount = await prisma.trip.count({
      where: { country: existing.slug },
    });
    if (tripCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot delete "${existing.name}" because ${tripCount} trip(s) still reference it. Reassign or delete those trips first, or set the country inactive.`,
        },
        { status: 409 }
      );
    }

    await prisma.destinationCountry.delete({ where: { id } });
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/taxonomy/countries/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to delete country" },
      { status: 500 }
    );
  }
}
