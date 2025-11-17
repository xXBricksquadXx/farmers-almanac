"use client"; // MUST be first line

import { useState } from "react";
import data from "@/data/almanac-2025-2026.json";
import { AlmanacDay } from "@/components/DayCard";
import { MonthGrid } from "@/components/MonthGrid";

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

  const days = (data as AlmanacDay[]).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const grouped = groupByMonth(days);
  const monthKeys = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50">
            Farmer&apos;s Almanac: Moon &amp; Business
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Moon phases, named full moons, and practical notes for planting,
            harvesting, and contracts.
          </p>
        </header>

        {/* Filter buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
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

        {/* Month sections */}
        {monthKeys.map((key) => {
          const original = grouped[key];

          const filtered =
            filter === "all"
              ? original
              : original.filter((d) =>
                  filter === "farming" ? !!d.farming : !!d.business
                );

          // If no days match this filter for this month, skip rendering that month
          if (filtered.length === 0) return null;

          return (
            <MonthGrid
              key={key}
              label={monthLabelFromKey(key)}
              days={filtered}
            />
          );
        })}
      </div>
    </main>
  );
}
