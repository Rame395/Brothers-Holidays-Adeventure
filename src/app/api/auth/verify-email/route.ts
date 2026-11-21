import { NextResponse } from "next/server";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { sha256Hex } from "@/lib/auth/crypto";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent, verifyCsrf } from "@/lib/auth/request";
import { verifyEmailSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rl = await checkRateLimit(
    `verify_email_ip:${ipAddress}`,
    15,
    15 * 60 * 1000,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many verification attempts. Please wait." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    const tokenHash = sha256Hex(parsed.data.token);
    const now = new Date();
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.purpose !== TokenPurpose.EMAIL_VERIFY ||
      record.actorType !== AuthActorType.CUSTOMER ||
      record.usedAt ||
      record.expiresAt <= now
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "This verification link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.verificationToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: now },
      });
      if (claim.count !== 1) return { status: "already_used" as const };

      const existing = await tx.customer.findUnique({
        where: { email: record.email },
      });

      if (existing && !existing.deletedAt) {
        if (existing.passwordHash && existing.emailVerifiedAt) {
          return { status: "already_verified" as const, customer: existing };
        }
        const updated = await tx.customer.update({
          where: { id: existing.id },
          data: {
            emailVerifiedAt: now,
            isActive: true,
            ...(record.pendingPasswordHash
              ? { passwordHash: record.pendingPasswordHash }
              : {}),
            ...(record.pendingFullName
              ? { fullName: record.pendingFullName }
              : {}),
            ...(record.pendingPhone ? { phone: record.pendingPhone } : {}),
            ...(record.pendingCountry
              ? { country: record.pendingCountry }
              : {}),
          },
        });
        return { status: "verified" as const, customer: updated };
      }

      if (!record.pendingPasswordHash || !record.pendingFullName) {
        return { status: "invalid" as const };
      }

      const created = await tx.customer.create({
        data: {
          email: record.email,
          fullName: record.pendingFullName,
          passwordHash: record.pendingPasswordHash,
          emailVerifiedAt: now,
          isActive: true,
          phone: record.pendingPhone || null,
          country: record.pendingCountry || null,
          source: "signup",
        },
      });

      return { status: "verified" as const, customer: created };
    });

    if (result.status === "already_used" || result.status === "invalid") {
      return NextResponse.json(
        {
          ok: false,
          error: "This verification link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: result.customer.id,
      email: result.customer.email,
      action: "EMAIL_VERIFIED",
      success: true,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully. You may now sign in to your account.",
    });
  } catch (err) {
    console.error("POST /api/auth/verify-email error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to verify email right now" },
      { status: 500 }
    );
  }
}
