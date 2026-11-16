export interface Trek {
  id: string;
  slug: string;
  name: string;
  range: string;
  region: string;
  district: string;
  difficulty: "Moderate" | "Strenuous" | "Extreme";
  duration: number; // days
  startPoint: string;
  highestPoint: number; // meters
  highestPointName: string;
  priceFrom: number;
  season: string; // "spring" | "autumn" | "summer"
  seasonLabel: string;
  statusBadge: "Restricted Area" | "Open Trail" | "Technical Route" | "Special Permit Only" | "Moderate High Trail";
  statusColor: "primary" | "tertiary" | "error";
  description: string;
  image: string;
  elevationPoints: {
    start: string;
    mid: string;
    peak: string;
    svgPath: string;
    peakCoords: { x: number; y: number };
  };
}

export const TREKS: Trek[] = [
  {
    id: "langtang",
    slug: "langtang-valley",
    name: "Langtang Valley and Kyanjin Gompa",
    range: "Langtang Himal",
    region: "Rasuwa Region",
    district: "Rasuwa District",
    difficulty: "Moderate",
    duration: 11,
    startPoint: "Syabrubesi start",
    highestPoint: 5150,
    highestPointName: "Kyanjin Ri",
    priceFrom: 1420,
    season: "spring autumn",
    seasonLabel: "Spring & Autumn",
    statusBadge: "Open Trail",
    statusColor: "primary",
    description:
      "Ascend through dense rhododendron into glacial amphitheaters flanked by Langtang Lirung and ice falls. Ancient stone yak pastures and sacred monasteries.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAXV5yHz_kb9tbLee5eOs-BAeRBiDVHui0lDUjOMtpJ9T7VADlH5UjelVSy0IUU5ZmaPnDpNtsd90BCUcomMeqaDuavnV3uzTvFTQXjdhwMV5sD9Ta8B-JRzxZ07AmX0JWt4Z1aGonpUXslZkQpcq75BPBDgRTVPUpLlf6gwMvso9Y42j_C40kyMlwnpMR5bsXV2g3QUIpxtP--aLUBmLjH40wtvLOb7xW303EwU6M",
    elevationPoints: {
      start: "Syabrubesi (1,460m)",
      mid: "Gompa (3,870m)",
      peak: "Kyanjin Ri (4,773m)",
      svgPath: "M 0 36 Q 50 32, 120 22 T 220 12 L 270 5 L 300 12 L 300 40 L 0 40 Z",
      peakCoords: { x: 270, y: 5 },
    },
  },
  {
    id: "manaslu",
    slug: "manaslu-circuit",
    name: "Manaslu Circuit and Larkya La",
    range: "Mansiri Himal",
    region: "Gorkha Region",
    district: "Restricted Area Permit",
    difficulty: "Strenuous",
    duration: 18,
    startPoint: "Soti Khola loop",
    highestPoint: 5106,
    highestPointName: "Larkya Pass",
    priceFrom: 2180,
    season: "autumn spring",
    seasonLabel: "Autumn & Spring",
    statusBadge: "Restricted Area",
    statusColor: "tertiary",
    description:
      "Encircling the eighth-highest peak on Earth. Ancient Tibetan Buddhist monasteries, wild gorges, and an exhilarating crossing of Larkya La.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYmM4zUiLynhmovtO0XnJKpWnhgZ-Dg1ANSEUApYGClwVpwHi8FpA21cSe4RHzi6WEsal2Wu7PleKwCBOLpfEludTrwPH3hTE3ba03Y4a4Rb_xwcDhUhVwuItM1Pq9pBfGuL91j-jwUNLZ33snBKqnnhp3t0HxfPv79AO6owu77piC38CutAa9kRHTd5fF1Ro3RqlsBIO4qfJCxPTxYR9fucf35cpvVES1aGrvxAk",
    elevationPoints: {
      start: "Soti Khola (700m)",
      mid: "Larkya (5,160m)",
      peak: "Bhimthang",
      svgPath: "M 0 35 Q 60 30, 110 24 T 190 12 T 230 4 L 270 28 L 300 32 L 300 40 L 0 40 Z",
      peakCoords: { x: 230, y: 4 },
    },
  },
  {
    id: "annapurna",
    slug: "annapurna-sanctuary",
    name: "Annapurna Sanctuary and Base Camp",
    range: "Annapurna Range",
    region: "Gandaki Region",
    district: "ACAP Reserve",
    difficulty: "Moderate",
    duration: 14,
    startPoint: "Pokhara hub",
    highestPoint: 4130,
    highestPointName: "ABC Basin",
    priceFrom: 1580,
    season: "spring autumn",
    seasonLabel: "Spring & Autumn",
    statusBadge: "Moderate High Trail",
    statusColor: "primary",
    description:
      "Walk into the sacred 360-degree natural fortress enclosed by Annapurna South, Hiunchuli, and the iconic Fish Tail Machapuchare peak.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7CpIGIc_spnCAhyagfmAPGw4EBlH3J9Lz2tVcTzkszas9pc8han5jOl61FdmO9-MhVnqWKjq3y7Wjk-hg92-rjMt40KjSz1BuRTb4aPYy_8464hhzpO21zQbA3gJOCs79-HRG-MN4ax3HGq7HshfxqebH98o3OD2rG7m3FEDRPDF06UxUoFnjG4ZNYpBufTgNXREdJ8rEBQ5zPnz_Agj6VcMAmSRI-adWmVQCknk",
    elevationPoints: {
      start: "Nayapul (1,070m)",
      mid: "Chhomrong (2,170m)",
      peak: "ABC (4,130m)",
      svgPath: "M 0 38 Q 80 34, 150 25 T 240 12 L 285 7 L 300 8 L 300 40 L 0 40 Z",
      peakCoords: { x: 285, y: 7 },
    },
  },
  {
    id: "khumbu",
    slug: "khumbu-glacier-traverse",
    name: "Khumbu Glacier Traverse & Three Passes",
    range: "Sagarmatha Region",
    region: "Khumbu Valley",
    district: "Kongma La, Cho La, Renjo La",
    difficulty: "Strenuous",
    duration: 18,
    startPoint: "Lukla circular",
    highestPoint: 5545,
    highestPointName: "Kala Patthar",
    priceFrom: 2650,
    season: "autumn spring",
    seasonLabel: "Autumn & Spring",
    statusBadge: "Technical Route",
    statusColor: "tertiary",
    description:
      "Cross Kongma La, Cho La, and Renjo La with direct vantages of Everest, Lhotse, Makalu, and pristine cobalt high glacial lakes.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRnFesGA4VBqTUvWVrsvlRDKvR4_bw5RNo0DjVgrVtHRaZ9X352g2JlVJtJKP0_gIcuWT-9ay7qkHDf3TD2HrngjGy0QjCC3LUNFBO5E6bK949HoZ_gpoxy0sb49dqcUSLFbaoFbE2nrl7aDaPWxfCFzmANfYGaspJMrafM-fMGwOoOKPXGvfxanJps-iJoXR0N4Nf2RYhZRrTszVW-JeLTtnoHS7bSji8SEcALMU",
    elevationPoints: {
      start: "Lukla (2,840m)",
      mid: "Cho La (5,420m)",
      peak: "Kala Patthar (5,545m)",
      svgPath: "M 0 34 Q 40 28, 90 20 T 170 7 T 230 14 T 275 3 L 300 18 L 300 40 L 0 40 Z",
      peakCoords: { x: 275, y: 3 },
    },
  },
  {
    id: "mustang",
    slug: "upper-mustang",
    name: "Upper Mustang Desert Traverse",
    range: "Kingdom of Lo",
    region: "Mustang Rainshadow",
    district: "Lo Manthang Walled Realm",
    difficulty: "Moderate",
    duration: 16,
    startPoint: "Jomsom outbound",
    highestPoint: 3820,
    highestPointName: "Lo Manthang",
    priceFrom: 3890,
    season: "spring autumn summer",
    seasonLabel: "Spring, Summer & Autumn",
    statusBadge: "Special Permit Only",
    statusColor: "tertiary",
    description:
      "Isolated trans-Himalayan rain shadow. Ancient Tibetan monasteries, cave frescoes, and the citadel of Lo Manthang.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAaYBWdjQLK6NVyyNIbPCir52FyBFq22oRbt9wNnKCx7-xdbna5GUMRFCbdXPi4_bwgIWtVWo_hZa9VsrKJQHWWDTBc1yC5Y0oHabgY9KXrMdhAwv8l5jIfe0tlTRLxzG-CoHG75onF73REFNkD4kCmucDADZXlJ9Pg9oE7FgGP5G1gYs89WuOkp9W3S0wqVe2LEVOasNNlLVXkYM9cxTQmX0NE7OkFKNx2qu-XQJ8",
    elevationPoints: {
      start: "Jomsom (2,720m)",
      mid: "Charang (3,560m)",
      peak: "Lo Manthang (3,820m)",
      svgPath: "M 0 36 Q 70 30, 130 18 T 210 14 T 260 5 L 300 24 L 300 40 L 0 40 Z",
      peakCoords: { x: 260, y: 5 },
    },
  },
  {
    id: "makalu",
    slug: "makalu-base-camp",
    name: "Makalu Base Camp and Sherpa Valleys",
    range: "Barun Valley",
    region: "Wilderness Reserve",
    district: "Sankhuwasabha",
    difficulty: "Strenuous",
    duration: 22,
    startPoint: "Num trailhead",
    highestPoint: 4870,
    highestPointName: "Makalu BC",
    priceFrom: 2950,
    season: "autumn spring",
    seasonLabel: "Autumn & Spring",
    statusBadge: "Restricted Area",
    statusColor: "tertiary",
    description:
      "Granite cliffs, pristine cloud forests, and alpine meadows leading to the soaring base of Makalu (8,485m).",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHgaDXVnvkFqf6S29lIg411jfuBFI7vnxwyKH5Uxdk35hyM4alm3tHhmMactGUlHnT1QwozFRE0wm5ZBgV5UTnp4h3sslWBjS0ZXjI9CEak_EQENDHNki2b0jcJzTFp1LF8WSyfwfocY416zEXiLwBsS6smRZbfH61PyO_08-F-waEN9iodSlfV2nw8ZqTXY87KsEVmtoG4Us0vbNTdUMn9ZpoNICqZhGhK5ZodN8",
    elevationPoints: {
      start: "Num (1,560m)",
      mid: "Shipton La (4,216m)",
      peak: "Makalu BC (4,870m)",
      svgPath: "M 0 36 Q 60 30, 120 20 T 210 10 L 260 4 L 300 16 L 300 40 L 0 40 Z",
      peakCoords: { x: 260, y: 4 },
    },
  },
  {
    id: "kanchenjunga",
    slug: "kanchenjunga-traverse",
    name: "Kanchenjunga North to South Traverse",
    range: "Eastern Himalayas",
    region: "Taplejung",
    district: "Far Eastern District",
    difficulty: "Strenuous",
    duration: 26,
    startPoint: "Suketar transit",
    highestPoint: 5143,
    highestPointName: "Pangpema",
    priceFrom: 3450,
    season: "autumn spring",
    seasonLabel: "Autumn & Spring",
    statusBadge: "Special Permit Only",
    statusColor: "tertiary",
    description:
      "Remote wilderness beneath the world's third highest mountain. Lush sub-tropical valleys climbing to the Pangpema north face camp.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsW12hPMp1m5ESdxj9TKAFlb4YQ10XQmON9G-EMgERTPvFa4TzVSwO9RDTlB-4f4jionFC00Fpbm_I8nY6vpPyRAWj4UfMi_xDihUTmOD5ndTBBMzur77g3XLr7_QdSZp3aHegYxBnDxYzgcrXXmAytso_ZNutmW2ePrqnner8sCnhH9CjnKMzobPyn-s76gQydBqEbz2HBtN_j7__rhEV5gV0EkoepBqBw_0elqQ",
    elevationPoints: {
      start: "Suketar (2,420m)",
      mid: "Ghunsa (3,595m)",
      peak: "Pangpema (5,143m)",
      svgPath: "M 0 35 Q 50 28, 110 18 T 200 12 L 270 4 L 300 18 L 300 40 L 0 40 Z",
      peakCoords: { x: 270, y: 4 },
    },
  },
  {
    id: "rara",
    slug: "rara-lake-western-wilderness",
    name: "Rara Lake and Western Wilderness",
    range: "Karnali Province",
    region: "Mugu Alpine Basin",
    district: "Mugu District",
    difficulty: "Moderate",
    duration: 12,
    startPoint: "Talcha flight",
    highestPoint: 3710,
    highestPointName: "Chuchemara",
    priceFrom: 1890,
    season: "spring autumn",
    seasonLabel: "Spring & Autumn",
    statusBadge: "Open Trail",
    statusColor: "primary",
    description:
      "Untouched pine forests and azure waters of Nepal's largest high-altitude lake surrounded by snow-dusted peaks in western Nepal.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0WdO3aNvDTbHpd3yj8IPR1S1WPBoqVZ3crH7zUmNvtHg1tFPoWMTLE039zU1jK7qQ-093AABicY7WgJGhewNERhJ7yAqB5mAJHmJ8TnWYiyCY-e9Bkr4mrrNR1FyZ4lLatbg4hwmTRy_lsIHQA8O49BwnOOOf9ZNEHdVX_KKvvKmsZFYEboCoUQ6BEFz8bXu9WsmzGyWwMgYs0cVZWOz5xPbGV_sK31RbpDmBe5A",
    elevationPoints: {
      start: "Jumla (2,370m)",
      mid: "Rara (2,990m)",
      peak: "Chuchemara (3,710m)",
      svgPath: "M 0 38 Q 60 30, 140 22 T 240 14 L 280 8 L 300 16 L 300 40 L 0 40 Z",
      peakCoords: { x: 280, y: 8 },
    },
  },
  {
    id: "dhaulagiri",
    slug: "dhaulagiri-circuit",
    name: "Dhaulagiri Circuit High Col",
    range: "Dhaulagiri Massif",
    region: "Myagdi Region",
    district: "French & Dhampus Pass",
    difficulty: "Extreme",
    duration: 19,
    startPoint: "Beni departure",
    highestPoint: 5360,
    highestPointName: "French Pass",
    priceFrom: 2890,
    season: "autumn",
    seasonLabel: "Autumn Only",
    statusBadge: "Technical Route",
    statusColor: "error",
    description:
      "A raw, demanding high-altitude circuit over French Pass (5,360m) and Dhampus Pass (5,244m) through the desolate Hidden Valley.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvbh81Kb4cHxfDPx8Q6qDcmK7Z7leetLPcy-ZKb49BGn7c8lr1_YHa9Al7kXw7eLIUMGjvPlmvOYe2aWgRy3ooNzwmyy9yEG30f6y1DyP0NOEMLbQlPImhQoGEPIfk7V-ueagbmUktx54dysOH-QcE5Ch0Em2eRY1tBxDoz_lJexCmB0HM_WGMlv_sxC_1jJ_r5zG4b8Fsaf1FbAdbAEwsYk6tZNSFc9hSp3TzV1M",
    elevationPoints: {
      start: "Beni (830m)",
      mid: "Italian BC (3,660m)",
      peak: "French Pass (5,360m)",
      svgPath: "M 0 38 Q 40 32, 100 24 T 180 14 L 250 4 L 300 18 L 300 40 L 0 40 Z",
      peakCoords: { x: 250, y: 4 },
    },
  },
  {
    id: "gokyo",
    slug: "gokyo-lakes-renjo-la",
    name: "Gokyo Lakes and Renjo La",
    range: "Sagarmatha Zone",
    region: "Khumbu",
    district: "Ngozumpa Glacier",
    difficulty: "Strenuous",
    duration: 15,
    startPoint: "Namche branch",
    highestPoint: 5360,
    highestPointName: "Gokyo Ri",
    priceFrom: 2280,
    season: "autumn spring",
    seasonLabel: "Autumn & Spring",
    statusBadge: "Open Trail",
    statusColor: "primary",
    description:
      "Pristine turquoise glacial lakes beneath Cho Oyu, climbing Gokyo Ri and traversing the dramatic panoramic Renjo La pass.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRnFesGA4VBqTUvWVrsvlRDKvR4_bw5RNo0DjVgrVtHRaZ9X352g2JlVJtJKP0_gIcuWT-9ay7qkHDf3TD2HrngjGy0QjCC3LUNFBO5E6bK949HoZ_gpoxy0sb49dqcUSLFbaoFbE2nrl7aDaPWxfCFzmANfYGaspJMrafM-fMGwOoOKPXGvfxanJps-iJoXR0N4Nf2RYhZRrTszVW-JeLTtnoHS7bSji8SEcALMU",
    elevationPoints: {
      start: "Lukla (2,840m)",
      mid: "Gokyo (4,750m)",
      peak: "Renjo La (5,360m)",
      svgPath: "M 0 35 Q 50 30, 110 20 T 200 12 L 270 5 L 300 16 L 300 40 L 0 40 Z",
      peakCoords: { x: 270, y: 5 },
    },
  },
];
