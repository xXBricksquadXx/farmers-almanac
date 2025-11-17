"use client";

import { useMemo, useState } from "react";
import data from "@/data/almanac-2025-2026.json";
import { AlmanacDay } from "@/components/DayCard";
import { MonthCalendarGrid } from "@/components/MonthCalendarGrid";
import { TodayStrip } from "@/components/TodayStrip";

type FilterMode = "all" | "farming" | "business";
type Grouped = Record<string, AlmanacDay[]>;

function groupByMonth(days: AlmanacDay[]): Grouped {
  return days.reduce<Grouped>((acc, day) => {
    const d = new Date(day.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(day);
    return acc;
  }, {});
}

function monthLabelFromKey(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function HomePage() {
  const [filter, setFilter] = useState<FilterMode>("all");

  const days = useMemo(
    () =>
      (data as AlmanacDay[]).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    []
  );

  const grouped = useMemo(() => groupByMonth(days), [days]);
  const monthKeys = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped]
  );

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    monthKeys[0] ?? ""
  );

  const currentIndex = Math.max(
    monthKeys.indexOf(selectedMonthKey),
    0
  );
  const currentKey = monthKeys[currentIndex] ?? "";
  const [yearStr, monthStr] = currentKey.split("-");
  const currentYear = Number(yearStr) || new Date().getFullYear();
  const currentMonthIndex = (Number(monthStr) || 1) - 1;

  const baseMonthDays = grouped[currentKey] ?? [];
  const filteredMonthDays =
    filter === "all"
      ? baseMonthDays
      : baseMonthDays.filter((d) =>
          filter === "farming" ? !!d.farming : !!d.business
        );

  function goPrevMonth() {
    if (currentIndex <= 0) return;
    setSelectedMonthKey(monthKeys[currentIndex - 1]);
  }

  function goNextMonth() {
    if (currentIndex >= monthKeys.length - 1) return;
    setSelectedMonthKey(monthKeys[currentIndex + 1]);
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-slate-50">
            Farmer&apos;s Almanac: Moon &amp; Business
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Moon phases, named full moons, and practical notes for planting,
            harvesting, and contracts, tuned to Middle Tennessee / Zone 7.
          </p>
        </header>

        <TodayStrip days={days} />

        {/* Month navigation */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={currentIndex <= 0}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={currentIndex >= monthKeys.length - 1}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300" htmlFor="month-select">
              Jump to
            </label>
            <select
              id="month-select"
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
            >
              {monthKeys.map((key) => (
                <option key={key} value={key}>
                  {monthLabelFromKey(key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "farming", "business"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={[
                "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-colors",
                filter === mode
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500",
              ].join(" ")}
            >
              {mode === "all"
                ? "All entries"
                : mode === "farming"
                ? "Farming focus"
                : "Business focus"}
            </button>
          ))}
        </div>

        {/* Calendar grid for the selected month */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">
            {monthLabelFromKey(currentKey)}
          </h2>
          <MonthCalendarGrid
            year={currentYear}
            monthIndex={currentMonthIndex}
            days={filteredMonthDays}
          />
        </section>
      </div>
    </main>
  );
}
