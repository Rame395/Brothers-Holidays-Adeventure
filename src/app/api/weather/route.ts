import { NextResponse } from "next/server";

export interface WeatherForecastResponse {
  ok: true;
  resolvedLocation: string | null;
  elevationUsed: number | null;
  fetchedAt: string;
  current: {
    temp: number;
    humidity: number;
    windKmh: number;
    weatherCode: number;
    time: string;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    precipMm: number;
    weatherCode: number;
  }>;
}

interface GeocodeCandidate {
  name?: string;
  admin1?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

function normalizeCountryHint(country: string | null): string {
  const c = (country || "").trim().toLowerCase();
  if (c === "tibet") return "china";
  return c;
}

async function geocodePlaceName(
  query: string,
  countryHint: string | null
): Promise<{ lat: number; lon: number; label: string } | null> {
  const attempts = [query.trim()];
  const firstSegment = query.split(",")[0]?.trim();
  if (firstSegment && firstSegment !== attempts[0]) {
    attempts.push(firstSegment);
  }

  const normalizedCountry = normalizeCountryHint(countryHint);

  for (const term of attempts) {
    if (term.length < 2) continue;
    try {
      const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      geoUrl.searchParams.set("name", term);
      geoUrl.searchParams.set("count", "6");
      geoUrl.searchParams.set("language", "en");
      geoUrl.searchParams.set("format", "json");

      const geoRes = await fetch(geoUrl.toString(), {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      });
      if (!geoRes.ok) continue;

      const geoJson = (await geoRes.json()) as {
        results?: GeocodeCandidate[];
      };
      const results = geoJson.results ?? [];
      if (results.length === 0) continue;

      const preferred =
        (normalizedCountry
          ? results.find(
              (r) => (r.country || "").toLowerCase() === normalizedCountry
            )
          : undefined) ?? results[0];

      if (
        typeof preferred.latitude === "number" &&
        typeof preferred.longitude === "number"
      ) {
        return {
          lat: preferred.latitude,
          lon: preferred.longitude,
          label: preferred.name || term,
        };
      }
    } catch {
      // Try next fallback attempt
    }
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get("lat");
  const rawLon = searchParams.get("lon");
  const q = searchParams.get("q")?.trim() || "";
  const country = searchParams.get("country")?.trim() || null;
  const rawElevation = searchParams.get("elevation");

  let lat = rawLat !== null ? Number(rawLat) : Number.NaN;
  let lon = rawLon !== null ? Number(rawLon) : Number.NaN;
  let resolvedLocation: string | null = null;

  const hasValidCoords =
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180;

  if (!hasValidCoords) {
    if (!q) {
      return NextResponse.json(
        { ok: false, error: "Valid lat/lon or location query q is required." },
        { status: 400 }
      );
    }

    const geocoded = await geocodePlaceName(q, country);
    if (geocoded) {
      lat = geocoded.lat;
      lon = geocoded.lon;
      resolvedLocation = geocoded.label;
    } else {
      // Final fallback: Kathmandu Valley
      lat = 27.7172;
      lon = 85.324;
      resolvedLocation = "Kathmandu Valley";
    }
  }

  const parsedElevation =
    rawElevation !== null ? Number(rawElevation) : Number.NaN;
  const elevationUsed =
    Number.isFinite(parsedElevation) &&
    parsedElevation > 0 &&
    parsedElevation <= 8849
      ? Math.round(parsedElevation)
      : null;

  try {
    const upstreamUrl = new URL("https://api.open-meteo.com/v1/forecast");
    upstreamUrl.searchParams.set("latitude", lat.toFixed(4));
    upstreamUrl.searchParams.set("longitude", lon.toFixed(4));
    if (elevationUsed !== null) {
      upstreamUrl.searchParams.set("elevation", String(elevationUsed));
    }
    upstreamUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    );
    upstreamUrl.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
    );
    upstreamUrl.searchParams.set("timezone", "auto");
    upstreamUrl.searchParams.set("forecast_days", "7");

    const res = await fetch(upstreamUrl.toString(), {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Weather feed temporarily unavailable." },
        { status: 502 }
      );
    }

    const raw = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        weather_code?: number;
        time?: string;
      };
      daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_sum?: number[];
      };
    };

    if (!raw.current || !raw.daily?.time?.length) {
      return NextResponse.json(
        { ok: false, error: "Incomplete weather forecast payload." },
        { status: 502 }
      );
    }

    const daily = raw.daily.time.map((date, idx) => ({
      date,
      maxTemp: Math.round(raw.daily?.temperature_2m_max?.[idx] ?? 0),
      minTemp: Math.round(raw.daily?.temperature_2m_min?.[idx] ?? 0),
      precipMm: Number((raw.daily?.precipitation_sum?.[idx] ?? 0).toFixed(1)),
      weatherCode: raw.daily?.weather_code?.[idx] ?? 0,
    }));

    const payload: WeatherForecastResponse = {
      ok: true,
      resolvedLocation,
      elevationUsed,
      fetchedAt: new Date().toISOString(),
      current: {
        temp: Math.round(raw.current.temperature_2m ?? 0),
        humidity: Math.round(raw.current.relative_humidity_2m ?? 0),
        windKmh: Math.round(raw.current.wind_speed_10m ?? 0),
        weatherCode: raw.current.weather_code ?? 0,
        time: raw.current.time ?? new Date().toISOString(),
      },
      daily,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to reach weather service." },
      { status: 502 }
    );
  }
}
