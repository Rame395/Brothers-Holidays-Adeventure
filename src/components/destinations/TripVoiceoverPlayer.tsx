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
import type {
  TripCustomSectionDTO,
  TripFaqDTO,
  TripItineraryDayDTO,
  TripServiceGroupDTO,
} from "@/lib/types";

export interface TripVoiceoverPlayerProps {
  tripSlug: string;
  overview: string;
  overviewCustomSections?: TripCustomSectionDTO[];
  highlights?: string[];
  itineraryIntro?: string | null;
  itinerary?: TripItineraryDayDTO[];
  includes?: string[];
  includeGroups?: TripServiceGroupDTO[];
  excludes?: string[];
  excludeGroups?: TripServiceGroupDTO[];
  knowBeforeYouGoSections?: TripCustomSectionDTO[];
  gearList?: string[];
  bottomCustomSections?: TripCustomSectionDTO[];
  faqs?: TripFaqDTO[];
}

interface NarrationChunk {
  text: string;
  section: string;
}

const WAVEFORM_BARS = [
  36, 58, 44, 82, 52, 70, 92, 42, 66, 84, 50, 96, 62, 40, 78, 88, 54, 68, 86,
  46, 72, 90, 48, 64, 94, 56, 74, 42,
];

const SPEEDS = [1, 1.25, 1.5] as const;
const MAX_CHUNK_CHARS = 160;

function subscribeNoop() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function getSpeechSupportServerSnapshot() {
  return false;
}

function stripRichText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensurePeriod(text: string): string {
  const clean = text.trim();
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

/**
 * Splits long prose into <= 160 char chunks on sentence, clause, then word
 * boundaries so iOS Safari and mobile WebKit never hit the silent 15s cutoff.
 */
function splitSafeChunks(text: string, section: string): NarrationChunk[] {
  const clean = stripRichText(text);
  if (!clean) return [];

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: NarrationChunk[] = [];

  const pushBounded = (piece: string) => {
    const trimmed = piece.trim();
    if (!trimmed) return;
    if (trimmed.length <= MAX_CHUNK_CHARS) {
      chunks.push({ text: trimmed, section });
      return;
    }

    const clauses = trimmed
      .split(/(?<=[,;:])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    let buffer = "";
    for (const clause of clauses) {
      if (clause.length > MAX_CHUNK_CHARS) {
        if (buffer) {
          chunks.push({ text: buffer, section });
          buffer = "";
        }
        const words = clause.split(/\s+/);
        let wordBuf = "";
        for (const w of words) {
          const candidate = wordBuf ? `${wordBuf} ${w}` : w;
          if (candidate.length > MAX_CHUNK_CHARS) {
            if (wordBuf) chunks.push({ text: wordBuf, section });
            wordBuf = w;
          } else {
            wordBuf = candidate;
          }
        }
        if (wordBuf) chunks.push({ text: wordBuf, section });
        continue;
      }

      const combined = buffer ? `${buffer} ${clause}` : clause;
      if (combined.length > MAX_CHUNK_CHARS) {
        if (buffer) chunks.push({ text: buffer, section });
        buffer = clause;
      } else {
        buffer = combined;
      }
    }
    if (buffer) chunks.push({ text: buffer, section });
  };

  let sentenceBuf = "";
  for (const sentence of sentences) {
    const combined = sentenceBuf ? `${sentenceBuf} ${sentence}` : sentence;
    if (combined.length <= MAX_CHUNK_CHARS) {
      sentenceBuf = combined;
    } else {
      if (sentenceBuf) pushBounded(sentenceBuf);
      if (sentence.length > MAX_CHUNK_CHARS) {
        pushBounded(sentence);
        sentenceBuf = "";
      } else {
        sentenceBuf = sentence;
      }
    }
  }
  if (sentenceBuf) pushBounded(sentenceBuf);

  return chunks;
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
    "Samantha",
    "Daniel",
    "Karen",
    "Moira",
    "Natural",
    "Google US English",
    "Google UK English Female",
    "Google UK English Male",
  ];
  for (const needle of preferredNames) {
    const match = voices.find(
      (v) => v.lang.toLowerCase().startsWith("en") && v.name.includes(needle)
    );
    if (match) return match;
  }
  return (
    voices.find(
      (v) => v.lang.toLowerCase().startsWith("en") && v.localService
    ) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

export function TripVoiceoverPlayer({
  tripSlug,
  overview,
  overviewCustomSections = [],
  highlights = [],
  itineraryIntro,
  itinerary = [],
  includes = [],
  includeGroups = [],
  excludes = [],
  excludeGroups = [],
  knowBeforeYouGoSections = [],
  gearList = [],
  bottomCustomSections = [],
  faqs = [],
}: TripVoiceoverPlayerProps) {
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);

  const playbackSessionRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const speedRef = useRef<number>(SPEEDS[0]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const speed = SPEEDS[speedIndex] ?? 1;

  // Build script strictly from Overview downward (skipping the top hero heading)
  const { chunks, baseTotalSeconds } = useMemo(() => {
    const list: NarrationChunk[] = [];
    const pushSection = (section: string, blocks: (string | null | undefined)[]) => {
      for (const block of blocks) {
        if (!block) continue;
        list.push(...splitSafeChunks(ensurePeriod(block), section));
      }
    };

    // 1. Overview
    pushSection("Overview", [
      "Overview",
      overview,
      ...overviewCustomSections.flatMap((s) => [s.title, s.content]),
    ]);

    // 2. Highlights
    if (highlights.length > 0) {
      pushSection("Highlights", ["Trip Highlights", ...highlights]);
    }

    // 3. Itinerary
    if (itinerary.length > 0) {
      const dayBlocks: string[] = ["Day by Day Itinerary"];
      if (itineraryIntro) dayBlocks.push(itineraryIntro);
      const unit = itinerary.length === 1 ? "Stage" : "Day";
      for (const day of itinerary) {
        const trimmedDay = day.day.trim();
        const label = /^(day|stage)\b/i.test(trimmedDay)
          ? trimmedDay
          : `${unit} ${trimmedDay}`;
        const headerParts = [
          `${label}: ${day.title}`,
          day.altitude > 0
            ? `Maximum altitude ${day.altitude.toLocaleString("en-US")} meters`
            : "",
        ].filter(Boolean);
        dayBlocks.push(headerParts.join(". "));
        if (day.note) dayBlocks.push(day.note);
      }
      pushSection("Itinerary", dayBlocks);
    }

    // 4. Cost Includes
    const incLines =
      includeGroups.length > 0
        ? includeGroups.flatMap((g) => [g.title, ...g.items])
        : includes;
    if (incLines.length > 0) {
      pushSection("Includes", ["What is Included", ...incLines]);
    }

    // 5. Cost Excludes
    const excLines =
      excludeGroups.length > 0
        ? excludeGroups.flatMap((g) => [g.title, ...g.items])
        : excludes;
    if (excLines.length > 0) {
      pushSection("Excludes", ["What is Excluded", ...excLines]);
    }

    // 6. Know Before You Go & Gear Checklist
    const kbygBlocks: string[] = [];
    for (const sec of knowBeforeYouGoSections) {
      kbygBlocks.push(sec.title, sec.content);
    }
    if (gearList.length > 0) {
      kbygBlocks.push("Packing and Gear Checklist", ...gearList);
    }
    for (const sec of bottomCustomSections) {
      kbygBlocks.push(sec.title, sec.content);
    }
    if (kbygBlocks.length > 0) {
      pushSection("Know Before You Go", [
        "Know Before You Go",
        ...kbygBlocks,
      ]);
    }

    // 7. FAQs
    if (faqs.length > 0) {
      pushSection("FAQs", [
        "Frequently Asked Questions",
        ...faqs.flatMap((f) => [f.question, f.answer]),
      ]);
    }

    const totalWords = list.reduce(
      (sum, chunk) => sum + chunk.text.split(/\s+/).filter(Boolean).length,
      0
    );
    const estimatedSeconds = Math.max(12, Math.round((totalWords / 150) * 60));

    return {
      chunks: list,
      baseTotalSeconds: estimatedSeconds,
    };
  }, [
    overview,
    overviewCustomSections,
    highlights,
    itineraryIntro,
    itinerary,
    includes,
    includeGroups,
    excludes,
    excludeGroups,
    knowBeforeYouGoSections,
    gearList,
    bottomCustomSections,
    faqs,
  ]);

  const totalSeconds = Math.max(8, Math.round(baseTotalSeconds / speed));

  // Keep speechSynthesis voices cached (critical for iOS Safari / Chrome async voice loading)
  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const syncVoices = () => {
      try {
        voicesRef.current = synth.getVoices();
      } catch {
        voicesRef.current = [];
      }
    };
    syncVoices();
    synth.addEventListener?.("voiceschanged", syncVoices);
    return () => {
      synth.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, [isSupported]);

  const stopSpeechEngine = useCallback(() => {
    playbackSessionRef.current += 1;
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    activeUtteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeechEngine();
    };
  }, [stopSpeechEngine, tripSlug]);

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

  const speakFromChunk = useCallback(
    (startIndex: number, rate: number) => {
      if (!isSupported || chunks.length === 0) return;

      const synth = window.speechSynthesis;
      const hadActiveSpeech = synth.speaking || synth.pending;

      playbackSessionRef.current += 1;
      const sessionId = playbackSessionRef.current;

      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }

      const clampedStart = Math.max(
        0,
        Math.min(startIndex, chunks.length - 1)
      );
      chunkIndexRef.current = clampedStart;
      speedRef.current = rate;
      setActiveChunkIndex(clampedStart);
      setIsPlaying(true);

      const enqueueNext = (idx: number) => {
        if (playbackSessionRef.current !== sessionId) return;
        if (idx >= chunks.length) {
          activeUtteranceRef.current = null;
          chunkIndexRef.current = 0;
          setActiveChunkIndex(0);
          setIsPlaying(false);
          setElapsedSeconds(0);
          return;
        }

        chunkIndexRef.current = idx;
        setActiveChunkIndex(idx);

        const chunk = chunks[idx]!;
        const utterance = new SpeechSynthesisUtterance(chunk.text);
        utterance.lang = "en-US";
        utterance.rate = speedRef.current;
        utterance.pitch = 1;
        utterance.volume = 1;

        const preferredVoice = pickPreferredVoice(
          voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices()
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Pin strong reference so iOS WebKit does not GC utterance before onend
        activeUtteranceRef.current = utterance;

        utterance.onend = () => {
          if (playbackSessionRef.current !== sessionId) return;
          enqueueNext(idx + 1);
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          if (playbackSessionRef.current !== sessionId) return;
          if (
            event.error === "interrupted" ||
            event.error === "canceled"
          ) {
            return;
          }
          activeUtteranceRef.current = null;
          setIsPlaying(false);
        };

        synth.speak(utterance);
      };

      // Only cancel when interrupting existing audio; when idle, speak synchronously
      // inside the user tap gesture (required by iOS / iPhone Safari).
      if (hadActiveSpeech) {
        synth.cancel();
        resumeTimerRef.current = window.setTimeout(() => {
          resumeTimerRef.current = null;
          enqueueNext(clampedStart);
        }, 40);
      } else {
        enqueueNext(clampedStart);
      }
    },
    [isSupported, chunks]
  );

  const handleTogglePlay = () => {
    if (!isSupported) return;
    if (isPlaying) {
      stopSpeechEngine();
      setIsPlaying(false);
      return;
    }
    const startIdx =
      elapsedSeconds >= totalSeconds ? 0 : chunkIndexRef.current;
    if (elapsedSeconds >= totalSeconds) {
      setElapsedSeconds(0);
    }
    speakFromChunk(startIdx, speed);
  };

  const handleReset = () => {
    stopSpeechEngine();
    chunkIndexRef.current = 0;
    setActiveChunkIndex(0);
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
      speakFromChunk(chunkIndexRef.current, nextSpeed);
    }
  };

  const handleSeekBar = (barIdx: number) => {
    const ratio = (barIdx + 1) / WAVEFORM_BARS.length;
    const targetElapsed = Math.round(ratio * totalSeconds);
    const targetChunk = Math.min(
      chunks.length - 1,
      Math.max(0, Math.floor(ratio * chunks.length))
    );
    chunkIndexRef.current = targetChunk;
    setActiveChunkIndex(targetChunk);
    setElapsedSeconds(targetElapsed);

    if (isPlaying) {
      speakFromChunk(targetChunk, speed);
    }
  };

  if (!isSupported || chunks.length === 0) {
    return null;
  }

  const progressFraction =
    totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;
  const activeBarCount = Math.round(progressFraction * WAVEFORM_BARS.length);
  const currentSectionName = chunks[activeChunkIndex]?.section ?? "Overview";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex max-w-full flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 rounded-full border border-stone-200/90 bg-[#faf9f7] px-3 sm:px-3.5 py-2 shadow-2xs">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause audio guide" : "Play audio guide"}
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
            aria-label="Restart audio guide"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#57534d] hover:bg-stone-200/70 hover:text-[#1c1917] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
        <Volume2 className="h-3.5 w-3.5 text-[#3f6e15] shrink-0" />
        <span>
          {isPlaying
            ? `Playing · ${currentSectionName}`
            : elapsedSeconds > 0
            ? `Paused · ${currentSectionName}`
            : "Listen to Audio Guide"}
        </span>
      </span>
    </div>
  );
}
