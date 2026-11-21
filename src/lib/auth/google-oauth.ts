import "server-only";
import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { timingSafeEqualHex } from "./crypto";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() || "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthConfig() !== null;
}

export function createPkcePair(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function buildGoogleAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCodeAndVerify(params: {
  code: string;
  codeVerifier: string;
  expectedNonce: string;
  redirectUri: string;
}): Promise<{
  sub: string;
  email: string;
  name: string;
}> {
  const config = getGoogleOAuthConfig();
  if (!config) {
    throw new Error("Google OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    code_verifier: params.codeVerifier,
    redirect_uri: params.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(8000),
  });

  if (!tokenRes.ok) {
    throw new Error("Google token exchange failed");
  }

  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  if (!tokenJson.id_token) {
    throw new Error("Google response did not include an ID token");
  }

  const { payload } = await jwtVerify(tokenJson.id_token, GOOGLE_JWKS, {
    algorithms: ["RS256"],
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: config.clientId,
  });

  const tokenNonce =
    typeof payload.nonce === "string" ? payload.nonce : "";
  if (!tokenNonce || !timingSafeEqualHex(tokenNonce, params.expectedNonce)) {
    throw new Error("Invalid OAuth nonce");
  }

  if (payload.email_verified !== true || typeof payload.email !== "string") {
    throw new Error("Google account email must be verified");
  }

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Missing Google subject identifier");
  }

  const email = payload.email.trim().toLowerCase();
  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim()
      : email.split("@")[0];

  return {
    sub: payload.sub,
    email,
    name,
  };
}
