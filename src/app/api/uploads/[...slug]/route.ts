import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;
    if (!Array.isArray(slug) || slug.length < 1) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    for (const seg of slug) {
      if (!SAFE_SEGMENT.test(seg) || seg === "." || seg === "..") {
        return NextResponse.json({ error: "Invalid path segment" }, { status: 400 });
      }
    }

    const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
    const resolved = path.resolve(uploadsRoot, ...slug);

    if (!resolved.startsWith(uploadsRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const bytes = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT" || code === "EISDIR") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("GET /api/uploads/[...slug] error:", err);
    return NextResponse.json({ error: "Unable to read upload" }, { status: 500 });
  }
}
