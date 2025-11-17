"use client";

import { useState } from "react";
import data from "@/data/almanac-2025-2026.json";
import { AlmanacDay } from "@/components/DayCard";
import { MonthCalendarGrid } from "@/components/MonthCalendarGrid";
import { TodayStrip } from "@/components/TodayStrip";

type Grouped = Record<string, AlmanacDay[]>;

function parseIso(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

function groupByMonth(days: AlmanacDay[]): Grouped {
  return days.reduce<Grouped>((acc, day) => {
    const { year, monthIndex } = parseIso(day.date);
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
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

function isoToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getInitialSelectedDate(days: AlmanacDay[]): string | null {
  if (!days.length) return null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const todayIso = isoToday();

  const todayMatch = sorted.find((d) => d.date === todayIso);
  if (todayMatch) return todayMatch.date;

  const nextFuture = sorted.find((d) => d.date > todayIso);
  if (nextFuture) return nextFuture.date;

  return sorted[sorted.length - 1].date;
}

function getMonthKeyForDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const { year, monthIndex } = parseIso(dateStr);
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

// --- Seasonal banner helpers ---

type SeasonInfo = {
  name: string;
  tone: string;
  farming: string;
  business: string;
};

function getSeasonForMonth(monthIndex: number): SeasonInfo {
  // monthIndex: 0 = Jan ... 11 = Dec
  if (monthIndex === 11 || monthIndex <= 1) {
    // Dec–Feb
    return {
      name: "Winter planning",
      tone: "Quiet fields, busy notebooks.",
      farming:
        "Focus on equipment maintenance, seed orders, pasture planning, and barn repairs.",
      business:
        "Good for budgeting, tax prep, and mapping cash flow before the next planting push.",
    };
  }
  if (monthIndex >= 2 && monthIndex <= 4) {
    // Mar–May
    return {
      name: "Spring emergence",
      tone: "Ground wakes up; plans take root.",
      farming:
        "Corn and soybean planting, pasture renovation, and watching soil temps and moisture.",
      business:
        "Strong time for launching new offers and lining up markets for the growing season.",
    };
  }
  if (monthIndex >= 5 && monthIndex <= 7) {
    // Jun–Aug
    return {
      name: "High summer",
      tone: "Growth, stress, and mid-season checks.",
      farming:
        "Side-dressing, irrigation, hay cutting, and keeping cattle on good forage.",
      business:
        "Run mid-season promotions, review margins on inputs, and cut what isn’t paying.",
    };
  }
  // Sep–Nov
  return {
    name: "Harvest & wrap-up",
    tone: "Bringing crops and accounts back home.",
    farming:
      "Harvesting corn and soybeans, bringing in pumpkins, and setting winter cover crops.",
    business:
      "Clear out risky contracts, settle accounts, and take a hard look at year-end numbers.",
  };
}

export default function HomePage() {
  const days = [...(data as AlmanacDay[])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const grouped = groupByMonth(days);
  const monthKeys = Object.keys(grouped).sort();

  const initialSelectedDate = getInitialSelectedDate(days);
  const initialMonthKey =
    getMonthKeyForDate(initialSelectedDate) ?? monthKeys[0] ?? "";

  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialSelectedDate
  );
  const [selectedMonthKey, setSelectedMonthKey] =
    useState<string>(initialMonthKey);

  const currentIndex = Math.max(monthKeys.indexOf(selectedMonthKey), 0);
  const currentKey = monthKeys[currentIndex] ?? "";
  const [yearStr, monthStr] = currentKey.split("-");
  const currentYear = Number(yearStr) || new Date().getFullYear();
  const currentMonthIndex = (Number(monthStr) || 1) - 1;

  const baseMonthDays = grouped[currentKey] ?? [];

  const season = getSeasonForMonth(currentMonthIndex);

  function goPrevMonth() {
    if (currentIndex <= 0) return;
    setSelectedMonthKey(monthKeys[currentIndex - 1]);
  }

  function goNextMonth() {
    if (currentIndex >= monthKeys.length - 1) return;
    setSelectedMonthKey(monthKeys[currentIndex + 1]);
  }

  function handleMonthSelect(value: string) {
    setSelectedMonthKey(value);
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-4 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-slate-50">
            Farmer&apos;s Almanac: Moon &amp; Business
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Moon phases, named full moons, and practical notes for planting,
            harvesting, and contracts, tuned to Middle Tennessee / Zone 7.
          </p>
        </header>

        <TodayStrip days={days} selectedDate={selectedDate} />

        {/* Seasonal banner */}
        <section className="mb-5 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-200">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Season guide
              </p>
              <p className="text-sm font-semibold text-slate-50">
                {season.name}
              </p>
              <p className="text-[11px] text-slate-300">{season.tone}</p>
            </div>
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Farming focus
              </p>
              <p className="mt-1 text-[12px] leading-relaxed">
                {season.farming}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Business focus
              </p>
              <p className="mt-1 text-[12px] leading-relaxed">
                {season.business}
              </p>
            </div>
          </div>
        </section>

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
              onChange={(e) => handleMonthSelect(e.target.value)}
            >
              {monthKeys.map((key) => (
                <option key={key} value={key}>
                  {monthLabelFromKey(key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">
            {monthLabelFromKey(currentKey)}
          </h2>
          <MonthCalendarGrid
            year={currentYear}
            monthIndex={currentMonthIndex}
            days={baseMonthDays}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        </section>
      </div>
    </main>
  );
}
