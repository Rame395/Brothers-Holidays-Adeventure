export interface Objective {
  id: string;
  name: string;
  region: string;
  permit: string;
  band: "8,000m Band" | "7,000m Band" | "6,000m Band";
  bandType: "death-zone" | "high-alpine" | "acclimatization";
  elevation: number; // meters
  elevationFt: string;
  season: string;
  seasonSub: string;
  route: string;
  specs: string;
  guideRatio: string;
  guideSpecs: string;
  image?: string;
  icon?: string;
}

export const EXPEDITION_OBJECTIVES: Objective[] = [
  {
    id: "manaslu",
    name: "Manaslu",
    region: "Gorkha Massif",
    permit: "Permit: NMA Tier A Restricted",
    band: "8,000m Band",
    bandType: "death-zone",
    elevation: 8163,
    elevationFt: "26,781 ft",
    season: "Sep to Oct",
    seasonSub: "Post-Monsoon Stable",
    route: "Northeast Face",
    specs: "Grade IV / Sustained snow slopes, crevasse mazes C1 to C3",
    guideRatio: "1:1 Ratio",
    guideSpecs: "IFMGA Lead + O₂ Cylinders (4x)",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHgaDXVnvkFqf6S29lIg411jfuBFI7vnxwyKH5Uxdk35hyM4alm3tHhmMactGUlHnT1QwozFRE0wm5ZBgV5UTnp4h3sslWBjS0ZXjI9CEak_EQENDHNki2b0jcJzTFp1LF8WSyfwfocY416zEXiLwBsS6smRZbfH61PyO_08-F-waEN9iodSlfV2nw8ZqTXY87KsEVmtoG4Us0vbNTdUMn9ZpoNICqZhGhK5ZodN8",
  },
  {
    id: "ama-dablam",
    name: "Ama Dablam",
    region: "Khumbu Valley",
    permit: "Permit: Sagarmatha National Park",
    band: "8,000m Band",
    bandType: "high-alpine",
    elevation: 6812,
    elevationFt: "22,349 ft",
    season: "Oct to Nov",
    seasonSub: "Autumn Window",
    route: "Southwest Ridge",
    specs: "Grade V / Mixed 5.7 Rock, 80° Ice Dablam headwall",
    guideRatio: "1:1 Ratio",
    guideSpecs: "Technical Sherpa + Camp 2 High Bivouac",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsW12hPMp1m5ESdxj9TKAFlb4YQ10XQmON9G-EMgERTPvFa4TzVSwO9RDTlB-4f4jionFC00Fpbm_I8nY6vpPyRAWj4UfMi_xDihUTmOD5ndTBBMzur77g3XLr7_QdSZp3aHegYxBnDxYzgcrXXmAytso_ZNutmW2ePrqnner8sCnhH9CjnKMzobPyn-s76gQydBqEbz2HBtN_j7__rhEV5gV0EkoepBqBw_0elqQ",
  },
  {
    id: "baruntse",
    name: "Baruntse",
    region: "Makalu Barun Region",
    permit: "Permit: Wilderness Peak Entry",
    band: "8,000m Band",
    bandType: "high-alpine",
    elevation: 7129,
    elevationFt: "23,389 ft",
    season: "Apr to May",
    seasonSub: "Pre-Monsoon Thermal",
    route: "Southeast Ridge",
    specs: "Grade IV / Knife-edge wind cornices, icefall navigation",
    guideRatio: "1:1 Ratio",
    guideSpecs: "Full Expedition Sherpa Support",
    icon: "landscape",
  },
  {
    id: "mera-peak",
    name: "Mera Peak",
    region: "Hinku Valley",
    permit: "Permit: NMA Group B",
    band: "7,000m Band",
    bandType: "acclimatization",
    elevation: 6476,
    elevationFt: "21,247 ft",
    season: "Oct to Apr",
    seasonSub: "Extended Autumn/Spring",
    route: "Standard Route",
    specs: "Grade II / Moderate non-technical glacier crossing, high altitude ramp",
    guideRatio: "1:2 Ratio",
    guideSpecs: "Glacier Guide + High Camp Cook",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0WdO3aNvDTbHpd3yj8IPR1S1WPBoqVZ3crH7zUmNvtHg1tFPoWMTLE039zU1jK7qQ-093AABicY7WgJGhewNERhJ7yAqB5mAJHmJ8TnWYiyCY-e9Bkr4mrrNR1FyZ4lLatbg4hwmTRy_lsIHQA8O49BwnOOOf9ZNEHdVX_KKvvKmsZFYEboCoUQ6BEFz8bXu9WsmzGyWwMgYs0cVZWOz5xPbGV_sK31RbpDmBe5A",
  },
  {
    id: "island-peak",
    name: "Island Peak",
    region: "Chhukung Glacier",
    permit: "Permit: Imja Valley Climber Pass",
    band: "7,000m Band",
    bandType: "acclimatization",
    elevation: 6189,
    elevationFt: "20,305 ft",
    season: "Mar to May",
    seasonSub: "Spring Acclimatization",
    route: "Imja Tse Glacier",
    specs: "Grade II+ / Rock scramble to 45° summit headwall ice fixed rope",
    guideRatio: "1:2 Ratio",
    guideSpecs: "NMA Certified Alpine Guide",
    icon: "downhill_skiing",
  },
  {
    id: "lobuche-east",
    name: "Lobuche East",
    region: "Everest Highway",
    permit: "Permit: Khumbu Pasang Lhamu",
    band: "7,000m Band",
    bandType: "acclimatization",
    elevation: 6119,
    elevationFt: "20,075 ft",
    season: "Apr to May",
    seasonSub: "Spring Window",
    route: "South Ridge",
    specs: "Grade III / Dark slab climbing, exposed knife-edge snow ridge",
    guideRatio: "1:2 Ratio",
    guideSpecs: "Lead Climbing Guide",
    icon: "filter_hdr",
  },
];
