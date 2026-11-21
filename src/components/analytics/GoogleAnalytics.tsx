"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { captureUtmParams, trackEvent } from "@/lib/analytics";

interface GoogleAnalyticsProps {
  gaMeasurementId?: string | null;
  gtmContainerId?: string | null;
  facebookPixelId?: string | null;
}

export function GoogleAnalytics({
  gaMeasurementId,
  gtmContainerId,
}: GoogleAnalyticsProps) {
  const gaId =
    gaMeasurementId?.trim() ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    "";
  const gtmId =
    gtmContainerId?.trim() || process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

  useEffect(() => {
    captureUtmParams();
  }, []);

  useReportWebVitals((metric) => {
    if (!gaId && !gtmId) return;
    trackEvent(metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  });

  if (!gaId && !gtmId) return null;

  return (
    <>
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId.replace(/[^A-Za-z0-9_-]/g, "")}');`,
          }}
        />
      )}

      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','${gaId.replace(/[^A-Za-z0-9_-]/g, "")}',{send_page_view:true});`,
            }}
          />
        </>
      )}
    </>
  );
}
