"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
  }
}

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const UTM_STORAGE_KEY = "bha_utm_params";

export function captureUtmParams(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") || undefined;
    const utmMedium = params.get("utm_medium") || undefined;
    const utmCampaign = params.get("utm_campaign") || undefined;
    if (utmSource || utmMedium || utmCampaign) {
      const payload: UtmParams = { utmSource, utmMedium, utmCampaign };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // ignore storage errors
  }
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

export function trackViewTrip(trip: {
  slug: string;
  name: string;
  price: number;
  country: string;
  region?: string | null;
}) {
  trackEvent("view_item", {
    currency: "USD",
    value: trip.price,
    items: [
      {
        item_id: trip.slug,
        item_name: trip.name,
        item_category: trip.country,
        item_category2: trip.region || "himalaya",
        price: trip.price,
      },
    ],
  });
}

export function trackBeginBooking(trip: {
  slug: string;
  name: string;
  totalAmount: number;
  travellers: number;
}) {
  trackEvent("begin_checkout", {
    currency: "USD",
    value: trip.totalAmount,
    items: [
      {
        item_id: trip.slug,
        item_name: trip.name,
        quantity: trip.travellers,
        price: Math.round(trip.totalAmount / Math.max(trip.travellers, 1)),
      },
    ],
  });
}

export function trackCompleteBooking(booking: {
  reference: string;
  tripSlug: string;
  tripName: string;
  totalAmount: number;
  travellers: number;
}) {
  trackEvent("purchase", {
    transaction_id: booking.reference,
    currency: "USD",
    value: booking.totalAmount,
    items: [
      {
        item_id: booking.tripSlug,
        item_name: booking.tripName,
        quantity: booking.travellers,
      },
    ],
  });
  trackEvent("generate_lead", {
    lead_type: "booking",
    trip_slug: booking.tripSlug,
    value: booking.totalAmount,
    currency: "USD",
  });
}

export function trackGenerateLead(params: {
  leadType: string;
  interest?: string;
  sourcePage?: string;
}) {
  trackEvent("generate_lead", {
    lead_type: params.leadType,
    interest: params.interest,
    source_page: params.sourcePage,
  });
}

export function trackNewsletterSignup(source: string) {
  trackEvent("sign_up", {
    method: "newsletter",
    source,
  });
}

export function trackWhatsAppClick(context: string) {
  trackEvent("contact", {
    method: "whatsapp",
    context,
  });
}
