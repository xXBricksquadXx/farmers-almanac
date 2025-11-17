// scripts/generate-almanac.mjs
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Moon } from 'lunarphase-js';

const REGION = 'Middle Tennessee / Zone 7a';

function* eachDay(from, to) {
  const cur = new Date(from);
  while (cur <= to) {
    yield new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
}

// Map library's phase names ("Waxing Crescent", etc.) into our slugs
function mapPhaseName(name) {
  switch (name) {
    case 'New':
      return 'new';
    case 'Waxing Crescent':
      return 'waxing_crescent';
    case 'First Quarter':
      return 'first_quarter';
    case 'Waxing Gibbous':
      return 'waxing_gibbous';
    case 'Full':
      return 'full';
    case 'Waning Gibbous':
      return 'waning_gibbous';
    case 'Last Quarter':
      return 'last_quarter';
    case 'Waning Crescent':
      return 'waning_crescent';
    default:
      return 'unknown';
  }
}

function buildDay(date) {
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const phaseName = Moon.lunarPhase(date); // e.g. "Waxing Gibbous"
  const moonPhase = mapPhaseName(phaseName);

  return {
    date: iso,
    moonPhase,
    moonName: null,
    sign: null,
    notes: null,
    region: REGION,
    holiday: null,
    eclipse: null,
    crops: [],
    farming: {},
    business: {},
  };
}

function main() {
  const from = new Date('2025-01-01T00:00:00Z');
  const to = new Date('2026-12-31T00:00:00Z');

  const days = [];
  for (const d of eachDay(from, to)) {
    days.push(buildDay(d));
  }

  const outPath = join(process.cwd(), 'src', 'data', 'almanac-2025-2026.json');
  writeFileSync(outPath, JSON.stringify(days, null, 2));
  console.log(`Wrote ${days.length} days to ${outPath}`);
}

main();
