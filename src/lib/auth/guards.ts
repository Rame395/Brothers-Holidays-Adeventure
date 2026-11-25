import "server-only";
import { AdminRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { connection, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyCsrf } from "./request";
import { getAdminSession, getCustomerSession } from "./session";

export type AdminPermission =
  | "trips:read"
  | "trips:write"
  | "departures:write"
  | "crm:read"
  | "crm:write"
  | "bookings:read"
  | "bookings:write"
  | "journal:write"
  | "seo:write"
  | "settings:write"
  | "users:manage"
  | "audit:read";

export const ADMIN_ROLE_PERMISSIONS: Record<
  AdminRole,
  readonly AdminPermission[]
> = {
  SUPER_ADMIN: [
    "trips:read",
    "trips:write",
    "departures:write",
    "crm:read",
    "crm:write",
    "bookings:read",
    "bookings:write",
    "journal:write",
    "seo:write",
    "settings:write",
    "users:manage",
    "audit:read",
  ],
  EDITOR: [
    "trips:read",
    "trips:write",
    "departures:write",
    "journal:write",
    "seo:write",
    "crm:read",
    "bookings:read",
  ],
  SALES_AGENT: [
    "trips:read",
    "crm:read",
    "crm:write",
    "bookings:read",
    "bookings:write",
  ],
};

export function hasAdminPermission(
  role: AdminRole,
  permission: AdminPermission
): boolean {
  return ADMIN_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export async function requireAdmin(options?: {
  roles?: AdminRole[];
  permission?: AdminPermission;
  allowPendingMfa?: boolean;
}) {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const admin = session.adminUser;
  if (!options?.allowPendingMfa && !session.mfaVerified) {
    redirect("/admin/mfa-verify");
  }

  if (options?.roles && !options.roles.includes(admin.role)) {
    redirect("/admin?denied=1");
  }
  if (
    options?.permission &&
    !hasAdminPermission(admin.role, options.permission)
  ) {
    redirect("/admin?denied=1");
  }

  return {
    sessionId: session.id,
    mfaVerified: session.mfaVerified,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      mfaEnabled: admin.mfaEnabled,
      mfaRequired: admin.mfaRequired,
      lastLoginAt: admin.lastLoginAt,
      passwordChangedAt: admin.passwordChangedAt,
    },
    permissions: ADMIN_ROLE_PERMISSIONS[admin.role],
  };
}

export async function requireAdminApi(
  request: Request,
  options?: {
    roles?: AdminRole[];
    permission?: AdminPermission;
    allowPendingMfa?: boolean;
    checkCsrf?: boolean;
  }
) {
  const method = request.method.toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (isMutation && options?.checkCsrf !== false) {
    const csrf = await verifyCsrf(request);
    if (!csrf.ok) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { ok: false, error: csrf.error },
          { status: 403 }
        ),
      };
    }
  }

  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const admin = session.adminUser;
  if (!options?.allowPendingMfa && !session.mfaVerified) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          error: "Email verification required",
          nextStep: "mfa_verify",
        },
        { status: 403 }
      ),
    };
  }

  if (options?.roles && !options.roles.includes(admin.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Insufficient permissions for this action" },
        { status: 403 }
      ),
    };
  }

  if (
    options?.permission &&
    !hasAdminPermission(admin.role, options.permission)
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Insufficient permissions for this action" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    sessionId: session.id,
    mfaVerified: session.mfaVerified,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      mfaEnabled: admin.mfaEnabled,
      mfaRequired: admin.mfaRequired,
      lastLoginAt: admin.lastLoginAt,
      passwordChangedAt: admin.passwordChangedAt,
    },
    permissions: ADMIN_ROLE_PERMISSIONS[admin.role],
  };
}

export async function getOptionalCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;
  if (session.customer.mfaEnabled && !session.mfaVerified) {
    return null;
  }
  const c = session.customer;
  return {
    sessionId: session.id,
    customer: {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      whatsapp: c.whatsapp,
      country: c.country,
      nationality: c.nationality,
      emailVerifiedAt: c.emailVerifiedAt,
      mfaEnabled: c.mfaEnabled,
      hasPassword: Boolean(c.passwordHash),
      lastLoginAt: c.lastLoginAt,
      createdAt: c.createdAt,
    },
  };
}

export async function requireCustomer(options?: { allowPendingMfa?: boolean }) {
  await connection();
  const session = await getCustomerSession();
  if (!session) {
    redirect("/login");
  }

  const c = session.customer;
  if (!options?.allowPendingMfa && c.mfaEnabled && !session.mfaVerified) {
    redirect("/login/mfa");
  }

  return {
    sessionId: session.id,
    mfaVerified: session.mfaVerified,
    customer: {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      whatsapp: c.whatsapp,
      country: c.country,
      nationality: c.nationality,
      emailVerifiedAt: c.emailVerifiedAt,
      mfaEnabled: c.mfaEnabled,
      hasPassword: Boolean(c.passwordHash),
      lastLoginAt: c.lastLoginAt,
      createdAt: c.createdAt,
    },
  };
}

export async function requireCustomerApi(
  request: Request,
  options?: { allowPendingMfa?: boolean; checkCsrf?: boolean }
) {
  const method = request.method.toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (isMutation && options?.checkCsrf !== false) {
    const csrf = await verifyCsrf(request);
    if (!csrf.ok) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { ok: false, error: csrf.error },
          { status: 403 }
        ),
      };
    }
  }

  const session = await getCustomerSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Please sign in to continue" },
        { status: 401 }
      ),
    };
  }

  const c = session.customer;
  if (!options?.allowPendingMfa && c.mfaEnabled && !session.mfaVerified) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          error: "Two-factor verification required",
          nextStep: "mfa_verify",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    sessionId: session.id,
    mfaVerified: session.mfaVerified,
    customer: {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      whatsapp: c.whatsapp,
      country: c.country,
      nationality: c.nationality,
      emailVerifiedAt: c.emailVerifiedAt,
      mfaEnabled: c.mfaEnabled,
      hasPassword: Boolean(c.passwordHash),
      lastLoginAt: c.lastLoginAt,
      createdAt: c.createdAt,
    },
  };
}

// IDOR-safe ownership helpers — never trust IDs without scoping by session actor ID
export async function getCustomerOwnedBooking(
  customerId: string,
  bookingId: string
) {
  return prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });
}

export async function getCustomerOwnedInquiry(
  customerId: string,
  inquiryId: string
) {
  return prisma.inquiry.findFirst({
    where: { id: inquiryId, customerId },
  });
}

export async function deleteAdminOwnedSession(
  adminUserId: string,
  sessionId: string
): Promise<boolean> {
  const result = await prisma.adminSession.updateMany({
    where: { id: sessionId, adminUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count === 1;
}

export async function deleteCustomerOwnedSession(
  customerId: string,
  sessionId: string
): Promise<boolean> {
  const result = await prisma.customerSession.updateMany({
    where: { id: sessionId, customerId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count === 1;
}
