export interface ArchiveEntry {
  id: string;
  year: number;
  decade: "1980s" | "1990s" | "2000s" | "2010s" | "2020s";
  name: string;
  region: string;
  subRegion: string;
  passDetail: string;
  status: "Archived" | "Documented";
  altitude: number; // meters
  altitudeFt: string;
  icon: string;
  summary: string;
}

export const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    id: "1984-annapurna",
    year: 1984,
    decade: "1980s",
    name: "Annapurna Circuit Traverse",
    region: "Annapurna",
    subRegion: "Gandaki Basin",
    passDetail: "Thorong La Ridge Pass",
    status: "Archived",
    altitude: 5416,
    altitudeFt: "17,769 ft",
    icon: "landscape",
    summary:
      "First institutional survey of the complete circumambulation crossing Thorong La during the inaugural autumn permit era.",
  },
  {
    id: "1989-langtang",
    year: 1989,
    decade: "1980s",
    name: "Langtang Valley Log",
    region: "Langtang",
    subRegion: "Helambu Border",
    passDetail: "Kyanjin Gompa Moraine",
    status: "Archived",
    altitude: 4984,
    altitudeFt: "16,351 ft",
    icon: "terrain",
    summary:
      "Glacial retreat measurement expedition recording terminal moraine positions beneath Langtang Lirung.",
  },
  {
    id: "1995-khumbu",
    year: 1995,
    decade: "1990s",
    name: "Khumbu Glacier Journal",
    region: "Khumbu",
    subRegion: "Sagarmatha Zone",
    passDetail: "Kala Patthar Observatory",
    status: "Archived",
    altitude: 5545,
    altitudeFt: "18,192 ft",
    icon: "ac_unit",
    summary:
      "Pre-monsoon meteorological monitoring baseline documenting barometric variations and jet-stream shear levels.",
  },
  {
    id: "2001-manaslu",
    year: 2001,
    decade: "2000s",
    name: "Manaslu Circuit Notes",
    region: "Manaslu",
    subRegion: "Gorkha Alpine",
    passDetail: "Larkya La Ice Step",
    status: "Archived",
    altitude: 5106,
    altitudeFt: "16,752 ft",
    icon: "explore",
    summary:
      "Restricted boundary crossing mapping ancient salt-trade trading routes linking Nuwa to Larkya Bazaar.",
  },
  {
    id: "2008-makalu",
    year: 2008,
    decade: "2000s",
    name: "Makalu Base Camp Record",
    region: "Makalu",
    subRegion: "Barun Sanctuary",
    passDetail: "Shipton High Pass",
    status: "Archived",
    altitude: 4870,
    altitudeFt: "15,977 ft",
    icon: "flag",
    summary:
      "Wilderness ecological transect through the Barun River gorge surveying high-altitude snow leopard habitats.",
  },
  {
    id: "2012-mustang",
    year: 2012,
    decade: "2010s",
    name: "Upper Mustang Chronicles",
    region: "Mustang",
    subRegion: "Lo Manthang Walled Realm",
    passDetail: "Cave Frescoes",
    status: "Documented",
    altitude: 3810,
    altitudeFt: "12,500 ft",
    icon: "history",
    summary:
      "Cultural conservation documentation of 14th-century Buddhist gompas and painted rock caves in the Kingdom of Lo.",
  },
  {
    id: "2015-rolwaling",
    year: 2015,
    decade: "2010s",
    name: "Rolwaling High Pass Expedition",
    region: "Rolwaling",
    subRegion: "Tsho Rolpa Lake",
    passDetail: "Tashi Lapcha Glacial Pass",
    status: "Archived",
    altitude: 5755,
    altitudeFt: "18,881 ft",
    icon: "alt_route",
    summary:
      "Post-monsoon glacial dam stabilization survey and high technical crossing into the Khumbu valley via Tashi Lapcha.",
  },
  {
    id: "2018-dhaulagiri",
    year: 2018,
    decade: "2010s",
    name: "Dhaulagiri Sanctuary Survey",
    region: "Dhaulagiri",
    subRegion: "Hidden Valley",
    passDetail: "French Pass Moraine",
    status: "Archived",
    altitude: 5360,
    altitudeFt: "17,585 ft",
    icon: "filter_hdr",
    summary:
      "Complete unsupported winter reconnaissance of the uninhabited Hidden Valley and Dhampus Pass traverse.",
  },
  {
    id: "2021-kanchenjunga",
    year: 2021,
    decade: "2020s",
    name: "Kanchenjunga Wilderness Survey",
    region: "Kanchenjunga",
    subRegion: "Far Eastern Ridge",
    passDetail: "Pangpema North Base",
    status: "Documented",
    altitude: 5143,
    altitudeFt: "16,873 ft",
    icon: "biotech",
    summary:
      "Biometric oxygen saturation trial comparing rapid staged ascent versus traditional 24-day acclimatization pacing.",
  },
  {
    id: "2024-dolpo",
    year: 2024,
    decade: "2020s",
    name: "Dolpo Trans-Himalayan Traverse",
    region: "Dolpo",
    subRegion: "Shey Phoksundo Rain Shadow",
    passDetail: "Kang La Pass",
    status: "Archived",
    altitude: 5200,
    altitudeFt: "17,060 ft",
    icon: "satellite_alt",
    summary:
      "Multi-band satellite telemetry validation across the trans-Himalayan rain shadow testing emergency heli-response protocols.",
  },
];
