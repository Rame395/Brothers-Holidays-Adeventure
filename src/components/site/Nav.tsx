"use client";

import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  MapPin,
  Menu,
  Send,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COUNTRIES, REGIONS } from "@/data/trips";
import type {
  DestinationCountryDTO,
  DestinationRegionDTO,
  DestinationTaxonomyDTO,
  NavTripDTO,
  TripCategoryDTO,
} from "@/lib/types";

const FALLBACK_COUNTRIES: DestinationCountryDTO[] = COUNTRIES.map((c, i) => ({
  id: c.id,
  slug: c.id,
  name: c.label,
  blurb: c.blurb,
  heroImage: c.image,
  sortOrder: i + 1,
  isActive: true,
}));

const FALLBACK_CATEGORIES: TripCategoryDTO[] = CATEGORIES.map((c, i) => ({
  id: c.id,
  slug: c.id,
  name: c.label,
  blurb: c.blurb,
  heroImage: c.image,
  groupByRegion: c.id === "trekking",
  sortOrder: i + 1,
  isActive: true,
}));

const FALLBACK_REGIONS: DestinationRegionDTO[] = REGIONS.map((r, i) => ({
  id: r.id,
  slug: r.id,
  name: r.label,
  countryId: "nepal",
  countrySlug: "nepal",
  blurb: "",
  heroImage: r.image,
  sortOrder: i + 1,
  isActive: true,
}));

export function BrothersMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1 23 L14 6 L20 13 L27 3 L39 23"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M24 7.5 L27 3 L30 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}
export const KharkaMark = BrothersMark;

const NAV_LINKS: Array<{
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}> = [
  {
    href: "/destinations?view=all",
    label: "All Trips",
    match: (p) => p === "/destinations",
  },
  { href: "/treks", label: "Treks", match: (p) => p.startsWith("/treks") },
  {
    href: "/expeditions",
    label: "Expeditions",
    match: (p) => p.startsWith("/expeditions"),
  },
  { href: "/journal", label: "Journal", match: (p) => p.startsWith("/journal") },
  { href: "/guides", label: "Guides", match: (p) => p.startsWith("/guides") },
  { href: "/about", label: "About", match: (p) => p === "/about" },
];

export function MegaPanel({
  activeCountry,
  activeCategory,
  regionsForCountry,
  tripsSource,
  onHoverTrip,
  onClose,
}: {
  activeCountry: DestinationCountryDTO;
  activeCategory: TripCategoryDTO | undefined;
  regionsForCountry: DestinationRegionDTO[];
  tripsSource: NavTripDTO[];
  onHoverTrip: (img: string | null) => void;
  onClose?: () => void;
}) {
  const categorySlug = activeCategory?.slug;
  const countryTrips = tripsSource.filter(
    (t) =>
      t.country === activeCountry.slug &&
      (!categorySlug || t.categories.includes(categorySlug))
  );

  const viewAllHref = categorySlug
    ? `/destinations?country=${encodeURIComponent(activeCountry.slug)}&category=${encodeURIComponent(categorySlug)}`
    : `/destinations?country=${encodeURIComponent(activeCountry.slug)}`;

  const headingLabel = activeCategory
    ? `${activeCategory.name} in ${activeCountry.name}`
    : `Journeys in ${activeCountry.name}`;

  if (activeCategory?.groupByRegion && regionsForCountry.length > 0) {
    const regionSlugs = new Set(regionsForCountry.map((r) => r.slug));
    const unassignedTrips = countryTrips
      .filter((t) => !t.region || !regionSlugs.has(t.region))
      .slice(0, 6);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f05e25]">
            {headingLabel}
          </p>
          <Link
            href={viewAllHref}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#f05e25] hover:underline"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {regionsForCountry.map((region) => {
            const list = countryTrips
              .filter((t) => t.region === region.slug)
              .slice(0, 8);
            return (
              <div key={region.slug} className="space-y-1.5">
                <Link
                  href={`/destinations/region/${encodeURIComponent(region.slug)}`}
                  onClick={onClose}
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#1c1917] hover:text-[#f05e25] transition-colors"
                >
                  {region.name}
                </Link>
                {list.length > 0 ? (
                  <ul className="space-y-1">
                    {list.map((trip) => (
                      <li key={trip.slug}>
                        <Link
                          href={`/destinations/${trip.slug}`}
                          onClick={onClose}
                          onMouseEnter={() => onHoverTrip(trip.image)}
                          onMouseLeave={() => onHoverTrip(null)}
                          className="group flex items-center justify-between text-xs text-stone-600 transition-colors hover:text-[#1c1917]"
                        >
                          <span className="truncate transition-transform group-hover:translate-x-0.5">
                            {trip.name}
                          </span>
                          <span className="ml-2 text-[11px] text-stone-400 tabular-nums group-hover:text-[#f05e25]">
                            {trip.days}d
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">
                    Routes opening soon
                  </p>
                )}
              </div>
            );
          })}

          {unassignedTrips.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1c1917]">
                Other {activeCountry.name} Routes
              </p>
              <ul className="space-y-1">
                {unassignedTrips.map((trip) => (
                  <li key={trip.slug}>
                    <Link
                      href={`/destinations/${trip.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => onHoverTrip(trip.image)}
                      onMouseLeave={() => onHoverTrip(null)}
                      className="group flex items-center justify-between text-xs text-stone-600 transition-colors hover:text-[#1c1917]"
                    >
                      <span className="truncate transition-transform group-hover:translate-x-0.5">
                        {trip.name}
                      </span>
                      <span className="ml-2 text-[11px] text-stone-400 tabular-nums group-hover:text-[#f05e25]">
                        {trip.days}d
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f05e25]">
          {headingLabel}
        </p>
        <Link
          href={viewAllHref}
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#f05e25] hover:underline"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {countryTrips.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {countryTrips.slice(0, 12).map((trip) => (
            <Link
              key={trip.slug}
              href={`/destinations/${trip.slug}`}
              onClick={onClose}
              onMouseEnter={() => onHoverTrip(trip.image)}
              onMouseLeave={() => onHoverTrip(null)}
              className="group flex items-center justify-between rounded-[6px] px-2 py-1 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-[#1c1917]"
            >
              <span className="truncate transition-transform group-hover:translate-x-0.5">
                {trip.name}
              </span>
              <span className="ml-2 text-[11px] text-stone-400 tabular-nums group-hover:text-[#f05e25]">
                {trip.days}d
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-stone-200 bg-stone-50 p-5 space-y-2">
          <p className="text-xs text-stone-600 leading-relaxed">
            No published routes in {headingLabel} yet. Our Kathmandu team builds bespoke private departures on request.
          </p>
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f05e25] hover:underline"
          >
            <span>Plan a custom route in {activeCountry.name}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export function Nav({
  navTrips,
  taxonomy,
}: {
  navTrips?: NavTripDTO[];
  taxonomy?: DestinationTaxonomyDTO;
}) {
  const countries =
    taxonomy && taxonomy.countries.length > 0
      ? taxonomy.countries
      : FALLBACK_COUNTRIES;
  const categories =
    taxonomy && taxonomy.categories.length > 0
      ? taxonomy.categories
      : FALLBACK_CATEGORIES;
  const regions = taxonomy ? taxonomy.regions : FALLBACK_REGIONS;

  const tripsSource = useMemo<NavTripDTO[]>(() => {
    if (navTrips && navTrips.length > 0) return navTrips;
    return [];
  }, [navTrips]);

  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [selectedCountrySlug, setSelectedCountrySlug] = useState<string | null>(
    null
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    null
  );
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const hasDarkHero =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/destinations" ||
    pathname.startsWith("/destinations/country/") ||
    pathname.startsWith("/destinations/category/") ||
    pathname.startsWith("/destinations/region/");
  const isSolid = !hasDarkHero || scrolled || megaOpen || open;

  const desktopLinkClass = (active: boolean) =>
    `relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
      active
        ? isSolid
          ? "bg-white text-[#3f6e15] shadow-sm ring-1 ring-stone-200"
          : "bg-white/25 text-white"
        : isSolid
        ? "text-[#1c1917]/80 hover:bg-white hover:text-[#3f6e15]"
        : "text-white/90 hover:bg-white/15 hover:text-white"
    }`;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const next = y > 40;
        setScrolled((prev) => (prev === next ? prev : next));
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
        setScrollProgress(Math.round(pct * 2) / 2);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    let activeFetch = true;
    const checkSession = () => {
      fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (
            data: {
              authenticated?: boolean;
              customer?: { fullName?: string } | null;
            } | null
          ) => {
            if (!activeFetch) return;
            if (data?.authenticated && data.customer?.fullName) {
              setCustomerName(
                data.customer.fullName.trim().split(/\s+/)[0] || "Account"
              );
            } else {
              setCustomerName(null);
            }
          }
        )
        .catch(() => {
          if (activeFetch) setCustomerName(null);
        });
    };
    checkSession();
    window.addEventListener("bha-auth-changed", checkSession);
    return () => {
      activeFetch = false;
      window.removeEventListener("bha-auth-changed", checkSession);
    };
  }, []);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 180);
  };

  const activeCountry =
    countries.find((c) => c.slug === selectedCountrySlug) ?? countries[0];

  const regionsForActiveCountry = regions.filter(
    (r) => r.countrySlug === activeCountry?.slug
  );

  const matchingCategories = activeCountry
    ? categories.filter(
        (cat) =>
          tripsSource.some(
            (t) =>
              t.country === activeCountry.slug &&
              t.categories.includes(cat.slug)
          ) ||
          (cat.groupByRegion && regionsForActiveCountry.length > 0) ||
          !tripsSource.some((t) => t.categories.includes(cat.slug))
      )
    : [];

  const categoriesForCountry =
    matchingCategories.length > 0 ? matchingCategories : categories;

  const activeCategory =
    categoriesForCountry.find((c) => c.slug === selectedCategorySlug) ??
    categoriesForCountry[0];

  const featureImg =
    hoverImg ??
    tripsSource.find(
      (t) =>
        t.country === activeCountry?.slug &&
        (!activeCategory || t.categories.includes(activeCategory.slug))
    )?.image ??
    activeCategory?.heroImage ??
    activeCountry?.heroImage ??
    "/images/trips/everest.jpg";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
        isSolid
          ? "bg-white/90 backdrop-blur-xl border-b border-stone-200/70 shadow-[0_8px_30px_-14px_rgba(28,25,23,0.18)]"
          : "bg-gradient-to-b from-black/55 via-black/20 to-transparent border-b border-transparent"
      }`}
      onMouseLeave={scheduleCloseMega}
    >
      {/* Scroll progress line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
      >
        <div
          className="h-full bg-gradient-to-r from-[#3f6e15] via-[#8bc34a] to-[#f05e25] transition-[width,opacity] duration-150"
          style={{
            width: `${scrollProgress}%`,
            opacity: scrolled && !megaOpen && !open ? 1 : 0,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <nav
          className={`w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled || !hasDarkHero ? "py-2.5" : "py-3.5 sm:py-4"
          }`}
        >
          {/* Left: Brand Logo */}
          <Link
            href="/"
            onClick={() => {
              setOpen(false);
              setMegaOpen(false);
            }}
            onMouseEnter={scheduleCloseMega}
            className="group flex items-center shrink-0 cursor-pointer"
            aria-label="BROTHERS Holidays Adventure Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brothers_logo_navbar.png"
              alt="BROTHERS Holidays Adventure"
              className={`h-9 sm:h-11 w-auto max-w-[150px] sm:max-w-[190px] object-contain transition-all duration-300 group-hover:scale-[1.03] ${
                isSolid ? "brightness-0" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              }`}
            />
          </Link>

          {/* Center: Pill Navigation */}
          <div
            className={`hidden lg:flex items-center gap-1 rounded-full border p-1 transition-colors duration-300 ${
              isSolid
                ? "bg-stone-100/80 border-stone-200/80"
                : "bg-white/10 border-white/20 backdrop-blur-md"
            }`}
          >
            <button
              type="button"
              onMouseEnter={openMega}
              onFocus={openMega}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white shadow-sm transition-all cursor-pointer ${
                megaOpen
                  ? "bg-[#d94e18]"
                  : "bg-[#f05e25] hover:bg-[#d94e18]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Destinations</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {NAV_LINKS.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onMouseEnter={scheduleCloseMega}
                  aria-current={active ? "page" : undefined}
                  className={desktopLinkClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link
              href="/contact"
              onMouseEnter={scheduleCloseMega}
              className="group inline-flex items-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_16px_-6px_rgba(240,94,37,0.7)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Contact</span>
            </Link>

            <Link
              href={customerName ? "/account" : "/login"}
              onMouseEnter={scheduleCloseMega}
              className={`inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                isSolid
                  ? "border-stone-200 bg-white hover:border-[#3f6e15]/40 text-[#1c1917]"
                  : "border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                  customerName
                    ? "bg-[#3f6e15] text-white"
                    : isSolid
                    ? "bg-[#3f6e15]/10 text-[#3f6e15]"
                    : "bg-white/20 text-white"
                }`}
              >
                {customerName ? (
                  customerName.charAt(0).toUpperCase()
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
              </span>
              <span>{customerName ?? "Sign In"}</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2.5">
            <Link
              href="/contact"
              className="flex items-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-colors"
            >
              <span>Contact</span>
            </Link>

            <button
              type="button"
              className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                isSolid
                  ? "bg-white border-stone-200 text-[#1c1917] hover:border-[#3f6e15]/40"
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
              }`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            >
              {open ? (
                <X
                  className={`h-4 w-4 ${
                    isSolid ? "text-[#f05e25]" : "text-white"
                  }`}
                />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </nav>

        {/* Desktop 3-Column Destinations Mega Menu (Country -> Category -> Regions & Trips) */}
        <div
          onMouseEnter={openMega}
          aria-hidden={!megaOpen}
          className={
            megaOpen
              ? "hidden lg:block mx-4 sm:mx-6 lg:mx-8 mt-1 rounded-2xl border border-stone-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(28,25,23,0.3)] overflow-hidden"
              : "hidden"
          }
        >
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-gradient-to-r from-[#3f6e15] via-[#f05e25] to-[#3f6e15]"
          />
          <div className="grid grid-cols-[155px_195px_1fr] xl:grid-cols-[155px_195px_1fr_210px] gap-6 p-6 xl:p-7">
            {/* Column 1: Countries */}
            <div className="border-r border-stone-200 pr-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 text-stone-400 mb-2">
                Countries
              </p>
              {countries.map((c) => {
                const isSelected = activeCountry?.slug === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onMouseEnter={() => {
                      setSelectedCountrySlug(c.slug);
                      setSelectedCategorySlug(null);
                      setHoverImg(null);
                    }}
                    onFocus={() => {
                      setSelectedCountrySlug(c.slug);
                      setSelectedCategorySlug(null);
                    }}
                    onClick={() => {
                      setSelectedCountrySlug(c.slug);
                      setSelectedCategorySlug(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#3f6e15] text-white shadow-sm"
                        : "text-stone-700 hover:bg-stone-100 hover:text-[#1c1917]"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected ? (
                      <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-[#f05e25]" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Column 2: Categories for Active Country */}
            <div className="border-r border-stone-200 pr-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 text-stone-400 mb-2">
                Categories
              </p>
              {categoriesForCountry.map((cat) => {
                const isSelected = activeCategory?.slug === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onMouseEnter={() => {
                      setSelectedCategorySlug(cat.slug);
                      setHoverImg(null);
                    }}
                    onFocus={() => setSelectedCategorySlug(cat.slug)}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`block w-full rounded-[8px] px-2.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#f05e25]/10 text-[#c2410c] font-semibold border border-[#f05e25]/30"
                        : "text-stone-600 hover:bg-stone-100 hover:text-[#1c1917]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Column 3: Regions & Trips */}
            <div className="min-h-[260px]">
              {activeCountry && (
                <MegaPanel
                  activeCountry={activeCountry}
                  activeCategory={activeCategory}
                  regionsForCountry={regionsForActiveCountry}
                  tripsSource={tripsSource}
                  onHoverTrip={setHoverImg}
                  onClose={() => setMegaOpen(false)}
                />
              )}
            </div>

            {/* Column 4: Contextual Feature Image (xl screens) */}
            <div className="hidden xl:block relative overflow-hidden rounded-[12px] border border-stone-200 bg-stone-900">
              {megaOpen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featureImg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#ff8a50] font-semibold">
                  {activeCountry?.name ?? "Himalaya"} Dispatch
                </p>
                <p className="mt-1 font-serif text-sm leading-snug text-white">
                  {activeCountry?.blurb ||
                    "Small groups, certified Sherpa guides, transparent tariffs."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 bg-[#faf9f7] px-6 xl:px-7 py-3">
            <p className="text-xs text-[#57534d]">
              Can&apos;t find your route? Our Kathmandu team builds private
              departures on request.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/destinations?view=all"
                onClick={() => setMegaOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#3f6e15] hover:text-[#f05e25] transition-colors"
              >
                <span>Browse All Trips</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                onClick={() => setMegaOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors"
              >
                <Send className="h-3 w-3" />
                <span>Plan a Custom Trip</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div className="border-t border-stone-200 bg-white text-[#1c1917] px-5 py-6 lg:hidden shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#f05e25] mb-2 font-semibold">
              <MapPin className="w-3 h-3" />
              <span>Explore by Country</span>
            </div>

            {countries.map((country) => {
              const countryTrips = tripsSource.filter(
                (t) => t.country === country.slug
              );
              const isExpanded = mobileExpanded === country.slug;
              return (
                <div key={country.slug} className="border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpanded((prev) =>
                        prev === country.slug ? null : country.slug
                      )
                    }
                    className="flex w-full items-center justify-between py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#1c1917] hover:text-[#f05e25]"
                  >
                    <span>{country.name}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isExpanded ? "rotate-180 text-[#f05e25]" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 pb-3 pl-3">
                      <Link
                        href={`/destinations?country=${encodeURIComponent(country.slug)}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#f05e25]"
                      >
                        <span>All {country.name} journeys</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <ul className="space-y-1.5">
                        {countryTrips.map((t) => (
                          <li key={t.slug}>
                            <Link
                              href={`/destinations/${t.slug}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between text-[11px] text-stone-600 hover:text-[#f05e25]"
                            >
                              <span className="truncate">{t.name}</span>
                              <span className="ml-2 text-[10px] text-stone-400 tabular-nums">
                                {t.days}d
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-4 pt-2 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[#3f6e15]/10 text-[#3f6e15] font-semibold"
                        : "text-[#1c1917] font-medium hover:bg-stone-100 hover:text-[#3f6e15]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        active ? "text-[#3f6e15]" : "text-stone-300"
                      }`}
                    />
                  </Link>
                );
              })}
              <div className="pt-2 space-y-2.5">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full border border-[#f05e25] bg-[#f05e25] hover:bg-[#ff7a45] text-white py-2.5 rounded-[8px] text-xs font-bold uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact Us</span>
                </Link>
                <Link
                  href={customerName ? "/account" : "/login"}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full border border-stone-200 bg-stone-50 text-[#1c1917] py-2.5 rounded-[8px] text-xs font-semibold uppercase tracking-wider hover:border-[#f05e25] hover:text-[#f05e25]"
                >
                  <User className="w-3.5 h-3.5 text-[#f05e25]" />
                  <span>
                    {customerName ? `My Account (${customerName})` : "Traveler Sign In"}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;
