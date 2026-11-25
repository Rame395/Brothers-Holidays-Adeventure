"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Globe2,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Mountain,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";

export interface AdminIdentityDTO {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminShell({
  admin,
  permissions,
  title,
  subtitle,
  actions,
  children,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const canReadTrips = permissions.includes("trips:read");
  const canWriteSeo = permissions.includes("seo:write");

  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: LayoutDashboard,
      visible: true,
      exact: true,
    },
    {
      href: "/admin/taxonomy",
      label: "Countries & Regions",
      icon: Globe2,
      visible: canReadTrips,
      exact: false,
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Layers,
      visible: canReadTrips,
      exact: false,
    },
    {
      href: "/admin/trips",
      label: "Trips & Packages",
      icon: Mountain,
      visible: canReadTrips,
      exact: false,
    },
    {
      href: "/admin/guides",
      label: "Travel Guides",
      icon: BookOpen,
      visible: canReadTrips,
      exact: false,
    },
    {
      href: "/admin/seo",
      label: "SEO & Settings",
      icon: Search,
      visible: canWriteSeo,
      exact: false,
    },
    {
      href: "/admin/security",
      label: "Security & Audit",
      icon: ShieldCheck,
      visible: true,
      exact: false,
    },
  ].filter((item) => item.visible);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await authFetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        <Link
          href="/admin"
          onClick={() => setMobileNavOpen(false)}
          className="block rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 space-y-1.5 hover:border-white/20 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brothers_logo_navbar.png"
            alt="BROTHERS Holidays Adventure"
            className="h-8 w-auto max-w-[165px] object-contain"
          />
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7dd3fc]">
            Admin Command Portal
          </p>
        </Link>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#3f6e15] text-white font-semibold shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-[#ff8a50]" : "text-white/60"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate">
              {admin.name}
            </span>
            <span className="shrink-0 rounded-full border border-[#f05e25]/40 bg-[#f05e25]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ff8a50]">
              {admin.role}
            </span>
          </div>
          <p className="text-xs text-white/60 truncate">{admin.email}</p>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-between rounded-xl border border-white/15 px-3.5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>View Live Site</span>
          <ArrowUpRight className="h-4 w-4 text-[#7dd3fc]" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1c1917] flex flex-col lg:flex-row">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex lg:w-68 lg:shrink-0 lg:flex-col border-r border-white/10 bg-[#071526] p-4 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#071526] px-4 py-3 text-white lg:hidden sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brothers_logo_navbar.png"
            alt="BROTHERS Holidays Adventure"
            className="h-7 w-auto object-contain shrink-0"
          />
          <span className="font-heading font-bold text-base text-white truncate">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white cursor-pointer"
        >
          {mobileNavOpen ? (
            <X className="h-4 w-4 text-[#ff8a50]" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="border-b border-white/15 bg-[#071526] p-4 text-white lg:hidden">
          {sidebarContent}
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-slate-200 bg-white px-5 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f05e25]">
                Operations &amp; Catalog Control
              </p>
              <h1 className="mt-1 font-heading font-bold text-2xl sm:text-3xl text-[#1c1917] tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-[#57534d]">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
