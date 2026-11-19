# BROTHERS Holidays Adventure — Premium Himalayan Expeditions & Field Journal

> Production-grade, high-performance web platform for **BROTHERS Holidays Adventure** (Est. Kathmandu, Nepal). Engineered with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Three.js procedural WebGL terrain rendering.

---

## 🏔️ Brand Overview

**BROTHERS Holidays Adventure** is an elite Himalayan expedition and high-altitude trekking outfitter based in Kathmandu, Nepal. The platform serves as their digital flagship, integrating topographic survey profiles, live elevation telemetry, an interactive booking engine, comprehensive route cartography, and an editorial alpine journal.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.4.6** | App Router, Turbopack, Partial Prerendering (PPR), Static Generation |
| **UI Library** | **React 19.3.0** | Strict type safety, React Server Components (RSC), optimized client boundaries |
| **Styling** | **Tailwind CSS v4** | Bespoke `@theme` tokens, alpine typography, luxury gold accents |
| **3D Engine** | **Three.js & @react-three/fiber** | Procedural WebGL mountain terrain, dynamic lighting, atmospheric clouds |
| **Icons** | **Lucide React** | Clean, lightweight SVG vector icons |
| **Typography** | **Google Fonts** | Newsreader (Editorial Serif), Cormorant Garamond, Geist Sans, Geist Mono |

---

## 📁 Project Directory Structure

```text
kharka-trekking/
├── public/
│   ├── images/
│   │   ├── trips/                     # 16 High-resolution expedition destination assets
│   │   ├── brothers_holidays_adventure_logo_8k.png # Official 8K master logo
│   │   ├── brothers_logo_navbar.png   # Optimized transparent navbar & footer logo
│   │   ├── cta-himalaya-bg.jpg        # Newsletter & banner mountain backdrop
│   │   ├── footer-bg-himalaya.jpg     # Animated footer mountain backdrop
│   │   ├── himalaya-poster.jpg        # Video fallback poster
│   │   └── home-camp.jpg              # High-camp expedition imagery
│   └── videos/
│       └── himalaya-flight.mp4        # Photoreal 4K Himalayan aerial flight footage
├── src/
│   ├── app/
│   │   ├── about/                     # Heritage, values, accreditation & guides
│   │   ├── archive/                   # 40-year expedition ledger & historical filter
│   │   ├── contact/                   # Kathmandu headquarters & global satellite comms
│   │   ├── destinations/              # All Destinations filter & category catalog
│   │   │   └── [slug]/                # Dynamic destination details & booking engine
│   │   ├── expeditions/               # High-altitude 6k/7k/8k physiological matrix
│   │   ├── journal/                   # High-altitude field notes & medical treatise
│   │   ├── process/                   # 5-stage expedition chronology & ledger
│   │   ├── route/[slug]/              # Legacy & technical route specifications
│   │   ├── treks/                     # Live route directory, elevation charts & compare
│   │   ├── globals.css                # Tailwind CSS v4 design tokens & base resets
│   │   ├── layout.tsx                 # Root layout, fonts, header, footer & loaders
│   │   └── page.tsx                   # Flagship homepage
│   ├── components/
│   │   ├── destinations/              # BookingPanel, ElevationProfile, TripCard
│   │   ├── hero/                      # Hero section, HeroScene (Three.js), terrain math
│   │   ├── home/                      # TopographicSurveyProfile
│   │   ├── site/                      # Nav (Navbar with MegaMenu & mobile drawer)
│   │   ├── ExpeditionLoader.tsx       # Cinematic mountaineer climbing launch loader
│   │   ├── Footer.tsx                 # Multi-column animated footer with borders
│   │   ├── Header.tsx                 # Persistent navigation wrapper
│   │   ├── MirrorHighRoutes.tsx       # Interactive 3D featured routes showcase
│   │   └── RouteLoadingIndicator.tsx  # 0.5s smooth page transit overlay
│   ├── data/
│   │   └── trips.ts                   # Centralized type-safe expedition registry
│   └── lib/
│       └── booking.ts                 # Tariff calculation & reservation helpers
├── package.json
└── tsconfig.json
```

---

## ⚡ Key Features

1. **Cinematic Mountain Climbing Loader (`ExpeditionLoader`)**:
   - Realistic mountaineer silhouette climbing an SVG ridge path with trekking poles.
   - Elevation markers from Kathmandu (1,400m) to Summit (8,848m) with real-time percentage progress.
   - Smoothly reveals the homepage on launch and on any page refresh or logo touch.

2. **Snappy Page Navigation (`RouteLoadingIndicator`)**:
   - 0.5-second route transition with an elegant spinning gold compass rose and elevation telemetry.

3. **Responsive Hero Section with Everest Base Camp Featured Card**:
   - Fully optimized for desktop, tablet, and mobile.
   - Zero element overlap between brand heading, tagline, and featured ascent card.
   - Quick-booking button links directly to `/destinations/everest-base-camp-trek#book`.

4. **Multi-Column Animated Footer**:
   - Luminous gold borders dividing sections, columns, and accreditation bars.
   - Direct Quick Links to About Us, All Destinations, Our Process, Journal, and Contact Us.
   - Full legal accreditation (Nepal Tourism Board, TAAN, NMA, Govt. Regd. 58177/068/069).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/kushal-0987/Trecking-website-.git
cd "Trecking-website-/kharka-trekking"

# Install dependencies
npm install
```

### Development
```bash
npm run dev
# Starts Turbopack development server at http://localhost:3000
```

### Production Build
```bash
npm run build
# Compiles and optimizes all 62 static and dynamic routes

npm start
# Launches the production server
```

---

## 📜 License & Ownership
© 2026 Brothers Holidays Adventure Pvt. Ltd. All rights reserved.
