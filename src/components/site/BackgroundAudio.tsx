"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function BackgroundAudio() {
  const pathname = usePathname();
  const isTripDetail = Boolean(
    pathname &&
      pathname.startsWith("/destinations/") &&
      pathname.length > "/destinations/".length
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (isPlaying) {
      let vol = audio.volume;
      fadeIntervalRef.current = window.setInterval(() => {
        vol = Math.max(0, vol - 0.08);
        audio.volume = vol;
        if (vol <= 0.01) {
          audio.pause();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          setIsPlaying(false);
        }
      }, 40);
    } else {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          let vol = 0;
          fadeIntervalRef.current = window.setInterval(() => {
            vol = Math.min(0.55, vol + 0.06);
            audio.volume = vol;
            if (vol >= 0.54) {
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            }
          }, 40);
        })
        .catch((err) => {
          console.warn("Audio autoplay blocked by browser policy:", err);
        });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  return (
    <div
      className={`fixed right-4 sm:right-6 z-50 transition-all duration-300 ${
        isTripDetail ? "bottom-20 lg:bottom-6" : "bottom-6"
      }`}
    >
      <audio
        ref={audioRef}
        loop
        preload="none"
        src="/audio/himalayan-ambient.wav"
      />
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? "Pause background audio" : "Play background audio"}
        className={`group relative flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl lg:backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isPlaying
            ? "border-[#c89b4b] bg-[#081318]/95 lg:bg-[#081318]/90 text-[#e5b96b] shadow-[0_0_24px_rgba(200,155,75,0.35)]"
            : "border-white/20 bg-[#081318]/92 lg:bg-[#081318]/75 text-white/70 hover:border-white/40 hover:text-white"
        }`}
      >
        {isPlaying ? (
          <>
            {/* Playing Speaker Icon with Sound Waves */}
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-6 w-6 text-[#e5b96b]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.63.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
            {/* Subtle animated beacon ring */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e5b96b] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#e5b96b]" />
            </span>
          </>
        ) : (
          /* Muted Speaker Icon */
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-1.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.63.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
