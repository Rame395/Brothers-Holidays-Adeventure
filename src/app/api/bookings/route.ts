import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getOptionalCustomer } from "@/lib/auth/guards";
import { bookingReference, clampTravellers } from "@/lib/booking";

const bookingSchema = z.object({
  tripSlug: z.string().min(1, "Trip slug is required"),
  departureId: z.string().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  isCustomDate: z.boolean().optional().default(false),
  travellers: z.coerce.number().int().min(1).max(30),
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email address").max(160),
  phone: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  sourcePage: z.string().trim().max(300).optional().nullable(),
  utmSource: z.string().trim().max(120).optional().nullable(),
  utmMedium: z.string().trim().max(120).optional().nullable(),
  utmCampaign: z.string().trim().max(120).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid booking payload",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const trip = await prisma.trip.findFirst({
      where: { slug: data.tripSlug, isPublished: true },
    });

    if (!trip) {
      return NextResponse.json(
        { ok: false, error: "Selected expedition could not be found" },
        { status: 404 }
      );
    }

    const travellers = clampTravellers(data.travellers, trip.groupMax);
    const emailNormalized = data.email.toLowerCase();

    let departureRecord = null;
    if (data.departureId) {
      departureRecord = await prisma.tripDeparture.findFirst({
        where: { id: data.departureId, tripId: trip.id },
      });
    }

    let resolvedDepartureDate: Date | null = null;
    if (departureRecord) {
      resolvedDepartureDate = departureRecord.startDate;
    } else if (data.departureDate) {
      const candidate = new Date(data.departureDate);
      if (!Number.isNaN(candidate.getTime())) {
        resolvedDepartureDate = candidate;
      }
    }

    const pricePerPerson = departureRecord?.priceOverride ?? trip.price;
    const totalAmount = pricePerPerson * travellers;

    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const baseRef = bookingReference(
      trip.slug,
      resolvedDepartureDate ?? new Date()
    );
    const reference = `${baseRef}-${suffix}`;
    const loggedIn = await getOptionalCustomer();

    const result = await prisma.$transaction(async (tx) => {
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
                fullName: data.name,
                phone: data.phone || existingCustomer.phone,
              },
            })
        : await tx.customer.create({
            data: {
              fullName: data.name,
              email: emailNormalized,
              phone: data.phone || null,
              source: "booking-panel",
            },
          });

      const booking = await tx.booking.create({
        data: {
          reference,
          tripId: trip.id,
          tripSlug: trip.slug,
          tripName: trip.name,
          departureId: departureRecord?.id ?? null,
          departureDate: resolvedDepartureDate,
          isCustomDate: Boolean(data.isCustomDate || !departureRecord),
          travellers,
          pricePerPerson,
          totalAmount,
          currency: "NPR",
          status: "PENDING",
          paymentStatus: "UNPAID",
          customerId: customer.id,
          customerName: data.name,
          customerEmail: emailNormalized,
          customerPhone: data.phone || null,
          specialNotes: data.notes || null,
          sourcePage: data.sourcePage || `/destinations/${trip.slug}`,
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
        },
      });

      if (departureRecord) {
        const nextSeatsBooked = departureRecord.seatsBooked + travellers;
        const remaining = departureRecord.seatsTotal - nextSeatsBooked;
        const nextStatus =
          remaining <= 0
            ? "SOLD_OUT"
            : remaining <= 2 && departureRecord.status === "OPEN"
            ? "LIMITED"
            : departureRecord.status;

        await tx.tripDeparture.update({
          where: { id: departureRecord.id },
          data: {
            seatsBooked: nextSeatsBooked,
            status: nextStatus,
          },
        });
      }

      await tx.leadActivity.create({
        data: {
          type: "NOTE",
          content: `New booking request ${reference} for ${trip.name} (${travellers} ${
            travellers === 1 ? "traveller" : "travellers"
          }, NPR ${totalAmount.toLocaleString("en-US")}).`,
          bookingId: booking.id,
          customerId: customer.id,
        },
      });

      return booking;
    });

    return NextResponse.json(
      {
        ok: true,
        reference: result.reference,
        bookingId: result.id,
        totalAmount: result.totalAmount,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create booking request right now" },
      { status: 500 }
    );
  }
}
