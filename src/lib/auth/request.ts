import "server-only";
import { getCsrfCookie } from "./cookies";
import { timingSafeEqualHex } from "./crypto";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "127.0.0.1";
}

export function getUserAgent(request: Request): string {
  return (request.headers.get("user-agent") ?? "").slice(0, 400);
}

function getAllowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).origin);
    } catch {
      // Ignore malformed env URL
    }
  }
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    allowed.add(`${proto}://${host}`);
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }
  return allowed;
}

export async function verifyCsrf(
  request: Request
): Promise<{ ok: true } | { ok: false; error: string }> {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins(request);

  if (origin) {
    if (!allowedOrigins.has(origin)) {
      return { ok: false, error: "Invalid request origin" };
    }
  } else if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!allowedOrigins.has(refOrigin)) {
        return { ok: false, error: "Invalid request referer" };
      }
    } catch {
      return { ok: false, error: "Malformed request referer" };
    }
  }

  const headerToken = request.headers.get("x-csrf-token")?.trim() ?? "";
  const cookieToken = (await getCsrfCookie())?.trim() ?? "";

  if (!headerToken || !cookieToken || !timingSafeEqualHex(headerToken, cookieToken)) {
    return {
      ok: false,
      error: "Security token missing or expired. Please refresh and try again.",
    };
  }

  return { ok: true };
}

export async function verifyTurnstile(
  token: string | null | undefined,
  ipAddress: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secretKey) {
    // Turnstile not configured in this environment
    return true;
  }

  if (!token || !token.trim()) {
    return false;
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", secretKey);
    form.set("response", token.trim());
    if (ipAddress) form.set("remoteip", ipAddress);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
