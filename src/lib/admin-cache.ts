import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function revalidatePublicCatalog(extraPaths: string[] = []): void {
  revalidateTag("taxonomy", { expire: 0 });
  revalidateTag("trips", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/destinations");
  revalidatePath("/sitemap.xml");
  for (const path of extraPaths) {
    if (path && path.startsWith("/")) {
      revalidatePath(path);
    }
  }
}

export function revalidateSeoAndSettings(extraPaths: string[] = []): void {
  revalidateTag("settings", { expire: 0 });
  revalidateTag("seo", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  for (const path of extraPaths) {
    if (path && path.startsWith("/")) {
      revalidatePath(path);
    }
  }
}

export function revalidateJournalPosts(slugs: string[] = []): void {
  revalidateTag("journal", { expire: 0 });
  for (const s of slugs) {
    if (s) {
      revalidateTag(`journal-${s}`, { expire: 0 });
    }
  }
  revalidatePath("/journal");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  for (const s of slugs) {
    if (s) {
      revalidatePath(`/journal/${s}`);
    }
  }
}

export function revalidateReviews(): void {
  revalidateTag("reviews", { expire: 0 });
  revalidateTag("trips", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/destinations");
}
