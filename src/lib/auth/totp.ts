import "server-only";
import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { hmacHex, timingSafeEqualHex } from "./crypto";

const TOTP_ISSUER = "BROTHERS Holidays Adventure";

export async function createTotpSetup(
  email: string,
  portalLabel: "Admin" | "Traveler"
): Promise<{
  secretBase32: string;
  otpauthUri: string;
  qrDataUrl: string;
}> {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_ISSUER,
    label: `${portalLabel} (${email})`,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUri, {
    width: 240,
    margin: 2,
    color: {
      dark: "#071317",
      light: "#ffffff",
    },
  });

  return {
    secretBase32: secret.base32,
    otpauthUri,
    qrDataUrl,
  };
}

export function verifyTotpToken(secretBase32: string, rawCode: string): boolean {
  const token = rawCode.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(token)) return false;

  try {
    const totp = new OTPAuth.TOTP({
      issuer: TOTP_ISSUER,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

function normalizeBackupCode(rawCode: string): string {
  return rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hashBackupCode(
  normalizedCode: string,
  actorType: "ADMIN" | "CUSTOMER",
  userId: string
): string {
  return hmacHex(normalizedCode, `mfa-backup:${actorType}:${userId}`);
}

export function generateBackupCodes(
  actorType: "ADMIN" | "CUSTOMER",
  userId: string,
  count = 10
): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i += 1) {
    // 48-bit random uppercase hex formatted XXXX-XXXX-XXXX
    const rawHex = crypto.randomBytes(6).toString("hex").toUpperCase();
    const formatted = `${rawHex.slice(0, 4)}-${rawHex.slice(4, 8)}-${rawHex.slice(
      8,
      12
    )}`;
    plainCodes.push(formatted);
    hashedCodes.push(hashBackupCode(rawHex, actorType, userId));
  }

  return { plainCodes, hashedCodes };
}

export async function replaceBackupCodes(
  actorType: "ADMIN" | "CUSTOMER",
  userId: string
): Promise<string[]> {
  const { plainCodes, hashedCodes } = generateBackupCodes(actorType, userId, 10);
  const prismaActor =
    actorType === "ADMIN" ? AuthActorType.ADMIN : AuthActorType.CUSTOMER;

  await prisma.$transaction([
    prisma.mfaBackupCode.deleteMany({
      where:
        actorType === "ADMIN"
          ? { actorType: prismaActor, adminUserId: userId }
          : { actorType: prismaActor, customerId: userId },
    }),
    prisma.mfaBackupCode.createMany({
      data: hashedCodes.map((codeHash) => ({
        codeHash,
        actorType: prismaActor,
        adminUserId: actorType === "ADMIN" ? userId : null,
        customerId: actorType === "CUSTOMER" ? userId : null,
      })),
    }),
  ]);

  return plainCodes;
}

export async function verifyAndConsumeBackupCode(
  actorType: "ADMIN" | "CUSTOMER",
  userId: string,
  rawCode: string
): Promise<boolean> {
  const normalized = normalizeBackupCode(rawCode);
  if (normalized.length < 8) return false;

  const candidateHash = hashBackupCode(normalized, actorType, userId);
  const prismaActor =
    actorType === "ADMIN" ? AuthActorType.ADMIN : AuthActorType.CUSTOMER;

  const unusedCodes = await prisma.mfaBackupCode.findMany({
    where:
      actorType === "ADMIN"
        ? { actorType: prismaActor, adminUserId: userId, usedAt: null }
        : { actorType: prismaActor, customerId: userId, usedAt: null },
    select: { id: true, codeHash: true },
  });

  let matchedId: string | null = null;
  for (const row of unusedCodes) {
    if (timingSafeEqualHex(row.codeHash, candidateHash)) {
      matchedId = row.id;
    }
  }

  if (!matchedId) return false;

  const updated = await prisma.mfaBackupCode.updateMany({
    where: { id: matchedId, usedAt: null },
    data: { usedAt: new Date() },
  });

  return updated.count === 1;
}
