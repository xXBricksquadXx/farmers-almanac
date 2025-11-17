import { AlmanacDay } from "./DayCard";

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

function parseIso(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

function isoToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Today / next / last using ISO strings
function pickEntry(
  days: AlmanacDay[],
  selectedDate?: string | null
): AlmanacDay | null {
  if (!days.length) return null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  if (selectedDate) {
    const match = sorted.find((d) => d.date === selectedDate);
    if (match) return match;
  }

  const todayIso = isoToday();

  const todayMatch = sorted.find((d) => d.date === todayIso);
  if (todayMatch) return todayMatch;

  const nextFuture = sorted.find((d) => d.date > todayIso);
  if (nextFuture) return nextFuture;

  return sorted[sorted.length - 1] ?? null;
}

export function TodayStrip({
  days,
  selectedDate,
}: {
  days: AlmanacDay[];
  selectedDate?: string | null;
}) {
  const entry = pickEntry(days, selectedDate);
  if (!entry) return null;

  const { year, monthIndex, day } = parseIso(entry.date);
  const localDate = new Date(year, monthIndex, day);
  const dateLabel = localDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const phaseLabel = phaseLabels[entry.moonPhase] ?? entry.moonPhase;
  const farmingBest = entry.farming?.bestFor?.[0];
  const businessBest = entry.business?.bestFor?.[0];

  return (
    <section className="mb-6 rounded-none border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-50">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-300">
            Today&apos;s guidance
          </p>
          <p className="text-base font-semibold">{dateLabel}</p>
          <p className="text-[11px] text-slate-300">
            Moon phase: {phaseLabel}
            {entry.moonName ? ` • ${entry.moonName}` : ""}
            {entry.sign ? ` • in ${entry.sign}` : ""}
          </p>
        </div>
        {entry.region && (
          <p className="text-[11px] text-slate-300">
            Region: {entry.region}
          </p>
        )}
      </div>

        {entry.notes && (
        <p className="mt-2 text-[13px] leading-relaxed text-slate-100 dropcap">
          {entry.notes}
        </p>
      )}

      <div className="mt-2 space-y-1 text-xs text-slate-200">
        {farmingBest && (
          <p>
            <span className="font-semibold">Farming: </span>
            {farmingBest}
          </p>
        )}
        {businessBest && (
          <p>
            <span className="font-semibold">Business: </span>
            {businessBest}
          </p>
        )}
      </div>
    </section>
  );
}
