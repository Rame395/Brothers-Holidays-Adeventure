import { NextRequest, NextResponse } from "next/server";
import { isHttpsProduction, OAUTH_STATE_COOKIE } from "@/lib/auth/cookies";
import { encryptSecret, generateSecureToken } from "@/lib/auth/crypto";
import {
  buildGoogleAuthorizationUrl,
  createPkcePair,
  getGoogleOAuthConfig,
} from "@/lib/auth/google-oauth";
import { sanitizeRedirectPath } from "@/lib/auth/validation";

function getSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_not_configured", request.url)
    );
  }

  const nextPath = sanitizeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    ["/account", "/destinations", "/treks"],
    "/account"
  );

  const state = generateSecureToken(24);
  const nonce = generateSecureToken(24);
  const { codeVerifier, codeChallenge } = createPkcePair();

  const sealedState = encryptSecret(
    JSON.stringify({
      state,
      nonce,
      codeVerifier,
      next: nextPath,
      exp: Date.now() + 10 * 60 * 1000,
    })
  );

  const redirectUri = `${getSiteOrigin(request)}/api/auth/google/callback`;
  const authUrl = buildGoogleAuthorizationUrl({
    clientId: config.clientId,
    redirectUri,
    state,
    nonce,
    codeChallenge,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, sealedState, {
    httpOnly: true,
    secure: isHttpsProduction(),
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });

  return response;
}
