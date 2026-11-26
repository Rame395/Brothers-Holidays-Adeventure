import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidateJournalPosts, slugify } from "@/lib/admin-cache";
import {
  blogPostPatchSchema,
  computeReadingTimeMin,
  resolveBlogExcerpt,
  sanitizeBlogContent,
} from "@/lib/blog-utils";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.journalPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = blogPostPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid blog post payload.",
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
      const conflict = await prisma.journalPost.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict && conflict.id !== existing.id) {
        return NextResponse.json(
          {
            ok: false,
            error: `Another blog post already uses slug "${nextSlug}".`,
          },
          { status: 409 }
        );
      }
    }

    const nextContent =
      d.content !== undefined
        ? sanitizeBlogContent(d.content)
        : existing.content;
    const nextTitle = d.title ?? existing.title;
    const nextReadingTimeMin =
      d.content !== undefined
        ? computeReadingTimeMin(nextContent)
        : existing.readingTimeMin;

    const nextExcerpt =
      d.excerpt !== undefined || d.content !== undefined
        ? resolveBlogExcerpt(
            d.excerpt !== undefined ? d.excerpt : existing.excerpt,
            nextContent,
            nextTitle
          )
        : existing.excerpt;

    const post = await prisma.journalPost.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        slug: nextSlug,
        ...(d.subtitle !== undefined ? { subtitle: d.subtitle } : {}),
        excerpt: nextExcerpt,
        content: nextContent,
        ...(d.image !== undefined ? { image: d.image.trim() } : {}),
        ...(d.category !== undefined
          ? { category: d.category.trim() || "Field Dispatch" }
          : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
        ...(d.authorName !== undefined
          ? { authorName: d.authorName.trim() || "Brothers Field Team" }
          : {}),
        ...(d.authorRole !== undefined
          ? { authorRole: d.authorRole.trim() || "Senior Alpine Lead" }
          : {}),
        ...(d.badge !== undefined
          ? { badge: d.badge.trim() || "Field Note" }
          : {}),
        ...(d.dispatchNo !== undefined
          ? { dispatchNo: d.dispatchNo.trim() || "JOURNAL" }
          : {}),
        readingTimeMin: nextReadingTimeMin,
        ...(d.content !== undefined
          ? { duration: `${nextReadingTimeMin} min read` }
          : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
        ...(d.isFeatured !== undefined ? { isFeatured: d.isFeatured } : {}),
        ...(d.focusKeyword !== undefined
          ? { focusKeyword: d.focusKeyword?.trim() || null }
          : {}),
        ...(d.metaTitle !== undefined
          ? { metaTitle: d.metaTitle?.trim() || null }
          : {}),
        ...(d.metaDescription !== undefined
          ? { metaDescription: d.metaDescription?.trim() || null }
          : {}),
        ...(d.metaKeywords !== undefined
          ? { metaKeywords: d.metaKeywords }
          : {}),
        ...(d.ogImage !== undefined
          ? { ogImage: d.ogImage?.trim() || null }
          : {}),
        ...(d.canonicalUrl !== undefined
          ? { canonicalUrl: d.canonicalUrl?.trim() || null }
          : {}),
      },
    });

    revalidateJournalPosts([existing.slug, post.slug]);
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("PATCH /api/admin/blog/[id] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not update blog post." },
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
    const existing = await prisma.journalPost.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    await prisma.journalPost.delete({ where: { id } });

    revalidateJournalPosts([existing.slug]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/blog/[id] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not delete blog post." },
      { status: 500 }
    );
  }
}
