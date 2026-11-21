import { NextRequest, NextResponse } from "next/server";
import { AuthActorType, OAuthProvider } from "@prisma/client";
import prisma from "@/lib/prisma";
import { detectAndAlertNewDevice, logAuthEvent } from "@/lib/auth/audit";
import { isHttpsProduction, OAUTH_STATE_COOKIE } from "@/lib/auth/cookies";
import { decryptSecret, timingSafeEqualHex } from "@/lib/auth/crypto";
import { exchangeGoogleCodeAndVerify } from "@/lib/auth/google-oauth";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { createCustomerSession } from "@/lib/auth/session";
import { sanitizeRedirectPath } from "@/lib/auth/validation";

function getSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  return request.nextUrl.origin;
}

function redirectWithClearState(url: URL): NextResponse {
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: isHttpsProduction(),
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 0,
  });
  return res;
}

export async function GET(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) {
    return redirectWithClearState(
      new URL("/login?error=oauth_cancelled", request.url)
    );
  }

  const code = request.nextUrl.searchParams.get("code") || "";
  const returnedState = request.nextUrl.searchParams.get("state") || "";
  const sealedCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value || "";

  if (!code || !returnedState || !sealedCookie) {
    return redirectWithClearState(
      new URL("/login?error=oauth_invalid_state", request.url)
    );
  }

  let parsedState: {
    state: string;
    nonce: string;
    codeVerifier: string;
    next: string;
    exp: number;
  };

  try {
    parsedState = JSON.parse(decryptSecret(sealedCookie));
  } catch {
    return redirectWithClearState(
      new URL("/login?error=oauth_invalid_state", request.url)
    );
  }

  if (
    !parsedState.exp ||
    parsedState.exp <= Date.now() ||
    !timingSafeEqualHex(returnedState, parsedState.state)
  ) {
    return redirectWithClearState(
      new URL("/login?error=oauth_expired_state", request.url)
    );
  }

  try {
    const redirectUri = `${getSiteOrigin(request)}/api/auth/google/callback`;
    const googleUser = await exchangeGoogleCodeAndVerify({
      code,
      codeVerifier: parsedState.codeVerifier,
      expectedNonce: parsedState.nonce,
      redirectUri,
    });

    const now = new Date();
    const customer = await prisma.$transaction(async (tx) => {
      const linkedOAuth = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: OAuthProvider.GOOGLE,
            providerAccountId: googleUser.sub,
          },
        },
        include: { customer: true },
      });

      if (linkedOAuth) {
        if (!linkedOAuth.customer.isActive || linkedOAuth.customer.deletedAt) {
          throw new Error("Account inactive");
        }
        return tx.customer.update({
          where: { id: linkedOAuth.customer.id },
          data: {
            emailVerifiedAt: linkedOAuth.customer.emailVerifiedAt ?? now,
            lastLoginAt: linkedOAuth.customer.mfaEnabled
              ? linkedOAuth.customer.lastLoginAt
              : now,
          },
        });
      }

      const existingByEmail = await tx.customer.findUnique({
        where: { email: googleUser.email },
      });

      if (existingByEmail && !existingByEmail.deletedAt) {
        if (!existingByEmail.isActive) {
          throw new Error("Account inactive");
        }
        await tx.oAuthAccount.create({
          data: {
            provider: OAuthProvider.GOOGLE,
            providerAccountId: googleUser.sub,
            email: googleUser.email,
            customerId: existingByEmail.id,
          },
        });
        return tx.customer.update({
          where: { id: existingByEmail.id },
          data: {
            emailVerifiedAt: existingByEmail.emailVerifiedAt ?? now,
            lastLoginAt: existingByEmail.mfaEnabled
              ? existingByEmail.lastLoginAt
              : now,
          },
        });
      }

      const created = await tx.customer.create({
        data: {
          fullName: googleUser.name,
          email: googleUser.email,
          emailVerifiedAt: now,
          isActive: true,
          source: "google-oauth",
          lastLoginAt: now,
        },
      });

      await tx.oAuthAccount.create({
        data: {
          provider: OAuthProvider.GOOGLE,
          providerAccountId: googleUser.sub,
          email: googleUser.email,
          customerId: created.id,
        },
      });

      return created;
    });

    await createCustomerSession({
      customerId: customer.id,
      mfaVerified: !customer.mfaEnabled,
      ipAddress,
      userAgent,
    });

    if (customer.mfaEnabled) {
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: customer.id,
        email: customer.email,
        action: "OAUTH_LOGIN_PENDING_MFA",
        success: true,
        ipAddress,
        userAgent,
        metadata: { provider: "GOOGLE" },
      });
      const mfaUrl = new URL("/login/mfa", request.url);
      mfaUrl.searchParams.set("next", parsedState.next || "/account");
      return redirectWithClearState(mfaUrl);
    }

    await detectAndAlertNewDevice({
      actorType: "CUSTOMER",
      userId: customer.id,
      email: customer.email,
      name: customer.fullName,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: customer.id,
      email: customer.email,
      action: "OAUTH_LOGIN_SUCCESS",
      success: true,
      ipAddress,
      userAgent,
      metadata: { provider: "GOOGLE" },
    });

    const destination = sanitizeRedirectPath(
      parsedState.next,
      ["/account", "/destinations", "/treks"],
      "/account"
    );
    return redirectWithClearState(new URL(destination, request.url));
  } catch (err) {
    console.error("GET /api/auth/google/callback error:", err);
    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      action: "OAUTH_LOGIN_FAILED",
      success: false,
      ipAddress,
      userAgent,
      metadata: {
        error: err instanceof Error ? err.message : "oauth_callback_error",
      },
    });
    return redirectWithClearState(new URL("/login?error=oauth_failed", request.url));
  }
}
