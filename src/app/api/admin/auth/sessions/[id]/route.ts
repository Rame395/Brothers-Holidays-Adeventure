import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import { logAuthEvent } from "@/lib/auth/audit";
import { clearAdminSessionCookie } from "@/lib/auth/cookies";
import { deleteAdminOwnedSession, requireAdminApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!id || id.length > 64) {
    return NextResponse.json(
      { ok: false, error: "Invalid session identifier" },
      { status: 400 }
    );
  }

  const deleted = await deleteAdminOwnedSession(auth.admin.id, id);
  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "Session not found" },
      { status: 404 }
    );
  }

  const revokedCurrent = id === auth.sessionId;
  if (revokedCurrent) {
    await clearAdminSessionCookie();
  }

  await logAuthEvent({
    actorType: AuthActorType.ADMIN,
    adminUserId: auth.admin.id,
    email: auth.admin.email,
    action: "SESSION_REVOKED",
    success: true,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    metadata: { revokedSessionId: id, revokedCurrent },
  });

  return NextResponse.json({ ok: true, revokedCurrent });
}
