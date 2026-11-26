import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import AdminBlogClient, {
  type AdminBlogPostRecord,
} from "@/components/admin/AdminBlogClient";

async function AdminBlogGate() {
  const auth = await requireAdmin({ permission: "trips:read" });

  const rows = await prisma.journalPost.findMany({
    orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
  });

  const initialPosts: AdminBlogPostRecord[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    dispatchNo: p.dispatchNo,
    title: p.title,
    subtitle: p.subtitle,
    excerpt: p.excerpt,
    content: p.content,
    image: p.image,
    authorName: p.authorName,
    authorRole: p.authorRole,
    category: p.category,
    tags: p.tags,
    badge: p.badge,
    readingTimeMin: p.readingTimeMin,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    focusKeyword: p.focusKeyword,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    ogImage: p.ogImage,
    canonicalUrl: p.canonicalUrl,
  }));

  return (
    <AdminBlogClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      initialPosts={initialPosts}
    />
  );
}

export default function AdminBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading Blog &amp; Field Journal Editor...
        </div>
      }
    >
      <AdminBlogGate />
    </Suspense>
  );
}
