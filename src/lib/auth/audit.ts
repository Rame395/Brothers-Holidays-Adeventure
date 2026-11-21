import "server-only";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { parseDeviceLabel } from "./validation";
import { sendSecurityAlertEmail } from "./email";

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|otp|code|cookie|authorization|hash/i;

function sanitizeMetadata(
  value: Record<string, unknown> | undefined
): string | null {
  if (!value) return null;
  const redact = (obj: unknown): unknown => {
    if (Array.isArray(obj)) return obj.map(redact);
    if (obj && typeof obj === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (SENSITIVE_KEY_PATTERN.test(k)) {
          out[k] = "[REDACTED]";
        } else {
          out[k] = redact(v);
        }
      }
      return out;
    }
    return obj;
  };
  try {
    return JSON.stringify(redact(value));
  } catch {
    return null;
  }
}

export async function logAuthEvent(params: {
  actorType: AuthActorType;
  adminUserId?: string | null;
  customerId?: string | null;
  email?: string | null;
  action: string;
  success?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.authAuditLog.create({
      data: {
        actorType: params.actorType,
        adminUserId: params.adminUserId ?? null,
        customerId: params.customerId ?? null,
        email: params.email ?? null,
        action: params.action,
        success: params.success ?? true,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ? params.userAgent.slice(0, 400) : null,
        metadata: sanitizeMetadata(params.metadata),
      },
    });
  } catch (err) {
    console.error("Failed to persist AuthAuditLog:", err);
  }
}

export async function detectAndAlertNewDevice(params: {
  actorType: "ADMIN" | "CUSTOMER";
  userId: string;
  email: string;
  name: string;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  try {
    const deviceLabel = parseDeviceLabel(params.userAgent);
    const whereUser =
      params.actorType === "ADMIN"
        ? { adminUserId: params.userId }
        : { customerId: params.userId };

    const previousLogins = await prisma.authAuditLog.findMany({
      where: {
        actorType: params.actorType,
        ...whereUser,
        action: "LOGIN_SUCCESS",
        success: true,
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { ipAddress: true, userAgent: true },
    });

    if (previousLogins.length === 0) {
      // First recorded login — baseline device
      return;
    }

    const seenBefore = previousLogins.some(
      (entry) =>
        entry.ipAddress === params.ipAddress &&
        parseDeviceLabel(entry.userAgent) === deviceLabel
    );

    if (!seenBefore) {
      await logAuthEvent({
        actorType: params.actorType,
        adminUserId: params.actorType === "ADMIN" ? params.userId : null,
        customerId: params.actorType === "CUSTOMER" ? params.userId : null,
        email: params.email,
        action: "NEW_DEVICE_LOGIN",
        success: true,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { deviceLabel },
      });

      await sendSecurityAlertEmail({
        to: params.email,
        name: params.name,
        eventTitle: "New sign-in from an unrecognized device",
        details: `Device: ${deviceLabel} | IP Address: ${params.ipAddress} | Time: ${new Date().toUTCString()}`,
      });
    }
  } catch (err) {
    console.error("New-device alert check error:", err);
  }
}
