import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { clearCustomerSessionCookie } from "@/lib/auth/cookies";
import { deleteCustomerOwnedSession, requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!id || id.length > 64) {
    return NextResponse.json(
      { ok: false, error: "Invalid session identifier" },
      { status: 400 }
    );
  }

  const deleted = await deleteCustomerOwnedSession(auth.customer.id, id);
  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "Session not found" },
      { status: 404 }
    );
  }

  const revokedCurrent = id === auth.sessionId;
  if (revokedCurrent) {
    await clearCustomerSessionCookie();
  }

  await logAuthEvent({
    actorType: AuthActorType.CUSTOMER,
    customerId: auth.customer.id,
    email: auth.customer.email,
    action: "SESSION_REVOKED",
    success: true,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    metadata: { revokedSessionId: id, revokedCurrent },
  });

  return NextResponse.json({ ok: true, revokedCurrent });
}
