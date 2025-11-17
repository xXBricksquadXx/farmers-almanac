export type CategoryNotes = {
  bestFor?: string[];
  avoid?: string[];
};

export type AlmanacDay = {
  date: string;
  moonPhase: string;
  moonName?: string | null;
  sign?: string | null;
  notes?: string | null;
  farming?: CategoryNotes;
  business?: CategoryNotes;

  // New fields
  region?: string | null;
  holiday?: string | null;
  eclipse?: "solar" | "lunar" | null;
  crops?: string[];
};

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderCategory(label: string, cat?: CategoryNotes) {
  if (!cat || (!cat.bestFor && !cat.avoid)) return null;

  return (
    <div className="rounded-lg bg-slate-900/70 p-3 text-xs text-slate-200">
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </h3>
      {cat.bestFor && cat.bestFor.length > 0 && (
        <div className="mb-1">
          <p className="font-semibold text-emerald-300">Best for</p>
          <ul className="list-disc pl-4">
            {cat.bestFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {cat.avoid && cat.avoid.length > 0 && (
        <div>
          <p className="font-semibold text-rose-300">Avoid</p>
          <ul className="list-disc pl-4">
            {cat.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DayCard({ day }: { day: AlmanacDay }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            {formatDate(day.date)}
          </h2>
          <p className="text-xs uppercase text-slate-400">
            {phaseLabels[day.moonPhase] ?? day.moonPhase}
            {day.moonName ? ` • ${day.moonName}` : ""}
          </p>
          {day.region && (
            <p className="mt-1 text-[11px] text-slate-400">
              {day.region}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {day.sign && (
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">
              {day.sign}
            </span>
          )}
          {day.holiday && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-medium text-amber-300">
              {day.holiday}
            </span>
          )}
          {day.eclipse && (
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-medium text-indigo-300">
              {day.eclipse === "solar" ? "Solar eclipse" : "Lunar eclipse"}
            </span>
          )}
        </div>
      </div>

      {day.notes && (
        <p className="mt-3 text-sm text-slate-200">{day.notes}</p>
      )}

      {day.crops && day.crops.length > 0 && (
        <p className="mt-3 text-xs text-slate-300">
          Focus crops:{" "}
          <span className="font-medium">
            {day.crops.join(", ")}
          </span>
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {renderCategory("Farming", day.farming)}
        {renderCategory("Business", day.business)}
      </div>
    </article>
  );
}
