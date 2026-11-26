"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  Compass,
  FileCheck2,
  MapPin,
  Menu,
  Mountain,
  Phone,
  Send,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COUNTRIES, REGIONS } from "@/data/trips";
import {
  PEAK_BRACKETS,
  buildPeakBracketHref,
  matchesPeakBracket,
} from "@/lib/peak-brackets";
import type {
  DestinationCountryDTO,
  DestinationRegionDTO,
  DestinationTaxonomyDTO,
  NavTripDTO,
  TripCategoryDTO,
} from "@/lib/types";

type ActiveDesktopMenu =
  | "destinations"
  | "activities"
  | "peaks"
  | "guides"
  | "about"
  | null;

type MobileSection =
  | "destinations"
  | "activities"
  | "peaks"
  | "guides"
  | "about"
  | null;

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

const ABOUT_SUB_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Blog", href: "/journal" },
  { label: "Our Team", href: "/about#our-team" },
  { label: "Responsible Travel", href: "/about#responsible-travel" },
  { label: "Why Travel with Us?", href: "/about#why-travel-with-us" },
  {
    label: "Legal Documents – Brothers Holidays Adventure Pvt. Ltd.",
    href: "/legal-documents",
  },
];

const GUIDE_SUB_LINKS = [
  {
    label: "All Travel Guides",
    href: "/guides",
    desc: "Destination notes, altitude prep & trail advisories",
  },
  {
    label: "Field Journal & Blog",
    href: "/journal",
    desc: "Dispatches from Khumbu, Manaslu & Dolpo",
  },
  {
    label: "Himalayan Trekking Routes",
    href: "/treks",
    desc: "Classic & high-pass trail directory",
  },
  {
    label: "Risk-Free Booking Policy",
    href: "/booking-policy",
    desc: "Flexible dates, low deposit & weather protection",
  },
];

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

export function Nav({
  navTrips,
  taxonomy,
  contactPhone = "+977-1-4700000",
}: {
  navTrips?: NavTripDTO[];
  taxonomy?: DestinationTaxonomyDTO;
  contactPhone?: string;
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
  const [activeMenu, setActiveMenu] = useState<ActiveDesktopMenu>(null);
  const [selectedCountrySlug, setSelectedCountrySlug] = useState<string | null>(
    null
  );
  const [selectedActivitySlug, setSelectedActivitySlug] = useState<string | null>(
    null
  );
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const [mobileSection, setMobileSection] =
    useState<MobileSection>("destinations");
  const [mobileCountrySlug, setMobileCountrySlug] = useState<string | null>(
    "nepal"
  );
  const [scrolled, setScrolled] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(0);
  const closeTimer = useRef<number | null>(null);

  const pathname = usePathname();
  const hasDarkHero =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/destinations" ||
    pathname.startsWith("/destinations/country/") ||
    pathname.startsWith("/destinations/category/") ||
    pathname.startsWith("/destinations/region/");
  const isSolid = !hasDarkHero || scrolled || activeMenu !== null || open;

  const openMenu = (menu: ActiveDesktopMenu) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setActiveMenu(menu);
  };

  const scheduleCloseMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActiveMenu(null), 180);
  };

  const closeAllMenus = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setActiveMenu(null);
    setOpen(false);
  };

  useEffect(() => {
    let raf = 0;

    const measureMaxScroll = () => {
      maxScrollRef.current = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const updateBar = () => {
      const y = window.scrollY;
      const next = y > 40;
      setScrolled((prev) => (prev === next ? prev : next));
      const max = maxScrollRef.current;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        updateBar();
      });
    };

    const onResize = () => {
      measureMaxScroll();
      updateBar();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setOpen(false);
      }
    };

    measureMaxScroll();
    updateBar();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measureMaxScroll();
            updateBar();
          })
        : null;
    ro?.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
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

  const activeCountry =
    countries.find((c) => c.slug === selectedCountrySlug) ?? countries[0];
  const regionsForActiveCountry = regions.filter(
    (r) => r.countrySlug === activeCountry?.slug
  );
  const countryTrips = useMemo(() => {
    if (!activeCountry) return [];
    return tripsSource.filter((t) => t.country === activeCountry.slug);
  }, [activeCountry, tripsSource]);

  const activeActivity =
    categories.find((c) => c.slug === selectedActivitySlug) ?? categories[0];
  const activityTrips = useMemo(() => {
    if (!activeActivity) return [];
    return tripsSource.filter((t) =>
      t.categories.includes(activeActivity.slug)
    );
  }, [activeActivity, tripsSource]);

  const peakGroups = useMemo(
    () =>
      PEAK_BRACKETS.map((bracket) => ({
        bracket,
        trips: tripsSource
          .filter((t) => matchesPeakBracket(t, bracket.id))
          .slice(0, 8),
      })),
    [tripsSource]
  );

  const featureCountryImg =
    hoverImg ??
    countryTrips[0]?.image ??
    activeCountry?.heroImage ??
    "/images/trips/everest.jpg";

  const triggerBtnClass = (isOpen: boolean, isRouteActive = false) =>
    `inline-flex items-center gap-1.5 rounded-none px-3.5 xl:px-4 h-full text-[11.5px] xl:text-[12px] font-semibold uppercase tracking-[0.09em] xl:tracking-[0.11em] whitespace-nowrap transition-colors cursor-pointer ${
      isOpen
        ? "bg-[#f05e25] text-white"
        : isRouteActive
        ? isSolid
          ? "text-[#3f6e15] border-b-2 border-[#f05e25]"
          : "text-white border-b-2 border-[#f05e25]"
        : isSolid
        ? "text-[#1c1917] hover:text-[#f05e25]"
        : "text-white/95 hover:text-[#ff8a50]"
    }`;

  const isDestinationsActive = pathname.startsWith("/destinations");
  const isPeaksActive =
    pathname.startsWith("/expeditions") ||
    pathname === "/destinations/category/peak-climbing";
  const isGuidesActive =
    pathname.startsWith("/guides") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/treks") ||
    pathname === "/booking-policy";
  const isAboutActive =
    pathname === "/about" || pathname === "/legal-documents";

  const telHref = `tel:${contactPhone.replace(/[^+\d]/g, "")}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
        isSolid
          ? "bg-white border-b border-stone-200 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.14)]"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent border-b border-transparent"
      }`}
      onMouseLeave={scheduleCloseMenu}
    >
      {/* Top Risk-Free Booking Policy Bar (collapses smoothly once scrolled) */}
      <div
        className={`w-full bg-[#162b0c] text-white transition-all duration-300 overflow-hidden ${
          scrolled || activeMenu !== null || open
            ? "max-h-0 opacity-0"
            : "max-h-12 opacity-100 border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0 flex-1">
            <Bell className="w-3.5 h-3.5 text-[#ff8a50] shrink-0" />
            <span className="truncate font-medium text-white/95">
              Check Our Risk-Free Booking Policy
            </span>
            <Link
              href="/booking-policy"
              onClick={closeAllMenus}
              className="inline-flex items-center gap-1 rounded-[3px] bg-white text-[#162b0c] hover:bg-[#ff8a50] hover:text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors"
            >
              <span>View Details</span>
              <ChevronsRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-[11px] text-white/85">
            <a
              href={telHref}
              className="inline-flex items-center gap-1.5 hover:text-[#ff8a50] transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-[#8bc34a]" />
              <span>{contactPhone}</span>
            </a>
            <Link
              href="/legal-documents"
              onClick={closeAllMenus}
              className="inline-flex items-center gap-1 hover:text-[#ff8a50] transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-[#8bc34a]" />
              <span>Govt. Licensed · NTB 1509</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll progress line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left bg-gradient-to-r from-[#3f6e15] via-[#8bc34a] to-[#f05e25] transition-opacity duration-150"
          style={{
            transform: "scaleX(0)",
            opacity: scrolled && activeMenu === null && !open ? 1 : 0,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <nav className="w-full px-4 sm:px-6 lg:px-8 py-2.5 lg:py-0 lg:h-[64px] flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            onClick={closeAllMenus}
            onMouseEnter={scheduleCloseMenu}
            className="group flex items-center shrink-0 cursor-pointer"
            aria-label="BROTHERS Holidays Adventure Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brothers_logo_navbar.png"
              alt="BROTHERS Holidays Adventure"
              className={`h-9 sm:h-10 w-auto max-w-[140px] sm:max-w-[175px] object-contain transition-all duration-300 group-hover:scale-[1.03] ${
                isSolid
                  ? "brightness-0"
                  : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              }`}
            />
          </Link>

          {/* Center: Clean Architectural Rectangular Navigation Tabs */}
          <div className="hidden lg:flex items-stretch h-full gap-0.5 xl:gap-1">
            {/* 1. Destinations */}
            <button
              type="button"
              onMouseEnter={() => openMenu("destinations")}
              onFocus={() => openMenu("destinations")}
              onClick={() =>
                setActiveMenu((m) =>
                  m === "destinations" ? null : "destinations"
                )
              }
              aria-expanded={activeMenu === "destinations"}
              className={triggerBtnClass(
                activeMenu === "destinations",
                isDestinationsActive && !isPeaksActive
              )}
            >
              <span>Destinations</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "destinations" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 2. Activities */}
            <button
              type="button"
              onMouseEnter={() => openMenu("activities")}
              onFocus={() => openMenu("activities")}
              onClick={() =>
                setActiveMenu((m) => (m === "activities" ? null : "activities"))
              }
              aria-expanded={activeMenu === "activities"}
              className={triggerBtnClass(activeMenu === "activities")}
            >
              <span>Activities</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "activities" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 3. Peak Climbing */}
            <button
              type="button"
              onMouseEnter={() => openMenu("peaks")}
              onFocus={() => openMenu("peaks")}
              onClick={() =>
                setActiveMenu((m) => (m === "peaks" ? null : "peaks"))
              }
              aria-expanded={activeMenu === "peaks"}
              className={triggerBtnClass(activeMenu === "peaks", isPeaksActive)}
            >
              <span>Peak Climbing</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "peaks" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 4. Travel Guide */}
            <div className="relative flex items-stretch">
              <button
                type="button"
                onMouseEnter={() => openMenu("guides")}
                onFocus={() => openMenu("guides")}
                onClick={() =>
                  setActiveMenu((m) => (m === "guides" ? null : "guides"))
                }
                aria-expanded={activeMenu === "guides"}
                className={triggerBtnClass(
                  activeMenu === "guides",
                  isGuidesActive
                )}
              >
                <span>Travel Guide</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMenu === "guides" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeMenu === "guides" && (
                <div
                  onMouseEnter={() => openMenu("guides")}
                  className="absolute left-0 top-full mt-0 w-72 rounded-none border border-t-2 border-stone-200 border-t-[#f05e25] bg-white shadow-[0_20px_48px_-16px_rgba(15,23,42,0.22)] overflow-hidden z-50"
                >
                  <div className="divide-y divide-stone-100">
                    {GUIDE_SUB_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeAllMenus}
                        className="group block px-5 py-3 hover:bg-[#f8fafc] transition-colors"
                      >
                        <div className="text-[13px] font-semibold text-[#1c1917] group-hover:text-[#f05e25] transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {item.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. About Us */}
            <div className="relative flex items-stretch">
              <button
                type="button"
                onMouseEnter={() => openMenu("about")}
                onFocus={() => openMenu("about")}
                onClick={() =>
                  setActiveMenu((m) => (m === "about" ? null : "about"))
                }
                aria-expanded={activeMenu === "about"}
                className={triggerBtnClass(activeMenu === "about", isAboutActive)}
              >
                <span>About Us</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMenu === "about" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeMenu === "about" && (
                <div
                  onMouseEnter={() => openMenu("about")}
                  className="absolute right-0 xl:left-0 xl:right-auto top-full mt-0 w-80 rounded-none border border-t-2 border-stone-200 border-t-[#f05e25] bg-[#f8fafc] shadow-[0_20px_48px_-16px_rgba(15,23,42,0.22)] overflow-hidden z-50"
                >
                  <div className="divide-y divide-stone-200/70">
                    {ABOUT_SUB_LINKS.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between gap-2 px-5 py-3 text-[13.5px] font-medium text-[#334155] hover:bg-white hover:text-[#f05e25] transition-colors"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/contact"
              onClick={closeAllMenus}
              onMouseEnter={scheduleCloseMenu}
              className="group inline-flex items-center gap-1.5 rounded-[4px] bg-[#f05e25] hover:bg-[#d94e18] px-3.5 xl:px-4 py-2 text-[11px] xl:text-[11.5px] font-bold uppercase tracking-[0.1em] text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Contact</span>
            </Link>

            <Link
              href={customerName ? "/account" : "/login"}
              onClick={closeAllMenus}
              onMouseEnter={scheduleCloseMenu}
              className={`inline-flex items-center gap-2 rounded-[4px] border pl-1.5 pr-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                isSolid
                  ? "border-stone-200 bg-white hover:border-[#3f6e15]/50 text-[#1c1917]"
                  : "border-white/35 bg-[#081318]/55 hover:bg-[#081318]/75 text-white"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-[3px] text-[11px] font-bold ${
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
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={telHref}
              aria-label="Call Brothers Holidays Adventure"
              className={`w-9 h-9 rounded-[4px] border flex items-center justify-center transition-colors ${
                isSolid
                  ? "bg-white border-stone-200 text-[#3f6e15] hover:border-[#3f6e15]/50"
                  : "bg-[#081318]/55 border-white/30 text-white hover:bg-[#081318]/75"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
            </a>

            <Link
              href="/contact"
              onClick={closeAllMenus}
              className="flex items-center gap-1.5 rounded-[4px] bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-colors"
            >
              <span>Contact</span>
            </Link>

            <button
              type="button"
              className={`w-9 h-9 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                isSolid
                  ? "bg-white border-stone-200 text-[#1c1917] hover:border-[#3f6e15]/50"
                  : "bg-[#081318]/55 border-white/30 text-white hover:bg-[#081318]/75"
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

        {/* MEGA PANEL 1: DESTINATIONS (Flush Rectangular Mega-Menu) */}
        {activeMenu === "destinations" && (
          <div
            onMouseEnter={() => openMenu("destinations")}
            className="hidden lg:block mx-4 sm:mx-6 lg:mx-8 mt-0 rounded-none border border-t-2 border-stone-200 border-t-[#f05e25] bg-white shadow-[0_20px_48px_-16px_rgba(15,23,42,0.22)] overflow-hidden"
          >
            <div className="grid grid-cols-[190px_1fr_240px]">
              {/* Left: Countries */}
              <div className="border-r border-stone-200 bg-[#f8fafc] py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 text-stone-400 mb-2">
                  Destinations
                </p>
                <div className="divide-y divide-stone-200/70">
                  {countries.map((c) => {
                    const isSelected = activeCountry?.slug === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onMouseEnter={() => {
                          setSelectedCountrySlug(c.slug);
                          setHoverImg(null);
                        }}
                        onFocus={() => setSelectedCountrySlug(c.slug)}
                        onClick={() => setSelectedCountrySlug(c.slug)}
                        className={`flex w-full items-center justify-between rounded-none px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#3f6e15] text-white"
                            : "text-stone-700 hover:bg-white hover:text-[#1c1917]"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isSelected ? (
                          <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-[#ff8a50]" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center: Regions + Popular Journeys in Active Country */}
              <div className="p-6 space-y-4">
                {activeCountry && (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f05e25]">
                        {activeCountry.name} Expeditions &amp; Treks
                      </p>
                      <Link
                        href={`/destinations/country/${encodeURIComponent(
                          activeCountry.slug
                        )}`}
                        onClick={closeAllMenus}
                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#3f6e15] hover:text-[#f05e25]"
                      >
                        Explore {activeCountry.name}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {regionsForActiveCountry.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {regionsForActiveCountry.map((region) => {
                          const regionTrips = countryTrips
                            .filter((t) => t.region === region.slug)
                            .slice(0, 6);
                          return (
                            <div key={region.slug} className="space-y-1.5">
                              <Link
                                href={`/destinations/region/${encodeURIComponent(
                                  region.slug
                                )}`}
                                onClick={closeAllMenus}
                                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#3f6e15] hover:text-[#f05e25]"
                              >
                                <span>{region.name}</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                              {regionTrips.length > 0 ? (
                                <ul className="space-y-1">
                                  {regionTrips.map((trip) => (
                                    <li key={trip.slug}>
                                      <Link
                                        href={`/destinations/${trip.slug}`}
                                        onClick={closeAllMenus}
                                        onMouseEnter={() =>
                                          setHoverImg(trip.image)
                                        }
                                        onMouseLeave={() => setHoverImg(null)}
                                        className="group flex items-center justify-between text-xs text-stone-600 hover:text-[#1c1917]"
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
                                  Custom routes available
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : countryTrips.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {countryTrips.slice(0, 12).map((trip) => (
                          <Link
                            key={trip.slug}
                            href={`/destinations/${trip.slug}`}
                            onClick={closeAllMenus}
                            onMouseEnter={() => setHoverImg(trip.image)}
                            onMouseLeave={() => setHoverImg(null)}
                            className="group flex items-center justify-between rounded-none px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50 hover:text-[#1c1917]"
                          >
                            <span className="truncate group-hover:translate-x-0.5 transition-transform">
                              {trip.name}
                            </span>
                            <span className="ml-2 text-[11px] text-stone-400 tabular-nums group-hover:text-[#f05e25]">
                              {trip.days}d
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-none border border-stone-200 bg-stone-50 p-5 space-y-2">
                        <p className="text-xs text-stone-600 leading-relaxed">
                          Private customized journeys in {activeCountry.name}{" "}
                          arranged with licensed regional guides and full permit
                          handling.
                        </p>
                        <Link
                          href="/contact"
                          onClick={closeAllMenus}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f05e25] hover:underline"
                        >
                          <span>Request a {activeCountry.name} itinerary</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: Featured Photo Block */}
              <div className="relative overflow-hidden rounded-none border-l border-stone-200 bg-stone-900 min-h-[240px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featureCountryImg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-5">
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
          </div>
        )}

        {/* MEGA PANEL 2: ACTIVITIES (Flush Rectangular Mega-Menu) */}
        {activeMenu === "activities" && (
          <div
            onMouseEnter={() => openMenu("activities")}
            className="hidden lg:block mx-4 sm:mx-6 lg:mx-8 mt-0 rounded-none border border-t-2 border-stone-200 border-t-[#f05e25] bg-white shadow-[0_20px_48px_-16px_rgba(15,23,42,0.22)] overflow-hidden"
          >
            <div className="grid grid-cols-[230px_1fr] xl:grid-cols-[250px_1fr]">
              {/* Left Vertical Activity Categories */}
              <div className="border-r border-stone-200 bg-[#f8fafc] py-3">
                <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                  Activities
                </p>
                <div className="divide-y divide-stone-200/70">
                  {categories.map((cat) => {
                    const isSelected = activeActivity?.slug === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onMouseEnter={() => setSelectedActivitySlug(cat.slug)}
                        onFocus={() => setSelectedActivitySlug(cat.slug)}
                        onClick={() => setSelectedActivitySlug(cat.slug)}
                        className={`flex w-full items-center justify-between rounded-none px-4 py-2.5 text-left text-[12.5px] transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#f05e25] font-semibold border-l-[3px] border-[#f05e25]"
                            : "text-[#334155] font-medium hover:bg-white hover:text-[#3f6e15]"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-[#f05e25]" : "text-stone-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 2-Column Trips Directory */}
              <div className="p-6 xl:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3f6e15]">
                        {activeActivity?.name ?? "Activities"}
                      </p>
                      {activeActivity?.blurb && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {activeActivity.blurb}
                        </p>
                      )}
                    </div>
                    {activeActivity && (
                      <Link
                        href={`/destinations/category/${encodeURIComponent(
                          activeActivity.slug
                        )}`}
                        onClick={closeAllMenus}
                        className="inline-flex items-center gap-1 rounded-[3px] bg-[#3f6e15]/10 hover:bg-[#3f6e15] text-[#3f6e15] hover:text-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors shrink-0"
                      >
                        <span>View all</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>

                  {activityTrips.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-h-[340px] overflow-y-auto pr-1">
                      {activityTrips.map((trip) => (
                        <Link
                          key={trip.slug}
                          href={`/destinations/${trip.slug}`}
                          onClick={closeAllMenus}
                          className="group flex items-center justify-between rounded-none px-2.5 py-1.5 text-[12.5px] text-[#334155] hover:bg-stone-50 hover:text-[#f05e25] transition-colors"
                        >
                          <span className="truncate font-medium">
                            {trip.name}
                          </span>
                          <span className="ml-2 text-[11px] text-stone-400 tabular-nums shrink-0 group-hover:text-[#f05e25]">
                            {trip.days}d
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-none border border-stone-200 bg-stone-50 p-6 space-y-2">
                      <p className="text-xs text-stone-600">
                        Custom departures for {activeActivity?.name} are arranged
                        daily from our Thamel, Kathmandu head office.
                      </p>
                      <Link
                        href="/contact"
                        onClick={closeAllMenus}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f05e25] hover:underline"
                      >
                        <span>Customize {activeActivity?.name}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-500">
                  <span>
                    Showing {activityTrips.length}{" "}
                    {activityTrips.length === 1 ? "route" : "routes"} in{" "}
                    {activeActivity?.name}
                  </span>
                  <Link
                    href="/destinations?view=all"
                    onClick={closeAllMenus}
                    className="font-semibold text-[#3f6e15] hover:text-[#f05e25] inline-flex items-center gap-1"
                  >
                    <span>All Trips &amp; Filters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEGA PANEL 3: PEAK CLIMBING (Flush 4-Column Divided Rectangular Layout) */}
        {activeMenu === "peaks" && (
          <div
            onMouseEnter={() => openMenu("peaks")}
            className="hidden lg:block mx-4 sm:mx-6 lg:mx-8 mt-0 rounded-none border border-t-2 border-stone-200 border-t-[#f05e25] bg-white shadow-[0_20px_48px_-16px_rgba(15,23,42,0.22)] overflow-hidden"
          >
            <div className="grid grid-cols-4 divide-x divide-stone-200">
              {peakGroups.map(({ bracket, trips }) => (
                <div
                  key={bracket.id}
                  className="p-5 flex flex-col justify-between space-y-3 hover:bg-[#faf9f7]/50 transition-colors"
                >
                  <div className="space-y-2.5">
                    <Link
                      href={buildPeakBracketHref(bracket.id)}
                      onClick={closeAllMenus}
                      className="group flex items-center justify-between text-[13px] font-bold text-[#1c1917] hover:text-[#f05e25] transition-colors border-b border-stone-200 pb-2"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Mountain className="w-3.5 h-3.5 text-[#f05e25]" />
                        <span>{bracket.label}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#f05e25]" />
                    </Link>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {bracket.description}
                    </p>

                    {trips.length > 0 ? (
                      <ul className="space-y-1 pt-1">
                        {trips.map((trip) => (
                          <li key={trip.slug}>
                            <Link
                              href={`/destinations/${trip.slug}`}
                              onClick={closeAllMenus}
                              className="group flex items-center justify-between text-xs text-stone-700 hover:text-[#f05e25] py-0.5"
                            >
                              <span className="truncate font-medium">
                                {trip.name}
                              </span>
                              <span className="ml-2 text-[10px] text-stone-400 tabular-nums shrink-0">
                                {trip.maxAltitude.toLocaleString()}m
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic pt-1">
                        Custom climbing permits available
                      </p>
                    )}
                  </div>

                  <Link
                    href={buildPeakBracketHref(bracket.id)}
                    onClick={closeAllMenus}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#3f6e15] hover:text-[#f05e25] pt-2"
                  >
                    <span>View {bracket.shortLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-stone-200 bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-5">
                <Link
                  href="/destinations/category/peak-climbing"
                  onClick={closeAllMenus}
                  className="font-semibold text-[#3f6e15] hover:text-[#f05e25] inline-flex items-center gap-1"
                >
                  <span>All Peak Climbing Packages</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/expeditions"
                  onClick={closeAllMenus}
                  className="font-semibold text-[#334155] hover:text-[#f05e25] inline-flex items-center gap-1"
                >
                  <span>High-Altitude Expeditions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <Link
                href="/contact"
                onClick={closeAllMenus}
                className="font-semibold text-[#f05e25] hover:underline"
              >
                Need NMA Permit Advice? Talk to a Guide →
              </Link>
            </div>
          </div>
        )}

        {/* MOBILE-FRIENDLY ACCORDION DRAWER (Clean Rectangular Architecture) */}
        {open && (
          <div className="border-t border-stone-200 bg-white text-[#1c1917] px-4 sm:px-6 py-4 lg:hidden shadow-2xl max-h-[82vh] overflow-y-auto">
            {/* Quick Booking Policy Banner inside mobile drawer */}
            <Link
              href="/booking-policy"
              onClick={closeAllMenus}
              className="mb-3 flex items-center justify-between rounded-none bg-[#162b0c] px-3.5 py-2.5 text-white"
            >
              <span className="inline-flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-[#8bc34a] shrink-0" />
                <span>Risk-Free Booking Policy</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff8a50]">
                View Details »
              </span>
            </Link>

            <div className="divide-y divide-stone-200">
              {/* Mobile Accordion 1: Destinations (Nepal, Tibet, Bhutan) */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === "destinations" ? null : "destinations"
                    )
                  }
                  className="flex w-full min-h-[44px] items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c1917]"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#f05e25]" />
                    <span>Destinations (Nepal · Tibet · Bhutan)</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSection === "destinations"
                        ? "rotate-180 text-[#f05e25]"
                        : ""
                    }`}
                  />
                </button>
                {mobileSection === "destinations" && (
                  <div className="pb-3 pl-2 space-y-1.5">
                    {countries.map((country) => {
                      const cTrips = tripsSource.filter(
                        (t) => t.country === country.slug
                      );
                      const isCountryOpen = mobileCountrySlug === country.slug;
                      return (
                        <div
                          key={country.slug}
                          className="rounded-none border border-stone-200 bg-stone-50/70"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMobileCountrySlug((prev) =>
                                prev === country.slug ? null : country.slug
                              )
                            }
                            className="flex w-full min-h-[40px] items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#3f6e15]"
                          >
                            <span>{country.name}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isCountryOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isCountryOpen && (
                            <div className="px-3 pb-2.5 space-y-1.5 border-t border-stone-200/70 pt-2">
                              <Link
                                href={`/destinations/country/${encodeURIComponent(
                                  country.slug
                                )}`}
                                onClick={closeAllMenus}
                                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#f05e25]"
                              >
                                <span>All {country.name} Packages</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                              <ul className="space-y-1">
                                {cTrips.slice(0, 8).map((t) => (
                                  <li key={t.slug}>
                                    <Link
                                      href={`/destinations/${t.slug}`}
                                      onClick={closeAllMenus}
                                      className="flex items-center justify-between py-1 text-xs text-stone-700 hover:text-[#f05e25]"
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
                  </div>
                )}
              </div>

              {/* Mobile Accordion 2: Activities */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === "activities" ? null : "activities"
                    )
                  }
                  className="flex w-full min-h-[44px] items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c1917]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#3f6e15]" />
                    <span>Activities</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSection === "activities"
                        ? "rotate-180 text-[#f05e25]"
                        : ""
                    }`}
                  />
                </button>
                {mobileSection === "activities" && (
                  <div className="pb-3 pl-2 grid grid-cols-1 divide-y divide-stone-100">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/destinations/category/${encodeURIComponent(
                          cat.slug
                        )}`}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between rounded-none px-3 py-2 text-xs font-medium text-[#334155] hover:bg-stone-50 hover:text-[#f05e25]"
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    ))}
                    <Link
                      href="/destinations?view=all"
                      onClick={closeAllMenus}
                      className="mt-1 inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#3f6e15]"
                    >
                      <span>Browse All Trips</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Accordion 3: Peak Climbing (Altitude Brackets) */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) => (s === "peaks" ? null : "peaks"))
                  }
                  className="flex w-full min-h-[44px] items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c1917]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-[#f05e25]" />
                    <span>Peak Climbing</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSection === "peaks"
                        ? "rotate-180 text-[#f05e25]"
                        : ""
                    }`}
                  />
                </button>
                {mobileSection === "peaks" && (
                  <div className="pb-3 pl-2 divide-y divide-stone-100">
                    {PEAK_BRACKETS.map((b) => (
                      <Link
                        key={b.id}
                        href={buildPeakBracketHref(b.id)}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between rounded-none px-3 py-2 text-xs font-medium text-[#334155] hover:bg-stone-50 hover:text-[#f05e25]"
                      >
                        <span>{b.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    ))}
                    <Link
                      href="/expeditions"
                      onClick={closeAllMenus}
                      className="flex items-center justify-between rounded-none px-3 py-2 text-xs font-bold text-[#3f6e15]"
                    >
                      <span>8,000m &amp; Technical Expeditions</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Accordion 4: Travel Guide */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) => (s === "guides" ? null : "guides"))
                  }
                  className="flex w-full min-h-[44px] items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c1917]"
                >
                  <span>Travel Guide &amp; Journal</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSection === "guides"
                        ? "rotate-180 text-[#f05e25]"
                        : ""
                    }`}
                  />
                </button>
                {mobileSection === "guides" && (
                  <div className="pb-3 pl-2 divide-y divide-stone-100">
                    {GUIDE_SUB_LINKS.map((g) => (
                      <Link
                        key={g.href}
                        href={g.href}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between rounded-none px-3 py-2 text-xs font-medium text-[#334155] hover:bg-stone-50 hover:text-[#f05e25]"
                      >
                        <span>{g.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion 5: About Us (all 6 sub-items) */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSection((s) => (s === "about" ? null : "about"))
                  }
                  className="flex w-full min-h-[44px] items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c1917]"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#3f6e15]" />
                    <span>About Us</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSection === "about"
                        ? "rotate-180 text-[#f05e25]"
                        : ""
                    }`}
                  />
                </button>
                {mobileSection === "about" && (
                  <div className="pb-3 pl-2 divide-y divide-stone-100">
                    {ABOUT_SUB_LINKS.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between rounded-none px-3 py-2 text-xs font-medium text-[#334155] hover:bg-stone-50 hover:text-[#f05e25]"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 gap-2.5">
              <Link
                href="/contact"
                onClick={closeAllMenus}
                className="flex items-center justify-center gap-1.5 bg-[#f05e25] hover:bg-[#d94e18] text-white py-2.5 rounded-[4px] text-xs font-bold uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </Link>
              <Link
                href={customerName ? "/account" : "/login"}
                onClick={closeAllMenus}
                className="flex items-center justify-center gap-1.5 border border-stone-200 bg-stone-50 text-[#1c1917] py-2.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider hover:border-[#3f6e15]"
              >
                <User className="w-3.5 h-3.5 text-[#3f6e15]" />
                <span>{customerName ?? "Sign In"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;
