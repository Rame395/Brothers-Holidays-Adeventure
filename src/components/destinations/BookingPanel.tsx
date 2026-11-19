"use client";

import { Check, Minus, Plus, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Trip } from "@/data/trips";
import {
  bookingReference,
  bookingTotal,
  clampTravellers,
  formatRs,
  upcomingDepartures,
} from "@/lib/booking";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function BookingPanel({ trip }: { trip: Trip }) {
  const departures = useMemo(
    () => upcomingDepartures(new Date(), trip.seasonMonths, 6),
    [trip.seasonMonths]
  );
  const [selected, setSelected] = useState<string>(
    () => upcomingDepartures(new Date(), trip.seasonMonths, 6)[0]?.toISOString() ?? "custom"
  );
  const [customDate, setCustomDate] = useState("");
  const [travellers, setTravellers] = useState(() => clampTravellers(2, trip.groupMax));
  const [step, setStep] = useState<"quote" | "details" | "done">("quote");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState("");
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const list = upcomingDepartures(new Date(), trip.seasonMonths, 6);
    setSelected(list[0]?.toISOString() ?? "custom");
    setTravellers((t) => clampTravellers(t, trip.groupMax));
    setStep("quote");
  }, [trip.slug, trip.seasonMonths, trip.groupMax]);

  const total = bookingTotal(trip.price, travellers, trip.groupMax);
  const chosenDate =
    selected === "custom"
      ? customDate
        ? new Date(customDate)
        : null
      : selected
      ? new Date(selected)
      : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) {
      errs.name = "Please enter your full name";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setReference(bookingReference(trip.slug, chosenDate ?? new Date()));
    setStep("done");
  };

  return (
    <div
      id="book"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#d8e5e7] bg-white shadow-[0_20px_50px_-15px_rgba(0,56,64,0.14)] text-[#111d1f]"
    >
      {/* Top Dark Teal Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#003840] via-[#00515b] to-[#071318] p-6 text-white">
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e8b765] font-semibold">
              Book This Expedition
            </p>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#89d6e2]">
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            <div>
              <p className="font-serif text-3xl font-medium tracking-tight text-white">
                {formatRs(trip.price)}
              </p>
              <p className="text-xs text-white/75 mt-0.5">
                per person · all-inclusive fixed tariff
              </p>
            </div>
          </div>
        </div>
      </div>

      {step !== "done" ? (
        <div className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#55606a] font-semibold mb-3">
            Fixed Departures
          </p>
          <div className="grid grid-cols-2 gap-2">
            {departures.map((d) => {
              const iso = d.toISOString();
              const on = selected === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelected(iso)}
                  className={`relative rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition-all cursor-pointer ${
                    on
                      ? "border-[#00515b] bg-[#00515b]/10 text-[#003840] font-semibold shadow-sm"
                      : "border-[#d8e5e7] bg-[#f8fafb] text-[#3f484a] hover:border-[#006b78]/50"
                  }`}
                >
                  <span className="relative">{fmtDate(d)}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelected("custom")}
              className={`col-span-2 rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition-all cursor-pointer ${
                selected === "custom"
                  ? "border-[#b58133] bg-[#b58133]/10 text-[#111d1f] font-semibold"
                  : "border-[#d8e5e7] bg-[#f8fafb] text-[#3f484a] hover:border-[#b58133]/50"
              }`}
            >
              Private departure — choose your own date
            </button>
          </div>

          {selected === "custom" && (
            <div className="mt-2.5">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full rounded-lg border border-[#bec8cb] bg-[#f8fafb] px-3 py-2.5 text-sm text-[#111d1f] focus:border-[#00515b] focus:outline-none"
                aria-label="Preferred start date"
              />
            </div>
          )}

          {/* Travellers Selector */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#e8f0f3]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#55606a] font-semibold">
                Travellers
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6f797b]">
                <Users className="h-3.5 w-3.5 text-[#006b78]" /> max{" "}
                {trip.groupMax} per group
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[#d8e5e7] bg-[#f8fafb] p-1">
              <button
                type="button"
                aria-label="Fewer travellers"
                onClick={() =>
                  setTravellers((t) => clampTravellers(t - 1, trip.groupMax))
                }
                disabled={travellers <= 1}
                className="grid h-8 w-8 place-items-center rounded-full text-[#111d1f] hover:bg-[#e3f0f3] disabled:opacity-30 cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                className="w-8 text-center font-mono text-sm font-bold text-[#003840]"
                aria-live="polite"
              >
                {travellers}
              </span>
              <button
                type="button"
                aria-label="More travellers"
                onClick={() =>
                  setTravellers((t) => clampTravellers(t + 1, trip.groupMax))
                }
                disabled={travellers >= trip.groupMax}
                className="grid h-8 w-8 place-items-center rounded-full text-[#111d1f] hover:bg-[#e3f0f3] disabled:opacity-30 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Total Breakdown Box */}
          <div className="mt-5 rounded-xl bg-[#f2f8fa] border border-[#d8e5e7] p-4">
            <div className="flex justify-between text-xs text-[#55606a] font-mono">
              <span>
                {formatRs(trip.price)} × {travellers}
              </span>
              <span className="text-[#006b78]">Permits &amp; fees incl.</span>
            </div>
            <div className="mt-2 flex items-end justify-between border-t border-[#d8e5e7]/70 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#111d1f] font-semibold">
                Total Tariff
              </span>
              <span className="font-serif text-2xl font-semibold text-[#b58133]">
                {formatRs(total)}
              </span>
            </div>
          </div>

          {step === "quote" ? (
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={!chosenDate}
              className="mt-5 w-full rounded-full bg-[#00515b] hover:bg-[#003840] py-3.5 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {chosenDate
                ? `Book for ${fmtDate(chosenDate)}`
                : "Choose a Departure Date"}
            </button>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
              {(
                [
                  ["name", "Full name", "text"],
                  ["email", "Email address", "email"],
                  ["phone", "Phone / WhatsApp (optional)", "tel"],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key}>
                  <input
                    type={type}
                    placeholder={label}
                    aria-label={label}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className={`w-full rounded-lg border bg-[#f8fafb] px-3 py-2.5 text-sm text-[#111d1f] placeholder:text-[#6f797b] focus:border-[#00515b] focus:bg-white focus:outline-none ${
                      errors[key] ? "border-[#ba1a1a]" : "border-[#bec8cb]"
                    }`}
                  />
                  {errors[key] && (
                    <p className="mt-1 text-xs text-[#ba1a1a]">{errors[key]}</p>
                  )}
                </div>
              ))}
              <textarea
                placeholder="Any notes? (dietary needs, prior altitude experience…)"
                aria-label="Notes"
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full resize-none rounded-lg border border-[#bec8cb] bg-[#f8fafb] px-3 py-2.5 text-sm text-[#111d1f] placeholder:text-[#6f797b] focus:border-[#00515b] focus:bg-white focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("quote")}
                  className="rounded-full border border-[#d8e5e7] px-4 py-3 text-xs font-mono uppercase tracking-wider text-[#3f484a] hover:bg-[#f2f8fa] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#b58133] hover:bg-[#9a6c28] py-3 text-xs font-mono uppercase tracking-widest font-semibold text-white shadow-md cursor-pointer transition-colors"
                >
                  Request Booking
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 flex items-center gap-2 text-[11px] text-[#55606a]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#006b78]" /> No
            payment required today. Free date changes up to 60 days prior.
          </p>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#00515b] text-white shadow-md">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-serif text-2xl text-[#111d1f]">
            Expedition Request Received
          </h3>
          <p className="mt-2 text-xs text-[#55606a] leading-relaxed">
            Thank you, {form.name.split(" ")[0]}. Your dossier for{" "}
            <strong className="text-[#111d1f]">{trip.name}</strong> ({travellers}{" "}
            {travellers === 1 ? "traveller" : "travellers"}
            {chosenDate ? ` · ${fmtDate(chosenDate)}` : ""}) has been logged.
          </p>
          <p className="mt-4 inline-block rounded-full bg-[#f2f8fa] border border-[#d8e5e7] px-3 py-1 font-mono text-xs font-semibold text-[#00515b]">
            Ref · {reference}
          </p>
          <p className="mt-2 font-serif text-xl font-semibold text-[#b58133]">
            {formatRs(total)}
          </p>
          <button
            type="button"
            onClick={() => setStep("quote")}
            className="mt-5 block mx-auto text-xs font-mono uppercase tracking-wider text-[#006b78] underline hover:text-[#003840] cursor-pointer"
          >
            Modify booking details
          </button>
        </div>
      )}
    </div>
  );
}
