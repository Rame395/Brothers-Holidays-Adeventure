import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOptionalCustomer } from "@/lib/auth/guards";

const inquirySchema = z.object({
  type: z
    .enum(["GENERAL", "CUSTOM_TRIP", "TRIP_INQUIRY", "EXPEDITION", "CALLBACK"])
    .optional()
    .default("GENERAL"),
  fullName: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email address").max(160),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  interest: z.string().trim().max(160).optional().nullable(),
  routeName: z.string().trim().max(160).optional().nullable(),
  tripSlug: z.string().trim().max(160).optional().nullable(),
  preferredDate: z.string().trim().max(80).optional().nullable(),
  groupSize: z.coerce.number().int().min(1).max(50).optional().nullable(),
  budget: z.string().trim().max(80).optional().nullable(),
  message: z.string().trim().max(3000).optional().nullable(),
  sourcePage: z.string().trim().max(300).optional().nullable(),
  utmSource: z.string().trim().max(120).optional().nullable(),
  utmMedium: z.string().trim().max(120).optional().nullable(),
  utmCampaign: z.string().trim().max(120).optional().nullable(),
});

function buildInquiryRef(): string {
  const now = new Date();
  const stamp = `${now.getFullYear().toString().slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const hex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `INQ-${stamp}-${hex}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = inquirySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid inquiry payload",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const emailNormalized = data.email.toLowerCase();

    let resolvedTripId: string | null = null;
    if (data.tripSlug) {
      const trip = await prisma.trip.findUnique({
        where: { slug: data.tripSlug },
        select: { id: true },
      });
      resolvedTripId = trip?.id ?? null;
    }

    let parsedPreferredDate: Date | null = null;
    if (data.preferredDate) {
      const candidate = new Date(data.preferredDate);
      if (!Number.isNaN(candidate.getTime())) {
        parsedPreferredDate = candidate;
      }
    }

    const reference = buildInquiryRef();
    const loggedIn = await getOptionalCustomer();

    const inquiry = await prisma.$transaction(async (tx) => {
      const existingCustomer = await tx.customer.findUnique({
        where: { email: emailNormalized },
      });

      const isProtectedAccount =
        Boolean(existingCustomer?.passwordHash) &&
        loggedIn?.customer.id !== existingCustomer?.id;

      const customer = existingCustomer
        ? isProtectedAccount
          ? existingCustomer
          : await tx.customer.update({
              where: { id: existingCustomer.id },
              data: {
                fullName: data.fullName,
                phone: data.phone || existingCustomer.phone,
                whatsapp: data.whatsapp || existingCustomer.whatsapp,
                country: data.country || existingCustomer.country,
              },
            })
        : await tx.customer.create({
            data: {
              fullName: data.fullName,
              email: emailNormalized,
              phone: data.phone || null,
              whatsapp: data.whatsapp || null,
              country: data.country || null,
              source: data.sourcePage || "inquiry-form",
            },
          });

      const created = await tx.inquiry.create({
        data: {
          reference,
          type: data.type,
          status: "NEW",
          priority: data.type === "EXPEDITION" ? "HIGH" : "MEDIUM",
          customerId: customer.id,
          fullName: data.fullName,
          email: emailNormalized,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          country: data.country || null,
          interest: data.interest || null,
          routeName: data.routeName || null,
          tripId: resolvedTripId,
          preferredDate: parsedPreferredDate,
          groupSize: data.groupSize ?? null,
          budget: data.budget || null,
          message:
            data.message ||
            (data.preferredDate && !parsedPreferredDate
              ? `Preferred departure window: ${data.preferredDate}`
              : null),
          sourcePage: data.sourcePage || "/",
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
        },
      });

      await tx.leadActivity.create({
        data: {
          type: "NOTE",
          content: `Lead ${reference} captured from ${
            data.sourcePage || "website"
          } (${data.interest || data.routeName || data.type}).`,
          inquiryId: created.id,
          customerId: customer.id,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        ok: true,
        reference: inquiry.reference,
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/inquiries error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to submit inquiry right now" },
      { status: 500 }
    );
  }
}
