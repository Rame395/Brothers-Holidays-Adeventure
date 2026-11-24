import "server-only";
import prisma from "@/lib/prisma";
import {
  ADMIN_TRUSTED_DEVICE_TTL_MS,
  clearAdminSessionCookie,
  clearCustomerSessionCookie,
  getAdminSessionCookie,
  getAdminTrustedDeviceCookie,
  getCustomerSessionCookie,
  setAdminSessionCookie,
  setAdminTrustedDeviceCookie,
  setCustomerSessionCookie,
} from "./cookies";
import {
  generateSecureToken,
  hmacHex,
  sha256Hex,
  timingSafeEqualHex,
} from "./crypto";
import { parseDeviceLabel } from "./validation";

export const ADMIN_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const ADMIN_ABSOLUTE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const ADMIN_TRUSTED_DEVICE_CONTEXT = "admin-trusted-device-v1";

function buildAdminTrustedDevicePayload(params: {
  adminUserId: string;
  expiresAtMs: number;
  passwordChangedAt?: Date | null;
  mfaVerifiedAt?: Date | null;
}): string {
  const pwdTs = params.passwordChangedAt?.getTime() ?? 0;
  const mfaTs = params.mfaVerifiedAt?.getTime() ?? 0;
  return `${params.adminUserId}:${params.expiresAtMs}:${pwdTs}:${mfaTs}`;
}

/** Issues an HMAC-signed 30-day trusted-device cookie bound to current credentials. */
export async function issueAdminTrustedDevice(params: {
  adminUserId: string;
  passwordChangedAt?: Date | null;
  mfaVerifiedAt?: Date | null;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + ADMIN_TRUSTED_DEVICE_TTL_MS);
  const expiresAtMs = expiresAt.getTime();
  const payload = buildAdminTrustedDevicePayload({
    adminUserId: params.adminUserId,
    expiresAtMs,
    passwordChangedAt: params.passwordChangedAt,
    mfaVerifiedAt: params.mfaVerifiedAt,
  });
  const signature = hmacHex(payload, ADMIN_TRUSTED_DEVICE_CONTEXT);
  const token = `${params.adminUserId}.${expiresAtMs}.${signature}`;
  await setAdminTrustedDeviceCookie(token, expiresAt);
}

/** Verifies whether the incoming request carries a valid non-expired trusted-device cookie. */
export async function hasValidAdminTrustedDevice(params: {
  adminUserId: string;
  passwordChangedAt?: Date | null;
  mfaVerifiedAt?: Date | null;
}): Promise<boolean> {
  try {
    const raw = await getAdminTrustedDeviceCookie();
    if (!raw) return false;

    const parts = raw.split(".");
    if (parts.length !== 3) return false;

    const [uid, expStr, sig] = parts;
    if (!uid || uid !== params.adminUserId || !sig) return false;

    const expMs = Number(expStr);
    if (!Number.isFinite(expMs) || expMs <= Date.now()) return false;

    const payload = buildAdminTrustedDevicePayload({
      adminUserId: params.adminUserId,
      expiresAtMs: expMs,
      passwordChangedAt: params.passwordChangedAt,
      mfaVerifiedAt: params.mfaVerifiedAt,
    });
    const expected = hmacHex(payload, ADMIN_TRUSTED_DEVICE_CONTEXT);
    return timingSafeEqualHex(sig, expected);
  } catch {
    return false;
  }
}

export const CUSTOMER_IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const CUSTOMER_ABSOLUTE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const ACTIVITY_UPDATE_THROTTLE_MS = 5 * 60 * 1000;

export async function createAdminSession(params: {
  adminUserId: string;
  mfaVerified: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const rawToken = generateSecureToken(32);
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + ADMIN_ABSOLUTE_TIMEOUT_MS);

  const session = await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId: params.adminUserId,
      mfaVerified: params.mfaVerified,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ? params.userAgent.slice(0, 400) : null,
      deviceLabel: parseDeviceLabel(params.userAgent),
      expiresAt,
    },
  });

  await setAdminSessionCookie(rawToken, expiresAt);
  return session;
}

export async function rotateAdminSession(params: {
  oldSessionId: string;
  adminUserId: string;
  mfaVerified: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const rawToken = generateSecureToken(32);
  const tokenHash = sha256Hex(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_ABSOLUTE_TIMEOUT_MS);

  const [, session] = await prisma.$transaction([
    prisma.adminSession.updateMany({
      where: { id: params.oldSessionId, adminUserId: params.adminUserId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.adminSession.create({
      data: {
        tokenHash,
        adminUserId: params.adminUserId,
        mfaVerified: params.mfaVerified,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ? params.userAgent.slice(0, 400) : null,
        deviceLabel: parseDeviceLabel(params.userAgent),
        expiresAt,
      },
    }),
  ]);

  await setAdminSessionCookie(rawToken, expiresAt);
  return session;
}

export async function getAdminSession() {
  const rawToken = await getAdminSessionCookie();
  if (!rawToken) return null;

  const tokenHash = sha256Hex(rawToken);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          mfaEnabled: true,
          mfaRequired: true,
          lastLoginAt: true,
          passwordChangedAt: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || !session.adminUser.isActive) {
    return null;
  }

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    return null;
  }

  if (now - session.lastActivityAt.getTime() > ADMIN_IDLE_TIMEOUT_MS) {
    return null;
  }

  if (
    session.adminUser.passwordChangedAt &&
    session.createdAt < session.adminUser.passwordChangedAt
  ) {
    return null;
  }

  if (now - session.lastActivityAt.getTime() > ACTIVITY_UPDATE_THROTTLE_MS) {
    prisma.adminSession
      .updateMany({
        where: { id: session.id, revokedAt: null },
        data: { lastActivityAt: new Date(now) },
      })
      .catch(() => {});
  }

  return session;
}

export async function revokeCurrentAdminSession(): Promise<void> {
  const rawToken = await getAdminSessionCookie();
  if (rawToken) {
    await prisma.adminSession.updateMany({
      where: { tokenHash: sha256Hex(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await clearAdminSessionCookie();
}

export async function revokeAllAdminSessions(
  adminUserId: string,
  exceptSessionId?: string
): Promise<void> {
  await prisma.adminSession.updateMany({
    where: {
      adminUserId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });
  if (!exceptSessionId) {
    await clearAdminSessionCookie();
  }
}

export async function listAdminSessions(
  adminUserId: string,
  currentSessionId: string
) {
  const now = new Date();
  const rows = await prisma.adminSession.findMany({
    where: {
      adminUserId,
      revokedAt: null,
      expiresAt: { gt: now },
      lastActivityAt: { gt: new Date(now.getTime() - ADMIN_IDLE_TIMEOUT_MS) },
    },
    orderBy: { lastActivityAt: "desc" },
    select: {
      id: true,
      deviceLabel: true,
      ipAddress: true,
      mfaVerified: true,
      lastActivityAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    isCurrent: row.id === currentSessionId,
  }));
}

export async function createCustomerSession(params: {
  customerId: string;
  mfaVerified: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const rawToken = generateSecureToken(32);
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + CUSTOMER_ABSOLUTE_TIMEOUT_MS);

  const session = await prisma.customerSession.create({
    data: {
      tokenHash,
      customerId: params.customerId,
      mfaVerified: params.mfaVerified,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ? params.userAgent.slice(0, 400) : null,
      deviceLabel: parseDeviceLabel(params.userAgent),
      expiresAt,
    },
  });

  await setCustomerSessionCookie(rawToken, expiresAt);
  return session;
}

export async function rotateCustomerSession(params: {
  oldSessionId: string;
  customerId: string;
  mfaVerified: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const rawToken = generateSecureToken(32);
  const tokenHash = sha256Hex(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CUSTOMER_ABSOLUTE_TIMEOUT_MS);

  const [, session] = await prisma.$transaction([
    prisma.customerSession.updateMany({
      where: {
        id: params.oldSessionId,
        customerId: params.customerId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    }),
    prisma.customerSession.create({
      data: {
        tokenHash,
        customerId: params.customerId,
        mfaVerified: params.mfaVerified,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ? params.userAgent.slice(0, 400) : null,
        deviceLabel: parseDeviceLabel(params.userAgent),
        expiresAt,
      },
    }),
  ]);

  await setCustomerSessionCookie(rawToken, expiresAt);
  return session;
}

export async function getCustomerSession() {
  const rawToken = await getCustomerSessionCookie();
  if (!rawToken) return null;

  const tokenHash = sha256Hex(rawToken);
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          whatsapp: true,
          country: true,
          nationality: true,
          emailVerifiedAt: true,
          isActive: true,
          deletedAt: true,
          mfaEnabled: true,
          passwordHash: true,
          lastLoginAt: true,
          passwordChangedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (
    !session ||
    session.revokedAt ||
    !session.customer.isActive ||
    session.customer.deletedAt
  ) {
    return null;
  }

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    return null;
  }

  if (now - session.lastActivityAt.getTime() > CUSTOMER_IDLE_TIMEOUT_MS) {
    return null;
  }

  if (
    session.customer.passwordChangedAt &&
    session.createdAt < session.customer.passwordChangedAt
  ) {
    return null;
  }

  if (now - session.lastActivityAt.getTime() > ACTIVITY_UPDATE_THROTTLE_MS) {
    prisma.customerSession
      .updateMany({
        where: { id: session.id, revokedAt: null },
        data: { lastActivityAt: new Date(now) },
      })
      .catch(() => {});
  }

  return session;
}

export async function revokeCurrentCustomerSession(): Promise<void> {
  const rawToken = await getCustomerSessionCookie();
  if (rawToken) {
    await prisma.customerSession.updateMany({
      where: { tokenHash: sha256Hex(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await clearCustomerSessionCookie();
}

export async function revokeAllCustomerSessions(
  customerId: string,
  exceptSessionId?: string
): Promise<void> {
  await prisma.customerSession.updateMany({
    where: {
      customerId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });
  if (!exceptSessionId) {
    await clearCustomerSessionCookie();
  }
}

export async function listCustomerSessions(
  customerId: string,
  currentSessionId: string
) {
  const now = new Date();
  const rows = await prisma.customerSession.findMany({
    where: {
      customerId,
      revokedAt: null,
      expiresAt: { gt: now },
      lastActivityAt: {
        gt: new Date(now.getTime() - CUSTOMER_IDLE_TIMEOUT_MS),
      },
    },
    orderBy: { lastActivityAt: "desc" },
    select: {
      id: true,
      deviceLabel: true,
      ipAddress: true,
      mfaVerified: true,
      lastActivityAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    isCurrent: row.id === currentSessionId,
  }));
}
