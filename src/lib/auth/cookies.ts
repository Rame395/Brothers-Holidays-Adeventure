import "server-only";
import { cookies } from "next/headers";

export function isHttpsProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://")
  );
}

export function getAdminCookieName(): string {
  return isHttpsProduction() ? "__Host-bha_admin_session" : "bha_admin_session";
}

export function getCustomerCookieName(): string {
  return isHttpsProduction()
    ? "__Host-bha_customer_session"
    : "bha_customer_session";
}

export const OAUTH_STATE_COOKIE = "bha_oauth_state";
export const CSRF_COOKIE = "bha_csrf";
export const ADMIN_TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getAdminTrustedDeviceCookieName(): string {
  return isHttpsProduction()
    ? "__Host-bha_admin_trusted_device"
    : "bha_admin_trusted_device";
}

export async function getAdminTrustedDeviceCookie(): Promise<string | null> {
  const store = await cookies();
  return (
    store.get("__Host-bha_admin_trusted_device")?.value ??
    store.get("bha_admin_trusted_device")?.value ??
    null
  );
}

export async function setAdminTrustedDeviceCookie(
  rawToken: string,
  expiresAt: Date
): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  store.set(getAdminTrustedDeviceCookieName(), rawToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminTrustedDeviceCookie(): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  for (const name of [
    "__Host-bha_admin_trusted_device",
    "bha_admin_trusted_device",
  ]) {
    store.set(name, "", {
      httpOnly: true,
      secure: name.startsWith("__Host-") ? true : secure,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getAdminSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return (
    store.get("__Host-bha_admin_session")?.value ??
    store.get("bha_admin_session")?.value ??
    null
  );
}

export async function setAdminSessionCookie(
  rawToken: string,
  expiresAt: Date
): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  store.set(getAdminCookieName(), rawToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  for (const name of ["__Host-bha_admin_session", "bha_admin_session"]) {
    store.set(name, "", {
      httpOnly: true,
      secure: name.startsWith("__Host-") ? true : secure,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getCustomerSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return (
    store.get("__Host-bha_customer_session")?.value ??
    store.get("bha_customer_session")?.value ??
    null
  );
}

export async function setCustomerSessionCookie(
  rawToken: string,
  expiresAt: Date
): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  store.set(getCustomerCookieName(), rawToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const store = await cookies();
  const secure = isHttpsProduction();
  for (const name of ["__Host-bha_customer_session", "bha_customer_session"]) {
    store.set(name, "", {
      httpOnly: true,
      secure: name.startsWith("__Host-") ? true : secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getCsrfCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(CSRF_COOKIE)?.value ?? null;
}
