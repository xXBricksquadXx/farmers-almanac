import data from "@/data/almanac-2025-2026.json";
import { AlmanacDay } from "@/components/DayCard";
import { MonthGrid } from "@/components/MonthGrid";

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
  const days = (data as AlmanacDay[]).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const grouped = groupByMonth(days);
  const monthKeys = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-50">
            Farmer&apos;s Almanac: Moon &amp; Business
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Moon phases, named full moons, and practical notes for planting,
            harvesting, and contracts.
          </p>
        </header>

        {monthKeys.map((key) => (
          <MonthGrid key={key} label={monthLabelFromKey(key)} days={grouped[key]} />
        ))}
      </div>
    </main>
  );
}
