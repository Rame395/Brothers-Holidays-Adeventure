"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminRole } from "@prisma/client";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Save,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { authFetch } from "@/lib/auth/client";
import type { AdminPermission } from "@/lib/auth/guards";
import type { SiteSettingDTO } from "@/lib/types";

function formatWhatsappHref(num?: string | null): string {
  const digits = (num ?? "").replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export default function AdminCompanyClient({
  admin,
  permissions,
  initialSettings,
}: {
  admin: { id: string; email: string; name: string; role: AdminRole };
  permissions: readonly AdminPermission[];
  initialSettings: SiteSettingDTO;
}) {
  const canWrite = permissions.includes("seo:write");

  const [form, setForm] = useState({
    siteName: initialSettings.siteName ?? "",
    tagline: initialSettings.tagline ?? "",
    footerDescription:
      initialSettings.footerDescription ??
      "Kathmandu-based trekking and mountaineering outfitter leading small groups across Nepal, Tibet, and Bhutan with local Sherpa leadership.",
    registrationNo: initialSettings.registrationNo ?? "",
    officeAddress: initialSettings.officeAddress ?? "",
    officeHours: initialSettings.officeHours ?? "Sun–Fri · 9 AM – 6 PM NPT",
    contactPhone: initialSettings.contactPhone ?? "",
    contactEmail: initialSettings.contactEmail ?? "",
    whatsappNumber: initialSettings.whatsappNumber ?? "",
    australiaWhatsapp: initialSettings.australiaWhatsapp ?? "",
    japanWhatsapp: initialSettings.japanWhatsapp ?? "",
    facebookUrl: initialSettings.facebookUrl ?? "",
    instagramUrl: initialSettings.instagramUrl ?? "",
    tiktokUrl: initialSettings.tiktokUrl ?? "",
    youtubeUrl: initialSettings.youtubeUrl ?? "",
    tripadvisorUrl: initialSettings.tripadvisorUrl ?? "",
    announcementActive: Boolean(initialSettings.announcementActive),
    announcementBanner: initialSettings.announcementBanner ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const primaryWaHref = formatWhatsappHref(form.whatsappNumber);

  const seoReadiness = useMemo(() => {
    const hasIdentity =
      (form.siteName ?? "").trim().length >= 2 &&
      (form.tagline ?? "").trim().length >= 8;
    const hasNap =
      (form.officeAddress ?? "").trim().length >= 5 &&
      (form.contactPhone ?? "").trim().length >= 6 &&
      (form.contactEmail ?? "").includes("@") &&
      (form.officeHours ?? "").trim().length >= 4;
    const hasTrustBio =
      (form.registrationNo ?? "").trim().length >= 6 &&
      (form.footerDescription ?? "").trim().length >= 80;
    const hasWhatsapp =
      (form.whatsappNumber ?? "").replace(/[^\d]/g, "").length >= 7 &&
      (Boolean((form.australiaWhatsapp ?? "").trim()) ||
        Boolean((form.japanWhatsapp ?? "").trim()));

    const coreSocials = [
      (form.facebookUrl ?? "").trim(),
      (form.instagramUrl ?? "").trim(),
      (form.tiktokUrl ?? "").trim(),
    ].filter(Boolean).length;
    const hasExtendedSocial =
      Boolean((form.youtubeUrl ?? "").trim()) ||
      Boolean((form.tripadvisorUrl ?? "").trim());

    const score =
      (hasIdentity ? 15 : 0) +
      (hasNap ? 20 : 0) +
      (hasTrustBio ? 15 : 0) +
      (hasWhatsapp ? 15 : 0) +
      Math.round((coreSocials / 3) * 25) +
      (hasExtendedSocial ? 10 : 0);

    const checks = [
      {
        label: "Brand Name & Tagline (Organization Schema)",
        ok: hasIdentity,
      },
      {
        label: "Complete LocalBusiness NAP (Address, Phone, Email & Hours)",
        ok: hasNap,
      },
      {
        label: "Licensing Credentials & Rich Footer Bio (≥80 chars)",
        ok: hasTrustBio,
      },
      {
        label: "Primary & Regional WhatsApp Desks Configured",
        ok: hasWhatsapp,
      },
      {
        label: `Core Social sameAs Links (${coreSocials}/3: Facebook, Instagram, TikTok)`,
        ok: coreSocials === 3,
      },
      {
        label: "Authority Signal (YouTube or TripAdvisor connected)",
        ok: hasExtendedSocial,
      },
    ];

    return { score, checks };
  }, [form]);

  const seoTone =
    seoReadiness.score >= 80
      ? {
          badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
          bar: "bg-emerald-500",
          label: "Strong Knowledge Panel SEO",
        }
      : seoReadiness.score >= 55
      ? {
          badge: "border-amber-200 bg-amber-50 text-amber-800",
          bar: "bg-amber-500",
          label: "Needs More Social Signals",
        }
      : {
          badge: "border-orange-200 bg-orange-50 text-[#d94e18]",
          bar: "bg-[#f05e25]",
          label: "Incomplete Local SEO Profile",
        };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await authFetch("/api/admin/company", {
        method: "PATCH",
        body: JSON.stringify({
          siteName: form.siteName,
          tagline: form.tagline,
          footerDescription: form.footerDescription,
          registrationNo: form.registrationNo,
          officeAddress: form.officeAddress,
          officeHours: form.officeHours,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          whatsappNumber: form.whatsappNumber,
          australiaWhatsapp: form.australiaWhatsapp,
          japanWhatsapp: form.japanWhatsapp,
          facebookUrl: form.facebookUrl,
          instagramUrl: form.instagramUrl,
          tiktokUrl: form.tiktokUrl,
          youtubeUrl: form.youtubeUrl,
          tripadvisorUrl: form.tripadvisorUrl,
          announcementBanner: form.announcementBanner,
          announcementActive: form.announcementActive,
        }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not save company & social settings.",
        });
        return;
      }

      setStatusMsg({
        type: "ok",
        text: "Company profile, office details, WhatsApp numbers, and social channels updated across the site.",
      });
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while saving company & social settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Company Details & Social Media"
      subtitle="Manage your Kathmandu office contact info, WhatsApp numbers, government registrations, and social channels displayed across the website."
    >
      <form onSubmit={handleSave} className="space-y-6">
        {statusMsg && (
          <div
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              statusMsg.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="rounded-lg p-1 hover:bg-black/5 cursor-pointer"
              aria-label="Dismiss status message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Organization & LocalBusiness SEO Readiness Score */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1c1917]">
                    Organization &amp; LocalBusiness SEO Readiness
                  </h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${seoTone.badge}`}
                  >
                    {seoReadiness.score}/100 · {seoTone.label}
                  </span>
                </div>
                <p className="text-xs text-[#57534d]">
                  Feeds Google&apos;s TravelAgency JSON-LD, local NAP signals, and
                  Knowledge Panel social sameAs links across the site.
                </p>
              </div>
            </div>

            <Link
              href="/admin/seo"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-[#f8fafc] hover:border-[#3f6e15] hover:text-[#3f6e15] px-3.5 py-1.5 text-xs font-semibold text-[#1c1917] transition-colors"
            >
              <span>Meta Titles &amp; Analytics</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${seoTone.bar}`}
              style={{ width: `${seoReadiness.score}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {seoReadiness.checks.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                  item.ok
                    ? "border-emerald-200/80 bg-emerald-50/50 text-emerald-900"
                    : "border-amber-200/80 bg-amber-50/50 text-amber-900"
                }`}
              >
                {item.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                )}
                <span className="leading-snug">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Company Identity & Licensing */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
                <Building2 className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                  Company Identity &amp; Licensing
                </h2>
                <p className="text-xs text-[#57534d]">
                  Brand name, tagline, footer bio, and official registration
                  credentials.
                </p>
              </div>
            </div>

            {canWrite && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] disabled:opacity-60 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? "Saving..." : "Save All Changes"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Company / Brand Name *
              </label>
              <input
                type="text"
                required
                disabled={!canWrite}
                value={form.siteName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, siteName: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Government Registration &amp; Memberships *
              </label>
              <input
                type="text"
                required
                disabled={!canWrite}
                value={form.registrationNo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    registrationNo: e.target.value,
                  }))
                }
                placeholder="Govt. Regd. 58177/068/069 · TAAN · NMA · NTB"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Official Tagline *
              </label>
              <input
                type="text"
                required
                disabled={!canWrite}
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tagline: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Footer Company Summary *
              </label>
              <textarea
                rows={2}
                required
                disabled={!canWrite}
                value={form.footerDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    footerDescription: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Head Office & Direct Contact */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f05e25]/10 text-[#f05e25]">
              <MapPin className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                Kathmandu Head Office &amp; Contact Details
              </h2>
              <p className="text-xs text-[#57534d]">
                Synced across your Navbar, Contact Page, Trip Booking Panel, and
                Footer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Office Street Address *
              </label>
              <input
                type="text"
                required
                disabled={!canWrite}
                value={form.officeAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    officeAddress: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Office Hours *
              </label>
              <input
                type="text"
                required
                disabled={!canWrite}
                value={form.officeHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, officeHours: e.target.value }))
                }
                placeholder="Sun–Fri · 9 AM – 6 PM NPT"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Official Contact Email *
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={!canWrite}
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Hotline / Office Phone *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={!canWrite}
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Primary Nepal WhatsApp Number (with Country Code) *
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <MessageCircle className="h-4 w-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={!canWrite}
                    value={form.whatsappNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        whatsappNumber: e.target.value,
                      }))
                    }
                    placeholder="+9779800000000"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
                {primaryWaHref && (
                  <a
                    href={primaryWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 transition-colors"
                  >
                    <span>Test {primaryWaHref}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: All Social Media Channels */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
              <Share2 className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                Social Media Links
              </h2>
              <p className="text-xs text-[#57534d]">
                Facebook, Instagram, TikTok, WhatsApp, YouTube, and TripAdvisor
                profiles linked in your Footer and Schema.org metadata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "facebookUrl" as const,
                label: "Facebook Page URL",
                placeholder: "https://facebook.com/brothersholidaysadventure",
              },
              {
                key: "instagramUrl" as const,
                label: "Instagram Profile URL",
                placeholder: "https://instagram.com/brothersholidaysadventure",
              },
              {
                key: "tiktokUrl" as const,
                label: "TikTok Profile URL",
                placeholder: "https://www.tiktok.com/@brothersholidays",
              },
              {
                key: "youtubeUrl" as const,
                label: "YouTube Channel URL",
                placeholder: "https://youtube.com/@brothersholidays",
              },
              {
                key: "tripadvisorUrl" as const,
                label: "TripAdvisor URL (Optional)",
                placeholder: "https://www.tripadvisor.com/Attraction_Review-...",
              },
            ].map((field) => {
              const val = form[field.key];
              return (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534d]">
                      {field.label}
                    </label>
                    {val.trim() && (
                      <a
                        href={val.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#3f6e15] hover:underline"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    disabled={!canWrite}
                    value={val}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
              );
            })}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                WhatsApp Chat Link (Auto-generated from Primary Number)
              </label>
              <input
                type="text"
                readOnly
                value={primaryWaHref || "Enter Primary WhatsApp Number above"}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm font-mono text-[#57534d]"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Global Representative Desks & Announcement */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-[#1c1917]">
              <Globe className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                Global WhatsApp Desks &amp; Seasonal Banner
              </h2>
              <p className="text-xs text-[#57534d]">
                International WhatsApp representatives displayed in the footer
                Global Desk section (leave blank to hide a desk).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Australia WhatsApp Desk
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={form.australiaWhatsapp}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    australiaWhatsapp: e.target.value,
                  }))
                }
                placeholder="+61 426 378 149"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                Japan WhatsApp Desk
              </label>
              <input
                type="text"
                disabled={!canWrite}
                value={form.japanWhatsapp}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    japanWhatsapp: e.target.value,
                  }))
                }
                placeholder="+81 80 4107 0813"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[#f05e25]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                    Optional Site-wide Announcement Notice
                  </span>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c1917] cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={form.announcementActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        announcementActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#3f6e15] focus:ring-[#3f6e15]"
                  />
                  <span>Active</span>
                </label>
              </div>

              <input
                type="text"
                disabled={!canWrite}
                value={form.announcementBanner}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    announcementBanner: e.target.value,
                  }))
                }
                placeholder="e.g. Spring 2027 Everest & Manaslu Fixed Departures Now Open"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
              />
            </div>
          </div>

          {canWrite && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] disabled:opacity-60 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>
                  {saving ? "Saving..." : "Save Company & Social Details"}
                </span>
              </button>
            </div>
          )}
        </section>
      </form>
    </AdminShell>
  );
}
