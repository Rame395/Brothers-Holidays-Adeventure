import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isHttpsProduction } from "@/lib/auth/cookies";
import { generateRandomHex } from "@/lib/auth/crypto";

export async function GET() {
  const store = await cookies();
  const existing = store.get("bha_csrf")?.value;
  const token = existing || generateRandomHex(32);

  const response = NextResponse.json(
    { ok: true, csrfToken: token },
    { status: 200 }
  );

  if (!existing) {
    response.cookies.set("bha_csrf", token, {
      httpOnly: false,
      secure: isHttpsProduction(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
