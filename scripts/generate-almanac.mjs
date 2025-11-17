// scripts/generate-almanac.mjs
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Moon } from 'lunarphase-js';

const REGION = 'Middle Tennessee / Zone 7a';

// Helpers to stay in LOCAL time, not UTC
function makeLocalDate(year, monthIndex, day) {
  return new Date(year, monthIndex, day);
}

function toLocalIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function* eachDay(from, to) {
  const cur = makeLocalDate(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  );
  while (cur <= to) {
    // yield a copy
    yield new Date(cur.getFullYear(), cur.getMonth(), cur.getDate());
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

// Full-moon names by month (0 = January)
const FULL_MOON_NAMES = [
  'Wolf Moon',
  'Snow Moon',
  'Worm Moon',
  'Pink Moon',
  'Flower Moon',
  'Strawberry Moon',
  'Buck Moon',
  'Sturgeon Moon',
  'Harvest Moon',
  "Hunter's Moon",
  'Beaver Moon',
  'Cold Moon',
];

function getFullMoonName(date, moonPhase) {
  if (moonPhase !== 'full') return null;
  const month = date.getMonth(); // 0-11 (LOCAL)
  return FULL_MOON_NAMES[month] ?? null;
}

// Simple US holiday recognizer (major dates + a few moveable)
function getHoliday(date) {
  const m = date.getMonth() + 1; // 1-12 (LOCAL)
  const d = date.getDate(); // 1-31 (LOCAL)
  const weekday = date.getDay(); // 0 Sun - 6 Sat (LOCAL)

  // Fixed-date holidays
  if (m === 1 && d === 1) return "New Year's Day";
  if (m === 7 && d === 4) return 'Independence Day';
  if (m === 10 && d === 31) return 'Halloween';
  if (m === 12 && d === 25) return 'Christmas Day';

  // Labor Day: first Monday in September
  if (m === 9 && weekday === 1 && d <= 7) return 'Labor Day';

  // Thanksgiving: fourth Thursday in November
  if (m === 11 && weekday === 4) {
    const nth = Math.floor((d - 1) / 7) + 1;
    if (nth === 4) return 'Thanksgiving';
  }

  // Memorial Day: last Monday in May
  if (m === 5 && weekday === 1 && d + 7 > 31) return 'Memorial Day';

  return null;
}

function getSeason(date) {
  const m = date.getMonth(); // 0-11 LOCAL
  if (m === 11 || m <= 1) return 'winter'; // Dec, Jan, Feb
  if (m >= 2 && m <= 4) return 'spring'; // Mar–May
  if (m >= 5 && m <= 7) return 'summer'; // Jun–Aug
  return 'fall'; // Sep–Nov
}

function getPhaseGroup(moonPhase) {
  if (moonPhase === 'new') return 'new';
  if (moonPhase === 'full') return 'full';
  if (moonPhase === 'first_quarter' || moonPhase === 'last_quarter') {
    return 'quarter';
  }
  if (moonPhase.startsWith('waxing')) return 'waxing';
  if (moonPhase.startsWith('waning')) return 'waning';
  return 'other';
}

// Simple Middle Tennessee guidance for soy / corn / pumpkins / cattle
function getGuidance(season, phaseGroup) {
  const farming = { bestFor: [], avoid: [] };
  const business = { bestFor: [], avoid: [] };
  const crops = [];

  // Season + crops
  if (season === 'spring') {
    crops.push('corn', 'soybeans', 'pasture renovation');
  } else if (season === 'summer') {
    crops.push('corn', 'soybeans', 'hay', 'cattle forage');
  } else if (season === 'fall') {
    crops.push('pumpkins', 'cover crops', 'pasture management');
  } else {
    // winter
    crops.push('equipment maintenance', 'pasture planning');
  }

  // Phase-based guidance
  if (season === 'spring') {
    if (phaseGroup === 'new' || phaseGroup === 'waxing') {
      farming.bestFor.push(
        'starting corn and soybean plantings',
        'seeding cool-season pasture'
      );
      farming.avoid.push('heavy harvest operations');
      business.bestFor.push(
        'kicking off new projects',
        'planning marketing around planting season'
      );
      business.avoid.push('overcommitting long-term before plans are clear');
    } else if (phaseGroup === 'waning' || phaseGroup === 'full') {
      farming.bestFor.push(
        'thinning seedlings',
        'weeding and strengthening stands'
      );
      business.bestFor.push('reviewing budgets', 'adjusting early plans');
    }
  } else if (season === 'summer') {
    if (phaseGroup === 'new' || phaseGroup === 'waxing') {
      farming.bestFor.push(
        'side-dressing corn and soybeans',
        'irrigation and pest scouting'
      );
      business.bestFor.push(
        'mid-season promotions',
        'field days and farm visits'
      );
    } else if (phaseGroup === 'waning' || phaseGroup === 'full') {
      farming.bestFor.push(
        'hay cutting and storage',
        'rotational grazing adjustments'
      );
      business.bestFor.push(
        'checking margins on inputs',
        'cutting what is not paying off'
      );
    }
  } else if (season === 'fall') {
    if (phaseGroup === 'full' || phaseGroup === 'waning') {
      farming.bestFor.push(
        'harvesting corn and soybeans',
        'bringing in pumpkins and fall crops',
        'seeding winter cover crops'
      );
      business.bestFor.push(
        'settling accounts',
        'closing out risky contracts',
        'year-end inventory'
      );
    } else if (phaseGroup === 'waxing' || phaseGroup === 'new') {
      farming.bestFor.push(
        'field scouting for harvest timing',
        'pasture overseeding'
      );
      business.bestFor.push(
        'planning fall markets',
        'lining up buyers and processors'
      );
    }
  } else {
    // winter
    if (phaseGroup === 'new' || phaseGroup === 'waxing') {
      farming.bestFor.push(
        'equipment maintenance',
        'seed ordering and pasture planning'
      );
      business.bestFor.push(
        'strategic planning for next season',
        'budgeting and cash-flow mapping'
      );
    } else if (phaseGroup === 'waning' || phaseGroup === 'full') {
      farming.bestFor.push('barn and fence repairs');
      business.bestFor.push('bookkeeping and tax prep', 'closing old files');
    }
  }

  return { farming, business, crops };
}

function buildDay(date) {
  const iso = toLocalIso(date); // YYYY-MM-DD in LOCAL time

  const phaseName = Moon.lunarPhase(date); // e.g. "Waxing Gibbous"
  const moonPhase = mapPhaseName(phaseName);

  const season = getSeason(date);
  const phaseGroup = getPhaseGroup(moonPhase);
  const { farming, business, crops } = getGuidance(season, phaseGroup);

  const moonName = getFullMoonName(date, moonPhase);
  const holiday = getHoliday(date);

  const notes = (() => {
    if (moonPhase === 'new') {
      return 'Quiet, seed-planting time in both fields and plans; good for intention and setup work.';
    }
    if (moonPhase === 'full') {
      return 'Peak energy and visibility; ideal for harvest, wrapping cycles, and public-facing moves.';
    }
    if (phaseGroup === 'quarter') {
      return 'Turning point energy; pause, evaluate, and adjust course rather than forcing new starts or endings.';
    }
    if (phaseGroup === 'waxing') {
      return 'Energy building; favor starting and growing things.';
    }
    if (phaseGroup === 'waning') {
      return 'Energy easing; favor cleanup, harvest, and letting go.';
    }
    return null;
  })();

  return {
    date: iso,
    moonPhase,
    moonName,
    sign: null,
    notes,
    region: REGION,
    holiday,
    eclipse: null,
    crops,
    farming,
    business,
  };
}

function main() {
  // Local midnight range for Middle Tennessee
  const from = makeLocalDate(2025, 0, 1); // Jan 1, 2025
  const to = makeLocalDate(2026, 11, 31); // Dec 31, 2026

  const days = [];
  for (const d of eachDay(from, to)) {
    days.push(buildDay(d));
  }

  const outPath = join(process.cwd(), 'src', 'data', 'almanac-2025-2026.json');
  writeFileSync(outPath, JSON.stringify(days, null, 2));
  console.log(`Wrote ${days.length} days to ${outPath}`);
}

main();
