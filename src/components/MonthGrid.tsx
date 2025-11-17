import { AlmanacDay, DayCard } from "./DayCard";

type MonthGridProps = {
  label: string;       // e.g. "November 2025"
  days: AlmanacDay[];  // already filtered to that month
};

export function MonthGrid({ label, days }: MonthGridProps) {
  if (days.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-slate-100">{label}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </section>
  );
}
