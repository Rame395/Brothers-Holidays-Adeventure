import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidateJournalPosts, slugify } from "@/lib/admin-cache";
import {
  blogPostBodySchema,
  computeReadingTimeMin,
  resolveBlogExcerpt,
  sanitizeBlogContent,
} from "@/lib/blog-utils";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  try {
    const posts = await prisma.journalPost.findMany({
      orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
    });
    return NextResponse.json({ ok: true, posts });
  } catch (err) {
    console.error("GET /api/admin/blog failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not load blog posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = blogPostBodySchema.safeParse(body);
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
    const slug = slugify(d.slug && d.slug.trim() ? d.slug : d.title);
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "A valid URL slug is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.journalPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: `A blog post with slug "${slug}" already exists.`,
        },
        { status: 409 }
      );
    }

    const cleanContent = sanitizeBlogContent(d.content);
    const readingTimeMin = computeReadingTimeMin(cleanContent);
    const category = (d.category ?? "").trim() || "Field Dispatch";
    const image = (d.image ?? "").trim();

    const post = await prisma.journalPost.create({
      data: {
        slug,
        title: d.title,
        subtitle: (d.subtitle ?? "").trim(),
        excerpt: resolveBlogExcerpt(d.excerpt, cleanContent, d.title),
        content: cleanContent,
        image,
        category,
        tags: d.tags ?? [],
        authorId: auth.admin.id,
        authorName: (d.authorName ?? "").trim() || "Brothers Field Team",
        authorRole: (d.authorRole ?? "").trim() || "Senior Alpine Lead",
        badge: (d.badge ?? "").trim() || category,
        dispatchNo: (d.dispatchNo ?? "").trim() || "JOURNAL",
        duration: `${readingTimeMin} min read`,
        readingTimeMin,
        isPublished: d.isPublished ?? true,
        isFeatured: d.isFeatured ?? false,
        focusKeyword: d.focusKeyword?.trim() || null,
        metaTitle: d.metaTitle?.trim() || null,
        metaDescription: d.metaDescription?.trim() || null,
        metaKeywords: d.metaKeywords ?? [],
        ogImage: d.ogImage?.trim() || null,
        canonicalUrl: d.canonicalUrl?.trim() || null,
      },
    });

    revalidateJournalPosts([post.slug]);
    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/blog failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not create blog post." },
      { status: 500 }
    );
  }
}
