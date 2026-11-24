import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["trips", "maps"]);

function detectImageExtension(
  buffer: Buffer,
  mimeType: string
): ".jpg" | ".png" | ".webp" | null {
  const mime = mimeType.toLowerCase();

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    if (mime && mime !== "image/jpeg" && mime !== "image/jpg") return null;
    return ".jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    if (mime && mime !== "image/png") return null;
    return ".png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    if (mime && mime !== "image/webp") return null;
    return ".webp";
  }

  return null;
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const rawFile = formData.get("file");
    const rawFolder = formData.get("folder");

    const folder =
      typeof rawFolder === "string" && rawFolder.trim() !== ""
        ? rawFolder.trim()
        : "trips";

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid upload folder. Allowed: "trips", "maps".' },
        { status: 400 }
      );
    }

    if (!(rawFile instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    if (rawFile.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Uploaded file is empty." },
        { status: 400 }
      );
    }

    if (rawFile.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File exceeds maximum size of 5 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await rawFile.arrayBuffer());
    const ext = detectImageExtension(buffer, rawFile.type || "");
    if (!ext) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unsupported or invalid image format. Use JPG, PNG, or WebP.",
        },
        { status: 400 }
      );
    }

    const filename = `${crypto.randomUUID()}${ext}`;
    const targetDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, filename), buffer);

    return NextResponse.json(
      {
        ok: true,
        url: `/api/uploads/${folder}/${filename}`,
        filename,
        size: buffer.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/upload error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to upload image right now." },
      { status: 500 }
    );
  }
}
