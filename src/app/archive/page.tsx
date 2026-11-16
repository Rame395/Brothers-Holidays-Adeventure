"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ARCHIVE_ENTRIES, ArchiveEntry } from "@/data/archive";

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDecade, setActiveDecade] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(true);
  const [sortKey, setSortKey] = useState<"year" | "alt">("year");
  const [activeEntry, setActiveEntry] = useState<ArchiveEntry | null>(null);
  const [newEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [entries, setEntries] = useState<ArchiveEntry[]>(ARCHIVE_ENTRIES);

  const [newEntryForm, setNewEntryForm] = useState({
    name: "",
    region: "",
    year: "2026",
    altitude: "5000",
    summary: "",
  });

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = entries.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.subRegion.toLowerCase().includes(q) ||
        item.year.toString().includes(q);

      const matchesDecade =
        activeDecade === "All" || item.decade === activeDecade;

      return matchesQuery && matchesDecade;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "year") {
        comparison = a.year - b.year;
      } else if (sortKey === "alt") {
        comparison = a.altitude - b.altitude;
      }
      return sortAscending ? comparison : -comparison;
    });
  }, [entries, searchQuery, activeDecade, sortKey, sortAscending]);

  const handleExportCSV = () => {
    const headers = "Year,Name,Region,Pass,AltitudeMeters,Status\n";
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.year}","${e.name}","${e.region}","${e.passDetail}","${e.altitude}","${e.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "kharka_alpine_archive.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ArchiveEntry = {
      id: `${newEntryForm.year}-${newEntryForm.name.toLowerCase().replace(/\s+/g, "-")}`,
      year: parseInt(newEntryForm.year, 10) || 2026,
      decade: "2020s",
      name: newEntryForm.name,
      region: newEntryForm.region,
      subRegion: "Registered Field Route",
      passDetail: "High Ridge Crossing",
      status: "Documented",
      altitude: parseInt(newEntryForm.altitude, 10) || 5000,
      altitudeFt: `${Math.round(
        (parseInt(newEntryForm.altitude, 10) || 5000) * 3.28084
      ).toLocaleString()} ft`,
      icon: "bookmark",
      summary: newEntryForm.summary || "Documented field survey contribution.",
    };
    setEntries([created, ...entries]);
    setNewEntryModalOpen(false);
    setNewEntryForm({
      name: "",
      region: "",
      year: "2026",
      altitude: "5000",
      summary: "",
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-margin py-10 space-y-10">
        {/* Header & Search */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
                  Field Library &amp; Ledger
                </span>
                <span className="text-outline-variant">/</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Established 1984
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight tracking-tight">
                Trek History Library
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Four decades of documented traverses, weather telemetry logs,
                and high-pass route chronicles across the Nepal Himalaya.
              </p>
            </div>

            {/* Year Selector / Active Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface border border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  calendar_month
                </span>
                <span className="font-label-lg text-label-lg">
                  Active Era:{" "}
                  <span className="font-medium text-primary">
                    {activeDecade === "All" ? "All Years" : activeDecade}
                  </span>
                </span>
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-semibold">
                  {filteredEntries.length}
                </span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">
                  history_edu
                </span>
                <span>Est. 1984</span>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              manage_search
            </span>
            <input
              className="w-full pl-12 pr-10 py-3.5 rounded-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md shadow-sm outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
              id="archiveSearchInput"
              placeholder="Search past expeditions, years, or regions (e.g. Annapurna, 1984, Dolpo)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                onClick={() => setSearchQuery("")}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Quick Decade Filtering Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { label: "All Decades", val: "All" },
              { label: "1980s (2)", val: "1980s" },
              { label: "1990s (1)", val: "1990s" },
              { label: "2000s (2)", val: "2000s" },
              { label: "2010s (3)", val: "2010s" },
              { label: "2020s (2)", val: "2020s" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setActiveDecade(tab.val)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                  activeDecade === tab.val
                    ? "bg-primary text-on-primary shadow-md"
                    : tab.val === "1980s" ? "bg-[#006b78]/10 text-[#006b78] hover:bg-[#006b78]/20 border border-[#006b78]/20"
                    : tab.val === "1990s" ? "bg-[#c88a3e]/10 text-[#895508] hover:bg-[#c88a3e]/20 border border-[#c88a3e]/20"
                    : tab.val === "2000s" ? "bg-[#00515b]/10 text-[#00515b] hover:bg-[#00515b]/20 border border-[#00515b]/20"
                    : tab.val === "2010s" ? "bg-[#006b78]/10 text-[#006b78] hover:bg-[#006b78]/20 border border-[#006b78]/20"
                    : tab.val === "2020s" ? "bg-[#895508]/10 text-[#895508] hover:bg-[#895508]/20 border border-[#895508]/20"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-variant border border-outline-variant/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Toolbar Strip */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span
                className="font-label-lg text-label-lg text-on-surface font-semibold"
                id="recordCountLabel"
              >
                {filteredEntries.length}{" "}
                {filteredEntries.length === 1 ? "record" : "records"}
              </span>
            </div>
            <span className="text-on-surface-variant/40">/</span>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">
                filter_alt
              </span>
              <span>All decades · Altitude band · Region</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
              id="sortToggleBtn"
              onClick={() => setSortAscending(!sortAscending)}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                swap_vert
              </span>
              <span>
                {sortAscending ? "Chronological (Asc)" : "Chronological (Desc)"}
              </span>
            </button>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
              title="Export Ledger as CSV"
              onClick={handleExportCSV}
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              <span>Export Log</span>
            </button>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors cursor-pointer"
              title="Contribute archival ledger entry"
              onClick={() => setNewEntryModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Entry</span>
            </button>
          </div>
        </section>

        {/* Historical Archive Ledger Table */}
        <section className="w-full space-y-4">
          <div className="w-full bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-outline-variant/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="py-4 px-6 font-semibold">
                      Trek Title &amp; Region
                    </th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th
                      className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => {
                        setSortKey("year");
                        setSortAscending(!sortAscending);
                      }}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>Year</span>
                        <span className="material-symbols-outlined text-[14px]">
                          unfold_more
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => {
                        setSortKey("alt");
                        setSortAscending(!sortAscending);
                      }}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>Max Altitude</span>
                        <span className="material-symbols-outlined text-[14px]">
                          north_east
                        </span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right font-semibold">
                      Field Notes &amp; Logs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((item) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-surface-container-low/80 transition-colors cursor-pointer"
                        onClick={() => setActiveEntry(item)}
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-primary">
                              <span className="material-symbols-outlined text-[16px]">
                                {item.icon}
                              </span>
                            </span>
                            <div>
                              <div className="font-headline-sm text-headline-sm text-on-surface font-medium group-hover:text-primary transition-colors">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                                <span>{item.subRegion}</span>
                                <span>·</span>
                                <span>{item.passDetail}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${
                              item.status === "Archived"
                                ? "bg-surface-container text-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "Archived"
                                  ? "bg-primary"
                                  : "bg-tertiary"
                              }`}
                            ></span>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-5 px-4">
                          <span className="font-display-md text-headline-md text-on-surface">
                            {item.year}
                          </span>
                        </td>

                        <td className="py-5 px-4">
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm font-semibold text-primary">
                              {item.altitude.toLocaleString()} m
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              {item.altitudeFt}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-6 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEntry(item);
                            }}
                          >
                            <span>Field Notes</span>
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_forward
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center space-y-3">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                          folder_off
                        </span>
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                          No historical logs match your parameters
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Try adjusting search keywords or clearing active decade
                          filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Archival Spotlight & Visual Documentation Cards */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Photographic Index
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Expedition Folios &amp; Cartographic Relics
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Preserved hand-drawn topo charts, glass-plate slides, and weather
              station logbooks cataloged from early reconnaissance ventures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual 1 */}
            <article className="group rounded-3xl bg-surface-container-lowest p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/30">
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Annapurna North Face Traverse 1984"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEYXXGc6c71VqIbWPLRmI8qQuCECoU0XIaZCvr3p3vz5kA-7dDsKaphO9qSN0GEdt1fMuF95-Xzdl9-mtATkn1Fmo8wMaUsRcKOLGpUNan38VnZ8V_ldyiexDCAnwSG6VenPF3aKiISQ1oeQ2VymqEdd113uA8DqmqMsu78pg160Mvoj1CEYZwuRGh8NeBquLJAH5sRUEOtOLj8t-oZa54kgq0EWjcdh0nPN11u3U"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                  Folio · 1984
                </span>
              </div>
              <div className="pt-4 space-y-2">
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  Annapurna North Face Traverse
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Original Kodachrome 35mm slide scans from the first trans-ridge
                  geological study led by the Kathmandu Alpine Institute.
                </p>
                <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-primary font-medium">
                  <span>18 Archival Slides</span>
                  <span className="material-symbols-outlined text-[16px]">
                    visibility
                  </span>
                </div>
              </div>
            </article>

            {/* Visual 2: Inline Technical Elevation SVG Relief Chart */}
            <article className="group rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                    Cartography Profile
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Log Ref #08-MAN
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Manaslu &amp; Larkya Pass Relief
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Reconstructed elevation gradient documenting glacial moraine
                  shrinkage between 2001 and 2024 surveys.
                </p>
              </div>

              <div className="my-4 py-2 w-full">
                <svg
                  className="w-full h-24 overflow-visible"
                  fill="none"
                  viewBox="0 0 320 90"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="elevationGradRelief"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="90"
                    >
                      <stop stopColor="#006b78" stopOpacity="0.35"></stop>
                      <stop
                        offset="100%"
                        stopColor="#006b78"
                        stopOpacity="0.0"
                      ></stop>
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 75 Q 40 70 80 52 T 160 42 T 220 12 T 280 48 T 320 62 L 320 90 L 0 90 Z"
                    fill="url(#elevationGradRelief)"
                  ></path>
                  <path
                    d="M0 75 Q 40 70 80 52 T 160 42 T 220 12 T 280 48 T 320 62"
                    stroke="#006b78"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  ></path>
                  <circle
                    className="animate-pulse"
                    cx="220"
                    cy="12"
                    fill="#006b78"
                    r="4.5"
                  ></circle>
                  <text
                    fill="#00515b"
                    fontFamily="Newsreader"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    x="220"
                    y="6"
                  >
                    5,106 m (Pass)
                  </text>
                  <text
                    fill="#55606a"
                    fontFamily="Geist"
                    fontSize="8"
                    x="4"
                    y="86"
                  >
                    Soti Khola (700m)
                  </text>
                  <text
                    fill="#55606a"
                    fontFamily="Geist"
                    fontSize="8"
                    textAnchor="end"
                    x="316"
                    y="86"
                  >
                    Dharapani
                  </text>
                </svg>
              </div>

              <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-primary font-medium">
                <span>Inspect Relief Contours</span>
                <span className="material-symbols-outlined text-[16px]">
                  polyline
                </span>
              </div>
            </article>

            {/* Visual 3 */}
            <article className="group rounded-3xl bg-surface-container-lowest p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/30">
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Khumbu Meteorological Diaries 1995"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCklHTpH4wPdJWcIenYP-TTzP92g2XFSdqUdHGf0WKpJq4mGcAabnmbGyU_LKcHDvfA5Vj72EumJwnp9mqFrZU9r9lkvf0FP2WYqatHpK4iUXAZz1K3yFk56wvPwxLyv1o00ZX9JdM_WGcCeDOdJSbxtWkK4T6fNeR4uQcSv_vo14tcQyQ5GdEn-_6eCMlLwC_mLpDXluP9oQUXBj8JO7hqJ-rWLSyeS8-waiuh030"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                  Ledger · 1995
                </span>
              </div>
              <div className="pt-4 space-y-2">
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  Khumbu Meteorological Diaries
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Daily temperature logs, windward gusts, and barometric
                  anomalies recorded during the pre-monsoon storm cycle.
                </p>
                <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-primary font-medium">
                  <span>Read Transcribed Text</span>
                  <span className="material-symbols-outlined text-[16px]">
                    menu_book
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Archival Statistics Ribbon */}
        <section className="p-8 rounded-3xl bg-surface-container-low grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-outline-variant/30">
          <div className="space-y-1">
            <span className="font-display-md text-display-md text-primary font-normal">
              40
            </span>
            <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Years of Field Records
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display-md text-display-md text-primary font-normal">
              5,755m
            </span>
            <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Highest Pass Recorded
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display-md text-display-md text-primary font-normal">
              14
            </span>
            <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Protected Valleys
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display-md text-display-md text-primary font-normal">
              1,480+
            </span>
            <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Field Log Transcripts
            </p>
          </div>
        </section>
      </div>

      {/* Field Note View Modal */}
      {activeEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative border border-outline-variant/30">
            <button
              onClick={() => setActiveEntry(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>

            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Archival Folio #{activeEntry.year} · {activeEntry.status}
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                {activeEntry.name}
              </h3>
              <p className="font-label-sm text-on-surface-variant">
                {activeEntry.subRegion} · {activeEntry.passDetail}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low text-body-md text-on-surface leading-relaxed">
              {activeEntry.summary}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-surface-container">
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Peak Altitude
                </span>
                <strong className="text-primary font-headline-sm">
                  {activeEntry.altitude.toLocaleString()} m ({activeEntry.altitudeFt})
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container">
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Survey Year
                </span>
                <strong className="text-on-surface font-headline-sm">
                  {activeEntry.year} AD
                </strong>
              </div>
            </div>

            <div className="pt-2 flex gap-4">
              <Link
                href="/treks"
                className="flex-1 py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-center hover:bg-primary transition-colors"
              >
                Find Current Equivalent Trek
              </Link>
              <button
                onClick={() => setActiveEntry(null)}
                className="px-6 py-3 rounded-full bg-surface-container text-on-surface font-label-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Archival Record Modal */}
      {newEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-5 relative border border-outline-variant/30">
            <button
              onClick={() => setNewEntryModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>

            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Contribute Field Record
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                Log Historical Expedition
              </h3>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="font-label-sm uppercase text-on-surface block mb-1">
                  Trek Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rolwaling Survey"
                  className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none"
                  value={newEntryForm.name}
                  onChange={(e) =>
                    setNewEntryForm({ ...newEntryForm, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm uppercase text-on-surface block mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dolpo"
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none"
                    value={newEntryForm.region}
                    onChange={(e) =>
                      setNewEntryForm({
                        ...newEntryForm,
                        region: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="font-label-sm uppercase text-on-surface block mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1998"
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none"
                    value={newEntryForm.year}
                    onChange={(e) =>
                      setNewEntryForm({ ...newEntryForm, year: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm uppercase text-on-surface block mb-1">
                  Max Altitude (meters)
                </label>
                <input
                  type="number"
                  required
                  placeholder="5400"
                  className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none"
                  value={newEntryForm.altitude}
                  onChange={(e) =>
                    setNewEntryForm({
                      ...newEntryForm,
                      altitude: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="font-label-sm uppercase text-on-surface block mb-1">
                  Field Summary Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on the pass condition, weather, route..."
                  className="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-md focus:outline-none resize-none"
                  value={newEntryForm.summary}
                  onChange={(e) =>
                    setNewEntryForm({
                      ...newEntryForm,
                      summary: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-primary-container text-on-primary font-label-lg uppercase tracking-wider hover:bg-primary transition-colors shadow-md"
              >
                Append to Archive Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
