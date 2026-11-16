# Kharka — Premium Himalayan Trekking & Mountaineering Platform

> Fully realized, production-grade Next.js 16 + React 19 recreation of the Google Stitch **Kharka Premium Himalayan Trekking** website. Reconstructed with exact visual fidelity, Material 3 alpine design tokens, interactive telemetry components, hypsometric SVG curves, and client-side expedition engines.

---

## 🏔️ Overview

**Kharka** (Est. 1984, Thamel, Kathmandu) is an elite Himalayan expedition and high-altitude trekking outfitter. This platform serves as their digital flagship, combining high-altitude mountaineering telemetry, route cartography, physiological risk stratification, historical expedition archives, and an interactive booking manifest.

### Key Highlights & Architecture
- **Framework**: Next.js 16.4.6 (App Router with Turbopack & Partial Prerendering)
- **UI Engine**: React 19 + TypeScript (Strict Type Safety)
- **Styling**: Tailwind CSS v4 with bespoke `@theme` containing all 44 Google Stitch color tokens, elevation scales, and alpine typography
- **Typography**: Google Fonts Newsreader (Editorial Serif) paired with Geist Sans & Geist Mono
- **Iconography**: Google Material Symbols Outlined font integration
- **Visual Assets**: Full-resolution 4K Himalayan panoramic imagery, vector SVG elevation profiles, and hypsometric telemetry curves

---

## 🗺️ Page Architecture & Features

### 1. Flagship Homepage (`/`)
- **Cinematic Alpine Hero**: High-resolution sunrise mountain vista, live elevation telemetry HUD, dynamic seasonal departure countdown.
- **Institutional Heritage**: 40-year foundation dossier, IFMGA/NNMGA accreditation stamps, safety record badges.
- **Signature Expeditions Rail**: Interactive cards with bespoke SVG elevation cross-sections, summit altitudes, technical grades, and per-person rates.
- **Dispatch Inquiry Console**: Real-time validated expedition booking form with season, group size, and route selectivity.

### 2. Alpine Catalog & Route Explorer (`/treks`)
- **Live Search & Filter Engine**: Instant multi-condition filtering by altitude threshold (<4000m, high passes >5000m), season (Spring Pre-Monsoon, Autumn Post-Monsoon), and keyword search.
- **Sort Mechanics**: Dynamic ordering by altitude, duration, and price.
- **Trek Comparison Dock**: Interactive selection engine allowing side-by-side comparison of routes with altitude deltas and gear prerequisites.
- **Structured Table View**: Dense tabular data view with direct route links and status flags.

### 3. High-Altitude Mountaineering Objectives (`/expeditions`)
- **Physiological Stratification**: Visual classification across 6,000m (Alpine Entry), 7,000m (Severe Hypoxia), and 8,000m (Death Zone / Supplemental O2 mandatory).
- **Interactive Hypsometric Curve**: Interactive vector altitude curve featuring interactive summits (Everest 8,848m, K2 8,611m, Kanchenjunga 8,586m, Lhotse 8,516m, Makalu 8,485m, Ama Dablam 6,812m) that highlight expedition parameters.
- **Objective Dossier Modal**: In-depth modal with technical pitch ratings, guide ratios (1:1 / 1:2), fixed-rope requirements, and application triggers.

### 4. Route Specification & Booking Manifest (`/route/[slug]`)
- **Route Hero**: Dynamic slug-based routing pre-rendered via `generateStaticParams()`.
- **Telemetry HUD**: 4 core metric tiles (Max Elevation, Total Ascent, Days on Trail, Technical Grade).
- **Dynamic Elevation Cross-Section**: Interactive SVG profile with waypoint scrubbers detailing acclimatization milestones.
- **Stage-by-Stage Itinerary**: Visual trail stages with daily ascent meters and key camp names.
- **Itemized Financial Manifest**: Clear breakdown of park permits, Sherpa guide wages, teahouse board, emergency satellite communication, and local flight transfers ($1,850 baseline).
- **Interactive Booking Drawer**: Live party-size calculator, departure date selection, special dietary/medical notes, and instant confirmation state.

### 5. Tome IV Dispatch Journal (`/journal`)
- **Clinical Field Monograph**: Complete high-altitude medical treatise by Dr. Pemba T. Sherpa MD covering AMS, HAPE, HACE prevention, fluid balance, and mandatory rest days.
- **Altitude vs. SpO2 Interactive Gauge**: Field telemetry preview showing expected blood oxygen saturation drops by altitude band.
- **Dispatch Registry**: 4 rich field essays from Manaslu, Upper Mustang, and the Khumbu icefall.
- **Full Story Reader Modal**: Distraction-free reading experience for field reports.

### 6. Historical Trek Archive (`/archive`)
- **Expedition History (1984–2024)**: 40-year ledger of summits, reconnaissance routes, and logistics milestones.
- **Chronological Filters**: Instant filtering by decade (1980s, 1990s, 2000s, 2010s, 2020s) and region.
- **Data Export**: Instant CSV log file download for archival records.
- **Submit Archive Entry**: Modal dialog to contribute expedition notes or historical logs.

### 7. Kathmandu Headquarters & Field Radio (`/contact`)
- **Live Nepal UTC+5:45 Clock**: Real-time ticking chronometer displaying current Kathmandu Headquarters local time.
- **GIS Cartography Card**: Coordinate readout (27.7149° N, 85.3123° E), office location in Thamel, and physical walk-in hours.
- **Direct Dispatch Form**: Validated communication form with route interest pills, custom dates, and priority response handling.
- **Institutional Assurances**: High-frequency satellite link uptime, evacuation protocols, and insurance validation guarantees.

---

## 🎨 Design System & Color Tokens

Recreated precisely from the Stitch design specifications:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `primary` | `#00515b` | Deep Glacial Teal (Key branding & primary actions) |
| `primary-container` | `#006b78` | Glacial Mid-Teal (Hover states, badges, accents) |
| `surface` | `#eefcfe` | Crisp Himalayan Ice (Light background) |
| `surface-container-lowest` | `#ffffff` | Pure White (Cards, elevated panels) |
| `surface-container` | `#e2f1f3` | Pale Glacial Tint (Table rows, neutral dividers) |
| `surface-container-high` | `#d6e6e8` | Subdued Glacial Gray (Borders, subtle cards) |
| `on-surface` | `#111d1f` | Lithic Ink / Obsidian (High-contrast primary typography) |
| `on-surface-variant` | `#3f4949` | Slate Gray (Secondary body typography, metadata) |
| `tertiary` | `#6a3f00` | Dawn Ochre / Brass (Warning states, technical grades) |
| `tertiary-container` | `#c88a3e` | Warm Amber Ochre (Accent highlights, star ratings) |
| `error` | `#ba1a1a` | Alpine Red (Emergency alerts, fatal errors) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone or Navigate to the Directory**:
   ```bash
   cd "kharka-trekking"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Run Production Server**:
   ```bash
   npm start
   ```

---

## 📁 Repository Structure

```
kharka-trekking/
├── public/
│   ├── images/
│   │   └── himalayan-sunrise-4096x2048.webp   # High-res 4K Himalayan hero banner
│   └── reference-screens/                     # Original Stitch exported reference UI
├── src/
│   ├── app/
│   │   ├── archive/page.tsx                   # Historical expedition registry
│   │   ├── contact/page.tsx                   # Kathmandu HQ & live clock dispatch
│   │   ├── expeditions/page.tsx               # Mountaineering & hypsometric curve
│   │   ├── journal/page.tsx                   # Field dispatches & clinical monograph
│   │   ├── route/[slug]/
│   │   │   ├── page.tsx                       # Dynamic SSR wrapper & static params
│   │   │   └── RouteDetailsClient.tsx         # Elevation chart & interactive booking
│   │   ├── treks/page.tsx                     # Searchable & filterable route catalog
│   │   ├── globals.css                        # Tailwind v4 theme, tokens & keyframes
│   │   ├── layout.tsx                         # Root layout, Google Fonts & icons
│   │   └── page.tsx                           # Flagship landing page
│   ├── components/
│   │   ├── Header.tsx                         # Glassmorphic header & navigation drawer
│   │   └── Footer.tsx                         # Institutional footer & field status
│   └── data/
│       ├── archive.ts                         # 40-year expedition records
│       ├── expeditions.ts                     # Peak specifications & physiological data
│       ├── journal.ts                         # Field monographs & stories
│       └── treks.ts                           # Complete trek routes with SVG paths
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛡️ Quality Assurance & Accessibility

- **Responsive Breakpoints**: Seamless scaling across Mobile (<640px), Tablet (768px - 1024px), Desktop (1280px), and Ultra-wide (1920px+).
- **Semantics & Accessibility**: Clean semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`), aria labels on interactive modals, and focus-visible outlines.
- **Performance**: High Next.js static generation optimization, SVG vector rendering for charts, and WebP compression for photography.
