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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[radial-gradient(ellipse_at_top,_rgba(217,159,56,0.12),_transparent_55%)]">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8b765]">
            Mandatory Administrator MFA
          </p>
          <h1 className="font-serif text-3xl text-white">
            {backupCodes ? "Save Your Recovery Codes" : "Enroll Authenticator App"}
          </h1>
          <p className="text-xs text-white/60">
            Signed in as <span className="text-white font-medium">{adminName}</span> ({adminEmail})
          </p>
        </div>

        <div className="rounded-2xl border border-[#d99f38]/30 bg-[#0b161e] p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          {backupCodes ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-400/30 bg-amber-950/30 px-4 py-3 text-xs text-amber-100 leading-relaxed">
                Store these 10 one-time recovery codes in a password manager or printed vault. They will <strong>never</strong> be shown again.
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {backupCodes.map((c) => (
                  <div
                    key={c}
                    className="rounded-lg border border-white/10 bg-[#060d12] px-3 py-2 font-mono text-xs text-center text-[#e8b765] tracking-wider"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10 cursor-pointer"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  router.push("/admin");
                  router.refresh();
                }}
                className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#060d12] hover:bg-[#e8b765] cursor-pointer"
              >
                Continue to Admin Portal →
              </button>
            </div>
          ) : loadingSetup ? (
            <div className="py-14 text-center font-mono text-xs text-white/60">
              Generating encrypted TOTP secret...
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="rounded-xl bg-white p-2.5 shrink-0">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Scan QR code in your authenticator app"
                      className="h-44 w-44"
                    />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-600">
                      Unavailable
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-xs text-white/75 leading-relaxed">
                  <p>
                    Scan this QR code using{" "}
                    <strong className="text-white">
                      Google Authenticator, 1Password, Authy, or Microsoft Authenticator
                    </strong>
                    .
                  </p>
                  {manualKey && (
                    <div className="space-y-1">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-[#e8b765]">
                        Manual Entry Key
                      </span>
                      <code className="block break-all rounded-md border border-white/10 bg-[#060d12] px-2.5 py-2 font-mono text-[11px] text-[#89d6e2]">
                        {manualKey}
                      </code>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate Secret
                  </button>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-totp-confirm"
                    className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
                    className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-white placeholder-white/25 focus:border-[#d99f38] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#060d12] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "Confirming..." : "Activate Two-Factor Authentication"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
