export type AlmanacDay = {
  date: string;
  moonPhase: string;
  moonName?: string | null;
  sign?: string | null;
  notes?: string | null;
  tags?: string[];
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

export function DayCard({ day }: { day: AlmanacDay }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{formatDate(day.date)}</h2>
          <p className="text-xs uppercase text-slate-400">
            {phaseLabels[day.moonPhase] ?? day.moonPhase}
            {day.moonName ? ` • ${day.moonName}` : ""}
          </p>
        </div>
        {day.sign && (
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">
            {day.sign}
          </span>
        )}
      </div>

      {day.notes && (
        <p className="mt-3 text-sm text-slate-200">{day.notes}</p>
      )}

      {day.tags && day.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {day.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
