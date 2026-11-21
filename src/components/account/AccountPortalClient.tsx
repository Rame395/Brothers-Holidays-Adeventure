"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Check,
  Copy,
  Download,
  KeyRound,
  Laptop,
  LogOut,
  MessageSquare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";

export interface AccountCustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  nationality: string | null;
  mfaEnabled: boolean;
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AccountBookingDTO {
  id: string;
  reference: string;
  tripSlug: string;
  tripName: string;
  departureDate: string | null;
  isCustomDate: boolean;
  travellers: number;
  pricePerPerson: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  specialNotes: string | null;
  createdAt: string;
}

export interface AccountInquiryDTO {
  id: string;
  reference: string;
  type: string;
  status: string;
  interest: string | null;
  routeName: string | null;
  preferredDate: string | null;
  groupSize: number | null;
  budget: string | null;
  message: string | null;
  createdAt: string;
}

export interface AccountSessionDTO {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  mfaVerified: boolean;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

type TabId =
  | "bookings"
  | "inquiries"
  | "profile"
  | "security"
  | "sessions"
  | "privacy";

export default function AccountPortalClient({
  initialCustomer,
  initialBookings,
  initialInquiries,
  initialSessions,
}: {
  initialCustomer: AccountCustomerDTO;
  initialBookings: AccountBookingDTO[];
  initialInquiries: AccountInquiryDTO[];
  initialSessions: AccountSessionDTO[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("bookings");
  const [customer, setCustomer] = useState(initialCustomer);
  const [sessions, setSessions] = useState(initialSessions);

  // Profile state
  const [fullName, setFullName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone || "");
  const [whatsapp, setWhatsapp] = useState(customer.whatsapp || "");
  const [country, setCountry] = useState(customer.country || "");
  const [nationality, setNationality] = useState(customer.nationality || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const strength = evaluatePasswordStrength(newPassword);

  // MFA state
  const [mfaSetupQr, setMfaSetupQr] = useState("");
  const [mfaManualKey, setMfaManualKey] = useState("");
  const [mfaConfirmCode, setMfaConfirmCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [disableMfaPassword, setDisableMfaPassword] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // Privacy Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleLogout() {
    await authFetch("/api/auth/logout", { method: "POST" });
    window.dispatchEvent(new Event("bha-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  async function handleLogoutAll() {
    await authFetch("/api/auth/logout-all", { method: "POST" });
    window.dispatchEvent(new Event("bha-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await authFetch("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          phone: phone || null,
          whatsapp: whatsapp || null,
          country: country || null,
          nationality: nationality || null,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        customer?: AccountCustomerDTO;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.customer) {
        setProfileMsg({
          type: "err",
          text: json.error || "Unable to update profile.",
        });
        return;
      }
      setCustomer(json.customer);
      window.dispatchEvent(new Event("bha-auth-changed"));
      setProfileMsg({ type: "ok", text: "Profile details updated." });
    } catch {
      setProfileMsg({ type: "err", text: "Network error updating profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "err", text: "Passphrases do not match." });
      return;
    }
    setPwdSaving(true);
    try {
      const res = await authFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          ...(customer.hasPassword ? { currentPassword } : {}),
          newPassword,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setPwdMsg({
          type: "err",
          text: json.error || "Unable to update passphrase.",
        });
        return;
      }
      setCustomer((prev) => ({ ...prev, hasPassword: true }));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdMsg({
        type: "ok",
        text: json.message || "Passphrase updated cleanly.",
      });
      router.refresh();
    } catch {
      setPwdMsg({ type: "err", text: "Network error updating passphrase." });
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleStartMfaSetup() {
    setMfaMsg(null);
    setMfaBusy(true);
    try {
      const res = await authFetch("/api/auth/mfa/setup", { method: "POST" });
      const json = (await res.json()) as {
        ok: boolean;
        qrDataUrl?: string;
        manualKey?: string;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.qrDataUrl) {
        setMfaMsg({
          type: "err",
          text: json.error || "Unable to initialize MFA setup.",
        });
        return;
      }
      setMfaSetupQr(json.qrDataUrl);
      setMfaManualKey(json.manualKey || "");
      setBackupCodes(null);
    } catch {
      setMfaMsg({ type: "err", text: "Network error initializing MFA." });
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleConfirmMfa(e: React.FormEvent) {
    e.preventDefault();
    setMfaMsg(null);
    setMfaBusy(true);
    try {
      const res = await authFetch("/api/auth/mfa/confirm", {
        method: "POST",
        body: JSON.stringify({ code: mfaConfirmCode.replace(/\s+/g, "") }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        backupCodes?: string[];
        error?: string;
      };
      if (!res.ok || !json.ok || !json.backupCodes) {
        setMfaMsg({
          type: "err",
          text: json.error || "Invalid 6-digit code.",
        });
        return;
      }
      setCustomer((prev) => ({ ...prev, mfaEnabled: true }));
      setMfaSetupQr("");
      setMfaManualKey("");
      setMfaConfirmCode("");
      setBackupCodes(json.backupCodes);
      setMfaMsg({
        type: "ok",
        text: "Two-factor authentication is now enabled. Save your recovery codes below.",
      });
    } catch {
      setMfaMsg({ type: "err", text: "Network error confirming MFA." });
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleDisableMfa(e: React.FormEvent) {
    e.preventDefault();
    setMfaMsg(null);
    setMfaBusy(true);
    try {
      const res = await authFetch("/api/auth/mfa/disable", {
        method: "POST",
        body: JSON.stringify({
          ...(customer.hasPassword ? { password: disableMfaPassword } : {}),
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setMfaMsg({ type: "err", text: json.error || "Unable to disable MFA." });
        return;
      }
      setCustomer((prev) => ({ ...prev, mfaEnabled: false }));
      setDisableMfaPassword("");
      setBackupCodes(null);
      setMfaMsg({
        type: "ok",
        text: json.message || "Two-factor authentication disabled.",
      });
    } catch {
      setMfaMsg({ type: "err", text: "Network error disabling MFA." });
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleRevokeSession(id: string) {
    const res = await authFetch(`/api/auth/sessions/${id}`, {
      method: "DELETE",
    });
    const json = (await res.json()) as {
      ok: boolean;
      revokedCurrent?: boolean;
    };
    if (res.ok && json.ok) {
      if (json.revokedCurrent) {
        window.dispatchEvent(new Event("bha-auth-changed"));
        router.push("/login");
        router.refresh();
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await authFetch("/api/account/delete", {
        method: "POST",
        body: JSON.stringify({
          ...(customer.hasPassword ? { password: deletePassword } : {}),
          confirmationText: deleteConfirmText,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setDeleteError(json.error || "Unable to delete account.");
        return;
      }
      window.dispatchEvent(new Event("bha-auth-changed"));
      router.push("/");
      router.refresh();
    } catch {
      setDeleteError("Network error deleting account.");
    } finally {
      setDeleting(false);
    }
  }

  const tabs: { id: TabId; label: string; icon: typeof User; count?: number }[] = [
    {
      id: "bookings",
      label: "My Bookings",
      icon: CalendarCheck,
      count: initialBookings.length,
    },
    {
      id: "inquiries",
      label: "My Inquiries",
      icon: MessageSquare,
      count: initialInquiries.length,
    },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security & MFA", icon: ShieldCheck },
    {
      id: "sessions",
      label: "Sessions",
      icon: Laptop,
      count: sessions.length,
    },
    { id: "privacy", label: "Privacy & Data", icon: ShieldAlert },
  ];

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#061116] text-white py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Traveler Banner */}
        <div className="rounded-2xl border border-[#c59a4a]/35 bg-gradient-to-br from-[#0b1c24] to-[#081319] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#89d6e2]">
              Traveler Command Portal
            </p>
            <h1 className="font-serif text-3xl text-white">
              Namaste, {customer.fullName}
            </h1>
            <p className="text-xs text-white/65">
              {customer.email} ·{" "}
              {customer.mfaEnabled ? (
                <span className="text-emerald-300 font-medium">MFA Active</span>
              ) : (
                <span className="text-amber-300">MFA Optional</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/destinations"
              className="rounded-lg border border-[#d99f38]/50 bg-[#d99f38]/10 px-4 py-2 text-xs font-semibold text-[#e8b765] hover:bg-[#d99f38]/20"
            >
              Explore Trips
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/90 hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#d99f38] text-[#061015] font-bold"
                    : "border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      active ? "bg-[#061015]/15 text-[#061015]" : "bg-white/10 text-white/75"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {tab === "bookings" && (
          <div className="space-y-4">
            {initialBookings.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#09171e] p-10 text-center space-y-3">
                <p className="font-serif text-xl text-white">No bookings yet</p>
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  When you reserve a fixed departure or private expedition using{" "}
                  <strong className="text-white">{customer.email}</strong>, it appears here automatically.
                </p>
                <Link
                  href="/destinations"
                  className="inline-block rounded-lg bg-[#d99f38] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765]"
                >
                  Browse Expeditions
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {initialBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-white/10 bg-[#09171e] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#e8b765]">
                          {b.reference}
                        </span>
                        <span className="rounded-full bg-[#00515b] px-2.5 py-0.5 font-mono text-[10px] text-[#89d6e2]">
                          {b.status}
                        </span>
                        <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-white/75">
                          Payment: {b.paymentStatus}
                        </span>
                      </div>
                      <Link
                        href={`/destinations/${b.tripSlug}`}
                        className="block font-serif text-xl text-white hover:text-[#e8b765]"
                      >
                        {b.tripName}
                      </Link>
                      <p className="text-xs text-white/65">
                        {b.departureDate
                          ? `Departure: ${new Date(
                              b.departureDate
                            ).toLocaleDateString()}`
                          : "Flexible / Custom Date"}{" "}
                        · {b.travellers}{" "}
                        {b.travellers === 1 ? "traveller" : "travellers"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-mono text-lg font-semibold text-white">
                        {b.currency} {b.totalAmount.toLocaleString("en-US")}
                      </p>
                      <p className="text-[11px] text-white/50">
                        Requested {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "inquiries" && (
          <div className="space-y-4">
            {initialInquiries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#09171e] p-10 text-center space-y-3">
                <p className="font-serif text-xl text-white">No inquiries logged</p>
                <p className="text-xs text-white/60">
                  Custom route quotes and callbacks linked to your email appear here.
                </p>
                <Link
                  href="/contact"
                  className="inline-block rounded-lg bg-[#d99f38] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015]"
                >
                  Request Custom Quote
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {initialInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-white/10 bg-[#09171e] p-6 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#e8b765]">
                          {inq.reference}
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-[#89d6e2]">
                          {inq.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/50">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-white">
                      {inq.routeName || inq.interest || inq.type}
                    </h3>
                    {inq.message && (
                      <p className="text-xs text-white/70 leading-relaxed">
                        {inq.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="max-w-xl rounded-2xl border border-white/10 bg-[#09171e] p-6 sm:p-8 space-y-4"
          >
            <h2 className="font-serif text-2xl text-white">Traveler Profile</h2>
            {profileMsg && (
              <div
                className={`rounded-lg border px-4 py-2.5 text-xs ${
                  profileMsg.type === "ok"
                    ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                    : "border-rose-500/40 bg-rose-950/40 text-rose-200"
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-white/55">
                Email (Verified)
              </label>
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full rounded-lg border border-white/10 bg-[#050c10] px-4 py-2.5 text-sm text-white/50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="prof-name"
                className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]"
              >
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-phone"
                  className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]"
                >
                  Phone
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-whatsapp"
                  className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]"
                >
                  WhatsApp
                </label>
                <input
                  id="prof-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-country"
                  className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]"
                >
                  Country
                </label>
                <input
                  id="prof-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-nationality"
                  className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]"
                >
                  Nationality (For Permits)
                </label>
                <input
                  id="prof-nationality"
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-[#d99f38] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}

        {tab === "security" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Passphrase card */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-white/10 bg-[#09171e] p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#e8b765]">
                <KeyRound className="h-4 w-4" />
                <h2 className="font-serif text-xl text-white">
                  {customer.hasPassword ? "Change Passphrase" : "Set a Passphrase"}
                </h2>
              </div>
              {pwdMsg && (
                <div
                  className={`rounded-lg border px-4 py-2.5 text-xs ${
                    pwdMsg.type === "ok"
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                      : "border-rose-500/40 bg-rose-950/40 text-rose-200"
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              {customer.hasPassword && (
                <input
                  type="password"
                  required
                  placeholder="Current passphrase"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
                />
              )}
              <input
                type="password"
                required
                minLength={12}
                placeholder="New passphrase (12+ characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
              />
              {newPassword && (
                <p className="text-[11px] text-white/55">{strength.label}</p>
              )}
              <input
                type="password"
                required
                minLength={12}
                placeholder="Confirm new passphrase"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
              />
              <button
                type="submit"
                disabled={pwdSaving || !strength.meetsMinLength}
                className="rounded-lg bg-[#d99f38] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
              >
                {pwdSaving ? "Updating..." : "Update Passphrase"}
              </button>
            </form>

            {/* TOTP MFA card */}
            <div className="rounded-2xl border border-white/10 bg-[#09171e] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#e8b765]">
                  <Shield className="h-4 w-4" />
                  <h2 className="font-serif text-xl text-white">
                    Two-Factor Authentication (TOTP)
                  </h2>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
                    customer.mfaEnabled
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {customer.mfaEnabled ? "ENABLED" : "OFF"}
                </span>
              </div>

              {mfaMsg && (
                <div
                  className={`rounded-lg border px-4 py-2.5 text-xs ${
                    mfaMsg.type === "ok"
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                      : "border-rose-500/40 bg-rose-950/40 text-rose-200"
                  }`}
                >
                  {mfaMsg.text}
                </div>
              )}

              {backupCodes && (
                <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-100">
                      One-Time Recovery Codes
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(backupCodes.join("\n"));
                        setCopiedBackup(true);
                        setTimeout(() => setCopiedBackup(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#e8b765] hover:underline cursor-pointer"
                    >
                      {copiedBackup ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy All
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((c) => (
                      <code
                        key={c}
                        className="rounded bg-[#061015] px-2 py-1 text-center font-mono text-[11px] text-[#e8b765]"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {customer.mfaEnabled ? (
                <form onSubmit={handleDisableMfa} className="space-y-3 pt-2">
                  <p className="text-xs text-white/70">
                    Your account is protected with an authenticator app and one-time backup codes.
                  </p>
                  {customer.hasPassword && (
                    <input
                      type="password"
                      required
                      placeholder="Confirm passphrase to disable MFA"
                      value={disableMfaPassword}
                      onChange={(e) => setDisableMfaPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2 text-xs text-white focus:border-rose-400 focus:outline-none"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={mfaBusy}
                    className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-950/70 disabled:opacity-60 cursor-pointer"
                  >
                    {mfaBusy ? "Disabling..." : "Disable Two-Factor Auth"}
                  </button>
                </form>
              ) : mfaSetupQr ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="rounded-lg bg-white p-2 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mfaSetupQr}
                        alt="Authenticator QR code"
                        className="h-36 w-36"
                      />
                    </div>
                    <div className="space-y-2 text-xs text-white/75">
                      <p>Scan with your authenticator app, or enter this key:</p>
                      <code className="block break-all rounded bg-[#061015] px-2 py-1.5 font-mono text-[11px] text-[#89d6e2]">
                        {mfaManualKey}
                      </code>
                    </div>
                  </div>
                  <form onSubmit={handleConfirmMfa} className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={8}
                      placeholder="6-digit code"
                      value={mfaConfirmCode}
                      onChange={(e) => setMfaConfirmCode(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-[#061015] px-4 py-2 font-mono text-sm text-white focus:border-[#d99f38] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={mfaBusy}
                      className="rounded-lg bg-[#d99f38] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#061015] cursor-pointer"
                    >
                      Verify
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-white/70">
                    Protect your booking records and profile with an authenticator app (Google Authenticator, Authy, 1Password).
                  </p>
                  <button
                    type="button"
                    onClick={handleStartMfaSetup}
                    disabled={mfaBusy}
                    className="rounded-lg bg-[#d99f38] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
                  >
                    {mfaBusy ? "Preparing..." : "Enable Authenticator App"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "sessions" && (
          <div className="rounded-2xl border border-white/10 bg-[#09171e] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-white">Active Devices</h2>
                <p className="text-xs text-white/60">
                  Revoke unrecognized browsers or sign out across all devices at once.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogoutAll}
                className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-950/70 cursor-pointer"
              >
                Log Out of All Devices
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="text-white font-medium">
                      {s.deviceLabel || "Browser Session"}{" "}
                      {s.isCurrent && (
                        <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-white/55 font-mono text-[11px]">
                      IP {s.ipAddress || "—"} · Last active{" "}
                      {new Date(s.lastActivityAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSession(s.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-1.5 text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "privacy" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#09171e] p-6 space-y-4">
              <h2 className="font-serif text-xl text-white">
                Export Personal Data
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                Download a complete JSON copy of your traveler profile, bookings, inquiries, and login activity (compliant with Nepal&apos;s Privacy Act 2018 & GDPR data portability).
              </p>
              <a
                href="/api/account/export"
                className="inline-flex items-center gap-2 rounded-lg border border-[#d99f38]/50 bg-[#d99f38]/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#e8b765] hover:bg-[#d99f38]/25"
              >
                <Download className="h-3.5 w-3.5" />
                Download My Data (.json)
              </a>
            </div>

            <form
              onSubmit={handleDeleteAccount}
              className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-6 space-y-4"
            >
              <h2 className="font-serif text-xl text-rose-200">
                Delete & Anonymize Account
              </h2>
              <p className="text-xs text-rose-100/75 leading-relaxed">
                This permanently removes your login credentials, revokes all sessions, and anonymizes your personal profile. Financial booking references are retained for statutory compliance without your login access.
              </p>

              {deleteError && (
                <div className="rounded-lg border border-rose-500/50 bg-rose-950/60 px-3 py-2 text-xs text-rose-200">
                  {deleteError}
                </div>
              )}

              {customer.hasPassword && (
                <input
                  type="password"
                  required
                  placeholder="Enter your passphrase"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2 text-xs text-white focus:border-rose-400 focus:outline-none"
                />
              )}

              <input
                type="text"
                required
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2 text-xs text-white focus:border-rose-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={deleting || deleteConfirmText !== "DELETE"}
                className="rounded-lg bg-rose-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting Account..." : "Permanently Delete Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
