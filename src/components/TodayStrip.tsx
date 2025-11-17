import { AlmanacDay } from "./DayCard";

function normalize(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function pickGuidance(days: AlmanacDay[]): AlmanacDay | null {
  if (!days.length) return null;

  const todayTime = normalize(new Date());
  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Exact match?
  for (const d of sorted) {
    if (normalize(new Date(d.date)) === todayTime) return d;
  }

  // Next upcoming day
  for (const d of sorted) {
    if (normalize(new Date(d.date)) > todayTime) return d;
  }

  // Fallback: last known entry
  return sorted[sorted.length - 1] ?? null;
}

export function TodayStrip({ days }: { days: AlmanacDay[] }) {
  const entry = pickGuidance(days);
  if (!entry) return null;

  const dateLabel = new Date(entry.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const farmingBest = entry.farming?.bestFor?.[0];
  const businessBest = entry.business?.bestFor?.[0];

  return (
    <section className="mb-6 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-50">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">
            Today&apos;s guidance
          </p>
          <p className="text-base font-semibold">
            {dateLabel}
            {entry.moonName ? ` • ${entry.moonName}` : ""}
          </p>
          <p className="text-[11px] text-emerald-200">
            Moon phase: {entry.moonPhase}
            {entry.sign ? ` • in ${entry.sign}` : ""}
          </p>
        </div>
        {entry.region && (
          <p className="text-[11px] text-emerald-200">
            Region: {entry.region}
          </p>
        )}
      </div>

      {entry.notes && (
        <p className="mt-2 text-sm text-emerald-50">{entry.notes}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {farmingBest && (
          <p>
            <span className="font-semibold">Farming:</span> {farmingBest}
          </p>
        )}
        {businessBest && (
          <p>
            <span className="font-semibold">Business:</span> {businessBest}
          </p>
        )}
      </div>
    </section>
  );
}
