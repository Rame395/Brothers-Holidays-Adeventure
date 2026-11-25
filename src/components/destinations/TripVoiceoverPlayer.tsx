"use client";

import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface TripVoiceoverPlayerProps {
  tripName: string;
  tagline?: string | null;
  area?: string | null;
  days: number;
  maxAltitude: number;
  difficulty: string;
  overview: string;
  highlights?: string[];
}

const WAVEFORM_BARS = [
  36, 58, 44, 82, 52, 70, 92, 42, 66, 84, 50, 96, 62, 40, 78, 88, 54, 68, 86,
  46, 72, 90, 48, 64, 94, 56, 74, 42,
];

const SPEEDS = [1, 1.25, 1.5] as const;

function subscribeNoop() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getSpeechSupportServerSnapshot() {
  return false;
}

function stripRichText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : text ? [text] : [];
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function pickPreferredVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const preferredNames = [
    "Natural",
    "Google US English",
    "Google UK English Female",
    "Google UK English Male",
    "Samantha",
    "Daniel",
  ];
  for (const needle of preferredNames) {
    const match = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes(needle)
    );
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function TripVoiceoverPlayer({
  tripName,
  tagline,
  area,
  days,
  maxAltitude,
  difficulty,
  overview,
  highlights = [],
}: TripVoiceoverPlayerProps) {
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const playbackSessionRef = useRef(0);
  const sentenceIndexRef = useRef(0);
  const speedRef = useRef<number>(SPEEDS[0]);

  const speed = SPEEDS[speedIndex] ?? 1;

  const { sentences, baseTotalSeconds } = useMemo(() => {
    const sections: string[] = [];
    const cleanTagline = tagline ? stripRichText(tagline) : "";
    const intro = cleanTagline ? `${tripName}. ${cleanTagline}.` : `${tripName}.`;
    sections.push(intro);

    const specParts = [
      `A ${days}-${days === 1 ? "day" : "days"} ${difficulty.toLowerCase()} expedition`,
      area ? `in ${area}` : "",
      maxAltitude > 0
        ? `reaching a maximum altitude of ${maxAltitude.toLocaleString("en-US")} meters`
        : "",
    ].filter(Boolean);
    sections.push(`${specParts.join(", ")}.`);

    const cleanOverview = stripRichText(overview);
    if (cleanOverview) {
      sections.push(cleanOverview);
    }

    const topHighlights = highlights
      .slice(0, 4)
      .map((h) => stripRichText(h))
      .filter(Boolean);
    if (topHighlights.length > 0) {
      sections.push(`Key highlights include: ${topHighlights.join(". ")}.`);
    }

    const fullText = sections.join(" ");
    const chunked = splitIntoSentences(fullText);
    const words = fullText.split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = Math.max(12, Math.round((words / 150) * 60));

    return {
      sentences: chunked,
      baseTotalSeconds: estimatedSeconds,
    };
  }, [tripName, tagline, area, days, maxAltitude, difficulty, overview, highlights]);

  const totalSeconds = Math.max(8, Math.round(baseTotalSeconds / speed));

  const stopSpeechEngine = useCallback(() => {
    playbackSessionRef.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeechEngine();
    };
  }, [stopSpeechEngine, tripName]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev + 1 >= totalSeconds) return totalSeconds;
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, totalSeconds]);

  const speakFromSentence = useCallback(
    (startIndex: number, rate: number) => {
      if (!isSupported || sentences.length === 0) return;

      stopSpeechEngine();
      const sessionId = playbackSessionRef.current;
      const clampedStart = Math.max(
        0,
        Math.min(startIndex, sentences.length - 1)
      );
      sentenceIndexRef.current = clampedStart;
      speedRef.current = rate;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = pickPreferredVoice(voices);

      const enqueueNext = (idx: number) => {
        if (playbackSessionRef.current !== sessionId) return;
        if (idx >= sentences.length) {
          sentenceIndexRef.current = 0;
          setIsPlaying(false);
          setElapsedSeconds(0);
          return;
        }

        sentenceIndexRef.current = idx;
        const utterance = new SpeechSynthesisUtterance(sentences[idx]!);
        utterance.lang = "en-US";
        utterance.rate = speedRef.current;
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
          if (playbackSessionRef.current !== sessionId) return;
          enqueueNext(idx + 1);
        };

        utterance.onerror = () => {
          if (playbackSessionRef.current !== sessionId) return;
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      setIsPlaying(true);
      enqueueNext(clampedStart);
    },
    [isSupported, sentences, stopSpeechEngine]
  );

  const handleTogglePlay = () => {
    if (!isSupported) return;
    if (isPlaying) {
      stopSpeechEngine();
      setIsPlaying(false);
      return;
    }
    const startIdx =
      elapsedSeconds >= totalSeconds ? 0 : sentenceIndexRef.current;
    if (elapsedSeconds >= totalSeconds) {
      setElapsedSeconds(0);
    }
    speakFromSentence(startIdx, speed);
  };

  const handleReset = () => {
    stopSpeechEngine();
    sentenceIndexRef.current = 0;
    setIsPlaying(false);
    setElapsedSeconds(0);
  };

  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEEDS.length;
    const nextSpeed = SPEEDS[nextIdx] ?? 1;
    const progressRatio = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;
    const nextTotal = Math.max(8, Math.round(baseTotalSeconds / nextSpeed));
    setSpeedIndex(nextIdx);
    setElapsedSeconds(Math.round(progressRatio * nextTotal));
    speedRef.current = nextSpeed;
    if (isPlaying) {
      speakFromSentence(sentenceIndexRef.current, nextSpeed);
    }
  };

  const handleSeekBar = (barIdx: number) => {
    const ratio = (barIdx + 1) / WAVEFORM_BARS.length;
    const targetElapsed = Math.round(ratio * totalSeconds);
    const targetSentence = Math.min(
      sentences.length - 1,
      Math.max(0, Math.floor(ratio * sentences.length))
    );
    sentenceIndexRef.current = targetSentence;
    setElapsedSeconds(targetElapsed);

    if (isPlaying) {
      speakFromSentence(targetSentence, speed);
    }
  };

  if (!isSupported || sentences.length === 0) {
    return null;
  }

  const progressFraction =
    totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;
  const activeBarCount = Math.round(progressFraction * WAVEFORM_BARS.length);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex max-w-full flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 rounded-full border border-stone-200/90 bg-[#faf9f7] px-3 sm:px-3.5 py-2 shadow-2xs">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause audio overview" : "Play audio overview"}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-xs transition-all cursor-pointer active:scale-95 ${
            isPlaying
              ? "bg-[#f05e25] hover:bg-[#d94e18]"
              : "bg-[#3f6e15] hover:bg-[#315710]"
          }`}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current translate-x-[1px]" />
          )}
        </button>

        {/* Interactive Waveform Bars */}
        <div
          role="group"
          aria-label="Audio guide progress waveform"
          className="flex h-7 items-center gap-[3px] px-0.5"
        >
          {WAVEFORM_BARS.map((heightPct, idx) => {
            const isPast = idx < activeBarCount;
            const isHead = isPlaying && idx === Math.max(0, activeBarCount - 1);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSeekBar(idx)}
                aria-label={`Jump to ${Math.round(
                  ((idx + 1) / WAVEFORM_BARS.length) * 100
                )}%`}
                className="flex h-7 items-center py-0.5 cursor-pointer group focus:outline-none"
              >
                <span
                  style={{ height: `${heightPct}%` }}
                  className={`block w-[2.5px] rounded-full transition-colors duration-200 ${
                    isHead
                      ? "bg-[#f05e25]"
                      : isPast
                      ? "bg-[#3f6e15]"
                      : "bg-stone-300 group-hover:bg-[#3f6e15]/50"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Elapsed / Total Clock */}
        <span className="text-xs font-medium text-[#57534d] tabular-nums whitespace-nowrap pl-0.5">
          {formatClock(elapsedSeconds)} / {formatClock(totalSeconds)}
        </span>

        {/* Speed Toggle */}
        <button
          type="button"
          onClick={handleCycleSpeed}
          aria-label={`Playback speed ${speed}x`}
          className="rounded-full border border-stone-200 bg-white hover:border-[#3f6e15]/40 hover:text-[#3f6e15] px-2.5 py-1 text-[11px] font-bold text-[#1c1917] tabular-nums transition-colors cursor-pointer"
        >
          {speed}x
        </button>

        {elapsedSeconds > 0 && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Restart audio overview"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#57534d] hover:bg-stone-200/70 hover:text-[#1c1917] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
        <Volume2 className="h-3.5 w-3.5 text-[#3f6e15]" />
        <span>{isPlaying ? "Playing Audio Guide..." : "Listen to Audio Guide"}</span>
      </span>
    </div>
  );
}
