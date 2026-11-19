"use client";

import {
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
  Menu,
  Mountain,
  MapPin,
  Info,
  BarChart2,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  REGIONS,
  tripsByCategory,
  tripsByCountry,
  tripsByRegion,
  type Category,
  type Trip,
} from "@/data/trips";

type MenuKey = Category | "tibet" | "bhutan";

const MENU: { key: MenuKey; label: string; group: string }[] = [
  ...CATEGORIES.map((c) => ({
    key: c.id as MenuKey,
    label: c.label,
    group: "Nepal",
  })),
  { key: "tibet", label: "Tibet", group: "Beyond" },
  { key: "bhutan", label: "Bhutan", group: "Beyond" },
];

function menuTrips(key: MenuKey): Trip[] {
  if (key === "tibet" || key === "bhutan") return tripsByCountry(key);
  return tripsByCategory(key);
}

function menuImage(key: MenuKey): string {
  if (key === "tibet" || key === "bhutan")
    return tripsByCountry(key)[0]?.image ?? "/images/trips/everest.jpg";
  return (
    CATEGORIES.find((c) => c.id === key)?.image ?? "/images/trips/everest.jpg"
  );
}

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

function ViewAllLink({
  menuKey,
  onClick,
}: {
  menuKey: MenuKey;
  onClick?: () => void;
}) {
  const isCountry = menuKey === "tibet" || menuKey === "bhutan";
  const href = isCountry
    ? `/destinations?country=${menuKey}`
    : `/destinations?category=${menuKey}`;
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#e8b765] hover:underline"
    >
      View all <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function MegaPanel({
  active,
  onHoverTrip,
  onClose,
}: {
  active: MenuKey;
  onHoverTrip: (img: string | null) => void;
  onClose?: () => void;
}) {
  const label = MENU.find((m) => m.key === active)?.label ?? "Destinations";

  if (active === "trekking") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#89d6e2]">
            Trekking Routes in Nepal
          </p>
          <ViewAllLink menuKey="trekking" onClick={onClose} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {REGIONS.map((region) => {
            const list = tripsByRegion(region.id).slice(0, 5);
            return (
              <div key={region.id} className="space-y-1.5">
                <Link
                  href={`/destinations?region=${region.id}`}
                  onClick={onClose}
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#e8b765] hover:underline"
                >
                  {region.label}
                </Link>
                <ul className="space-y-1">
                  {list.map((trip) => (
                    <li key={trip.slug}>
                      <Link
                        href={`/destinations/${trip.slug}`}
                        onClick={onClose}
                        onMouseEnter={() => onHoverTrip(trip.image)}
                        onMouseLeave={() => onHoverTrip(null)}
                        className="group flex items-center justify-between text-xs text-white/80 transition-colors hover:text-white"
                      >
                        <span className="truncate group-hover:translate-x-0.5 transition-transform">
                          {trip.name}
                        </span>
                        <span className="ml-2 font-mono text-[10px] text-white/40 group-hover:text-[#89d6e2]">
                          {trip.days}d
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const trips = menuTrips(active);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#89d6e2]">
          {label}
        </p>
        <ViewAllLink menuKey={active} onClick={onClose} />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {trips.slice(0, 10).map((trip) => (
          <Link
            key={trip.slug}
            href={`/destinations/${trip.slug}`}
            onClick={onClose}
            onMouseEnter={() => onHoverTrip(trip.image)}
            onMouseLeave={() => onHoverTrip(null)}
            className="group flex items-center justify-between rounded-sm px-2 py-1 text-xs text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="truncate group-hover:translate-x-0.5 transition-transform">
              {trip.name}
            </span>
            <span className="ml-2 font-mono text-[10px] text-white/40 group-hover:text-[#89d6e2]">
              {trip.days}d
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [active, setActive] = useState<MenuKey>("trekking");
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 180);
  };

  const featureImg = hoverImg ?? menuImage(active);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6 pointer-events-none transition-all duration-300"
      onMouseLeave={scheduleCloseMega}
    >
      <div className="max-w-7xl mx-auto relative pointer-events-auto">
        {/* ──────────────────────────────────────────────────────────
            BROTHERS HOLIDAYS ADVENTURE FLOATING GLASS-EFFECT NAVBAR PILL
            - Dark charcoal/navy glass with high opacity for crystal clarity
            - Metallic gold borders & subtle inner bevel
            - Refined icons and balanced typography matching reference image
            ────────────────────────────────────────────────────────── */}
        <nav
          className={`w-full rounded-2xl border transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6 shadow-2xl backdrop-blur-2xl ${
            scrolled || megaOpen
              ? "bg-[#071317]/95 border-[#c59a4a]/50 shadow-[0_12px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
              : "bg-[#09171e]/90 border-[#c59a4a]/40 shadow-[0_8px_32px_rgba(0,0,0,0.55)] ring-1 ring-white/5"
          }`}
        >
          {/* 1. LEFT BRAND: BROTHERS Holidays Adventure Logo */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            data-launch-reload="true"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              setMegaOpen(false);
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/";
            }}
            className="group flex items-center text-white shrink-0 cursor-pointer"
            aria-label="BROTHERS Holidays Adventure Home"
            onMouseEnter={scheduleCloseMega}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brothers_logo_navbar.png"
              alt="BROTHERS Holidays Adventure"
              className="h-7 sm:h-9 md:h-10 w-auto max-w-[135px] sm:max-w-[170px] md:max-w-none object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-md"
            />
          </a>

          {/* 2. MAIN NAVIGATION (Desktop / Tablet-Landscape) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* DESTINATIONS (Golden Pill Button with Pin & Chevron) */}
            <button
              type="button"
              onMouseEnter={openMega}
              onFocus={openMega}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${
                megaOpen
                  ? "bg-[#e8b765] text-[#071317] ring-2 ring-[#e8b765]/50 scale-[0.98]"
                  : "bg-[#d99f38] hover:bg-[#e8b765] text-[#071317]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Destinations</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ALL TRIPS */}
            <Link
              href="/destinations"
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 hover:text-[#e8b765] transition-colors py-1 group"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#e8b765] transition-transform group-hover:scale-110" />
              <span>All Trips</span>
            </Link>

            {/* TREKS */}
            <Link
              href="/treks"
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 hover:text-[#e8b765] transition-colors py-1 group"
            >
              <Mountain className="w-3.5 h-3.5 text-[#e8b765] transition-transform group-hover:scale-110" />
              <span>Treks</span>
            </Link>
          </div>

          {/* 3. CENTER BRAND DIVIDER */}
          <div className="hidden xl:flex items-center gap-4 text-white/20">
            <span className="h-4 w-px bg-white/20" />
            <span className="font-display text-sm tracking-[0.34em] text-white/70 select-none">
              B R O T H E R S
            </span>
          </div>

          {/* 4. RIGHT SECTION: About, Process & Prominent Gold Enquire Button */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* ABOUT */}
            <Link
              href="/#who-we-are"
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 hover:text-[#e8b765] transition-colors py-1 group"
            >
              <Info className="w-3.5 h-3.5 text-[#e8b765] transition-transform group-hover:scale-110" />
              <span>About</span>
            </Link>

            {/* PROGRESS / PROCESS */}
            <Link
              href="/#enquiry"
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 hover:text-[#e8b765] transition-colors py-1 group"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#e8b765] transition-transform group-hover:scale-110" />
              <span>Progress</span>
            </Link>

            <span className="h-4 w-px bg-white/20 hidden xl:block" />

            {/* ENQUIRE (Prominent Gold-Outlined Button with Send Icon) */}
            <Link
              href="/#enquiry"
              onMouseEnter={scheduleCloseMega}
              className="group flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#d99f38] hover:border-[#e8b765] bg-[#d99f38]/10 hover:bg-[#d99f38] text-[#e8b765] hover:text-[#071317] text-xs font-bold uppercase tracking-[0.22em] transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3 h-3 text-[#e8b765] group-hover:text-[#071317] transition-all duration-300 group-hover:translate-x-0.5" />
              <span>Enquire</span>
            </Link>
          </div>

          {/* 5. MOBILE ACTIONS (Enquire + Hamburger Menu Toggle) */}
          <div className="flex lg:hidden items-center gap-2.5">
            <Link
              href="/#enquiry"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#d99f38] bg-[#d99f38]/10 text-[#e8b765] text-[11px] font-bold uppercase tracking-wider"
            >
              <Send className="w-2.5 h-2.5 text-[#e8b765]" />
              <span>Enquire</span>
            </Link>

            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center cursor-pointer hover:border-[#e8b765]/50 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            >
              {open ? <X className="h-4 w-4 text-[#e8b765]" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* ──────────────────────────────────────────────────────────
            6. DESKTOP DESTINATIONS MEGA MENU DROPDOWN PANEL
            Seamlessly attached underneath the floating pill
            ────────────────────────────────────────────────────────── */}
        {megaOpen && (
          <div
            onMouseEnter={openMega}
            className="hidden lg:block mt-2 rounded-2xl border border-[#c59a4a]/40 bg-[#071317]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="grid grid-cols-[230px_1fr_250px] gap-8 p-8">
              {/* Country & Category Selector Tabs */}
              <div className="border-r border-white/10 pr-6 space-y-4">
                {(["Nepal", "Beyond"] as const).map((group) => (
                  <div key={group} className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] px-3 text-[#89d6e2]/80 font-semibold mb-1">
                      {group}
                    </p>
                    {MENU.filter((m) => m.group === group).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onMouseEnter={() => setActive(m.key)}
                        onFocus={() => setActive(m.key)}
                        className={`relative block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                          active === m.key
                            ? "bg-[#00515b] text-white font-semibold shadow-sm border border-[#89d6e2]/30"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Dynamic Trips Grid */}
              <div className="min-h-[280px]">
                <MegaPanel
                  active={active}
                  onHoverTrip={setHoverImg}
                  onClose={() => setMegaOpen(false)}
                />
              </div>

              {/* Live Photo Preview Card */}
              <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#050c0e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featureImg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050c0e] via-[#050c0e]/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e8b765] font-semibold">
                    Field Proven
                  </p>
                  <p className="mt-1 font-serif text-base leading-tight text-white">
                    Small groups. Certified Sherpa guides. Honest pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            7. MOBILE NAVIGATION DRAWER
            Matching dark charcoal glass with subtle gold trim
            ────────────────────────────────────────────────────────── */}
        {open && (
          <div className="mt-2 rounded-2xl border border-[#c59a4a]/40 bg-[#071317]/98 px-5 py-6 backdrop-blur-2xl lg:hidden shadow-2xl max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#e8b765] mb-2 font-semibold">
              <MapPin className="w-3 h-3" />
              <span>Explore Destinations</span>
            </div>

            {MENU.map((m) => (
              <div key={m.key} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setMobileExpanded((e) => (e === m.key ? null : m.key))
                  }
                  className="flex w-full items-center justify-between py-2.5 text-left text-xs font-medium text-white/90 hover:text-white"
                >
                  <span>{m.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      mobileExpanded === m.key ? "rotate-180 text-[#e8b765]" : ""
                    }`}
                  />
                </button>
                {mobileExpanded === m.key && (
                  <ul className="space-y-1.5 pb-2.5 pl-3">
                    {menuTrips(m.key).map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/destinations/${t.slug}`}
                          onClick={() => setOpen(false)}
                          className="block text-[11px] text-white/70 hover:text-[#e8b765]"
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="mt-4 pt-2 space-y-2">
              <Link
                href="/destinations"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 py-2 text-sm text-white font-medium hover:text-[#e8b765]"
              >
                <LayoutGrid className="w-4 h-4 text-[#e8b765]" />
                <span>All Trips</span>
              </Link>
              <Link
                href="/treks"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 py-2 text-sm text-white font-medium hover:text-[#e8b765]"
              >
                <Mountain className="w-4 h-4 text-[#e8b765]" />
                <span>Treks</span>
              </Link>
              <Link
                href="/#who-we-are"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 py-2 text-sm text-white font-medium hover:text-[#e8b765]"
              >
                <Info className="w-4 h-4 text-[#e8b765]" />
                <span>About</span>
              </Link>
              <Link
                href="/#enquiry"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 py-2 text-sm text-white font-medium hover:text-[#e8b765]"
              >
                <BarChart2 className="w-4 h-4 text-[#e8b765]" />
                <span>Progress</span>
              </Link>
              <Link
                href="/#enquiry"
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 w-full border border-[#d99f38] bg-[#d99f38]/15 text-[#e8b765] py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enquire Now</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;
