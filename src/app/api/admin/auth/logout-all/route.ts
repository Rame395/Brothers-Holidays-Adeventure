import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import {
  clearAdminSessionCookie,
  clearAdminTrustedDeviceCookie,
} from "@/lib/auth/cookies";
import { requireAdminApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { revokeAllAdminSessions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  await revokeAllAdminSessions(auth.admin.id);
  await clearAdminSessionCookie();
  await clearAdminTrustedDeviceCookie();

  await logAuthEvent({
    actorType: AuthActorType.ADMIN,
    adminUserId: auth.admin.id,
    email: auth.admin.email,
    action: "LOGOUT_ALL_DEVICES",
    success: true,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({
    ok: true,
    message: "All administrator sessions have been revoked.",
  });
}
