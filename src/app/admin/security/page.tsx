import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { listAdminSessions } from "@/lib/auth/session";
import AdminSecurityOverviewClient from "@/components/admin/AdminSecurityOverviewClient";

async function AdminSecurityGate() {
  const auth = await requireAdmin();
  const canReadAllAudit = auth.permissions.includes("audit:read");

  const [sessions, auditLogs] = await Promise.all([
    listAdminSessions(auth.admin.id, auth.sessionId),
    prisma.authAuditLog.findMany({
      where: canReadAllAudit ? {} : { adminUserId: auth.admin.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        actorType: true,
        email: true,
        action: true,
        success: true,
        ipAddress: true,
        metadata: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminSecurityOverviewClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
        mfaEnabled: auth.admin.mfaEnabled,
        lastLoginAt: auth.admin.lastLoginAt
          ? auth.admin.lastLoginAt.toISOString()
          : null,
      }}
      permissions={auth.permissions}
      initialSessions={sessions.map((s) => ({
        id: s.id,
        deviceLabel: s.deviceLabel,
        ipAddress: s.ipAddress,
        mfaVerified: s.mfaVerified,
        lastActivityAt: s.lastActivityAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        isCurrent: s.isCurrent,
      }))}
      initialAuditLogs={auditLogs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}

export default function AdminSecurityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading security overview...
        </div>
      }
    >
      <AdminSecurityGate />
    </Suspense>
  );
}
