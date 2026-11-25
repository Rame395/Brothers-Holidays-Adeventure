import "server-only";
import crypto from "node:crypto";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { hmacHex } from "@/lib/auth/crypto";
import { sendAdminLoginOtpEmail } from "@/lib/auth/email";

export const ADMIN_OTP_TTL_MS = 10 * 60 * 1000;

export async function issueAdminEmailOtp(params: {
  adminUserId: string;
  email: string;
  name: string;
}): Promise<void> {
  const code = crypto.randomInt(100000, 1000000).toString();
  const tokenHash = hmacHex(code, `admin_email_otp:${params.adminUserId}`);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_OTP_TTL_MS);

  await prisma.verificationToken.updateMany({
    where: {
      actorType: AuthActorType.ADMIN,
      purpose: TokenPurpose.EMAIL_VERIFY,
      adminUserId: params.adminUserId,
      usedAt: null,
    },
    data: { usedAt: now },
  });

  await prisma.verificationToken.create({
    data: {
      tokenHash,
      purpose: TokenPurpose.EMAIL_VERIFY,
      actorType: AuthActorType.ADMIN,
      adminUserId: params.adminUserId,
      email: params.email,
      expiresAt,
    },
  });

  await sendAdminLoginOtpEmail({
    to: params.email,
    name: params.name,
    code,
  });
}

export async function verifyAndConsumeAdminEmailOtp(
  adminUserId: string,
  rawCode: string
): Promise<boolean> {
  const cleanCode = rawCode.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  const tokenHash = hmacHex(cleanCode, `admin_email_otp:${adminUserId}`);
  const now = new Date();

  const row = await prisma.verificationToken.findFirst({
    where: {
      tokenHash,
      actorType: AuthActorType.ADMIN,
      purpose: TokenPurpose.EMAIL_VERIFY,
      adminUserId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true },
  });

  if (!row) {
    return false;
  }

  await prisma.verificationToken.update({
    where: { id: row.id },
    data: { usedAt: now },
  });

  return true;
}
