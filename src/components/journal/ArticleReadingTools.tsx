"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setProgress(ratio);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(update);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-[#3f6e15] via-[#558b1f] to-[#f05e25] transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function ShareArticleButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fall back to clipboard if share dialog was cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white hover:border-[#3f6e15]/40 hover:text-[#3f6e15] px-3.5 py-1.5 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#3f6e15]" aria-hidden="true" />
          <span className="text-[#3f6e15]">Link Copied</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
