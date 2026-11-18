import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Newsreader,
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";
import ExpeditionLoader from "@/components/ExpeditionLoader";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BROTHERS Holidays Adventure — Himalayan Field Journal & Premium Expeditions",
  description:
    "An alpine editorial journal of routes across Nepal, mapped with absolute elevation, topographic precision, and zero commercial filler.",
  keywords: [
    "Himalayan trekking",
    "Nepal expeditions",
    "Manaslu Circuit",
    "Khumbu Glacier Traverse",
    "Langtang Valley",
    "Alpine Field Journal",
    "Kala Patthar",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${cormorant.variable} ${manrope.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <ExpeditionLoader />
        </Suspense>
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        <Header />
        <main className="w-full flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
