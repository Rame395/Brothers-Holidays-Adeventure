import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { getClientIp, getUserAgent, verifyCsrf } from "@/lib/auth/request";
import {
  getAdminSession,
  revokeCurrentAdminSession,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const session = await getAdminSession();
  await revokeCurrentAdminSession();

  if (session) {
    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: session.adminUser.id,
      email: session.adminUser.email,
      action: "LOGOUT",
      success: true,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
  }

  return NextResponse.json({ ok: true });
}
