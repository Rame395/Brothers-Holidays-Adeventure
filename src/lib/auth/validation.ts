import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const emailFieldSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(160, "Email address is too long");

export const newPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Passphrase must be at least ${PASSWORD_MIN_LENGTH} characters long`
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Passphrase must not exceed ${PASSWORD_MAX_LENGTH} characters`
  )
  .refine((val) => val.trim().length > 0, "Passphrase cannot be blank");

export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(PASSWORD_MAX_LENGTH, "Password is too long");

export const adminLoginSchema = z.object({
  email: emailFieldSchema,
  password: loginPasswordSchema,
  turnstileToken: z.string().max(4096).optional().nullable(),
});

export const customerLoginSchema = z.object({
  email: emailFieldSchema,
  password: loginPasswordSchema,
  turnstileToken: z.string().max(4096).optional().nullable(),
});

export const customerSignupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  email: emailFieldSchema,
  password: newPasswordSchema,
  phone: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  turnstileToken: z.string().max(4096).optional().nullable(),
});

export const totpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit authenticator code"),
});

export const mfaVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Enter your 6-digit authenticator code or backup code")
    .max(32, "Verification code is too long"),
  useBackupCode: z.boolean().optional().default(false),
});

export const backupCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(8, "Enter a valid recovery backup code")
    .max(32, "Backup code is invalid"),
});

export const forgotPasswordSchema = z.object({
  email: emailFieldSchema,
  turnstileToken: z.string().max(4096).optional().nullable(),
});

export const passwordResetSchema = z.object({
  token: z.string().trim().min(20, "Invalid reset token").max(256),
  password: newPasswordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: loginPasswordSchema,
  newPassword: newPasswordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(20, "Invalid verification token").max(256),
});

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  nationality: z.string().trim().max(80).optional().nullable(),
});

export const deleteAccountSchema = z.object({
  password: z.string().max(PASSWORD_MAX_LENGTH).optional().nullable(),
  confirmationText: z.string().trim().max(32),
});

/**
 * Whitelist internal relative redirect paths to eliminate Open Redirects.
 * Rejects protocol-relative URLs (`//evil.com`), backslashes (`/\evil.com`),
 * and paths outside allowed prefixes.
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  allowedPrefixes: readonly string[],
  fallback: string
): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  if (/[\r\n\0]/.test(trimmed)) return fallback;

  let pathnameOnly = trimmed;
  try {
    const parsed = new URL(trimmed, "https://localhost.invalid");
    if (parsed.origin !== "https://localhost.invalid") return fallback;
    pathnameOnly = parsed.pathname;
  } catch {
    return fallback;
  }

  const allowed = allowedPrefixes.some(
    (prefix) => pathnameOnly === prefix || pathnameOnly.startsWith(`${prefix}/`)
  );
  return allowed ? trimmed : fallback;
}

export function parseDeviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return "Unknown Device";
  const ua = userAgent;

  let browser = "Browser";
  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome/") && !ua.includes("Chromium")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("curl/")) browser = "curl";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
}

export function evaluatePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  meetsMinLength: boolean;
} {
  const meetsMinLength = password.length >= PASSWORD_MIN_LENGTH;
  if (!password) {
    return { score: 0, label: "Enter a passphrase", meetsMinLength: false };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= PASSWORD_MIN_LENGTH) points += 1;
  if (password.length >= 16) points += 1;

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9\s]/.test(password),
    /\s/.test(password),
  ].filter(Boolean).length;

  if (classes >= 3 || password.length >= 20) points += 1;

  const clamped = Math.min(4, Math.max(1, points)) as 1 | 2 | 3 | 4;
  const labels: Record<1 | 2 | 3 | 4, string> = {
    1: "Weak — use at least 12 characters",
    2: meetsMinLength ? "Fair — longer passphrases are stronger" : "Too short (12+ chars needed)",
    3: "Strong passphrase",
    4: "Very strong passphrase",
  };

  return {
    score: clamped,
    label: labels[clamped],
    meetsMinLength,
  };
}
