import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { getClientIp, getUserAgent, verifyCsrf } from "@/lib/auth/request";
import {
  getCustomerSession,
  revokeCurrentCustomerSession,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const session = await getCustomerSession();
  await revokeCurrentCustomerSession();

  if (session) {
    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: session.customer.id,
      email: session.customer.email,
      action: "LOGOUT",
      success: true,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
  }

  return NextResponse.json({ ok: true });
}
