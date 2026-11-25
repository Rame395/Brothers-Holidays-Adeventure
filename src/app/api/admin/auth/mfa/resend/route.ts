import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { issueAdminEmailOtp } from "@/lib/auth/admin-email-otp";
import { requireAdminApi } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  if (auth.mfaVerified) {
    return NextResponse.json({ ok: true, message: "Session is already verified." });
  }

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rlKey = `admin_mfa_resend:${ipAddress}:${auth.admin.id}`;
  const rl = await checkRateLimit(rlKey, 5, 10 * 60 * 1000, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many code requests. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    await issueAdminEmailOtp({
      adminUserId: auth.admin.id,
      email: auth.admin.email,
      name: auth.admin.name,
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: auth.admin.id,
      email: auth.admin.email,
      action: "ADMIN_EMAIL_OTP_RESENT",
      success: true,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      message: "A new 6-digit code has been sent to your email.",
    });
  } catch (err) {
    console.error("POST /api/admin/auth/mfa/resend error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to send verification code right now." },
      { status: 500 }
    );
  }
}
