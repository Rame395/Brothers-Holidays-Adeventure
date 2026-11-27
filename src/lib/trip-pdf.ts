"use client";

import type { jsPDF } from "jspdf";
import { formatPriceUsd } from "@/lib/booking";
import type { TripDTO } from "@/lib/types";
import { formatSeasonRange } from "@/lib/weather-locations";

function toPdfText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]+/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u00B7|\u2022/g, "|")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadLogoDataUrl(src: string): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  if (typeof window === "undefined") return null;
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => resolve(null), 1500);
    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 240;
        canvas.height = img.naturalHeight || 80;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function formatStageLabel(day: string, unit: string): string {
  const trimmed = day.trim();
  if (/^(day|stage)\b/i.test(trimmed)) return trimmed;
  return `${unit} ${trimmed}`;
}

export async function downloadTripPdf(trip: TripDTO): Promise<void> {
  const [{ jsPDF: JsPdfCtor }, logoAsset] = await Promise.all([
    import("jspdf"),
    loadLogoDataUrl("/images/brothers_logo_navbar.png"),
  ]);

  const doc: jsPDF = new JsPdfCtor({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 18;
  let y = 0;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      y = 18;
    }
  };

  const drawSectionHeading = (title: string) => {
    ensureSpace(14);
    y += 4;
    doc.setFillColor(63, 110, 21); // #3f6e15
    doc.rect(marginX, y, 2.5, 6.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(28, 25, 23);
    doc.text(toPdfText(title), marginX + 5.5, y + 4.8);
    y += 9.5;
    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.25);
    doc.line(marginX, y - 2, pageWidth - marginX, y - 2);
  };

  const drawParagraph = (text: string, fontSize = 9.5, indent = 0) => {
    const clean = toPdfText(text);
    if (!clean) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(68, 64, 60);
    const paragraphs = clean.split(/\n+/);
    for (const para of paragraphs) {
      const lines = doc.splitTextToSize(para, contentWidth - indent) as string[];
      for (const line of lines) {
        ensureSpace(5);
        doc.text(line, marginX + indent, y);
        y += 4.5;
      }
      y += 1.5;
    }
  };

  const drawBulletList = (items: string[], bulletChar = "-") => {
    for (const raw of items) {
      const clean = toPdfText(raw);
      if (!clean) continue;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(41, 37, 36);
      const lines = doc.splitTextToSize(clean, contentWidth - 7) as string[];
      ensureSpace(lines.length * 4.5 + 2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(240, 94, 37);
      doc.text(bulletChar, marginX + 1.5, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(41, 37, 36);
      lines.forEach((line, i) => {
        if (i > 0) ensureSpace(4.8);
        doc.text(line, marginX + 6.5, y);
        y += 4.5;
      });
      y += 0.8;
    }
  };

  // --- TOP BRAND BANNER (#142136) ---
  doc.setFillColor(20, 33, 54);
  doc.rect(0, 0, pageWidth, 42, "F");
  doc.setFillColor(240, 94, 37);
  doc.rect(0, 42, pageWidth, 1.4, "F");

  if (logoAsset) {
    const targetH = 12;
    const ratio = logoAsset.width / Math.max(1, logoAsset.height);
    const targetW = Math.min(36, targetH * ratio);
    doc.addImage(logoAsset.dataUrl, "PNG", marginX, 7.5, targetW, targetH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 169, 130);
    doc.text(
      "HIMALAYAN TREKKING & EXPEDITION DOSSIER",
      marginX + targetW + 5,
      12.5
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(
      "Thamel, Kathmandu, Nepal | info@brothersholidays.com",
      marginX + targetW + 5,
      17.5
    );
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("BROTHERS HOLIDAYS ADVENTURE", marginX, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 169, 130);
    doc.text("HIMALAYAN TREKKING & EXPEDITION DOSSIER", marginX, 18.5);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16.5);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(
    toPdfText(trip.name),
    contentWidth
  ) as string[];
  doc.text(titleLines[0] ?? "", marginX, 29.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  const subtitleText = [trip.area, trip.country ? trip.country.toUpperCase() : ""]
    .filter(Boolean)
    .join(" | ");
  doc.text(toPdfText(subtitleText), marginX, 36.5);

  y = 50;

  // --- KEY FACTS GRID ---
  const facts: [string, string][] = [
    ["DURATION", `${trip.days} ${trip.days === 1 ? "Day" : "Days"}`],
    [
      "MAX ALTITUDE",
      trip.maxAltitude > 0
        ? `${trip.maxAltitude.toLocaleString("en-US")} m`
        : "Lowland",
    ],
    ["DIFFICULTY", trip.difficulty],
    ["STARTING PRICE", `${formatPriceUsd(trip.price, trip.priceUsd)} USD`],
    ["BEST SEASONS", formatSeasonRange(trip.seasonMonths)],
    ["GROUP SIZE", `Up to ${trip.groupMax} travellers`],
  ];

  const colW = contentWidth / 3;
  const rowH = 14;
  doc.setFillColor(250, 249, 246);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, y, contentWidth, rowH * 2, 2.5, 2.5, "FD");

  facts.forEach(([label, val], idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const fx = marginX + col * colW + 4;
    const fy = y + row * rowH + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(120, 113, 108);
    doc.text(label, fx, fy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 25, 23);
    doc.text(toPdfText(val), fx, fy + 5.2);
  });

  y += rowH * 2 + 5;

  // --- OVERVIEW ---
  if (trip.overview) {
    drawSectionHeading("Trip Overview");
    drawParagraph(trip.overview, 9.5);
  }

  const overviewCustom = (trip.customSections ?? []).filter(
    (s) => s.placement === "overview"
  );
  for (const sec of overviewCustom) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.2);
    doc.setTextColor(63, 110, 21);
    doc.text(toPdfText(sec.title), marginX, y);
    y += 5;
    drawParagraph(sec.content, 9.2);
  }

  // --- HIGHLIGHTS ---
  if (trip.highlights.length > 0) {
    drawSectionHeading("Trip Highlights");
    drawBulletList(trip.highlights, "+");
  }

  // --- ITINERARY ---
  if (trip.itinerary.length > 0) {
    drawSectionHeading("Day-by-Day Itinerary");
    if (trip.itineraryIntro) {
      drawParagraph(trip.itineraryIntro, 9.2);
    }

    const unit = trip.days === 1 ? "Stage" : "Day";
    for (const day of trip.itinerary) {
      const stageLabel = formatStageLabel(day.day, unit);
      const dayTitle = `${stageLabel}: ${day.title}`;
      const metaParts = [
        day.altitude > 0 ? `Max Altitude: ${day.altitude.toLocaleString("en-US")} m` : "",
        day.durationHrs ? `Duration: ${day.durationHrs}` : "",
        day.distanceKm ? `Distance: ${day.distanceKm} km` : "",
        day.meals ? `Meals: ${day.meals}` : "",
        day.accommodation ? `Stay: ${day.accommodation}` : "",
      ].filter(Boolean);

      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(28, 25, 23);
      const headLines = doc.splitTextToSize(
        toPdfText(dayTitle),
        contentWidth
      ) as string[];
      for (const hl of headLines) {
        ensureSpace(5);
        doc.text(hl, marginX, y);
        y += 4.6;
      }

      if (metaParts.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(63, 110, 21);
        const metaLines = doc.splitTextToSize(
          toPdfText(metaParts.join("  |  ")),
          contentWidth
        ) as string[];
        for (const ml of metaLines) {
          ensureSpace(4.2);
          doc.text(ml, marginX, y);
          y += 4;
        }
      }

      if (day.note) {
        drawParagraph(day.note, 9, 2);
      } else {
        y += 2;
      }
    }
  }

  // --- INCLUDES ---
  const includeItems =
    trip.includeGroups.length > 0
      ? trip.includeGroups.flatMap((g) => [
          `[${g.title}]`,
          ...g.items.map((item) => `  ${item}`),
        ])
      : trip.includes;

  if (includeItems.length > 0) {
    drawSectionHeading("Cost Includes");
    drawBulletList(includeItems, "+");
  }

  // --- EXCLUDES ---
  const excludeItems =
    trip.excludeGroups.length > 0
      ? trip.excludeGroups.flatMap((g) => [
          `[${g.title}]`,
          ...g.items.map((item) => `  ${item}`),
        ])
      : trip.excludes;

  if (excludeItems.length > 0) {
    drawSectionHeading("Cost Excludes");
    drawBulletList(excludeItems, "x");
  }

  // --- KNOW BEFORE YOU GO & GEAR ---
  const kbyg = (trip.customSections ?? []).filter(
    (s) => s.placement === "know_before_you_go" || s.placement === "bottom"
  );
  if (kbyg.length > 0 || trip.gearList.length > 0) {
    drawSectionHeading("Know Before You Go & Gear Checklist");
    for (const sec of kbyg) {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(28, 25, 23);
      doc.text(toPdfText(sec.title), marginX, y);
      y += 4.8;
      drawParagraph(sec.content, 9);
    }
    if (trip.gearList.length > 0) {
      drawBulletList(trip.gearList, "-");
    }
  }

  // --- FAQS ---
  if (trip.faqs.length > 0) {
    drawSectionHeading("Frequently Asked Questions");
    for (const faq of trip.faqs) {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(28, 25, 23);
      const qLines = doc.splitTextToSize(
        toPdfText(`Q: ${faq.question}`),
        contentWidth
      ) as string[];
      for (const ql of qLines) {
        ensureSpace(4.8);
        doc.text(ql, marginX, y);
        y += 4.5;
      }
      drawParagraph(faq.answer, 9, 2);
    }
  }

  // --- PAGE FOOTERS ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(120, 113, 108);
    doc.text(
      "Brothers Holidays Adventure | Thamel, Kathmandu, Nepal | info@brothersholidays.com",
      marginX,
      pageHeight - 8.5
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 8.5,
      { align: "right" }
    );
  }

  doc.save(`${trip.slug}-itinerary.pdf`);
}
