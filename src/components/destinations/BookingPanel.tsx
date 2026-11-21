"use client";

import { Check, Minus, Plus, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { TripDTO } from "@/lib/types";
import {
  bookingTotal,
  clampTravellers,
  formatRs,
  upcomingDepartures,
} from "@/lib/booking";
import {
  getStoredUtmParams,
  trackBeginBooking,
  trackCompleteBooking,
} from "@/lib/analytics";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const emptySubscribe = () => () => {};
let cachedClientDay: string | null = null;

function getClientDaySnapshot(): string {
  if (!cachedClientDay) {
    const now = new Date();
    cachedClientDay = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }
  return cachedClientDay;
}

function getServerDaySnapshot(): string | null {
  return null;
}

interface DepartureChoice {
  id: string | null;
  date: Date;
  iso: string;
  priceOverride: number | null;
  seatsLeft: number | null;
  status: string;
}

export function BookingPanel({ trip }: { trip: TripDTO }) {
  return <BookingPanelInner key={trip.slug} trip={trip} />;
}

function BookingPanelInner({ trip }: { trip: TripDTO }) {
  const dbDepartures = useMemo<DepartureChoice[]>(() => {
    return (trip.departures || [])
      .filter((d) => d.status !== "CANCELLED" && d.status !== "SOLD_OUT")
      .slice(0, 6)
      .map((d) => ({
        id: d.id,
        date: new Date(d.startDate),
        iso: d.startDate,
        priceOverride: d.priceOverride ?? null,
        seatsLeft: Math.max(d.seatsTotal - d.seatsBooked, 0),
        status: d.status,
      }));
  }, [trip.departures]);

  const clientDay = useSyncExternalStore(
    emptySubscribe,
    getClientDaySnapshot,
    getServerDaySnapshot
  );

  const departures = useMemo<DepartureChoice[]>(() => {
    if (dbDepartures.length > 0) return dbDepartures;
    if (!clientDay) return [];
    const [year, month, day] = clientDay.split("-").map(Number);
    return upcomingDepartures(
      new Date(year, month, day),
      trip.seasonMonths,
      6
    ).map((d) => ({
      id: null,
      date: d,
      iso: d.toISOString(),
      priceOverride: null,
      seatsLeft: trip.groupMax,
      status: "OPEN",
    }));
  }, [dbDepartures, clientDay, trip.seasonMonths, trip.groupMax]);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const selected =
    selectedChoice !== null
      ? selectedChoice
      : departures[0]?.iso ?? "custom";
  const [customDate, setCustomDate] = useState("");
  const [travellers, setTravellers] = useState(() =>
    clampTravellers(2, trip.groupMax)
  );
  const [step, setStep] = useState<"quote" | "details" | "done">("quote");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  const selectedDeparture = departures.find((d) => d.iso === selected) ?? null;
  const activeUnitPrice = selectedDeparture?.priceOverride ?? trip.price;
  const total = bookingTotal(activeUnitPrice, travellers, trip.groupMax);

  const chosenDate =
    selected === "custom"
      ? customDate
        ? new Date(customDate)
        : null
      : selected
      ? new Date(selected)
      : null;

  const handleProceedToDetails = () => {
    trackBeginBooking({
      slug: trip.slug,
      name: trip.name,
      totalAmount: total,
      travellers,
    });
    setStep("details");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) {
      errs.name = "Please enter your full name";
    }
    if (
      !form.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errs.email = "Please enter a valid email address";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      const utm = getStoredUtmParams();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          departureId: selectedDeparture?.id ?? null,
          departureDate: chosenDate ? chosenDate.toISOString() : null,
          isCustomDate: selected === "custom" || !selectedDeparture?.id,
          travellers,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          notes: form.notes.trim() || null,
          sourcePage: `/destinations/${trip.slug}`,
          ...utm,
        }),
      });

      const json = (await res.json()) as {
        ok: boolean;
        reference?: string;
        totalAmount?: number;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.reference) {
        setSubmitError(
          json.error || "Unable to complete booking request right now."
        );
        return;
      }

      const finalTotal = json.totalAmount ?? total;
      setReference(json.reference);
      setConfirmedTotal(finalTotal);
      trackCompleteBooking({
        reference: json.reference,
        tripSlug: trip.slug,
        tripName: trip.name,
        totalAmount: finalTotal,
        travellers,
      });
      setStep("done");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="book"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#d6cfc2] bg-white shadow-[0_20px_50px_-15px_rgba(8,19,24,0.14)] text-[#141c1f]"
    >
      {/* Top Deep Alpine Slate Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c3d44] via-[#0f4c54] to-[#081318] p-5 sm:p-6 text-white">
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e5b96b] font-semibold">
              Book This Expedition
            </p>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#f6f4ef] tabular-nums">
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            <div>
              <p className="font-serif text-3xl font-medium tracking-tight text-white tabular-nums">
                {formatRs(activeUnitPrice)}
              </p>
              <p className="text-xs text-white/75 mt-0.5">
                per person · all-inclusive fixed tariff
              </p>
            </div>
          </div>
        </div>
      </div>

      {step !== "done" ? (
        <div className="p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#526065] font-semibold mb-3">
            Fixed Departures
          </p>
          <div className="grid grid-cols-2 gap-2">
            {departures.map((d) => {
              const on = selected === d.iso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setSelectedChoice(d.iso)}
                  className={`relative rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition-all cursor-pointer ${
                    on
                      ? "border-[#0f4c54] bg-[#0f4c54]/10 text-[#0c3d44] font-semibold shadow-sm"
                      : "border-[#d6cfc2] bg-[#faf8f4] text-[#3b464d] hover:border-[#0f4c54]/50"
                  }`}
                >
                  <span className="relative block">{fmtDate(d.date)}</span>
                  {d.seatsLeft !== null && (
                    <span className="block text-[10px] text-[#0f4c54] mt-0.5 tabular-nums">
                      {d.seatsLeft} seats left
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedChoice("custom")}
              className={`col-span-2 rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition-all cursor-pointer ${
                selected === "custom"
                  ? "border-[#c89b4b] bg-[#c89b4b]/10 text-[#141c1f] font-semibold"
                  : "border-[#d6cfc2] bg-[#faf8f4] text-[#3b464d] hover:border-[#c89b4b]/50"
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
                className="w-full rounded-lg border border-[#d6cfc2] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#141c1f] focus:border-[#0f4c54] focus:bg-white focus:outline-none"
                aria-label="Preferred start date"
              />
            </div>
          )}

          {/* Travellers Selector */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#d6cfc2]/70">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#526065] font-semibold">
                Travellers
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6c767a] tabular-nums">
                <Users className="h-3.5 w-3.5 text-[#0f4c54]" /> max{" "}
                {trip.groupMax} per group
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[#d6cfc2] bg-[#faf8f4] p-1">
              <button
                type="button"
                aria-label="Fewer travellers"
                onClick={() =>
                  setTravellers((t) => clampTravellers(t - 1, trip.groupMax))
                }
                disabled={travellers <= 1}
                className="grid h-9 w-9 place-items-center rounded-full text-[#141c1f] hover:bg-[#f6f4ef] disabled:opacity-30 cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                className="w-8 text-center font-mono text-sm font-bold text-[#0c3d44] tabular-nums"
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
                className="grid h-9 w-9 place-items-center rounded-full text-[#141c1f] hover:bg-[#f6f4ef] disabled:opacity-30 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Total Breakdown Box */}
          <div className="mt-5 rounded-xl bg-[#f6f4ef] border border-[#d6cfc2] p-4">
            <div className="flex justify-between text-xs text-[#526065] font-mono tabular-nums">
              <span>
                {formatRs(activeUnitPrice)} × {travellers}
              </span>
              <span className="text-[#0f4c54]">Permits &amp; fees incl.</span>
            </div>
            <div className="mt-2 flex items-end justify-between border-t border-[#d6cfc2]/70 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#141c1f] font-semibold">
                Total Tariff
              </span>
              <span className="font-serif text-2xl font-semibold text-[#c89b4b] tabular-nums">
                {formatRs(total)}
              </span>
            </div>
          </div>

          {step === "quote" ? (
            <button
              type="button"
              onClick={handleProceedToDetails}
              disabled={!chosenDate}
              className="mt-5 w-full rounded-full bg-[#0f4c54] hover:bg-[#0c3d44] py-3.5 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
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
                    className={`w-full rounded-lg border bg-[#faf8f4] px-3 py-2.5 text-sm text-[#141c1f] placeholder:text-[#6c767a] focus:border-[#0f4c54] focus:bg-white focus:outline-none ${
                      errors[key] ? "border-[#ba1a1a]" : "border-[#d6cfc2]"
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
                className="w-full resize-none rounded-lg border border-[#d6cfc2] bg-[#faf8f4] px-3 py-2.5 text-sm text-[#141c1f] placeholder:text-[#6c767a] focus:border-[#0f4c54] focus:bg-white focus:outline-none"
              />
              {submitError && (
                <p className="text-xs text-[#ba1a1a] font-medium">
                  {submitError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("quote")}
                  className="rounded-full border border-[#d6cfc2] px-4 py-3 text-xs font-mono uppercase tracking-wider text-[#3b464d] hover:bg-[#f6f4ef] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-[#c89b4b] hover:bg-[#e5b96b] py-3 text-xs font-mono uppercase tracking-widest font-semibold text-[#081318] shadow-md cursor-pointer transition-colors disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Request Booking"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 flex items-center gap-2 text-[11px] text-[#526065]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#0f4c54]" /> No
            payment required today. Free date changes up to 60 days prior.
          </p>
        </div>
      ) : (
        <div className="p-5 sm:p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#0f4c54] text-white shadow-md">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-serif text-2xl text-[#141c1f]">
            Expedition Request Received
          </h3>
          <p className="mt-2 text-xs text-[#526065] leading-relaxed">
            Thank you, {form.name.split(" ")[0]}. Your dossier for{" "}
            <strong className="text-[#141c1f]">{trip.name}</strong> ({travellers}{" "}
            {travellers === 1 ? "traveller" : "travellers"}
            {chosenDate ? ` · ${fmtDate(chosenDate)}` : ""}) has been logged in
            our Kathmandu expedition ledger.
          </p>
          <p className="mt-4 inline-block rounded-full bg-[#f6f4ef] border border-[#d6cfc2] px-3 py-1 font-mono text-xs font-semibold text-[#0f4c54] tabular-nums">
            Ref · {reference}
          </p>
          <p className="mt-2 font-serif text-xl font-semibold text-[#c89b4b] tabular-nums">
            {formatRs(confirmedTotal ?? total)}
          </p>
          <button
            type="button"
            onClick={() => setStep("quote")}
            className="mt-5 block mx-auto text-xs font-mono uppercase tracking-wider text-[#0f4c54] underline hover:text-[#0c3d44] cursor-pointer"
          >
            Modify booking details
          </button>
        </div>
      )}
    </div>
  );
}
