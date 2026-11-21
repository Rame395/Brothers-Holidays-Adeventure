import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { clearCustomerSessionCookie } from "@/lib/auth/cookies";
import { requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { revokeAllCustomerSessions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  await revokeAllCustomerSessions(auth.customer.id);
  await clearCustomerSessionCookie();

  await logAuthEvent({
    actorType: AuthActorType.CUSTOMER,
    customerId: auth.customer.id,
    email: auth.customer.email,
    action: "LOGOUT_ALL_DEVICES",
    success: true,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({
    ok: true,
    message: "All active sessions have been signed out.",
  });
}
