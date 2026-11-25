export type SeoCheckStatus = "pass" | "warn" | "fail";

export interface SeoCheckItem {
  id: string;
  label: string;
  status: SeoCheckStatus;
  points: number;
  maxPoints: number;
  hint: string;
}

export interface SeoAnalysisResult {
  score: number;
  grade: "Poor" | "Needs Work" | "Good" | "Excellent";
  wordCount: number;
  readingMinutes: number;
  keywordDensity: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  checks: SeoCheckItem[];
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(html: string): string {
  return decodeBasicEntities(
    html
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/blockquote|\/tr)\b[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function countOccurrences(haystackLower: string, needleLower: string): number {
  if (!needleLower) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = haystackLower.indexOf(needleLower, pos)) !== -1) {
    count++;
    pos += needleLower.length;
  }
  return count;
}

export function analyzeRegionSeo(params: {
  name: string;
  slug: string;
  focusKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  htmlContent?: string | null;
}): SeoAnalysisResult {
  const kw = (params.focusKeyword ?? "").trim();
  const kwLower = kw.toLowerCase();
  const effectiveTitle = (params.metaTitle ?? "").trim() || `${params.name} Treks & Routes`;
  const effectiveDesc = (params.metaDescription ?? "").trim();
  const html = params.htmlContent ?? "";

  const plainText = stripTags(html);
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  // Headings (H2 / H3)
  const headingMatches = [...html.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const headingTexts = headingMatches.map((m) => stripTags(m[2]));
  const headingCount = headingTexts.length;

  // Links & Images
  const linkCount = (html.match(/<a\b[^>]*href\s*=/gi) ?? []).length;
  const imgMatches = [...html.matchAll(/<img\b([^>]*)>/gi)];
  const imageCount = imgMatches.length;
  const imagesWithAlt = imgMatches.filter((m) =>
    /\balt\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i.test(m[1] ?? "")
  ).length;

  // Keyword metrics
  const plainLower = plainText.toLowerCase();
  const kwWordCount = kwLower ? kwLower.split(/\s+/).filter(Boolean).length : 0;
  const kwOccurrences = kwLower ? countOccurrences(plainLower, kwLower) : 0;
  const keywordDensity =
    wordCount > 0 && kwOccurrences > 0
      ? Number((((kwOccurrences * Math.max(1, kwWordCount)) / wordCount) * 100).toFixed(2))
      : 0;

  const introText = words.slice(0, 120).join(" ").toLowerCase();
  const kwInIntroOrHeading =
    Boolean(kwLower) &&
    (introText.includes(kwLower) ||
      headingTexts.some((h) => h.toLowerCase().includes(kwLower)));

  const checks: SeoCheckItem[] = [];

  // 1. Focus Keyword set (10)
  checks.push({
    id: "focus-keyword",
    label: "Focus keyword defined",
    status: kw.length >= 3 ? "pass" : "fail",
    points: kw.length >= 3 ? 10 : 0,
    maxPoints: 10,
    hint:
      kw.length >= 3
        ? `Targeting "${kw}".`
        : "Set a target focus keyword (e.g., \"Annapurna Base Camp Trek\").",
  });

  // 2. Meta Title length 45-65 (10)
  const titleLen = (params.metaTitle ?? "").trim().length;
  const titleLenPts =
    titleLen >= 45 && titleLen <= 65
      ? 10
      : titleLen >= 30 && titleLen <= 75
      ? 6
      : titleLen > 0
      ? 3
      : 0;
  checks.push({
    id: "meta-title-len",
    label: "Meta title length (45–65 chars)",
    status: titleLenPts === 10 ? "pass" : titleLenPts > 0 ? "warn" : "fail",
    points: titleLenPts,
    maxPoints: 10,
    hint:
      titleLen === 0
        ? "Add a custom Meta Title (currently falling back to region name)."
        : `${titleLen} characters (ideal is 45–65).`,
  });

  // 3. Focus Keyword in Meta Title (10)
  const kwInTitle = Boolean(kwLower) && effectiveTitle.toLowerCase().includes(kwLower);
  checks.push({
    id: "kw-in-title",
    label: "Focus keyword in meta title",
    status: kwInTitle ? "pass" : "fail",
    points: kwInTitle ? 10 : 0,
    maxPoints: 10,
    hint: kwInTitle
      ? "Focus keyword appears in the SEO title."
      : "Include your focus keyword inside the Meta Title.",
  });

  // 4. Meta Description length 120-165 (10)
  const descLen = effectiveDesc.length;
  const descLenPts =
    descLen >= 120 && descLen <= 165
      ? 10
      : descLen >= 80 && descLen <= 185
      ? 6
      : descLen > 0
      ? 3
      : 0;
  checks.push({
    id: "meta-desc-len",
    label: "Meta description length (120–165 chars)",
    status: descLenPts === 10 ? "pass" : descLenPts > 0 ? "warn" : "fail",
    points: descLenPts,
    maxPoints: 10,
    hint:
      descLen === 0
        ? "Write a compelling Meta Description for search results."
        : `${descLen} characters (ideal is 120–165).`,
  });

  // 5. Focus Keyword in Meta Description (10)
  const kwInDesc = Boolean(kwLower) && effectiveDesc.toLowerCase().includes(kwLower);
  checks.push({
    id: "kw-in-desc",
    label: "Focus keyword in meta description",
    status: kwInDesc ? "pass" : "fail",
    points: kwInDesc ? 10 : 0,
    maxPoints: 10,
    hint: kwInDesc
      ? "Focus keyword appears in the Meta Description."
      : "Mention your focus keyword naturally in the Meta Description.",
  });

  // 6. Content word count (15)
  const wordPts =
    wordCount >= 500 ? 15 : wordCount >= 300 ? 10 : wordCount >= 100 ? 4 : 0;
  checks.push({
    id: "word-count",
    label: "Long-form SEO depth (500+ words)",
    status: wordPts === 15 ? "pass" : wordPts >= 10 ? "warn" : "fail",
    points: wordPts,
    maxPoints: 15,
    hint: `${wordCount} words written (300+ good, 500+ optimal for regional guides).`,
  });

  // 7. Structured H2 / H3 headings (10)
  const headingPts = headingCount >= 2 ? 10 : headingCount === 1 ? 5 : 0;
  checks.push({
    id: "headings",
    label: "Structured H2 / H3 headings",
    status: headingPts === 10 ? "pass" : headingPts > 0 ? "warn" : "fail",
    points: headingPts,
    maxPoints: 10,
    hint:
      headingCount >= 2
        ? `${headingCount} subheadings structure the article cleanly.`
        : "Use at least 2 H2 or H3 subheadings to organize sections.",
  });

  // 8. Focus Keyword in intro or heading (10)
  checks.push({
    id: "kw-intro-heading",
    label: "Keyword in intro or subheading",
    status: kwInIntroOrHeading ? "pass" : "fail",
    points: kwInIntroOrHeading ? 10 : 0,
    maxPoints: 10,
    hint: kwInIntroOrHeading
      ? "Focus keyword appears early or inside a section heading."
      : "Use your focus keyword in the opening paragraph or an H2/H3 heading.",
  });

  // 9. Keyword density 0.5% - 3.0% (5)
  const densityPts =
    keywordDensity >= 0.5 && keywordDensity <= 3.0
      ? 5
      : keywordDensity > 0 && keywordDensity <= 4.0
      ? 3
      : 0;
  checks.push({
    id: "kw-density",
    label: "Healthy keyword density (0.5%–3.0%)",
    status: densityPts === 5 ? "pass" : densityPts > 0 ? "warn" : "fail",
    points: densityPts,
    maxPoints: 5,
    hint:
      kwLower && wordCount > 0
        ? `Density is ${keywordDensity}% (${kwOccurrences} matches).`
        : "Add your focus keyword naturally across the article.",
  });

  // 10. Links or images with alt text (10)
  let mediaPts = 0;
  if (linkCount > 0 && imagesWithAlt > 0) mediaPts = 10;
  else if (linkCount > 0 || imagesWithAlt > 0) mediaPts = 6;
  else if (imageCount > 0) mediaPts = 2;
  checks.push({
    id: "links-images",
    label: "Internal links & images with alt text",
    status: mediaPts === 10 ? "pass" : mediaPts >= 6 ? "warn" : "fail",
    points: mediaPts,
    maxPoints: 10,
    hint:
      mediaPts === 10
        ? `${linkCount} link(s) and ${imagesWithAlt} captioned image(s).`
        : "Add at least 1 helpful link and 1 image with alt text inside the article.",
  });

  const score = checks.reduce((sum, item) => sum + item.points, 0);
  const grade: SeoAnalysisResult["grade"] =
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Good"
      : score >= 35
      ? "Needs Work"
      : "Poor";

  return {
    score,
    grade,
    wordCount,
    readingMinutes,
    keywordDensity,
    headingCount,
    linkCount,
    imageCount,
    checks,
  };
}
