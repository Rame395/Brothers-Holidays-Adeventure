"use client";

import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Mountain,
  Plus,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { TripDTO } from "@/lib/types";
import { bookingTotal, clampTravellers, formatRs } from "@/lib/booking";
import { resolveTierPrice } from "@/lib/weather-locations";
import {
  getStoredUtmParams,
  trackBeginBooking,
  trackCompleteBooking,
  trackGenerateLead,
  trackWhatsAppClick,
} from "@/lib/analytics";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const emptySubscribe = () => () => {};
let cachedClientDay: string | null = null;

function getClientDaySnapshot(): string {
  if (!cachedClientDay) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    cachedClientDay = `${y}-${m}-${d}`;
  }
  return cachedClientDay;
}

function getServerDaySnapshot(): string | null {
  return null;
}

function toIsoDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIsoParts(iso: string): { year: number; month0: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return {
    year: y || 2026,
    month0: (m || 1) - 1,
    day: d || 1,
  };
}

function fmtDisplayDate(iso: string): string {
  const { year, month0, day } = parseIsoParts(iso);
  return new Date(year, month0, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toUtcDate(iso: string): Date {
  const { year, month0, day } = parseIsoParts(iso);
  return new Date(Date.UTC(year, month0, day));
}

export function BookingPanel({
  trip,
  whatsappNumber,
}: {
  trip: TripDTO;
  whatsappNumber?: string;
}) {
  return (
    <BookingPanelInner
      key={trip.slug}
      trip={trip}
      whatsappNumber={whatsappNumber}
    />
  );
}

function BookingPanelInner({
  trip,
  whatsappNumber,
}: {
  trip: TripDTO;
  whatsappNumber?: string;
}) {
  const clientDay = useSyncExternalStore(
    emptySubscribe,
    getClientDaySnapshot,
    getServerDaySnapshot
  );

  const todayIso = clientDay ?? "2026-01-01";
  const todayParts = useMemo(() => parseIsoParts(todayIso), [todayIso]);

  const dbDepartures = useMemo(() => {
    return (trip.departures || [])
      .filter((d) => d.status !== "CANCELLED" && d.status !== "SOLD_OUT")
      .map((d) => ({
        id: d.id,
        isoDate: d.startDate.slice(0, 10),
        priceOverride: d.priceOverride ?? null,
      }));
  }, [trip.departures]);

  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const activeDateIso = selectedDateIso ?? clientDay;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => todayParts.year);
  const [viewMonth, setViewMonth] = useState<number>(() => todayParts.month0);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const maxGroupCapacity = useMemo(
    () =>
      Math.max(
        trip.groupMax,
        ...(trip.priceTiers || []).map((t) => t.maxGroup)
      ),
    [trip.groupMax, trip.priceTiers]
  );

  const [travellers, setTravellers] = useState(() =>
    clampTravellers(1, maxGroupCapacity)
  );
  const [step, setStep] = useState<
    "quote" | "details" | "inquiry" | "done" | "inquiry_done"
  >("quote");
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

  useEffect(() => {
    if (!calendarOpen) return;
    function handleOutside(e: MouseEvent) {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [calendarOpen]);

  const matchedDeparture = activeDateIso
    ? dbDepartures.find((d) => d.isoDate === activeDateIso) ?? null
    : null;
  const tierResult = useMemo(
    () => resolveTierPrice(trip.price, trip.priceTiers || [], travellers),
    [trip.price, trip.priceTiers, travellers]
  );
  const activeUnitPrice = matchedDeparture?.priceOverride ?? tierResult.price;
  const hasGroupDiscount =
    !matchedDeparture?.priceOverride &&
    Boolean(tierResult.matchedTier) &&
    tierResult.price < trip.price;
  const total = bookingTotal(activeUnitPrice, travellers, maxGroupCapacity);

  const minYear = todayParts.year;
  const maxYear = todayParts.year + 3;
  const yearOptions = useMemo(
    () => [minYear, minYear + 1, minYear + 2, maxYear],
    [minYear, maxYear]
  );

  const isPrevMonthDisabled =
    viewYear < minYear ||
    (viewYear === minYear && viewMonth <= todayParts.month0);
  const isNextMonthDisabled = viewYear > maxYear || (viewYear === maxYear && viewMonth >= 11);

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, iso: toIsoDate(viewYear, viewMonth, day) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const cleanWhatsapp = useMemo(() => {
    const raw = (whatsappNumber || "").replace(/[^0-9]/g, "");
    if (!raw || raw === "9779800000000") return "61426378149";
    return raw;
  }, [whatsappNumber]);

  const whatsappHref = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hi BROTHERS Holidays, I have a question about ${trip.name}.`
  )}`;

  const handleToggleCalendar = () => {
    if (!calendarOpen) {
      const targetIso = activeDateIso ?? todayIso;
      const parts = parseIsoParts(targetIso);
      setViewYear(parts.year);
      setViewMonth(parts.month0);
    }
    setCalendarOpen((prev) => !prev);
  };

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleYearChange = (nextYear: number) => {
    setViewYear(nextYear);
    if (nextYear === minYear && viewMonth < todayParts.month0) {
      setViewMonth(todayParts.month0);
    }
  };

  const handleProceedToDetails = () => {
    if (!activeDateIso) return;
    setCalendarOpen(false);
    trackBeginBooking({
      slug: trip.slug,
      name: trip.name,
      totalAmount: total,
      travellers,
    });
    setErrors({});
    setSubmitError("");
    setStep("details");
  };

  const handleOpenInquiry = () => {
    setCalendarOpen(false);
    setErrors({});
    setSubmitError("");
    setStep("inquiry");
  };

  const submitForm = async (e: React.FormEvent) => {
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

    const chosenUtcDate = activeDateIso ? toUtcDate(activeDateIso) : null;

    try {
      const utm = getStoredUtmParams();
      if (step === "inquiry") {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "TRIP_INQUIRY",
            fullName: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            whatsapp: form.phone.trim() || null,
            routeName: trip.name,
            tripSlug: trip.slug,
            preferredDate: chosenUtcDate ? chosenUtcDate.toISOString() : null,
            groupSize: travellers,
            message: form.notes.trim() || null,
            sourcePage: `/destinations/${trip.slug}`,
            ...utm,
          }),
        });

        const json = (await res.json()) as {
          ok: boolean;
          reference?: string;
          error?: string;
        };

        if (!res.ok || !json.ok || !json.reference) {
          setSubmitError(
            json.error || "Unable to send your enquiry right now."
          );
          return;
        }

        setReference(json.reference);
        trackGenerateLead({
          leadType: "trip_inquiry",
          interest: trip.name,
          sourcePage: `/destinations/${trip.slug}`,
        });
        setStep("inquiry_done");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          departureId: matchedDeparture?.id ?? null,
          departureDate: chosenUtcDate ? chosenUtcDate.toISOString() : null,
          isCustomDate: !matchedDeparture,
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
      className="scroll-mt-24 rounded-[16px] border border-slate-200 bg-white shadow-[0_10px_30px_-10px_rgba(16,75,135,0.12)] text-[#1c1917] font-sans"
    >
      {/* Top Header */}
      <div className="rounded-t-[16px] px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917]">
          Start Booking
        </h2>
        <span className="rounded-full bg-[#f8fafc] border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#57534d] tabular-nums">
          {trip.days} {trip.days === 1 ? "Day" : "Days"}
        </span>
      </div>

      {step === "quote" && (
        <div className="p-6 space-y-5">
          {/* Departure Date Calendar Picker */}
          <div ref={calendarContainerRef} className="relative">
            <label
              htmlFor="booking-departure-trigger"
              className="block text-sm font-medium text-[#57534d] mb-2"
            >
              Departure Date
            </label>
            <button
              id="booking-departure-trigger"
              type="button"
              aria-expanded={calendarOpen}
              aria-haspopup="dialog"
              onClick={handleToggleCalendar}
              className={`w-full rounded-[10px] border bg-white px-4 py-3 text-[15px] font-medium text-[#1c1917] flex items-center justify-between transition-colors cursor-pointer ${
                calendarOpen
                  ? "border-[#104b87] ring-2 ring-[#104b87]/15"
                  : "border-slate-300 hover:border-[#104b87]/60"
              }`}
            >
              <span>
                {activeDateIso ? fmtDisplayDate(activeDateIso) : "Select date"}
              </span>
              <Calendar className="h-4 w-4 text-[#104b87] shrink-0" />
            </button>

            {calendarOpen && (
              <div
                role="dialog"
                aria-label="Choose departure date"
                className="absolute left-0 top-full mt-2 z-50 w-[296px] max-w-full rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-10px_rgba(16,75,135,0.2)]"
              >
                {/* Calendar Month / Year Header */}
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isPrevMonthDisabled}
                    aria-label="Previous month"
                    className="grid h-8 w-8 place-items-center rounded-full text-[#57534d] hover:bg-slate-100 hover:text-[#104b87] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <select
                      aria-label="Month"
                      value={viewMonth}
                      onChange={(e) => setViewMonth(Number(e.target.value))}
                      className="rounded-[8px] border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-[#1c1917] hover:bg-slate-100 focus:border-[#104b87] focus:outline-none cursor-pointer"
                    >
                      {MONTH_NAMES.map((name, idx) => {
                        const isPastMonth =
                          viewYear === minYear && idx < todayParts.month0;
                        return (
                          <option
                            key={name}
                            value={idx}
                            disabled={isPastMonth}
                          >
                            {name}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      aria-label="Year"
                      value={viewYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                      className="rounded-[8px] border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-[#1c1917] hover:bg-slate-100 focus:border-[#104b87] focus:outline-none cursor-pointer tabular-nums"
                    >
                      {yearOptions.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={isNextMonthDisabled}
                    aria-label="Next month"
                    className="grid h-8 w-8 place-items-center rounded-full text-[#57534d] hover:bg-slate-100 hover:text-[#104b87] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Weekday Row */}
                <div className="grid grid-cols-7 gap-y-1 text-center mb-1.5">
                  {WEEKDAYS.map((wd) => (
                    <span
                      key={wd}
                      className="text-xs font-medium text-[#64748b] py-1"
                    >
                      {wd}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {calendarCells.map((cell, idx) => {
                    if (!cell) {
                      return <span key={`empty-${idx}`} className="h-9" />;
                    }
                    const isPast = Boolean(clientDay && cell.iso < todayIso);
                    const isSelected = cell.iso === activeDateIso;
                    const isToday = Boolean(clientDay && cell.iso === todayIso);

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDateIso(cell.iso);
                          setCalendarOpen(false);
                        }}
                        aria-label={fmtDisplayDate(cell.iso)}
                        aria-pressed={isSelected}
                        className={`h-9 w-9 mx-auto rounded-full text-sm tabular-nums transition-colors ${
                          isPast
                            ? "text-slate-300 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#f05e25] text-white font-semibold shadow-xs cursor-pointer"
                            : isToday
                            ? "border border-[#104b87]/40 text-[#104b87] font-semibold hover:bg-[#104b87]/10 cursor-pointer"
                            : "text-[#1c1917] font-medium hover:bg-[#104b87]/10 hover:text-[#104b87] cursor-pointer"
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Travellers Stepper + Price Per Person */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Fewer travellers"
                onClick={() =>
                  setTravellers((t) =>
                    clampTravellers(t - 1, maxGroupCapacity)
                  )
                }
                disabled={travellers <= 1}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#1c1917] hover:border-[#104b87] hover:text-[#104b87] disabled:opacity-35 cursor-pointer transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-[#1c1917] tabular-nums"
                aria-live="polite"
              >
                {travellers}
              </span>
              <button
                type="button"
                aria-label="More travellers"
                onClick={() =>
                  setTravellers((t) =>
                    clampTravellers(t + 1, maxGroupCapacity)
                  )
                }
                disabled={travellers >= maxGroupCapacity}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#1c1917] hover:border-[#104b87] hover:text-[#104b87] disabled:opacity-35 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-[#1c1917] tabular-nums leading-tight">
                {formatRs(activeUnitPrice)}
              </p>
              <div className="mt-0.5 flex items-center justify-end gap-1.5">
                {hasGroupDiscount && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Group rate
                  </span>
                )}
                <p className="text-xs text-[#64748b]">Per person</p>
              </div>
            </div>
          </div>

          {/* Total Row */}
          <div className="border-t border-slate-200 pt-4 flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-medium text-[#57534d]">
              Total
            </span>
            <span className="text-2xl font-bold text-[#104b87] tabular-nums">
              {formatRs(total)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleOpenInquiry}
              className="rounded-full bg-[#104b87] hover:bg-[#0a355f] px-4 py-3 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              Trip Enquiry
            </button>
            <button
              type="button"
              onClick={handleProceedToDetails}
              disabled={!activeDateIso}
              className="rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-4 py-3 text-sm font-semibold text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {(step === "details" || step === "inquiry") && (
        <form onSubmit={submitForm} className="p-6 space-y-4" noValidate>
          <div className="rounded-[10px] bg-[#f8fafc] border border-slate-200 px-3.5 py-2.5 text-xs text-[#57534d] flex items-center justify-between gap-2">
            <span className="truncate font-medium">
              {activeDateIso ? fmtDisplayDate(activeDateIso) : "Flexible date"}{" "}
              · {travellers} {travellers === 1 ? "guest" : "guests"}
            </span>
            <span className="font-bold text-[#104b87] tabular-nums shrink-0">
              {formatRs(total)}
            </span>
          </div>

          <p className="text-sm font-semibold text-[#1c1917]">
            {step === "inquiry"
              ? "Ask a question about this trip"
              : "Complete your booking request"}
          </p>

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
                className={`w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-[#64748b] focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15 ${
                  errors[key] ? "border-[#ba1a1a]" : "border-slate-300"
                }`}
              />
              {errors[key] && (
                <p className="mt-1 text-xs text-[#ba1a1a]">{errors[key]}</p>
              )}
            </div>
          ))}

          <textarea
            placeholder={
              step === "inquiry"
                ? "What would you like to know? (dates, custom itinerary, fitness, permits…)"
                : "Any notes? (dietary needs, hotel preference, prior altitude experience…)"
            }
            aria-label="Notes"
            rows={2}
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            className="w-full resize-none rounded-[10px] border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-[#64748b] focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
          />

          {submitError && (
            <p className="text-xs text-[#ba1a1a] font-medium">{submitError}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setSubmitError("");
                setStep("quote");
              }}
              className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-[#57534d] hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-white shadow-xs cursor-pointer transition-colors disabled:opacity-60 ${
                step === "inquiry"
                  ? "bg-[#104b87] hover:bg-[#0a355f]"
                  : "bg-[#f05e25] hover:bg-[#d94e18]"
              }`}
            >
              {submitting
                ? "Sending..."
                : step === "inquiry"
                ? "Send Enquiry"
                : "Confirm Booking"}
            </button>
          </div>
        </form>
      )}

      {(step === "done" || step === "inquiry_done") && (
        <div className="p-6 text-center space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#1c1917]">
            {step === "inquiry_done" ? "Enquiry Received" : "Booking Request Sent"}
          </h3>
          <p className="text-sm text-[#57534d] leading-relaxed">
            Thank you, {form.name.split(" ")[0]}. Our Kathmandu team has
            received your{" "}
            {step === "inquiry_done" ? "question about" : "booking request for"}{" "}
            <strong className="text-[#1c1917]">{trip.name}</strong>
            {activeDateIso ? ` (${fmtDisplayDate(activeDateIso)})` : ""} and
            will reply shortly.
          </p>
          <div className="pt-1">
            <span className="inline-block rounded-[8px] bg-[#f8fafc] border border-slate-200 px-3 py-1 text-xs font-semibold text-[#104b87] tabular-nums">
              Ref: {reference}
            </span>
          </div>
          {step === "done" && (
            <p className="text-lg font-bold text-[#104b87] tabular-nums">
              Total: {formatRs(confirmedTotal ?? total)}
            </p>
          )}
          <button
            type="button"
            onClick={() => setStep("quote")}
            className="mt-2 inline-block text-xs font-semibold text-[#104b87] hover:underline cursor-pointer"
          >
            Back to booking options
          </button>
        </div>
      )}

      {/* Bottom Expert Help Strip */}
      <div className="rounded-b-[16px] border-t border-slate-100 bg-[#f8fafc] px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-full border border-[#104b87]/20 bg-white grid place-items-center shrink-0 shadow-2xs">
            <Mountain className="h-5 w-5 text-[#104b87]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#64748b] leading-tight">Quick help?</p>
            <Link
              href="/contact"
              className="text-[15px] font-semibold text-[#1c1917] hover:text-[#104b87] transition-colors truncate block"
            >
              Expert Advice
            </Link>
          </div>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(`booking_panel_${trip.slug}`)}
          aria-label="Chat with a trek expert on WhatsApp"
          className="h-11 w-11 rounded-full bg-[#104b87]/10 text-[#104b87] hover:bg-[#104b87] hover:text-white grid place-items-center transition-colors shrink-0"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
