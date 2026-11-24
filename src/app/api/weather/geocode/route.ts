import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);

  if (q.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Enter at least 2 characters to search a location." },
      { status: 400 }
    );
  }

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", q);
    geoUrl.searchParams.set("count", "6");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const res = await fetch(geoUrl.toString(), {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Location lookup service unavailable." },
        { status: 502 }
      );
    }

    const raw = (await res.json()) as {
      results?: Array<{
        id?: number;
        name?: string;
        admin1?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
        elevation?: number;
      }>;
    };

    const results = (raw.results ?? [])
      .filter(
        (r) =>
          typeof r.name === "string" &&
          typeof r.latitude === "number" &&
          typeof r.longitude === "number"
      )
      .map((r, idx) => ({
        id: r.id ?? idx + 1,
        name: r.name!,
        admin1: r.admin1 ?? null,
        country: r.country ?? null,
        latitude: r.latitude!,
        longitude: r.longitude!,
        elevation:
          typeof r.elevation === "number" ? Math.round(r.elevation) : null,
      }));

    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to search locations right now." },
      { status: 502 }
    );
  }
}
