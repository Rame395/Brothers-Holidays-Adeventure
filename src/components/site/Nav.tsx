"use client";

import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  MapPin,
  Send,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  REGIONS,
  TRIPS,
  type Category,
  type Region,
} from "@/data/trips";
import type { NavTripDTO } from "@/lib/types";

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

function filterMenuTrips(trips: NavTripDTO[], key: MenuKey): NavTripDTO[] {
  if (key === "tibet" || key === "bhutan") {
    return trips.filter((t) => t.country === key);
  }
  return trips.filter((t) => t.country === "nepal" && t.categories.includes(key));
}

function filterRegionTrips(trips: NavTripDTO[], region: Region): NavTripDTO[] {
  return trips.filter(
    (t) => t.region === region && t.categories.includes("trekking")
  );
}

function menuImage(trips: NavTripDTO[], key: MenuKey): string {
  if (key === "tibet" || key === "bhutan") {
    return (
      trips.find((t) => t.country === key)?.image ?? "/images/trips/everest.jpg"
    );
  }
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
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#e5b96b] hover:underline"
    >
      View all <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function MegaPanel({
  active,
  tripsSource,
  onHoverTrip,
  onClose,
}: {
  active: MenuKey;
  tripsSource: NavTripDTO[];
  onHoverTrip: (img: string | null) => void;
  onClose?: () => void;
}) {
  const label = MENU.find((m) => m.key === active)?.label ?? "Destinations";

  if (active === "trekking") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e5b96b]">
            Trekking Regions in Nepal
          </p>
          <ViewAllLink menuKey="trekking" onClick={onClose} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {REGIONS.map((region) => {
            const list = filterRegionTrips(tripsSource, region.id).slice(0, 5);
            return (
              <div key={region.id} className="space-y-1.5">
                <Link
                  href={`/destinations?region=${region.id}`}
                  onClick={onClose}
                  className="block text-[11px] font-semibold uppercase tracking-wider text-white/90 hover:text-[#e5b96b]"
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
                        className="group flex items-center justify-between text-xs text-white/75 transition-colors hover:text-white"
                      >
                        <span className="truncate transition-transform group-hover:translate-x-0.5">
                          {trip.name}
                        </span>
                        <span className="ml-2 text-[11px] text-white/45 tabular-nums group-hover:text-[#e5b96b]">
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

  const trips = filterMenuTrips(tripsSource, active);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e5b96b]">
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
            className="group flex items-center justify-between rounded-md px-2 py-1 text-xs text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="truncate transition-transform group-hover:translate-x-0.5">
              {trip.name}
            </span>
            <span className="ml-2 text-[11px] text-white/45 tabular-nums group-hover:text-[#e5b96b]">
              {trip.days}d
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Nav({ navTrips }: { navTrips?: NavTripDTO[] }) {
  const tripsSource: NavTripDTO[] =
    navTrips && navTrips.length > 0 ? navTrips : TRIPS;
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [active, setActive] = useState<MenuKey>("trekking");
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 40;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const featureImg = hoverImg ?? menuImage(tripsSource, active);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6 pointer-events-none transition-colors duration-300"
      onMouseLeave={scheduleCloseMega}
    >
      <div className="max-w-7xl mx-auto relative pointer-events-auto">
        <nav
          className={`w-full rounded-2xl border transition-colors duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 lg:backdrop-blur-md ${
            scrolled || megaOpen
              ? "bg-[#081318]/96 lg:bg-[#081318]/94 border-white/15 shadow-2xl"
              : "bg-[#081318]/92 lg:bg-[#081318]/86 border-white/12 shadow-xl"
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
            className="group flex items-center text-white shrink-0 cursor-pointer"
            aria-label="BROTHERS Holidays Adventure Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brothers_logo_navbar.png"
              alt="BROTHERS Holidays Adventure"
              className="h-7 sm:h-9 w-auto max-w-[140px] sm:max-w-[165px] object-contain"
            />
          </Link>

          {/* Center / Main Desktop Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            <button
              type="button"
              onMouseEnter={openMega}
              onFocus={openMega}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                megaOpen
                  ? "bg-[#e5b96b] text-[#081318]"
                  : "bg-[#c89b4b] hover:bg-[#e5b96b] text-[#081318]"
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

            <Link
              href="/destinations"
              onMouseEnter={scheduleCloseMega}
              className="text-xs font-medium uppercase tracking-[0.14em] text-white/85 hover:text-[#e5b96b] transition-colors whitespace-nowrap"
            >
              All Trips
            </Link>
            <Link
              href="/treks"
              onMouseEnter={scheduleCloseMega}
              className="text-xs font-medium uppercase tracking-[0.14em] text-white/85 hover:text-[#e5b96b] transition-colors whitespace-nowrap"
            >
              Treks
            </Link>
            <Link
              href="/expeditions"
              onMouseEnter={scheduleCloseMega}
              className="text-xs font-medium uppercase tracking-[0.14em] text-white/85 hover:text-[#e5b96b] transition-colors whitespace-nowrap"
            >
              Expeditions
            </Link>
            <Link
              href="/journal"
              onMouseEnter={scheduleCloseMega}
              className="text-xs font-medium uppercase tracking-[0.14em] text-white/85 hover:text-[#e5b96b] transition-colors whitespace-nowrap"
            >
              Journal
            </Link>
            <Link
              href="/#who-we-are"
              onMouseEnter={scheduleCloseMega}
              className="text-xs font-medium uppercase tracking-[0.14em] text-white/85 hover:text-[#e5b96b] transition-colors whitespace-nowrap"
            >
              About
            </Link>
          </div>

          {/* Right Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/#enquiry"
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#c89b4b]/60 hover:border-[#e5b96b] bg-[#c89b4b]/10 hover:bg-[#c89b4b] text-[#e5b96b] hover:text-[#081318] text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
            >
              <Send className="w-3 h-3" />
              <span>Enquire</span>
            </Link>

            <Link
              href={customerName ? "/account" : "/login"}
              onMouseEnter={scheduleCloseMega}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#e5b96b]/60 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 hover:text-[#e5b96b] text-xs font-medium tracking-wide transition-colors whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-[#e5b96b] shrink-0" />
              <span>{customerName ?? "Sign In"}</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2.5">
            <Link
              href="/#enquiry"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#c89b4b]/70 bg-[#c89b4b]/10 text-[#e5b96b] text-[11px] font-semibold uppercase tracking-wider"
            >
              <span>Enquire</span>
            </Link>

            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 text-white flex items-center justify-center cursor-pointer hover:border-[#e5b96b]/50 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            >
              {open ? <X className="h-4 w-4 text-[#e5b96b]" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Desktop Destinations Mega Menu */}
        {megaOpen && (
          <div
            onMouseEnter={openMega}
            className="hidden lg:block mt-2 rounded-2xl border border-white/15 bg-[#081318]/98 shadow-2xl backdrop-blur-md overflow-hidden"
          >
            <div className="grid grid-cols-[220px_1fr_240px] gap-8 p-7">
              <div className="border-r border-white/10 pr-6 space-y-4">
                {(["Nepal", "Beyond"] as const).map((group) => (
                  <div key={group} className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] px-3 text-[#e5b96b]/85 mb-1">
                      {group}
                    </p>
                    {MENU.filter((m) => m.group === group).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onMouseEnter={() => setActive(m.key)}
                        onFocus={() => setActive(m.key)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                          active === m.key
                            ? "bg-[#0f4c54] text-white font-semibold border border-white/15"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div className="min-h-[260px]">
                <MegaPanel
                  active={active}
                  tripsSource={tripsSource}
                  onHoverTrip={setHoverImg}
                  onClose={() => setMegaOpen(false)}
                />
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#060f13]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featureImg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060f13] via-[#060f13]/35 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#e5b96b] font-semibold">
                    Kathmandu Based
                  </p>
                  <p className="mt-1 font-serif text-base leading-snug text-white">
                    Small groups, certified Sherpa guides, transparent tariffs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer */}
        {open && (
          <div className="mt-2 rounded-2xl border border-white/15 bg-[#081318]/98 px-5 py-6 backdrop-blur-md lg:hidden shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#e5b96b] mb-2 font-semibold">
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
                      mobileExpanded === m.key ? "rotate-180 text-[#e5b96b]" : ""
                    }`}
                  />
                </button>
                {mobileExpanded === m.key && (
                  <ul className="space-y-1.5 pb-2.5 pl-3">
                    {filterMenuTrips(tripsSource, m.key).map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/destinations/${t.slug}`}
                          onClick={() => setOpen(false)}
                          className="block text-[11px] text-white/70 hover:text-[#e5b96b]"
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="mt-4 pt-2 space-y-1.5">
              <Link
                href="/destinations"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-white font-medium hover:text-[#e5b96b]"
              >
                All Trips
              </Link>
              <Link
                href="/treks"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-white font-medium hover:text-[#e5b96b]"
              >
                Treks
              </Link>
              <Link
                href="/expeditions"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-white font-medium hover:text-[#e5b96b]"
              >
                Expeditions
              </Link>
              <Link
                href="/journal"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-white font-medium hover:text-[#e5b96b]"
              >
                Journal
              </Link>
              <Link
                href="/#who-we-are"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-white font-medium hover:text-[#e5b96b]"
              >
                About
              </Link>
              <div className="pt-2 space-y-2.5">
                <Link
                  href="/#enquiry"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full border border-[#c89b4b] bg-[#c89b4b] text-[#081318] py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire Now</span>
                </Link>
                <Link
                  href={customerName ? "/account" : "/login"}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full border border-white/15 bg-white/[0.04] text-white/90 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:border-[#e5b96b]/50 hover:text-[#e5b96b]"
                >
                  <User className="w-3.5 h-3.5 text-[#e5b96b]" />
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
