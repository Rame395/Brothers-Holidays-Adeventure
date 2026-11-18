"use client";

import { useState, useRef, useEffect } from "react";
import { TREKS } from "@/data/treks";

export default function RouteDetailsClient({ slug }: { slug: string }) {
  // Find trek or fallback to Khumbu Glacier Traverse
  const trek =
    TREKS.find((t) => t.slug === slug) ||
    TREKS.find((t) => t.slug === "khumbu-glacier-traverse") ||
    TREKS[3];

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeWaypoint, setActiveWaypoint] = useState<string | null>(null);
  const [elevInView, setElevInView] = useState(false);
  const elevRef = useRef<HTMLDivElement>(null);

  // Animate elevation graph whenever it scrolls into view
  useEffect(() => {
    const el = elevRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setElevInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    partySize: "1",
    date: "October 2026",
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Immersive Editorial Cover */}
      <section className="relative w-full overflow-hidden bg-surface-container-highest">
        <div className="relative w-full h-[520px] lg:h-[600px] flex flex-col justify-end">
          {/* Background Field Imagery with Glacial Scrim */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvbh81Kb4cHxfDPx8Q6qDcmK7Z7leetLPcy-ZKb49BGn7c8lr1_YHa9Al7kXw7eLIUMGjvPlmvOYe2aWgRy3ooNzwmyy9yEG30f6y1DyP0NOEMLbQlPImhQoGEPIfk7V-ueagbmUktx54dysOH-QcE5Ch0Em2eRY1tBxDoz_lJexCmB0HM_WGMlv_sxC_1jJ_r5zG4b8Fsaf1FbAdbAEwsYk6tZNSFc9hSp3TzV1M')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>

          {/* Content Container */}
          <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-margin pb-12 flex flex-col justify-between h-full pt-10">
            {/* Breadcrumb / Route Category Badge */}
            <div className="flex items-center gap-3 pt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container/90 backdrop-blur-md text-primary font-label-md text-label-md uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Field Route Log 07 · {trek.region}
              </span>
              <span className="text-on-surface-variant/70 font-label-sm text-label-sm uppercase tracking-widest hidden sm:inline-block">
                27°59&apos;16&quot; N · 86°55&apos;30&quot; E
              </span>
            </div>

            {/* Headline & Editorial Serifs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mt-auto">
              <div className="lg:col-span-8 space-y-3">
                <p className="font-label-lg text-label-lg uppercase tracking-widest text-primary font-semibold">
                  High Altitude Alpine Route
                </p>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-[1.08] max-w-3xl">
                  {trek.name}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  {trek.description}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all duration-200 shadow-md"
                    href="#itinerary"
                  >
                    <span>Inspect Itinerary</span>
                    <span className="material-symbols-outlined text-[18px]">
                      south
                    </span>
                  </a>
                  <a
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-all duration-200"
                    href="#pricing"
                  >
                    <span>Manifest &amp; Breakdown</span>
                    <span className="material-symbols-outlined text-[18px]">
                      receipt_long
                    </span>
                  </a>
                </div>
              </div>

              {/* 3 Prominent Editorial Metrics */}
              <div className="lg:col-span-4 bg-surface-container-low/95 backdrop-blur-md p-6 rounded-lg shadow-sm border border-outline-variant/30">
                <div className="grid grid-cols-3 gap-4 divide-x-0">
                  <div className="flex flex-col">
                    <span className="font-display-md text-display-md text-primary leading-none">
                      {trek.duration}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mt-2">
                      Days Out
                    </span>
                  </div>
                  <div className="flex flex-col pl-4 border-l border-outline-variant/30">
                    <span className="font-display-md text-display-md text-primary leading-none">
                      {trek.highestPoint.toLocaleString()}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mt-2">
                      Meters Peak
                    </span>
                  </div>
                  <div className="flex flex-col pl-4 border-l border-outline-variant/30">
                    <span className="font-display-md text-display-md text-primary leading-none">
                      124
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mt-2">
                      Kilometers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stat Ribbon */}
      <section className="w-full bg-surface-container-low py-8 border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-margin">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1 */}
            <div className="p-6 rounded-DEFAULT bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Maximum Altitude
                </span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  landscape
                </span>
              </div>
              <div className="my-3">
                <span className="font-display-md text-display-md text-on-surface">
                  {trek.highestPoint.toLocaleString()}
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant ml-1">
                  m
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-2">
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  +14% vs avg
                </span>
                <span className="font-label-sm text-label-sm">
                  route peak · of 8,848 m
                </span>
              </div>
            </div>

            {/* Tile 2 */}
            <div className="p-6 rounded-DEFAULT bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Walking Distance
                </span>
                <span className="material-symbols-outlined text-[18px] text-primary">
                  route
                </span>
              </div>
              <div className="my-3">
                <span className="font-display-md text-display-md text-on-surface">
                  124
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant ml-1">
                  km
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-2">
                <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                  -3 km deviation
                </span>
                <span className="font-label-sm text-label-sm">
                  total track · of 130 km
                </span>
              </div>
            </div>

            {/* Tile 3 */}
            <div className="p-6 rounded-DEFAULT bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Daily Average
                </span>
                <span className="material-symbols-outlined text-[18px] text-primary">
                  pace
                </span>
              </div>
              <div className="my-3">
                <span className="font-display-md text-display-md text-on-surface">
                  8.8
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant ml-1">
                  km/day
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-2">
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  +1.2 km pace
                </span>
                <span className="font-label-sm text-label-sm">
                  per stage · of 10 km
                </span>
              </div>
            </div>

            {/* Tile 4 */}
            <div className="p-6 rounded-DEFAULT bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Ascent Total
                </span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  trending_up
                </span>
              </div>
              <div className="my-3">
                <span className="font-display-md text-display-md text-on-surface">
                  6,420
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant ml-1">
                  m
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-2">
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  +5% vs plan
                </span>
                <span className="font-label-sm text-label-sm">
                  cumulative · of 6,500 m
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Route Topography, Interactive Map & Elevation Profile */}
      <section className="max-w-7xl mx-auto w-full px-6 lg:px-margin py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
                Topographic Elevation Profile
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Waypoints &amp; Hypsometric Curve
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>{" "}
              Trekking Route
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>{" "}
              Acclimatization Node
            </span>
          </div>
        </div>

        {/* Main Map / Elevation Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Elevation Profile & Stage Plot */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                    Profile Analysis
                  </p>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    Trailhead to Kala Patthar Summit
                  </h3>
                </div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-surface-container text-primary rounded-full">
                  Datum: WGS 84
                </span>
              </div>

              {/* Clean Inline Elevation SVG Graph */}
              <div ref={elevRef} className="w-full h-64 relative flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 240"
                >
                  <defs>
                    <linearGradient
                      id="elevationGradDetail"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#006b78"
                        stopOpacity="0.35"
                      ></stop>
                      <stop
                        offset="100%"
                        stopColor="#eefcfe"
                        stopOpacity="0.0"
                      ></stop>
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line
                    stroke="#bec8cb"
                    strokeDasharray="4 4"
                    strokeOpacity="0.3"
                    x1="0"
                    x2="800"
                    y1="40"
                    y2="40"
                  ></line>
                  <line
                    stroke="#bec8cb"
                    strokeDasharray="4 4"
                    strokeOpacity="0.3"
                    x1="0"
                    x2="800"
                    y1="100"
                    y2="100"
                  ></line>
                  <line
                    stroke="#bec8cb"
                    strokeDasharray="4 4"
                    strokeOpacity="0.3"
                    x1="0"
                    x2="800"
                    y1="160"
                    y2="160"
                  ></line>
                  <line
                    stroke="#bec8cb"
                    strokeOpacity="0.5"
                    x1="0"
                    x2="800"
                    y1="210"
                    y2="210"
                  ></line>

                  {/* Elevation Area Fill */}
                  <polygon
                    fill="url(#elevationGradDetail)"
                    points="0,210 0,195 120,180 230,140 340,142 450,115 560,90 670,55 740,25 800,210"
                  ></polygon>

                  {/* Elevation Line */}
                  <polyline
                    fill="none"
                    points="0,195 120,180 230,140 340,142 450,115 560,90 670,55 740,25"
                    stroke="#00515b"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    strokeDasharray="1200"
                    strokeDashoffset={elevInView ? "0" : "1200"}
                    style={{
                      transition:
                        "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  ></polyline>

                  {/* Interactive Nodes */}
                  <circle
                    cx="0"
                    cy="195"
                    fill="#ffffff"
                    r="4"
                    stroke="#00515b"
                    strokeWidth="2.5"
                  ></circle>
                  <circle
                    cx="230"
                    cy="140"
                    fill="#feb968"
                    r="6"
                    stroke="#6a3f00"
                    strokeWidth="2.5"
                    className="cursor-pointer hover:scale-125"
                    onClick={() => setActiveWaypoint("Namche Bazaar (3,440 m)")}
                  ></circle>
                  <circle
                    cx="450"
                    cy="115"
                    fill="#ffffff"
                    r="4"
                    stroke="#00515b"
                    strokeWidth="2.5"
                  ></circle>
                  <circle
                    cx="560"
                    cy="90"
                    fill="#feb968"
                    r="6"
                    stroke="#6a3f00"
                    strokeWidth="2.5"
                    className="cursor-pointer hover:scale-125"
                    onClick={() => setActiveWaypoint("Dingboche (4,410 m)")}
                  ></circle>
                  <circle
                    cx="670"
                    cy="55"
                    fill="#ffffff"
                    r="4"
                    stroke="#00515b"
                    strokeWidth="2.5"
                  ></circle>
                  <circle
                    cx="740"
                    cy="25"
                    fill="#00515b"
                    r="5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer hover:scale-125"
                    onClick={() => setActiveWaypoint("Kala Patthar (5,545 m)")}
                  ></circle>
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="grid grid-cols-5 text-on-surface-variant font-label-sm text-label-sm pt-4 mt-2">
                <div>Lukla (2,846 m)</div>
                <div className="text-center">Namche (3,440 m)</div>
                <div className="text-center">Tengboche (3,867 m)</div>
                <div className="text-center">Dingboche (4,410 m)</div>
                <div className="text-right">Gorak Shep (5,164 m)</div>
              </div>

              {activeWaypoint && (
                <div className="mt-4 p-3 rounded-full bg-primary-fixed/30 text-on-primary-fixed flex items-center justify-between text-body-sm">
                  <span>
                    Selected Station: <strong>{activeWaypoint}</strong>
                  </span>
                  <button
                    onClick={() => setActiveWaypoint(null)}
                    className="text-primary hover:underline font-semibold"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* 3 Primary Altitude Stops Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="itinerary">
              {/* Stop 1 */}
              <div className="bg-surface-container-low p-5 rounded-DEFAULT shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-semibold">
                      Stage 03–04
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                      Rest Stage
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                    Namche Bazaar
                  </h4>
                  <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary mt-1">
                    Acclimatization Stop
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    Crucial physiological stabilization stop. Acclimatization
                    hike to Everest View Hotel &amp; Khumjung.
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-baseline justify-between border-t border-outline-variant/15">
                  <span className="font-display-md text-display-md text-primary">
                    3,440
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Meters Alt
                  </span>
                </div>
              </div>

              {/* Stop 2 */}
              <div className="bg-surface-container-low p-5 rounded-DEFAULT shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Stage 05
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                      Sacred Ridge
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                    Tengboche Ridge
                  </h4>
                  <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary mt-1">
                    Monastery Ridge
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    Historic high Gompa surrounded by dwarf firs, rhododendrons,
                    and unhindered vistas of Ama Dablam.
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-baseline justify-between border-t border-outline-variant/15">
                  <span className="font-display-md text-display-md text-primary">
                    3,867
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Meters Alt
                  </span>
                </div>
              </div>

              {/* Stop 3 */}
              <div className="bg-surface-container-low p-5 rounded-DEFAULT shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors border border-outline-variant/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Stage 08
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                      Alpine Apex
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                    Gorak Shep
                  </h4>
                  <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary mt-1">
                    Final Base Settlement
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    Frozen sandy lakebed beneath Kala Patthar and Nuptse moraine;
                    staging ground for Everest Base Camp.
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-baseline justify-between border-t border-outline-variant/15">
                  <span className="font-display-md text-display-md text-primary">
                    5,164
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Meters Alt
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Geographic Satellite & Micro Cartography */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm flex flex-col border border-outline-variant/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                  Topographic Sector
                </span>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>{" "}
                  Live Sector
                </span>
              </div>

              {/* Map Static Location */}
              <div
                className="w-full h-72 rounded-DEFAULT bg-cover bg-center overflow-hidden relative shadow-inner"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0tFDj2kdqEXaLc-6vwJbhPPdkKmU5rtjwnwIrNgpjAT-d_snMR3Khl1K35PaRpUrnSZk8kIGyYpFXyD9YeFoWe86mgRRF0t2CweIW_lHQTJmAtIFnSN3qaLC6oWM2NeN-8dwrnF08bqtnUoxJEcTbMTh9e_1mW4-bhAEeTT1drqin-7hjLfCWKRE0pIXxM1ptnY9gxmYWLNbTiUo5jCwzeqtniON55ljVjvV69EY')",
                }}
              >
                <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    pin_drop
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">
                    Khumbu Moraine Grid
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                  <span>Magnetic Declination</span>
                  <span className="text-on-surface font-medium">0°12&apos; W</span>
                </div>
                <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                  <span>Trail Moraine Composition</span>
                  <span className="text-on-surface font-medium">
                    Granite Gneiss / Ice
                  </span>
                </div>
                <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                  <span>Average Resting O₂ Saturation</span>
                  <span className="text-on-surface font-medium">78% - 82%</span>
                </div>
              </div>
            </div>

            {/* Archival Expedition Photo Card */}
            <div className="bg-surface-container-low p-5 rounded-DEFAULT shadow-sm flex items-center gap-4 border border-outline-variant/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-20 h-20 rounded-DEFAULT object-cover shadow-sm shrink-0"
                alt="Mani Stone Trail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA70EGZ9NDO--OG1BeBOsjzDh98eRe3G_aP4ZL68f6h5eQLRixILpy9sCg3tT67wBKHuF7pmjI5MR_0IoEZuIVaHeKHv6hkQBSdLGpIm4Zwj6MNzb90dNYV7yRHhZSNz6Y-0l6avhigjCm790Wju0EuhXMCupShLWNwsPJKhW6QvHiwOvEoPqSPUJx-NR1w3BnBbv-X4ksIPXuuKd8XkDV5b0Yy0G6t_ovOj3ogj_I"
              />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-semibold">
                  Field Archive #441
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Mani Stone Trail
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Sacred carvings circumambulated clockwise at 3,800m.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Route Specification (8 Properties) & Architecture Prose */}
      <section className="w-full bg-surface-container-low py-16 border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Route Specification */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="mb-6">
                <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
                  Route Specification
                </span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                  Expedition Parameters
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Verified against the 2026 Sagarmatha Alpine Registry.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm flex flex-col gap-4 border border-outline-variant/20">
                {/* Prop 1 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      flight_takeoff
                    </span>
                    Start Point
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {trek.startPoint}
                  </span>
                </div>

                {/* Prop 2 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      cabin
                    </span>
                    Highest Camp
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {trek.highestPointName}
                  </span>
                </div>

                {/* Prop 3 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      warning
                    </span>
                    Difficulty
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {trek.difficulty} Alpine
                  </span>
                </div>

                {/* Prop 4 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      calendar_month
                    </span>
                    Best Season
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {trek.seasonLabel}
                  </span>
                </div>

                {/* Prop 5 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      badge
                    </span>
                    Permits Required
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface text-right">
                    TIMS &amp; Sagarmatha NP
                  </span>
                </div>

                {/* Prop 6 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      sell
                    </span>
                    Base Price
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-normal">
                    Rs. {(trek.priceFrom * 100).toLocaleString()} Inclusive
                  </span>
                </div>

                {/* Prop 7 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      group
                    </span>
                    Group Ratio
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    4 trekkers per guide
                  </span>
                </div>

                {/* Prop 8 */}
                <div className="flex items-center justify-between py-2">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      emergency
                    </span>
                    Evacuation Protocol
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface text-right">
                    Satellite SOS &amp; Heli
                  </span>
                </div>
              </div>
            </div>

            {/* Prose Block & Operational Standards */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
                  Narrative &amp; Philosophy
                </span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 mb-6">
                  Route Architecture &amp; Acclimatization
                </h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6">
                  The traverse follows traditional trading paths before climbing
                  onto lateral moraines beneath Nuptse and Everest.
                  Acclimatization days at Namche Bazaar and Dingboche are built
                  into the schedule to match physiological ascent guidelines.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
                  Ascending too rapidly in the Dudh Koshi gorge triggers
                  hypobaric hypoxia. We regulate vertical elevation gain strictly
                  to no more than 400 to 500 meters per day once above the tree
                  line at Tengboche, pairing every significant push with active
                  afternoon recovery circuits.
                </p>

                {/* 3 Bullet points */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-DEFAULT bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-container text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">
                        health_and_safety
                      </span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Standard Emergency Evacuation
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        Emergency evacuation insurance included standard on all
                        departures, backed by high-altitude helicopter rescue
                        standby in Lukla and Kathmandu.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-DEFAULT bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-container text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">
                        verified_user
                      </span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Kathmandu Certified Mountain Guides
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        Certified mountain guides leading every group from Thamel
                        headquarters, with WFR medical certifications and pulsed
                        oximeter monitoring.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-DEFAULT bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-container text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">
                        assignment_turned_in
                      </span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Frictionless Field Logistics
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        Permits, lodge bookings, and porter logistics fully
                        managed with fair Sherpa wage guarantees and 20kg porter
                        load caps.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Breakdown Section */}
      <section
        className="max-w-7xl mx-auto w-full px-6 lg:px-margin py-16"
        id="pricing"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
              Transparent Economics
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">
              Expedition Cost Breakdown
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            BROTHERS Holidays Adventure operates on total fee transparency. No hidden tea house
            surcharges, undisclosed permit fees, or surprise porter levies along
            the trail.
          </p>
        </div>

        {/* Pricing Manifest Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-10 shadow-sm border border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Breakdown table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-12 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider pb-3 border-b border-outline-variant/20">
                <span className="col-span-6">Operational Line Item</span>
                <span className="col-span-3 text-center">Coverage</span>
                <span className="col-span-3 text-right">Cost (Rs.)</span>
              </div>

              {/* Item 1 */}
              <div className="grid grid-cols-12 items-center py-2 text-on-surface font-body-md text-body-md border-b border-outline-variant/15">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-on-surface">
                    Regulatory &amp; Park Conservancies
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Sagarmatha Entry, Khumbu Pasang Lhamu Permit &amp; TIMS
                  </span>
                </div>
                <div className="col-span-3 text-center font-label-sm text-label-sm uppercase text-primary font-medium">
                  Included
                </div>
                <div className="col-span-3 text-right font-headline-sm text-headline-sm">
                  Rs. 18,000
                </div>
              </div>

              {/* Item 2 */}
              <div className="grid grid-cols-12 items-center py-2 text-on-surface font-body-md text-body-md border-b border-outline-variant/15">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-on-surface">
                    Tea House Lodging &amp; Daily Board
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    13 nights private twin rooms &amp; 3 full daily meals +
                    boiled water
                  </span>
                </div>
                <div className="col-span-3 text-center font-label-sm text-label-sm uppercase text-primary font-medium">
                  Included
                </div>
                <div className="col-span-3 text-right font-headline-sm text-headline-sm">
                  Rs. 72,000
                </div>
              </div>

              {/* Item 3 */}
              <div className="grid grid-cols-12 items-center py-2 text-on-surface font-body-md text-body-md border-b border-outline-variant/15">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-on-surface">
                    Sherpa Team &amp; Head Mountain Guide
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Lead UIAGM guide, assistant guide, and insured porter support
                  </span>
                </div>
                <div className="col-span-3 text-center font-label-sm text-label-sm uppercase text-primary font-medium">
                  Included
                </div>
                <div className="col-span-3 text-right font-headline-sm text-headline-sm">
                  Rs. 56,000
                </div>
              </div>

              {/* Item 4 */}
              <div className="grid grid-cols-12 items-center py-2 text-on-surface font-body-md text-body-md border-b border-outline-variant/15">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-on-surface">
                    Medical Evacuation &amp; Satellite Ops
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Garmin inReach SOS link, Gamow hyperbaric bag, O₂ canisters
                  </span>
                </div>
                <div className="col-span-3 text-center font-label-sm text-label-sm uppercase text-primary font-medium">
                  Included
                </div>
                <div className="col-span-3 text-right font-headline-sm text-headline-sm">
                  Rs. 24,000
                </div>
              </div>

              {/* Item 5 */}
              <div className="grid grid-cols-12 items-center py-2 text-on-surface font-body-md text-body-md">
                <div className="col-span-6 flex flex-col">
                  <span className="font-semibold text-on-surface">
                    Domestic Flights (Kathmandu ↔ Lukla)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Twin Otter round-trip transfers with 15kg baggage allowance
                  </span>
                </div>
                <div className="col-span-3 text-center font-label-sm text-label-sm uppercase text-primary font-medium">
                  Included
                </div>
                <div className="col-span-3 text-right font-headline-sm text-headline-sm">
                  Rs. 15,000
                </div>
              </div>
            </div>

            {/* Total Manifest Column */}
            <div className="lg:col-span-4 bg-surface-container p-6 lg:p-8 rounded-lg flex flex-col justify-between h-full space-y-6 border border-outline-variant/30">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    All-Inclusive Total
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
                    Tier 1 Alpine
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg text-primary leading-none">
                    Rs. {(trek.priceFrom * 100).toLocaleString()}
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                    NPR / Person
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4">
                  Fully refundable up to 30 days prior to departure.
                  Single-supplement rooms available upon early request in Namche
                  and Lukla.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all duration-200 text-center shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book This Expedition</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
                <p className="font-label-sm text-label-sm text-center text-on-surface-variant">
                  Next scheduled departure: October 14, 2026 (4 slots remaining)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative border border-outline-variant/30">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setBookingSuccess(false);
              }}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                    Expedition Reservation
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                    Book {trek.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Starting from Rs. {(trek.priceFrom * 100).toLocaleString()} · No
                    immediate deposit required
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-label-md uppercase text-on-surface block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tenzing Norgay"
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none focus:bg-surface"
                    value={bookingForm.name}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-label-md uppercase text-on-surface block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tenzing@example.com"
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none focus:bg-surface"
                    value={bookingForm.email}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md uppercase text-on-surface block">
                      Party Size
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none focus:bg-surface"
                      value={bookingForm.partySize}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          partySize: e.target.value,
                        })
                      }
                    >
                      <option value="1">1 Climber</option>
                      <option value="2">2 Climbers</option>
                      <option value="3-4">3–4 Climbers</option>
                      <option value="5-8">5–8 (Full Cohort)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md uppercase text-on-surface block">
                      Target Window
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none focus:bg-surface"
                      value={bookingForm.date}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, date: e.target.value })
                      }
                    >
                      <option value="October 2026">October 2026</option>
                      <option value="November 2026">November 2026</option>
                      <option value="March 2027">March 2027</option>
                      <option value="April 2027">April 2027</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-md mt-2 cursor-pointer"
                >
                  Confirm Reservation Request
                </button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">
                    check_circle
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-serif">
                  Reservation Logged
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  We have registered your provisional reservation for{" "}
                  <strong>{trek.name}</strong> ({bookingForm.date}). A verified
                  equipment list and briefing document have been queued for{" "}
                  <strong>{bookingForm.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setBookingModalOpen(false);
                    setBookingSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
