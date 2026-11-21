import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PUBLIC_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function generateRandomHex(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hasAdminCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("__Host-bha_admin_session") ||
    request.cookies.has("bha_admin_session")
  );
}

function hasCustomerCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("__Host-bha_customer_session") ||
    request.cookies.has("bha_customer_session")
  );
}

function isHttpsProductionRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    request.nextUrl.protocol.replace(":", "");
  return (
    proto === "https" &&
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://")
  );
}

function applyCsrfCookieIfMissing(
  request: NextRequest,
  response: NextResponse
): void {
  if (request.method !== "GET" || request.nextUrl.pathname.startsWith("/api/")) {
    return;
  }
  if (request.cookies.get("bha_csrf")?.value) {
    return;
  }
  response.cookies.set("bha_csrf", generateRandomHex(32), {
    httpOnly: false,
    secure: isHttpsProductionRequest(request),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.has(pathname)) {
    if (!hasAdminCookie(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("next", `${pathname}${search}`);
      }
      const redirectResponse = NextResponse.redirect(loginUrl);
      applyCsrfCookieIfMissing(request, redirectResponse);
      return redirectResponse;
    }
  }

  if (pathname.startsWith("/account")) {
    if (!hasCustomerCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      const redirectResponse = NextResponse.redirect(loginUrl);
      applyCsrfCookieIfMissing(request, redirectResponse);
      return redirectResponse;
    }
  }

  const response = NextResponse.next();
  applyCsrfCookieIfMissing(request, response);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login/:path*",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/auth/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
  ],
};
