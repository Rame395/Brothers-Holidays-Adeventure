import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { getAdminTaxonomyWithCounts } from "@/lib/admin-taxonomy";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  const data = await getAdminTaxonomyWithCounts();
  return NextResponse.json({ ok: true, ...data });
}
