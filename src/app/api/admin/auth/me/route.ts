import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { listAdminSessions } from "@/lib/auth/session";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) return auth.response;

  const canReadAllAudit = auth.permissions.includes("audit:read");

  const [sessions, auditLogs] = await Promise.all([
    listAdminSessions(auth.admin.id, auth.sessionId),
    prisma.authAuditLog.findMany({
      where: canReadAllAudit ? {} : { adminUserId: auth.admin.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        actorType: true,
        email: true,
        action: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    admin: auth.admin,
    permissions: auth.permissions,
    sessions,
    auditLogs,
  });
}
