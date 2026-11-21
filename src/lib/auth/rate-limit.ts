import "server-only";
import prisma from "@/lib/prisma";

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function checkRateLimit(
  bucketKey: string,
  maxAttempts: number,
  windowMs: number,
  blockMs = 15 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
  const now = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.rateLimitAttempt.findUnique({
        where: { bucketKey },
      });

      if (existing?.blockedUntil && existing.blockedUntil > now) {
        const retryAfterSec = Math.max(
          1,
          Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000)
        );
        return { allowed: false, remaining: 0, retryAfterSec };
      }

      if (
        !existing ||
        existing.windowStart.getTime() + windowMs <= now.getTime()
      ) {
        await tx.rateLimitAttempt.upsert({
          where: { bucketKey },
          create: {
            bucketKey,
            count: 1,
            windowStart: now,
            blockedUntil: null,
          },
          update: {
            count: 1,
            windowStart: now,
            blockedUntil: null,
          },
        });
        return {
          allowed: true,
          remaining: Math.max(0, maxAttempts - 1),
          retryAfterSec: 0,
        };
      }

      const nextCount = existing.count + 1;
      if (nextCount > maxAttempts) {
        const blockedUntil = new Date(now.getTime() + blockMs);
        await tx.rateLimitAttempt.update({
          where: { id: existing.id },
          data: { count: nextCount, blockedUntil },
        });
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.ceil(blockMs / 1000),
        };
      }

      await tx.rateLimitAttempt.update({
        where: { id: existing.id },
        data: { count: nextCount },
      });

      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts - nextCount),
        retryAfterSec: 0,
      };
    });
  } catch (err) {
    console.error("Rate limit check fallback allow:", err);
    return { allowed: true, remaining: 1, retryAfterSec: 0 };
  }
}

export async function clearRateLimit(bucketKey: string): Promise<void> {
  try {
    await prisma.rateLimitAttempt.deleteMany({
      where: { bucketKey },
    });
  } catch {
    // Non-fatal cleanup error
  }
}

export async function applyProgressiveDelay(failures: number): Promise<void> {
  if (failures <= 0) return;
  const delayMs = Math.min(1500, failures * 250);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
