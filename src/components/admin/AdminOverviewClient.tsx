"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Globe2,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Mountain,
  ShieldCheck,
} from "lucide-react";
import AdminShell, { type AdminIdentityDTO } from "./AdminShell";

export interface AdminOverviewStatsDTO {
  countriesActive: number;
  countriesTotal: number;
  categoriesActive: number;
  categoriesTotal: number;
  regionsActive: number;
  regionsTotal: number;
  tripsPublished: number;
  tripsTotal: number;
  bookingsPending: number;
  bookingsTotal: number;
  inquiriesNew: number;
  inquiriesTotal: number;
  subscribersActive: number;
}

export interface RecentBookingDTO {
  id: string;
  reference: string;
  tripName: string;
  customerName: string;
  travellers: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface RecentInquiryDTO {
  id: string;
  reference: string;
  fullName: string;
  interest: string | null;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function AdminOverviewClient({
  admin,
  permissions,
  stats,
  recentBookings,
  recentInquiries,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  stats: AdminOverviewStatsDTO;
  recentBookings: RecentBookingDTO[];
  recentInquiries: RecentInquiryDTO[];
}) {
  const canReadTrips = permissions.includes("trips:read");
  const canReadBookings = permissions.includes("bookings:read");
  const canReadCrm = permissions.includes("crm:read");

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Operations Overview"
      subtitle="Manage countries, categories, regions, expedition packages, and live guest bookings."
      actions={
        <>
          {canReadTrips && (
            <Link
              href="/admin/taxonomy"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1c1917] hover:border-[#104b87] hover:text-[#104b87] transition-colors"
            >
              <Globe2 className="h-4 w-4 text-[#104b87]" />
              <span>Countries &amp; Regions</span>
            </Link>
          )}
          {canReadTrips && (
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1c1917] hover:border-[#104b87] hover:text-[#104b87] transition-colors"
            >
              <Layers className="h-4 w-4 text-[#104b87]" />
              <span>Categories</span>
            </Link>
          )}
          {canReadTrips && (
            <Link
              href="/admin/trips"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs"
            >
              <Mountain className="h-4 w-4" />
              <span>Manage Trips</span>
            </Link>
          )}
        </>
      }
    >
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#57534d]">
              Countries &amp; Regions
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#104b87]/10 text-[#104b87]">
              <Globe2 className="h-4 w-4" />
            </span>
          </div>
          <p className="font-heading font-bold text-3xl sm:text-4xl text-[#1c1917] tabular-nums">
            {stats.countriesActive}{" "}
            <span className="font-sans text-base font-normal text-[#57534d]">
              / {stats.regionsActive} regions
            </span>
          </p>
          <p className="text-sm text-[#57534d] tabular-nums">
            {stats.countriesTotal} total countries · {stats.regionsTotal} total regions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#57534d]">
              Published Trips
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#f05e25]">
              <Mountain className="h-4 w-4" />
            </span>
          </div>
          <p className="font-heading font-bold text-3xl sm:text-4xl text-[#1c1917] tabular-nums">
            {stats.tripsPublished}{" "}
            <span className="font-sans text-base font-normal text-[#57534d]">
              / {stats.tripsTotal} total
            </span>
          </p>
          <p className="text-sm text-[#57534d] tabular-nums">
            {stats.categoriesActive} active trip categories
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#57534d]">
              Booking Pipeline
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarClock className="h-4 w-4" />
            </span>
          </div>
          <p className="font-heading font-bold text-3xl sm:text-4xl text-[#1c1917] tabular-nums">
            {stats.bookingsPending}{" "}
            <span className="font-sans text-base font-normal text-[#57534d]">
              pending
            </span>
          </p>
          <p className="text-sm text-[#57534d] tabular-nums">
            {stats.bookingsTotal} total expedition bookings
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#57534d]">
              Leads &amp; Subscribers
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#104b87]">
              <MessageSquare className="h-4 w-4" />
            </span>
          </div>
          <p className="font-heading font-bold text-3xl sm:text-4xl text-[#1c1917] tabular-nums">
            {stats.inquiriesNew}{" "}
            <span className="font-sans text-base font-normal text-[#57534d]">
              new leads
            </span>
          </p>
          <p className="text-sm text-[#57534d] tabular-nums">
            {stats.inquiriesTotal} inquiries · {stats.subscribersActive} subscribers
          </p>
        </div>
      </div>

      {/* Quick Action Modules */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canReadTrips && (
          <Link
            href="/admin/taxonomy"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-[#104b87] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#104b87]/10 text-[#104b87]">
                <Globe2 className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#104b87]" />
            </div>
            <h2 className="mt-4 font-heading font-bold text-xl text-[#1c1917]">
              Countries &amp; Regions
            </h2>
            <p className="mt-1.5 text-sm text-[#57534d] leading-relaxed">
              Add destination countries and organize regional sub-groups displayed in the live navbar mega-menu.
            </p>
          </Link>
        )}

        {canReadTrips && (
          <Link
            href="/admin/categories"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-[#104b87] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#f05e25]">
                <Layers className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#f05e25]" />
            </div>
            <h2 className="mt-4 font-heading font-bold text-xl text-[#1c1917]">
              Trip Categories
            </h2>
            <p className="mt-1.5 text-sm text-[#57534d] leading-relaxed">
              Manage mega-menu categories like Trekking Routes, Tours, Peak Climbing, and Short Treks.
            </p>
          </Link>
        )}

        {canReadTrips && (
          <Link
            href="/admin/trips"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-[#104b87] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#104b87]/10 text-[#104b87]">
                <MapPin className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#104b87]" />
            </div>
            <h2 className="mt-4 font-heading font-bold text-xl text-[#1c1917]">
              Trips &amp; Itineraries
            </h2>
            <p className="mt-1.5 text-sm text-[#57534d] leading-relaxed">
              Publish trekking packages, upload photos &amp; route maps, update tariffs, FAQs, and itineraries.
            </p>
          </Link>
        )}

        <Link
          href="/admin/security"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-600 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </div>
          <h2 className="mt-4 font-heading font-bold text-xl text-[#1c1917]">
            Security &amp; Audit Trail
          </h2>
          <p className="mt-1.5 text-sm text-[#57534d] leading-relaxed">
            Inspect active administrator sessions, rotate your Argon2id passphrase, and review audit logs.
          </p>
        </Link>
      </div>

      {/* Live Pipeline Previews */}
      {(canReadBookings || canReadCrm) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {canReadBookings && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#104b87]">
                  <CalendarClock className="h-4 w-4 text-[#f05e25]" />
                  <h2 className="font-heading font-bold text-lg text-[#1c1917]">
                    Recent Bookings
                  </h2>
                </div>
                <span className="text-xs font-medium text-[#57534d]">
                  Latest {recentBookings.length}
                </span>
              </div>

              {recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="pb-2.5 pr-3">Ref</th>
                        <th className="pb-2.5 pr-3">Trip</th>
                        <th className="pb-2.5 pr-3">Guest</th>
                        <th className="pb-2.5 pr-3">Tariff</th>
                        <th className="pb-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80">
                          <td className="py-3 pr-3 font-mono text-xs font-medium text-[#104b87] whitespace-nowrap">
                            {b.reference}
                          </td>
                          <td className="py-3 pr-3 font-medium text-[#1c1917] truncate max-w-[160px]">
                            {b.tripName}
                          </td>
                          <td className="py-3 pr-3 text-[#57534d] truncate max-w-[120px]">
                            {b.customerName}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-[#104b87] tabular-nums whitespace-nowrap">
                            Rs. {b.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3">
                            <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#1c1917]">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[#57534d]">
                  No booking requests recorded yet.
                </p>
              )}
            </section>
          )}

          {canReadCrm && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#104b87]">
                  <Mail className="h-4 w-4 text-[#104b87]" />
                  <h2 className="font-heading font-bold text-lg text-[#1c1917]">
                    Recent Inquiries
                  </h2>
                </div>
                <span className="text-xs font-medium text-[#57534d]">
                  Latest {recentInquiries.length}
                </span>
              </div>

              {recentInquiries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="pb-2.5 pr-3">Ref</th>
                        <th className="pb-2.5 pr-3">Guest</th>
                        <th className="pb-2.5 pr-3">Interest / Type</th>
                        <th className="pb-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50/80">
                          <td className="py-3 pr-3 font-mono text-xs font-medium text-[#104b87] whitespace-nowrap">
                            {inq.reference}
                          </td>
                          <td className="py-3 pr-3 font-medium text-[#1c1917] truncate max-w-[140px]">
                            {inq.fullName}
                          </td>
                          <td className="py-3 pr-3 text-[#57534d] truncate max-w-[160px]">
                            {inq.interest || inq.type}
                          </td>
                          <td className="py-3">
                            <span className="inline-block rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-[#104b87]">
                              {inq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[#57534d]">
                  No customer inquiries recorded yet.
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </AdminShell>
  );
}
