import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { getOptionalCustomer } from "@/lib/auth/guards";

export async function GET() {
  const auth = await getOptionalCustomer();

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(auth),
    customer: auth?.customer ?? null,
    googleOAuthEnabled: isGoogleOAuthConfigured(),
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null,
  });
}
