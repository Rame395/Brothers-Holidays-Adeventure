"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, Suspense } from "react";

function NavigationLinks() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Treks", href: "/treks" },
    { label: "Expeditions", href: "/expeditions" },
    { label: "Archive", href: "/archive" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-4 sm:gap-6 md:gap-7 ml-2 sm:ml-4">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`transition-colors py-1 text-sm tracking-wide ${
              active
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary font-medium"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Treks", href: "/treks" },
    { label: "Expeditions", href: "/expeditions" },
    { label: "Archive", href: "/archive" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col space-y-2">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm tracking-wide transition-colors ${
              active
                ? "bg-primary-container text-on-primary font-medium"
                : "text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_2px_12px_rgba(0,81,91,0.06)] transition-all">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-margin flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Circular Logo Bezel */}
          <Link className="flex items-center gap-3 group shrink-0" href="/">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface shadow-sm flex items-center justify-center p-0.5 aspect-square shrink-0 transition-transform group-hover:scale-95 ring-1 ring-primary/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Kharka Himalayan Expeditions"
                className="w-full h-full object-cover object-center rounded-full"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-headline-sm text-base text-on-surface tracking-tight leading-none font-normal">
                Kharka
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-primary mt-1">
                Himalayan Field Journal
              </span>
            </div>
          </Link>

          {/* Page Names Displayed Directly on the Navigation Bar Itself */}
          <Suspense
            fallback={
              <nav className="flex items-center gap-4 ml-2">
                <span className="text-xs text-on-surface-variant">Loading...</span>
              </nav>
            }
          >
            <NavigationLinks />
          </Suspense>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary-container hover:bg-primary text-on-primary text-xs font-mono tracking-wider uppercase transition-colors shadow-sm"
            href="/route/khumbu-glacier-traverse"
          >
            Plan Route
          </Link>

          {/* Himalayan Rounded Image Avatar */}
          <div className="flex items-center pl-1 sm:border-l sm:border-outline-variant/40">
            <div className="relative group cursor-pointer" title="Himalayan Field Outpost Active">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Himalayan Outpost"
                className="w-8 h-8 rounded-full object-cover object-center ring-2 ring-primary/40 shadow-sm transition-transform group-hover:scale-105"
                src="/images/himalayan-sunrise-4096x2048.webp"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface"></span>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest/98 backdrop-blur-2xl border-b border-outline-variant/30 px-6 py-4 shadow-xl">
          <Suspense fallback={null}>
            <MobileNavLinks onClose={() => setMobileMenuOpen(false)} />
          </Suspense>
          <div className="pt-3 border-t border-outline-variant/20 mt-3">
            <Link
              href="/route/khumbu-glacier-traverse"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-mono uppercase tracking-wider shadow-sm"
            >
              Plan Route
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
