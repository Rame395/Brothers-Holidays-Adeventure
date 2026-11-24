"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Download,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";

export default function AdminMfaSetupClient({
  adminEmail,
  adminName,
}: {
  adminEmail: string;
  adminName: string;
}) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  async function requestMfaSecret(): Promise<{
    ok: boolean;
    qrDataUrl?: string;
    manualKey?: string;
    error?: string;
  }> {
    const res = await authFetch("/api/admin/auth/mfa/setup", {
      method: "POST",
    });
    const json = (await res.json()) as {
      ok: boolean;
      qrDataUrl?: string;
      manualKey?: string;
      error?: string;
    };
    if (!res.ok || !json.ok || !json.qrDataUrl) {
      return {
        ok: false,
        error: json.error || "Unable to generate authenticator setup",
      };
    }
    return json;
  }

  async function handleRegenerate() {
    setError("");
    setLoadingSetup(true);
    try {
      const json = await requestMfaSecret();
      if (!json.ok || !json.qrDataUrl) {
        setError(json.error || "Unable to generate authenticator setup");
        return;
      }
      setQrDataUrl(json.qrDataUrl);
      setManualKey(json.manualKey || "");
    } catch {
      setError("Network error while initializing MFA setup.");
    } finally {
      setLoadingSetup(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const json = await requestMfaSecret();
        if (!active) return;
        if (!json.ok || !json.qrDataUrl) {
          setError(json.error || "Unable to generate authenticator setup");
          return;
        }
        setQrDataUrl(json.qrDataUrl);
        setManualKey(json.manualKey || "");
      } catch {
        if (!active) return;
        setError("Network error while initializing MFA setup.");
      } finally {
        if (active) setLoadingSetup(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await authFetch("/api/admin/auth/mfa/confirm", {
        method: "POST",
        body: JSON.stringify({ code: code.replace(/\s+/g, "") }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        backupCodes?: string[];
        error?: string;
      };
      if (!res.ok || !json.ok || !json.backupCodes) {
        setError(json.error || "Invalid 6-digit authenticator code");
        return;
      }
      setBackupCodes(json.backupCodes);
    } catch {
      setError("Network error verifying code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await authFetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function handleCopyBackupCodes() {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  }

  function handleDownloadBackupCodes() {
    if (!backupCodes) return;
    const text = [
      "BROTHERS Holidays Adventure — Admin Recovery Backup Codes",
      `Account: ${adminEmail}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Each code works ONCE. Store safely offline:",
      ...backupCodes,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brothers-admin-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_rgba(16,75,135,0.08),_transparent_55%)]">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#071526] text-[#ff8a50] shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            Mandatory Administrator MFA
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917]">
            {backupCodes ? "Save Your Recovery Codes" : "Enroll Authenticator App"}
          </h1>
          <p className="text-sm text-[#57534d]">
            Signed in as{" "}
            <span className="text-[#1c1917] font-semibold">{adminName}</span> (
            {adminEmail})
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {backupCodes ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-relaxed">
                Store these 10 one-time recovery codes in a password manager or printed vault. They will <strong>never</strong> be shown again.
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {backupCodes.map((c) => (
                  <div
                    key={c}
                    className="rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2 font-mono text-xs text-center font-semibold text-[#104b87] tracking-wider"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-2.5 text-sm font-medium text-[#1c1917] hover:border-[#104b87] cursor-pointer"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-2.5 text-sm font-medium text-[#1c1917] hover:border-[#104b87] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .txt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  router.push("/admin");
                  router.refresh();
                }}
                className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white cursor-pointer shadow-sm"
              >
                Continue to Admin Portal →
              </button>
            </div>
          ) : loadingSetup ? (
            <div className="py-14 text-center text-sm font-medium text-[#104b87]">
              Generating encrypted TOTP secret...
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="rounded-xl border border-slate-200 bg-white p-2.5 shrink-0 shadow-xs">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Scan QR code in your authenticator app"
                      className="h-44 w-44"
                    />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-500">
                      Unavailable
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm text-[#57534d] leading-relaxed">
                  <p>
                    Scan this QR code using{" "}
                    <strong className="text-[#1c1917]">
                      Google Authenticator, 1Password, Authy, or Microsoft Authenticator
                    </strong>
                    .
                  </p>
                  {manualKey && (
                    <div className="space-y-1">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Manual Entry Key
                      </span>
                      <code className="block break-all rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2 font-mono text-xs text-[#104b87]">
                        {manualKey}
                      </code>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#104b87] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate Secret
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleConfirm}
                className="space-y-4 pt-3 border-t border-slate-200"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-totp-confirm"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    6-Digit Authenticator Code
                  </label>
                  <input
                    id="admin-totp-confirm"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={8}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-[#1c1917] placeholder:text-slate-300 focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {submitting
                    ? "Confirming..."
                    : "Activate Two-Factor Authentication"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534d] hover:text-[#1c1917] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
