import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(160),
  name: z.string().trim().max(120).optional().nullable(),
  source: z.string().trim().max(120).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = newsletterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid email address",
        },
        { status: 400 }
      );
    }

    const emailNormalized = parsed.data.email.toLowerCase();
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: emailNormalized },
    });

    const alreadySubscribed = Boolean(existing && existing.status === "ACTIVE");

    await prisma.newsletterSubscriber.upsert({
      where: { email: emailNormalized },
      update: {
        status: "ACTIVE",
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.source ? { source: parsed.data.source } : {}),
      },
      create: {
        email: emailNormalized,
        name: parsed.data.name || null,
        source: parsed.data.source || "website",
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      { ok: true, alreadySubscribed },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/newsletter error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to subscribe right now" },
      { status: 500 }
    );
  }
}
