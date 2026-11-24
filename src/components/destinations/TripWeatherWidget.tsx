"use client";

import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WeatherDailyItem {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipMm: number;
  weatherCode: number;
}

interface WeatherState {
  resolvedLocation: string | null;
  updatedLabel: string;
  current: {
    temp: number;
    humidity: number;
    windKmh: number;
    weatherCode: number;
    time: string;
  };
  daily: WeatherDailyItem[];
}

function WeatherConditionIcon({
  code,
  className = "h-7 w-7",
}: {
  code: number;
  className?: string;
}) {
  if (code === 0) {
    return <Sun className={`${className} text-[#f05e25]`} />;
  }
  if (code <= 2) {
    return <CloudSun className={`${className} text-[#104b87]`} />;
  }
  if (code === 3) {
    return <Cloud className={`${className} text-[#104b87]`} />;
  }
  if (code === 45 || code === 48) {
    return <CloudFog className={`${className} text-slate-500`} />;
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <CloudSnow className={`${className} text-[#104b87]`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${className} text-[#f05e25]`} />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-[#104b87]`} />;
  }
  return <CloudSun className={`${className} text-[#104b87]`} />;
}

function formatDayLabel(dateIso: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const [y, m, d] = dateIso.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-US", { weekday: "short" });
}

function formatUpdatedAgo(fetchedAtIso: string | undefined): string {
  if (!fetchedAtIso) return "Updated recently";
  const ts = Date.parse(fetchedAtIso);
  if (Number.isNaN(ts)) return "Updated recently";
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMin < 1) return "Updated just now";
  if (diffMin === 1) return "Updated 1 min ago";
  if (diffMin < 60) return `Updated ${diffMin} min ago`;
  const hrs = Math.round(diffMin / 60);
  return hrs === 1 ? "Updated 1 hr ago" : `Updated ${hrs} hrs ago`;
}

export function TripWeatherWidget({
  locationLabel,
  maxAltitude,
  lat,
  lon,
  query,
  country,
}: {
  locationLabel: string;
  maxAltitude: number;
  lat: number | null;
  lon: number | null;
  query: string;
  country: string;
}) {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (lat !== null && lon !== null) {
      params.set("lat", String(lat));
      params.set("lon", String(lon));
    } else {
      params.set("q", query || locationLabel);
      if (country) params.set("country", country);
    }
    if (maxAltitude > 0) {
      params.set("elevation", String(maxAltitude));
    }

    fetch(`/api/weather?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Weather unavailable");
        const json = (await res.json()) as {
          ok: boolean;
          resolvedLocation?: string | null;
          fetchedAt?: string;
          current?: WeatherState["current"];
          daily?: WeatherState["daily"];
        };
        if (!json.ok || !json.current || !json.daily) {
          throw new Error("Invalid payload");
        }
        setWeather({
          resolvedLocation: json.resolvedLocation ?? null,
          updatedLabel: formatUpdatedAgo(json.fetchedAt),
          current: json.current,
          daily: json.daily,
        });
        setStatus("ready");
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [lat, lon, query, country, locationLabel, maxAltitude]);

  if (status === "error") {
    return null;
  }

  if (status === "loading" || !weather) {
    return (
      <div className="border-t border-slate-100 mt-7 pt-6">
        <div className="animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3.5 w-48 rounded bg-slate-100" />
              <div className="h-7 w-20 rounded bg-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-72">
            <div className="h-24 rounded-[12px] bg-slate-100" />
            <div className="h-24 rounded-[12px] bg-slate-100" />
            <div className="h-24 rounded-[12px] bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const scrollDays = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="border-t border-slate-100 mt-7 pt-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Current Live Conditions */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#104b87]/[0.07]">
              <WeatherConditionIcon
                code={weather.current.weatherCode}
                className="h-6 w-6"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#57534d]">
                Weather near{" "}
                <strong className="font-semibold text-[#1c1917]">
                  {locationLabel}
                </strong>
                {maxAltitude > 0 && (
                  <span className="text-[#64748b] tabular-nums">
                    {" "}
                    ({maxAltitude.toLocaleString("en-US")} m)
                  </span>
                )}
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-[#1c1917] tabular-nums leading-none">
                  {weather.current.temp}°C
                </span>
                <span className="text-xs text-[#64748b]">
                  {weather.updatedLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-[#104b87]" />
              {weather.current.humidity}% humidity
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-[#104b87]" />
              {weather.current.windKmh} km/h wind
            </span>
          </div>

          <p className="text-xs text-[#64748b]">
            Mountain weather can change quickly. Follow your guide and local
            safety advice.
          </p>
        </div>

        {/* Right: 7-Day Forecast Strip */}
        <div className="lg:max-w-[380px] w-full shrink-0 space-y-2">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-2.5 overflow-x-auto pb-1 scrollbar-none"
          >
            {weather.daily.map((d, idx) => (
              <div
                key={d.date}
                className="min-w-[92px] shrink-0 rounded-[12px] border border-slate-200/80 bg-[#f8fafc] px-3 py-3 text-center flex flex-col items-center justify-between gap-2"
              >
                <span className="text-xs font-medium text-[#57534d]">
                  {formatDayLabel(d.date, idx)}
                </span>
                <WeatherConditionIcon
                  code={d.weatherCode}
                  className="h-5 w-5"
                />
                <div className="space-y-0.5 tabular-nums">
                  <p className="text-xs font-semibold text-[#1c1917]">
                    {d.maxTemp}°{" "}
                    <span className="font-normal text-[#64748b]">
                      {d.minTemp}°
                    </span>
                  </p>
                  <p className="inline-flex items-center justify-center gap-1 text-[11px] text-[#64748b]">
                    <Droplets className="h-3 w-3 text-[#104b87]" />
                    {d.precipMm} mm
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollDays(-180)}
                aria-label="Scroll earlier days"
                className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-[#57534d] hover:border-[#104b87] hover:text-[#104b87] cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollDays(180)}
                aria-label="Scroll later days"
                className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-[#57534d] hover:border-[#104b87] hover:text-[#104b87] cursor-pointer transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#64748b] hover:text-[#104b87] transition-colors"
            >
              Forecast via Open-Meteo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
