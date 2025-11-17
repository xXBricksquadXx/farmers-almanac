import { AlmanacDay } from "./DayCard";

type Props = {
  year: number;
  monthIndex: number; // 0-11
  days: AlmanacDay[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
};

type Cell = {
  dayNumber: number | null;
  entry: AlmanacDay | null;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const phaseLabels: Record<string, string> = {
  new: "New Moon",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  full: "Full Moon",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
};

function isoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function isoToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function MonthCalendarGrid({
  year,
  monthIndex,
  days,
  selectedDate,
  onSelectDate,
}: Props) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayIso = isoToday();

  const byDate = new Map<string, AlmanacDay>();
  days.forEach((d) => byDate.set(d.date, d));

  const cells: Cell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ dayNumber: null, entry: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = isoDate(year, monthIndex, day);
    cells.push({ dayNumber: day, entry: byDate.get(dateStr) ?? null });
  }

  return (
    <section>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg bg-slate-800">
        {cells.map((cell, idx) => {
          if (cell.dayNumber === null) {
            return (
              <div key={idx} className="h-24 bg-slate-950/70" />
            );
          }

          const entry = cell.entry;
          const isSelected = entry && selectedDate === entry.date;
          const isToday = entry && entry.date === todayIso;

          let subtitle = "";
          if (entry?.holiday) {
            subtitle = entry.holiday;
          } else if (entry?.moonName) {
            subtitle = entry.moonName;
          } else if (entry) {
            subtitle = phaseLabels[entry.moonPhase] ?? entry.moonPhase;
          }

          const baseClasses =
            "flex h-24 flex-col border border-slate-800 bg-slate-950/90 p-1.5 text-left text-xs focus:outline-none";
          const hoverClasses = entry
            ? "cursor-pointer hover:border-emerald-400 hover:bg-slate-900"
            : "";
          const selectedClasses = isSelected
            ? "border-emerald-400 bg-slate-900"
            : "";
          const todayClasses = isToday
            ? "ring-1 ring-emerald-400/60 ring-offset-0"
            : "";

          return (
            <button
              key={idx}
              type="button"
              onClick={() => entry && onSelectDate && onSelectDate(entry.date)}
              className={[
                baseClasses,
                hoverClasses,
                selectedClasses,
                todayClasses,
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold text-slate-100">
                  {cell.dayNumber}
                </span>
                <div className="flex gap-1">
                  {entry?.holiday && (
                    <span className="rounded-full bg-amber-500/20 px-1 text-[9px] text-amber-300">
                      H
                    </span>
                  )}
                  {entry?.moonPhase === "full" && !entry.holiday && (
                    <span className="rounded-full bg-sky-500/20 px-1 text-[9px] text-sky-300">
                      ●
                    </span>
                  )}
                </div>
              </div>

              {subtitle && (
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-200">
                  {subtitle}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border border-emerald-400" />{" "}
          Today
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full bg-sky-500/20 px-1 text-[9px] text-sky-300">
            ●
          </span>
          Full moon
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full bg-amber-500/20 px-1 text-[9px] text-amber-300">
            H
          </span>
          Holiday
        </span>
      </div>
    </section>
  );
}
