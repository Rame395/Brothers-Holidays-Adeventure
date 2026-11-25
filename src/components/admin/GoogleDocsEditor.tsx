"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Eye,
  FilePlus2,
  Highlighter,
  ImagePlus,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Outdent,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { HERO_IMAGE_PRESETS } from "@/lib/admin-presets";

const TEXT_COLORS = [
  { label: "Charcoal", value: "#1c1917" },
  { label: "Forest Green", value: "#3f6e15" },
  { label: "Himalayan Orange", value: "#f05e25" },
  { label: "Emerald", value: "#0f766e" },
  { label: "Stone", value: "#57534d" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "transparent" },
  { label: "Warm Highlight", value: "#ffedd5" },
  { label: "Sun Gold", value: "#fef08a" },
  { label: "Sky Mist", value: "#dbeafe" },
  { label: "Mint", value: "#d1fae5" },
];

function escapeAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getWordAndCharStats(html: string): {
  words: number;
  chars: number;
  minutes: number;
} {
  const plain = html
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/blockquote|\/tr)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const chars = plain.length;
  const minutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
  return { words, chars, minutes };
}

export default function GoogleDocsEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Write the comprehensive region travel & SEO guide here...",
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string>(value);

  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [fullscreen, setFullscreen] = useState(false);
  const [blockType, setBlockType] = useState("p");
  const [fontFamily, setFontFamily] = useState("sans");
  const [fontSize, setFontSize] = useState(15);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const stats = useMemo(() => getWordAndCharStats(value), [value]);

  // Keep contentEditable synced when value changes externally (e.g. switching regions)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || mode !== "visual") return;
    if (value !== lastEmittedRef.current && el.innerHTML !== value) {
      el.innerHTML = value || "";
      lastEmittedRef.current = value;
    }
  }, [value, mode]);

  // Populate editor when switching back from HTML mode
  useEffect(() => {
    const el = editorRef.current;
    if (!el || mode !== "visual") return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
      lastEmittedRef.current = value;
    }
  }, [mode, value]);

  function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }

  function emitChange() {
    const el = editorRef.current;
    if (!el) return;
    const nextHtml = el.innerHTML;
    lastEmittedRef.current = nextHtml;
    onChange(nextHtml);
  }

  function exec(command: string, commandVal?: string) {
    if (disabled || mode !== "visual") return;
    restoreSelection();
    document.execCommand(command, false, commandVal);
    saveSelection();
    emitChange();
  }

  function insertHtmlAtCursor(snippet: string) {
    if (disabled) return;
    if (mode === "html") {
      onChange(`${value}${value ? "\n" : ""}${snippet}`);
      return;
    }
    restoreSelection();
    document.execCommand("insertHTML", false, snippet);
    saveSelection();
    emitChange();
  }

  function handleBlockChange(nextTag: string) {
    setBlockType(nextTag);
    exec("formatBlock", `<${nextTag}>`);
  }

  function handleInsertPullQuote() {
    insertHtmlAtCursor(
      `<blockquote><strong>Trail Insight:</strong> Highlight key altitude acclimatization windows, best season views, and essential permit tips for trekkers.</blockquote><p><br/></p>`
    );
  }

  function handleInsertTable() {
    insertHtmlAtCursor(
      `<table><thead><tr><th>Stage / Camp</th><th>Altitude</th><th>Approx. Duration</th></tr></thead><tbody><tr><td>Trailhead</td><td>2,400 m</td><td>5–6 hours</td></tr><tr><td>High Camp</td><td>4,100 m</td><td>4–5 hours</td></tr></tbody></table><p><br/></p>`
    );
  }

  function handleConfirmLink(e: React.FormEvent) {
    e.preventDefault();
    const url = linkUrl.trim();
    if (!url) return;
    const label = linkText.trim() || url;
    insertHtmlAtCursor(
      `<a href="${escapeAttr(url)}">${escapeAttr(label)}</a>`
    );
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  }

  function handleConfirmImage(e: React.FormEvent) {
    e.preventDefault();
    const src = imgUrl.trim();
    if (!src) return;
    const alt = imgAlt.trim() || "Himalayan trekking region view";
    insertHtmlAtCursor(
      `<figure><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" /><figcaption>${escapeAttr(alt)}</figcaption></figure><p><br/></p>`
    );
    setShowImageDialog(false);
    setImgUrl("");
    setImgAlt("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || disabled) return;

    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "trips");

      const res = await authFetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.url) {
        setUploadError(json.error || "Failed to upload image.");
        return;
      }

      const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      insertHtmlAtCursor(
        `<figure><img src="${escapeAttr(json.url)}" alt="${escapeAttr(alt)}" /></figure><p><br/></p>`
      );
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploading(false);
    }
  }

  function handleClearDocument() {
    if (disabled) return;
    if (
      value.trim() &&
      !window.confirm("Clear all region SEO article content in this editor?")
    ) {
      return;
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    lastEmittedRef.current = "";
    onChange("");
  }

  const canvasFontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "heading"
      ? "font-heading"
      : "font-sans";

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[9000] flex flex-col bg-[#f1f5f9] p-3 sm:p-5"
          : "rounded-2xl border border-slate-200 bg-[#f8fafc] overflow-hidden shadow-xs"
      }
    >
      {/* Top Docs Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 font-heading font-bold uppercase tracking-[0.14em] text-[#f05e25]">
            <span className="h-2 w-2 rounded-full bg-[#f05e25]" />
            <span>BROTHERS DOCS</span>
          </span>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={handleClearDocument}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1c1917] disabled:opacity-50 cursor-pointer"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowImageDialog(true);
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1c1917] disabled:opacity-50 cursor-pointer"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              <span>Insert Image</span>
            </button>
            <button
              type="button"
              onClick={handleInsertPullQuote}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1c1917] disabled:opacity-50 cursor-pointer"
            >
              <Quote className="h-3.5 w-3.5" />
              <span>Pull Quote</span>
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              disabled={disabled}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1c1917] disabled:opacity-50 cursor-pointer"
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-[#f8fafc] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode("visual")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                mode === "visual"
                  ? "bg-white text-[#f05e25] shadow-xs"
                  : "text-slate-600 hover:text-[#1c1917]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("html")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                mode === "html"
                  ? "bg-white text-[#3f6e15] shadow-xs"
                  : "text-slate-600 hover:text-[#1c1917]"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>HTML</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            title={fullscreen ? "Exit Fullscreen" : "Expand Docs Editor"}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-[#f05e25] hover:text-[#f05e25] transition-colors cursor-pointer"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Toolbar Row 1 & Row 2 (Visual Mode) */}
      {mode === "visual" && (
        <div className="border-b border-slate-200 bg-[#f8fafc] px-3 py-2 space-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => exec("undo")}
              title="Undo"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("redo")}
              title="Redo"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("removeFormat")}
              title="Clear Formatting"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Eraser className="h-4 w-4" />
            </button>

            <span className="mx-1 h-4 w-px bg-slate-300" />

            <select
              aria-label="Text style"
              value={blockType}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#1c1917] focus:border-[#f05e25] focus:outline-none"
            >
              <option value="p">Normal text</option>
              <option value="h2">Heading 2 (SEO Section)</option>
              <option value="h3">Heading 3 (Sub-section)</option>
              <option value="h4">Heading 4</option>
            </select>

            <select
              aria-label="Font family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#1c1917] focus:border-[#f05e25] focus:outline-none"
            >
              <option value="sans">Poppins (Clean)</option>
              <option value="heading">Oswald (Editorial)</option>
              <option value="serif">Georgia (Classic)</option>
            </select>

            <div className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-1 text-xs">
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                className="px-1.5 text-slate-600 hover:text-[#f05e25] cursor-pointer"
                aria-label="Decrease font size"
              >
                -
              </button>
              <span className="w-7 text-center font-medium tabular-nums text-[#1c1917]">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                className="px-1.5 text-slate-600 hover:text-[#f05e25] cursor-pointer"
                aria-label="Increase font size"
              >
                +
              </button>
            </div>

            <span className="mx-1 h-4 w-px bg-slate-300" />

            <button
              type="button"
              onClick={() => exec("bold")}
              title="Bold"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("italic")}
              title="Italic"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("underline")}
              title="Underline"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("strikeThrough")}
              title="Strikethrough"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Strikethrough className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowTextColors((v) => !v);
                  setShowHighlights(false);
                }}
                title="Text Color"
                className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
              >
                <Palette className="h-4 w-4" />
              </button>
              {showTextColors && (
                <div className="absolute left-0 top-9 z-30 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => {
                        exec("foreColor", c.value);
                        setShowTextColors(false);
                      }}
                      className="h-5 w-5 rounded-full border border-slate-300 cursor-pointer"
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowHighlights((v) => !v);
                  setShowTextColors(false);
                }}
                title="Highlight Color"
                className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
              >
                <Highlighter className="h-4 w-4" />
              </button>
              {showHighlights && (
                <div className="absolute left-0 top-9 z-30 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => {
                        exec("hiliteColor", c.value);
                        setShowHighlights(false);
                      }}
                      className="h-5 w-5 rounded-full border border-slate-300 cursor-pointer"
                      style={{
                        backgroundColor:
                          c.value === "transparent" ? "#ffffff" : c.value,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 border-t border-slate-200/80 pt-1.5">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowLinkDialog(true);
              }}
              title="Insert Link"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5 text-[#3f6e15]" />
              <span>Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowImageDialog(true);
              }}
              title="Insert from Library or URL"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <ImagePlus className="h-3.5 w-3.5 text-[#f05e25]" />
              <span>Library</span>
            </button>

            <button
              type="button"
              onClick={() => {
                saveSelection();
                fileInputRef.current?.click();
              }}
              disabled={uploading || disabled}
              title="Upload Image File"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-[#3f6e15]" />
              <span>{uploading ? "Uploading..." : "Upload"}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <span className="mx-1 h-4 w-px bg-slate-300" />

            <button
              type="button"
              onClick={() => exec("justifyLeft")}
              title="Align Left"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyCenter")}
              title="Align Center"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyRight")}
              title="Align Right"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyFull")}
              title="Justify"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </button>

            <span className="mx-1 h-4 w-px bg-slate-300" />

            <button
              type="button"
              onClick={() => exec("insertUnorderedList")}
              title="Bullet List"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("insertOrderedList")}
              title="Numbered List"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("outdent")}
              title="Outdent"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Outdent className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("indent")}
              title="Indent"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Indent className="h-3.5 w-3.5" />
            </button>

            <span className="mx-1 h-4 w-px bg-slate-300" />

            <button
              type="button"
              onClick={handleInsertPullQuote}
              title="Blockquote"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec("insertHorizontalRule")}
              title="Horizontal Divider"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError("")}
            className="text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Docs Ruler Strip */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f1f5f9] px-5 py-1 text-[10px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-8 sm:gap-12">
          <span>| 1</span>
          <span>| 2</span>
          <span>| 3</span>
          <span className="hidden sm:inline">| 4</span>
          <span className="hidden sm:inline">| 5</span>
          <span className="hidden md:inline">| 6</span>
          <span className="hidden md:inline">| 7</span>
        </div>
        <span>Brothers Editorial Canvas</span>
      </div>

      {/* Document Sheet Area */}
      <div
        className={`bg-[#eef2f6] p-4 sm:p-8 overflow-y-auto ${
          fullscreen ? "flex-1" : "max-h-[540px]"
        }`}
      >
        {mode === "visual" ? (
          <div className="relative mx-auto min-h-[380px] max-w-[780px] rounded-lg border border-slate-200/90 bg-white px-6 py-8 sm:px-12 sm:py-10 shadow-sm">
            {!value.replace(/<[^>]+>/g, "").trim() && (
              <div className="pointer-events-none absolute left-6 sm:left-12 top-8 sm:top-10 text-sm text-slate-400">
                {placeholder}
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable={!disabled}
              suppressContentEditableWarning
              onInput={emitChange}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
              onBlur={() => {
                saveSelection();
                emitChange();
              }}
              style={{ fontSize: `${fontSize}px` }}
              className={`region-seo-prose min-h-[320px] outline-none ${canvasFontClass}`}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-[780px]">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              rows={16}
              placeholder="<h2>Complete Region Trekking Guide</h2><p>...</p>"
              className="w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-xs text-[#1c1917] focus:border-[#f05e25] focus:outline-none focus:ring-2 focus:ring-[#f05e25]/15"
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-4 tabular-nums">
          <span>
            <strong className="text-[#1c1917]">{stats.words}</strong> words
          </span>
          <span>
            <strong className="text-[#1c1917]">{stats.chars}</strong> chars
          </span>
          <span>
            {stats.minutes > 0 ? `~${stats.minutes} min read` : "Empty draft"}
          </span>
        </div>
        <span className="text-slate-400">
          Sanitized automatically on save
        </span>
      </div>

      {/* Link Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleConfirmLink}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-[#1c1917]">
                Insert Link
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="text-slate-400 hover:text-[#1c1917] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annapurna Circuit Trek"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-[#f05e25] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="/destinations/annapurna-circuit or https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs focus:border-[#f05e25] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#f05e25] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e18] cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image / Library Modal */}
      {showImageDialog && (
        <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleConfirmImage}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-[#1c1917]">
                Insert Image with Alt Text
              </h3>
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="text-slate-400 hover:text-[#1c1917] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Choose from Site Library
                </label>
                <select
                  value={
                    HERO_IMAGE_PRESETS.some((p) => p.url === imgUrl) ? imgUrl : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) setImgUrl(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs text-[#1c1917] focus:border-[#f05e25] focus:outline-none"
                >
                  <option value="">Select preset image...</option>
                  {HERO_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label} ({preset.url})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image URL / Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="/images/trips/annapurna.jpg"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs focus:border-[#f05e25] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Alt Text (Important for SEO score)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annapurna Base Camp trail at sunrise"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-[#f05e25] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#f05e25] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e18] cursor-pointer"
              >
                Insert Image
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
