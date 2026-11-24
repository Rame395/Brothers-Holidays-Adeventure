import type { TripServiceGroupDTO } from "./types";

export const HERO_IMAGE_PRESETS: { label: string; url: string }[] = [
  { label: "Everest Panorama", url: "/images/trips/everest.jpg" },
  { label: "Ama Dablam Alpine", url: "/images/trips/hero-ama-dablam.jpg" },
  { label: "Annapurna Sanctuary", url: "/images/trips/annapurna.jpg" },
  { label: "Langtang Valley", url: "/images/trips/langtang.jpg" },
  { label: "Manaslu Circuit", url: "/images/trips/manaslu.jpg" },
  { label: "Upper Mustang", url: "/images/trips/mustang.jpg" },
  { label: "Gokyo Lakes", url: "/images/trips/gokyo.jpg" },
  { label: "Kanchenjunga Wilderness", url: "/images/trips/kanchenjunga.jpg" },
  { label: "Tibet Roof of World", url: "/images/trips/tibet.jpg" },
  { label: "Bhutan Tiger's Nest", url: "/images/trips/bhutan.jpg" },
  { label: "Peak Climbing Ice Ridge", url: "/images/trips/peak.jpg" },
  { label: "Helicopter Tour Flight", url: "/images/trips/helicopter.jpg" },
  { label: "Chitwan Wildlife Safari", url: "/images/trips/safari.jpg" },
  { label: "Kathmandu Heritage", url: "/images/trips/kathmandu.jpg" },
  { label: "Himalayan Foothills", url: "/images/trips/foothills.jpg" },
  { label: "Gosainkunda Alpine Lakes", url: "/images/trips/gosainkunda.jpg" },
];

export const DEFAULT_INCLUDES_TEMPLATE: string[] = [
  "Airport transfers in Kathmandu by private vehicle upon arrival and departure",
  "3 nights star-rated hotel accommodation in Kathmandu with breakfast",
  "Licensed, English-speaking government-certified Sherpa trek leader",
  "Porters to carry main duffel baggage (1 porter for every 2 trekkers, max 12 kg each)",
  "All required trekking permits, TIMS card, and National Park / Conservation entry fees",
  "Full-board teahouse accommodation and 3 hot meals daily (Breakfast, Lunch, Dinner) on the trail",
  "Comprehensive wilderness first-aid medical kit & pulse oximeter carried by guide",
  "Warm sleeping bag and down jacket provided on loan for the trek",
  "All government taxes, VAT, and official logistics documentation",
];

export const DEFAULT_EXCLUDES_TEMPLATE: string[] = [
  "International airfare to and from Tribhuvan International Airport, Kathmandu",
  "Nepal entry visa fees (issued on arrival at Kathmandu airport)",
  "Comprehensive travel & high-altitude helicopter evacuation insurance (mandatory)",
  "Lunch and dinner while staying in Kathmandu",
  "Personal trail expenses: hot showers, battery charging, Wi-Fi, bottled water & snacks",
  "Alcoholic beverages, soft drinks, and espresso-bar drinks along the trail",
  "Extra hotel nights in Kathmandu due to early arrival, late departure, or flight delays",
  "Tips and gratuities for guides, assistant guides, and porters",
];

export const DEFAULT_GEAR_TEMPLATE: string[] = [
  "Permits & Insurance: Carry 4 passport-size photos, passport copy, and emergency helicopter evacuation coverage up to 6,000m",
  "Layered Clothing: Moisture-wicking thermal base layers, insulated fleece mid-layer, waterproof Gore-Tex shell jacket & trekking pants",
  "Footwear: Broken-in waterproof high-ankle trekking boots, wool trekking socks, and camp sandals/sneakers",
  "High-Altitude Protection: Warm down jacket (-15°C rated), beanie, neck gaiter/buff, waterproof gloves, and UV400 polarized sunglasses",
  "Trail Hardware: Adjustable trekking poles, 35–40L daypack with rain cover, headlamp with spare batteries, and 2x 1L insulated water bottles",
  "Health & Acclimatization: Diamox (consult your physician), water purification tablets/filter, SPF 50+ sunscreen, blister plasters, and personal first-aid",
  "Electronics: 20,000 mAh power bank (teahouse charging incurs small solar fees at altitude) and Type C/D travel adapter",
];

export const DEFAULT_FAQS_TEMPLATE: { question: string; answer: string }[] = [
  {
    question: "How physically fit do I need to be for this trek?",
    answer:
      "You should be comfortable walking 5 to 7 hours per day on uneven stone staircases and mountain trails carrying a light daypack (5–6 kg). Building cardio stamina with brisk hikes, stair climbing, or jogging 6–8 weeks prior is ideal.",
  },
  {
    question: "How do you manage altitude acclimatization and safety?",
    answer:
      "Our itineraries follow gradual ascent profiles with dedicated rest and acclimatization hikes. Guides carry calibrated pulse oximeters to monitor oxygen saturation twice daily, first-aid supplies, and coordinate immediate satellite evacuation if needed.",
  },
  {
    question: "What kind of accommodation and food are provided on the trail?",
    answer:
      "Along the trail you stay in the best available locally run mountain teahouses (twin-share heated dining hall rooms, attached baths at lower elevations). Freshly cooked hot meals include Dal Bhat, noodles, soups, pasta, pancakes, and warm drinks.",
  },
  {
    question: "What happens if domestic mountain flights are delayed by weather?",
    answer:
      "Mountain weather around airstrips like Lukla or Jomsom can cause delays. We always recommend keeping 1–2 buffer days at the end of your international flight schedule, and our Thamel operations desk prioritizes rebooking or optional helicopter transfers.",
  },
];

export const DEFAULT_INCLUDE_GROUPS_TEMPLATE: TripServiceGroupDTO[] = [
  {
    id: "inc-accommodation",
    title: "Accommodations",
    icon: "accommodation",
    subtitle: "Hotel stays in Kathmandu & twin-share mountain teahouses",
    items: [
      "Hotel accommodation in Kathmandu with buffet breakfast as per itinerary",
      "Free Wi-Fi in Kathmandu hotel",
      "Best available mountain teahouse / lodge accommodation along the trail",
    ],
  },
  {
    id: "inc-meals",
    title: "Meals During the Trek",
    icon: "meals",
    subtitle: "Freshly prepared hot meals chosen daily from the teahouse menu",
    items: [
      "Daily Breakfast, Lunch & Dinner during the trek with hot tea/coffee",
      "Welcome dinner in Kathmandu with our expedition team",
    ],
  },
  {
    id: "inc-transport",
    title: "Ground Transportation & Domestic Flights",
    icon: "transport",
    subtitle: null,
    items: [
      "International airport pick-up and drop-off by private vehicle",
      "Private vehicle / domestic flight transfers to and from trek start point",
      "All domestic airport taxes and passenger handling",
    ],
  },
  {
    id: "inc-guide",
    title: "Trekking Guide & Porters",
    icon: "guide",
    subtitle: null,
    items: [
      "Licensed, government-certified English-speaking Sherpa trek leader",
      "Strong porters to carry main duffel baggage (1 porter per 2 trekkers)",
      "Guide and porter salaries, meals, lodging, transport, and insurance covered",
    ],
  },
  {
    id: "inc-equipment",
    title: "Equipment for the Trek",
    icon: "equipment",
    subtitle: null,
    items: [
      "Complimentary water-resistant trekking duffel bag",
      "Warm down jacket and sleeping bag provided on loan for the trek",
      "Route map and BROS Holidays souvenir",
    ],
  },
  {
    id: "inc-permits",
    title: "Permits & Company Support",
    icon: "support",
    subtitle: null,
    items: [
      "All required trekking permits, TIMS card, and National Park / Conservation entry fees",
      "24/7 emergency coordination, pre-trip briefing, and medical first-aid kit with pulse oximeter",
    ],
  },
];

export const DEFAULT_EXCLUDE_GROUPS_TEMPLATE: TripServiceGroupDTO[] = [
  {
    id: "exc-drinks",
    title: "Drinks & Trail Extras",
    icon: "meals",
    subtitle: null,
    items: [
      "Hard and soft drinks, espresso coffee, and bottled beverages",
      "Hot showers, battery charging, and Wi-Fi at higher mountain teahouses",
    ],
  },
  {
    id: "exc-ktm",
    title: "Accommodation & Meals in Kathmandu",
    icon: "accommodation",
    subtitle: null,
    items: [
      "Lunch and dinner while staying in Kathmandu",
      "Extra hotel nights caused by early return, late departure, or flight weather delays",
    ],
  },
  {
    id: "exc-travel",
    title: "International Travel & Insurance",
    icon: "permits",
    subtitle: null,
    items: [
      "International airfare to and from Kathmandu",
      "Nepal entry visa fees (issued on arrival)",
      "Travel and high-altitude emergency helicopter evacuation insurance (mandatory)",
    ],
  },
  {
    id: "exc-personal",
    title: "Personal Expenses & Gratuities",
    icon: "support",
    subtitle: null,
    items: [
      "Personal trekking gear, snacks, and souvenirs",
      "Tips and gratuities for guides, assistant guides, and porters",
    ],
  },
];

export const KNOW_BEFORE_YOU_GO_PRESETS: {
  label: string;
  title: string;
  content: string;
}[] = [
  {
    label: "Best Season",
    title: "Best Season for This Trek",
    content:
      "Spring (March–May) and autumn (September–November) offer the clearest mountain views and most comfortable daytime trail temperatures.\n\n## Spring (March to May)\n\nWarming valley temperatures bring bright morning skies and blooming rhododendron forests along lower ridges. Afternoon clouds occasionally roll in near high camps, while **April and May** offer reliable summit and pass weather.\n\n## Autumn (September to November)\n\nPost-monsoon air leaves Himalayan horizons razor sharp with mild days and crisp starry nights. This is the most popular trekking window, so early teahouse and flight booking is recommended.\n\n## Winter & Monsoon\n\nDecember–February brings quiet trails and cold nights below freezing above 3,500m, while June–August brings afternoon showers in lower valleys.",
  },
  {
    label: "Altitude & Acclimatization",
    title: "Altitude Sickness & Acclimatization Guide",
    content:
      "Gradual ascent is the safest way to enjoy high-altitude Himalayan passes without rushing your body.\n\n## Our Acclimatization Protocol\n\n- Scheduled rest days with short **\"climb high, sleep low\"** ridge walks\n- Twice-daily oxygen saturation checks using calibrated pulse oximeters carried by your guide\n- Unhurried trekking pace with generous hydration stops\n\n## Everyday Prevention Tips\n\nDrink **3 to 4 litres of fluids daily**, prioritize carbohydrate-rich warm meals, avoid alcohol at altitude, and tell your guide immediately if you notice a persistent headache, dizziness, or poor appetite.",
  },
  {
    label: "Permits & Entry Rules",
    title: "Trekking Permits & Entry Requirements",
    content:
      "All mandatory national park, conservation area, and local municipality permits are handled by our Kathmandu operations team prior to your departure.\n\n## Required Documents\n\n- Original passport with at least **6 months remaining validity** and a valid Nepal visa\n- 2 recent passport-sized photographs (digital or print)\n- Travel insurance policy certificate covering **emergency helicopter evacuation above 4,500m**\n\nRestricted-area corridors require additional special permits arranged exclusively through a registered Nepali trekking agency.",
  },
  {
    label: "Teahouses & Food",
    title: "Accommodation, Meals & Drinking Water",
    content:
      "You stay in locally run mountain teahouses offering warm hospitality, twin-share rooms, and wood- or yak-dung-heated communal dining rooms in the evenings.\n\n## Meals Along the Trail\n\n- Freshly prepared **Breakfast, Lunch & Dinner** ordered daily from the teahouse menu\n- Classic Sherpa & Nepali staples like **Dal Bhat**, garlic soup, momos, noodle stir-fries, oatmeal, and eggs\n- Vegetarian, vegan, and basic gluten-free preferences easily accommodated\n\n## Safe Drinking Water\n\nCarry two 1-litre reusable insulated bottles; boiled drinking water is available at every lodge, or purify tap/spring water with SteriPEN, filter bottles, or chlorine dioxide drops.",
  },
  {
    label: "Fitness & Preparation",
    title: "Physical Fitness & Training Preparation",
    content:
      "You do not need technical mountaineering skills for standard trekking routes, though solid aerobic endurance turns long uphill days into a pleasure.\n\n## Recommended 6–8 Week Routine\n\n- Brisk **45–60 minute cardio sessions** (hill walks, stair climbing, cycling, or jogging) 3–4 times per week\n- Weekend day hikes carrying a **5–7 kg daypack** to break in your trekking boots and test your layering system\n\nOn the trail you typically walk **5 to 7 hours per day** at a steady conversational rhythm.",
  },
  {
    label: "Insurance & Flights",
    title: "Travel Insurance & Domestic Flight Buffer",
    content:
      "Comprehensive travel and high-altitude evacuation coverage is compulsory on every Himalayan itinerary.\n\n## What Your Policy Must Cover\n\n- Emergency **helicopter search, rescue, and medical evacuation** up to your trek's maximum elevation (at least 6,000m for base camp and high-pass routes)\n- Trip cancellation, medical hospitalization, and weather-delay expenses\n\n## Domestic Mountain Flight Buffer\n\nSTOL airstrips such as Lukla and Jomsom depend strictly on clear visual flying conditions. We strongly advise scheduling **1 to 2 extra buffer days** in Kathmandu before your international return flight.",
  },
];

export function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
