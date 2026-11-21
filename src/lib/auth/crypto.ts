import "server-only";
import crypto from "node:crypto";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

const ARGON2_OPTIONS = {
  algorithm: 2 as const, // 2 = Argon2id
  memoryCost: 19456, // 19 MiB (OWASP recommended baseline)
  timeCost: 2,
  parallelism: 1,
};

// Precomputed valid Argon2id digest for constant-time missing-user login verification
const DUMMY_ARGON2_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$iqbflucDeBuuGpC1U5cIcg$U0ovvZPkhyUtQLc/r19sdJE3Vb4DCUmyd80QcgxFc+I";

export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  if (storedHash.startsWith("$argon2")) {
    try {
      const valid = await argon2Verify(storedHash, password);
      return { valid, needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    try {
      const valid = await bcrypt.compare(password, storedHash);
      return { valid, needsRehash: valid };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  return { valid: false, needsRehash: false };
}

export async function verifyDummyPassword(password: string): Promise<void> {
  try {
    await argon2Verify(DUMMY_ARGON2_HASH, password);
  } catch {
    // Timing mitigation only
  }
}

export async function checkBreachedPassword(password: string): Promise<{
  breached: boolean;
  count: number;
  skipped?: boolean;
}> {
  try {
    const sha1 = crypto
      .createHash("sha1")
      .update(password, "utf8")
      .digest("hex")
      .toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "BrothersHolidaysAuthCheck/1.0",
      },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (!res.ok) {
      return { breached: false, count: 0, skipped: true };
    }

    const body = await res.text();
    for (const line of body.split(/\r?\n/)) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix === suffix) {
        const count = Number.parseInt(countStr ?? "0", 10);
        if (count > 0) {
          return { breached: true, count };
        }
      }
    }

    return { breached: false, count: 0 };
  } catch {
    // Fail open gracefully if network/DNS is unreachable (e.g. airgapped sandbox)
    return { breached: false, count: 0, skipped: true };
  }
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function generateRandomHex(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function getEncryptionKey(): Buffer {
  const raw = process.env.AUTH_ENCRYPTION_KEY?.trim();
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  const fallbackSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (fallbackSecret && fallbackSecret.length >= 32) {
    return crypto
      .createHash("sha256")
      .update(`bha-enc:${fallbackSecret}`, "utf8")
      .digest();
  }
  throw new Error(
    "Missing AUTH_ENCRYPTION_KEY (64 hex characters) in environment configuration"
  );
}

export function hmacHex(value: string, context: string): string {
  const key = getEncryptionKey();
  return crypto
    .createHmac("sha256", key)
    .update(`${context}:${value}`, "utf8")
    .digest("hex");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted secret payload");
  }
  const [ivB64, tagB64, encB64] = parts;
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
