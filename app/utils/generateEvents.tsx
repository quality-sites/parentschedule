import { eventConfig } from '../eventConfig';
import { termDates } from '../constants/constants';
import { Event } from '../types/types';
import {
  generateEvent,
  generateRepeatedDatesEvent,
  generateOneOffEvent,
  calculateHolidays,
  overrideEvent,
} from '../utils/utils';

/** Identify parent from a holiday event title. */
const parentFromTitle = (title: string): 'Dad' | 'Mom' | null => {
  const t = title.toLowerCase();
  if (t.includes("father") || t.includes("dad")) return 'Dad';
  if (t.includes("mother") || t.includes("mom")) return 'Mom';
  return null;
};

/** Returns 'Dad' or 'Mom' who had custody just before `date`, using holiday events already in `eventsList`. */
const lastHolidayParentBefore = (eventsList: Event[], date: Date): 'Dad' | 'Mom' | null => {
  const cutoff = date.getTime();
  let best: { parent: 'Dad' | 'Mom'; endMs: number } | null = null;

  for (const e of eventsList) {
    // Only consider holiday-style events (we key off the title patterns from calculateHolidays)
    const p = parentFromTitle(e.title);
    if (!p) continue;

    const endMs = new Date(e.end).getTime();
    const startMs = new Date(e.start).getTime();

    // event must end before the cutoff and be a holiday-style (non all-day school) window
    if (endMs <= cutoff && endMs >= startMs) {
      if (!best || endMs > best.endMs) {
        best = { parent: p, endMs };
      }
    }
  }

  return best ? best.parent : null;
};

/** Find the first Friday (day=5) within a term, returning that Date at 15:10 pickup. */
const firstFridayPickupInTerm = (term: { startDate: Date; endDate: Date }): Date | null => {
  const d = new Date(term.startDate);
  // walk forward to Friday (JS: 0=Sun..6=Sat)
  while (d <= term.endDate && d.getDay() !== 5) {
    d.setDate(d.getDate() + 1);
  }
  if (d > term.endDate) return null;

  d.setHours(15, 10, 0, 0);
  return d;
};

// Aggregate all events here
let eventsList: Event[] = [];

// 1) Holidays between terms (anchored to EVENT_HANDOVER inside calculateHolidays)
calculateHolidays(eventsList);

// 2) Term-time logic (Wednesdays + alternating weekends).
//    Weekend parity for each term is set to the OPPOSITE of whoever ended the preceding holiday.
//    If no holiday is found (e.g., first term in dataset), we fall back to term.dadStarts.
for (let termIndex = 0; termIndex < termDates.length; termIndex++) {
  const term = termDates[termIndex];

  // Determine who had custody right before this term started
  const starterParentFromHoliday = lastHolidayParentBefore(
    eventsList,
    // just before term start
    new Date(new Date(term.startDate).getTime() - 1)
  );

  // parentWeekendIndex: 0 => Mom's weekend, 1 => Dad's weekend (we only render Dad's weekends)
  let parentWeekendIndex: 0 | 1;

  if (starterParentFromHoliday) {
    // First term-time weekend should be the OPPOSITE of whoever *finished the holiday*
    parentWeekendIndex = starterParentFromHoliday === 'Dad' ? 0 : 1;
  } else {
    // Fallback to term config if no holiday context exists
    parentWeekendIndex = term.dadStarts ? 1 : 0;
  }

  // Iterate day-by-day through the term
  const cursor = new Date(term.startDate);
  const termEnd = new Date(term.endDate);

  while (cursor <= termEnd) {
    const day = cursor.getDay(); // 0=Sun..6=Sat

    // Midweek: Wednesday pickup 15:10 -> Thursday 08:40
    if (day === 3) {
      const pickup = new Date(cursor);
      pickup.setHours(15, 10, 0, 0);

      const drop = new Date(pickup);
      drop.setDate(drop.getDate() + 1);
      drop.setHours(8, 40, 0, 0);

      if (pickup >= term.startDate && drop <= term.endDate) {
        generateEvent(eventsList, "Father's Time (Wednesday-Thursday)", pickup, drop);
      }
    }

    // Weekends: Friday pickup -> Monday 08:40 return
    if (day === 5) {
      const pickup = new Date(cursor);
      pickup.setHours(15, 10, 0, 0);

      const returnMonday = new Date(pickup);
      returnMonday.setDate(returnMonday.getDate() + 2); // Monday
      returnMonday.setHours(8, 40, 0, 0);

      // Don't run beyond the school term (exclusive of the final day)
      const latestReturn = new Date(term.endDate);
      latestReturn.setDate(latestReturn.getDate() - 1);
      latestReturn.setHours(23, 59, 59, 999);

      if (pickup >= term.startDate && returnMonday <= latestReturn) {
        if (parentWeekendIndex === 1) {
          // Only render the Father's weekend entry; Mother's weekends are implied
          generateEvent(eventsList, "Father's Weekend", pickup, returnMonday);
        }
        // Flip for next weekend
        parentWeekendIndex = (1 - parentWeekendIndex) as 0 | 1;
      }
    }

    // next day
    cursor.setDate(cursor.getDate() + 1);
  }

  // (Optional safety) If you specifically want the *first* Friday to respect the rule even
  // when there are odd term edges, you can assert it by checking the first Friday explicitly:
  // const firstFriPickup = firstFridayPickupInTerm(term);
  // (not strictly necessary with the loop above)
}

// 3) One-offs / annual repeats
for (const config of eventConfig) {
  if ('date' in config) {
    generateOneOffEvent(
      eventsList,
      config.title,
      new Date(config.date),
      config.backgroundColor,
      config.textColor
    );
  } else if ('month' in config && 'day' in config) {
    generateRepeatedDatesEvent(
      eventsList,
      config.title,
      config.month,
      config.day,
      config.backgroundColor,
      config.textColor
    );
  }
}

// 4) Overrides (INSET/Bank holidays etc.)
overrideEvent(eventsList);

export default eventsList;
