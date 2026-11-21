import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import {
  checkBreachedPassword,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { requireCustomerApi } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import {
  revokeAllCustomerSessions,
  rotateCustomerSession,
} from "@/lib/auth/session";
import { changePasswordSchema, newPasswordSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rl = await checkRateLimit(
    `cust_chpwd:${auth.customer.id}`,
    8,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const row = await prisma.customer.findUnique({
      where: { id: auth.customer.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
      },
    });
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    let nextPassword = "";
    if (row.passwordHash) {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            ok: false,
            error: parsed.error.issues[0]?.message || "Invalid password input",
          },
          { status: 400 }
        );
      }

      if (parsed.data.currentPassword === parsed.data.newPassword) {
        return NextResponse.json(
          {
            ok: false,
            error: "New passphrase must differ from your current password",
          },
          { status: 400 }
        );
      }

      const validCurrent = await verifyPassword(
        parsed.data.currentPassword,
        row.passwordHash
      );
      if (!validCurrent.valid) {
        await logAuthEvent({
          actorType: AuthActorType.CUSTOMER,
          customerId: row.id,
          email: row.email,
          action: "PASSWORD_CHANGE_FAILED",
          success: false,
          ipAddress,
          userAgent,
        });
        return NextResponse.json(
          { ok: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      nextPassword = parsed.data.newPassword;
    } else {
      // Allows OAuth-only users to set an initial local passphrase
      const parsedNew = newPasswordSchema.safeParse(body.newPassword);
      if (!parsedNew.success) {
        return NextResponse.json(
          {
            ok: false,
            error: parsedNew.error.issues[0]?.message || "Invalid passphrase",
          },
          { status: 400 }
        );
      }
      nextPassword = parsedNew.data;
    }

    const pwned = await checkBreachedPassword(nextPassword);
    if (pwned.breached) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This passphrase has appeared in a known data breach. Please choose a unique passphrase.",
        },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(nextPassword);
    const now = new Date();

    await prisma.customer.update({
      where: { id: row.id },
      data: {
        passwordHash: newHash,
        passwordChangedAt: now,
      },
    });

    await revokeAllCustomerSessions(row.id, auth.sessionId);
    await rotateCustomerSession({
      oldSessionId: auth.sessionId,
      customerId: row.id,
      mfaVerified: auth.mfaVerified,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: row.id,
      email: row.email,
      action: "PASSWORD_CHANGED",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: row.email,
      name: row.fullName,
      eventTitle: "Passphrase Updated",
      details:
        "Your traveler account passphrase was updated and all other active sessions were signed out.",
    });

    return NextResponse.json({
      ok: true,
      message: "Passphrase updated and other active sessions signed out.",
    });
  } catch (err) {
    console.error("POST /api/auth/change-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update passphrase right now" },
      { status: 500 }
    );
  }
}
