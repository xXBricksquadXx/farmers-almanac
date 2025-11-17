import { AlmanacDay } from "./DayCard";

type Props = {
  year: number;
  monthIndex: number; // 0-11
  days: AlmanacDay[]; // already filtered for this month + filter mode
};

type Cell = {
  dayNumber: number | null;
  entry: AlmanacDay | null;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

export function MonthCalendarGrid({ year, monthIndex, days }: Props) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const byDate = new Map<string, AlmanacDay>();
  days.forEach((d) => byDate.set(d.date, d));

  const cells: Cell[] = [];

  // Leading empty cells
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ dayNumber: null, entry: null });
  }

  // Month days
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
              <div
                key={idx}
                className="h-20 bg-slate-950/60"
              />
            );
          }

          const hasEntry = !!cell.entry;

          return (
            <div
              key={idx}
              className={[
                "flex h-20 flex-col border border-slate-800 bg-slate-950/80 p-1 text-xs",
                hasEntry ? "cursor-pointer hover:border-emerald-400" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold text-slate-100">
                  {cell.dayNumber}
                </span>
                {cell.entry?.holiday && (
                  <span className="rounded-full bg-amber-500/20 px-1 text-[9px] text-amber-300">
                    H
                  </span>
                )}
              </div>
              {hasEntry && (
                <div className="mt-1 space-y-0.5">
                  <p className="truncate text-[10px] text-slate-200">
                    {cell.entry?.moonName
                      ? cell.entry.moonName
                      : cell.entry?.moonPhase}
                  </p>
                  {cell.entry?.farming && (
                    <p className="truncate text-[9px] text-emerald-300">
                      Farm: {cell.entry.farming.bestFor?.[0] ?? "see details"}
                    </p>
                  )}
                  {cell.entry?.business && (
                    <p className="truncate text-[9px] text-sky-300">
                      Biz: {cell.entry.business.bestFor?.[0] ?? "see details"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
