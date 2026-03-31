import moment from 'moment-timezone';

// Define the shape of our events
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor?: string;
  textColor?: string;
  display?: string;
}

export const EVENT_COLORS = {
  RED: 'red',
  PINK: 'pink',
  LIGHTPINK: '#FFB6C1',
  BLUE: 'blue',
  RICHBLUE: '#021BF9',
  LIGHTBLUE: '#00FFFF',
  YELLOW: 'yellow',
  BLACK: '#000',
  WHITE: '#fff',
};

const convertToLondonTimeZone = (date: Date) => {
  return moment(date).tz('Europe/London').toDate();
};

export const generateEventsFromConfig = (config: any): CalendarEvent[] => {
  const eventsList: CalendarEvent[] = [];
  
  if (!config || !config.terms || !Array.isArray(config.terms)) {
    return eventsList; // Invalid config
  }

  const {
    parents = ["Mum", "Dad"],
    parentColors = ["#FFB6C1", "#ADD8E6"],
    terms = [],
    bankHolidays = [],
    insets = [],
    birthdays = [],
    startDate,
    weekendStarterParent = 0,
    holidayHandover = { hour: 18, minute: 0 },
    rules = [
      { id: "leg-wed", parent: 1, startDay: 3, startTime: "15:10", endDay: 4, endTime: "08:40", frequency: "weekly" },
      { id: "leg-fri", parent: 1, startDay: 5, startTime: "15:10", endDay: 1, endTime: "08:40", frequency: "alternating" }
    ]
  } = config;

  // Simple event pushed to array
  const pushEvent = (title: string, start: Date, end: Date, bg?: string, txt?: string) => {
    eventsList.push({
      id: `gen-${eventsList.length + 1}`,
      title,
      start: convertToLondonTimeZone(start).toISOString(),
      end: convertToLondonTimeZone(end).toISOString(),
      allDay: false,
      backgroundColor: bg,
      textColor: txt,
      display: 'block'
    });
  };

  const pushAllDayEvent = (title: string, date: Date, bg: string, txt?: string) => {
    const d = convertToLondonTimeZone(date);
    eventsList.push({
      id: `gen-${eventsList.length + 1}`,
      title,
      start: d.toISOString(),
      end: d.toISOString(),
      allDay: true,
      backgroundColor: bg,
      textColor: txt,
    });
  };

  let activeTerms = [...terms];
  const hasValidTerms = termDatesValid(terms);
  
  // If the user hasn't explicitly set up term splits but provided a global startDate, we synthesize a multi-year term span
  if (!hasValidTerms && startDate) {
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + 2); // 2 year continuous cycle
    activeTerms = [{
      startDate: startDate,
      endDate: end.toISOString(),
      dadStarts: weekendStarterParent === 1
    }];
  } else if (hasValidTerms && startDate) {
    // If they have terms but explicitly set an initial starter parent, map it to the first term
    activeTerms[0].dadStarts = weekendStarterParent === 1;

    // Synthesize a continuous 2-year "after-school" trailing term so the calendar doesn't abruptly stop showing routines
    const lastTerm = activeTerms[activeTerms.length - 1];
    if (lastTerm && lastTerm.endDate) {
      const startOfContinuous = moment(lastTerm.endDate).add(1, 'day').toDate();
      const endOfContinuous = moment(startOfContinuous).add(2, 'years').toDate();
      activeTerms.push({
        startDate: startOfContinuous.toISOString(),
        endDate: endOfContinuous.toISOString(),
        dadStarts: false, // It inherits automatically via parentWeekendIndex inheritance from calculateTermTime
        simulateSchool: false
      });
    }
  }

  if (activeTerms.length > 0 && activeTerms[0].startDate) {
    // 1) Holidays between terms (only applies if > 1 term exists)
    calculateHolidays(eventsList, activeTerms, parents, holidayHandover, pushEvent, parentColors);

    // 2) Term-time / General routine
    calculateTermTime(eventsList, activeTerms, parents, insets, bankHolidays, pushEvent, parentColors, rules);
  }

  // 3) Birthdays (repeated over 3 years for context, native was startYear + 1)
  const currentYear = new Date().getFullYear();
  for (const bday of birthdays) {
    if (bday.month && bday.day) {
      for (let y = currentYear - 1; y <= currentYear + 2; y++) {
        const date = moment.tz({ year: y, month: bday.month - 1, day: bday.day }, 'Europe/London').toDate();
        pushAllDayEvent(bday.title, date, bday.backgroundColor || EVENT_COLORS.YELLOW, bday.textColor || 'black');
      }
    }
  }

  // 4) Bank Holidays
  for (const bh of bankHolidays) {
    if (bh.date) {
      pushAllDayEvent(bh.title, new Date(bh.date), EVENT_COLORS.YELLOW, 'black');
    }
  }

  // 5) INSETs
  for (const inset of insets) {
    if (inset.startDate) {
      const dStart = new Date(inset.startDate);
      const dEnd = inset.endDate ? new Date(inset.endDate) : dStart; 
      pushAllDayEvent(inset.title, dStart, inset.backgroundColor || '#FFA500', inset.textColor || EVENT_COLORS.WHITE);
    }
  }

  // 6) Manual Overrides array
  if (config.overrides && Array.isArray(config.overrides)) {
    for (const ov of config.overrides) {
      if (ov.startDate && ov.parent !== undefined) {
        const dStart = moment.tz(new Date(ov.startDate), 'Europe/London').startOf('day').toDate();
        const dEnd = ov.endDate ? moment.tz(new Date(ov.endDate), 'Europe/London').endOf('day').toDate() : moment.tz(new Date(ov.startDate), 'Europe/London').endOf('day').toDate();
        
        // Use parent colors used in holiday splits
        const bg = ov.parent === 0 ? parentColors[0] : parentColors[1];
        const txt = EVENT_COLORS.BLACK;
        const pName = parents[ov.parent] || 'Parent';

        // Delete any generated event that completely overlaps with our override
        // We do this precisely to make it completely an "Override"
        const ovStartTime = dStart.getTime();
        const ovEndTime = dEnd.getTime();
        
        for (let i = eventsList.length - 1; i >= 0; i--) {
           const e = eventsList[i];
           const eStart = new Date(e.start).getTime();
           const eEnd = new Date(e.end).getTime();
           const durationDays = (eEnd - eStart) / (1000 * 60 * 60 * 24);
           
           // If the generated event starts inside the override window, and is a routine block (<= 3 days), pop it
           if (eStart >= ovStartTime && eStart <= ovEndTime && durationDays <= 3) {
             eventsList.splice(i, 1);
           }
        }

        // Now push the override
        eventsList.push({
          id: `gen-override-${eventsList.length + 1}`,
          title: `*${pName}'s Override - ${ov.title}`,
          start: convertToLondonTimeZone(dStart).toISOString(),
          end: convertToLondonTimeZone(dEnd).toISOString(),
          allDay: true,
          backgroundColor: bg,
          textColor: txt,
        });
      }
    }
  }

  // 7) Fill gaps in term-time with Default Parent A's time
  if (activeTerms && activeTerms.length > 0) {
    fillTermGapsForParentA(eventsList, activeTerms, parents, pushEvent, parentColors);
  }

  return eventsList;
};

// Ensure terms are parsed
function termDatesValid(terms: any[]) {
  return terms && terms.length > 0 && terms[0].startDate;
}

// Extract parent finder for context
const parentFromTitle = (title: string, p0: string, p1: string): string | null => {
  const t = title.toLowerCase();
  if (t.includes(p0.toLowerCase())) return p0;
  if (t.includes(p1.toLowerCase())) return p1;
  return null;
};

function calculateHolidays(eventsList: CalendarEvent[], terms: any[], parents: string[], handover: any, pushEvent: any, parentColors: string[]) {
  const parentA = parents[0]; // Mum (Default)
  const colorA = parentColors[0];
  const parentB = parents[1]; // Dad (Assigned)
  const colorB = parentColors[1];

  for (let i = 0; i < terms.length - 1; i++) {
    const currentTerm = terms[i];
    const nextTerm = terms[i + 1];

    const holidayStart = moment(new Date(currentTerm.endDate)).tz('Europe/London').add(1, 'day').startOf('day');
    const holidayEnd = moment(new Date(nextTerm.startDate)).tz('Europe/London').subtract(1, 'day').endOf('day');

    if (!holidayStart.isSameOrBefore(holidayEnd)) continue;

    let parentIndex = nextTerm.dadStarts ? 1 : 0; // The holiday PRECEDING nextTerm is governed by nextTerm's starter flag
    let parent = parents[parentIndex];

    // Christmas handling (simulating native logic)
    if (holidayStart.month() === 11) {
      const xmasHandover = holidayStart.clone().date(25).hour(16).minute(0).second(0);
      const firstEnd = moment.min(xmasHandover, holidayEnd);

      const is2025 = holidayStart.year() === 2025;
      
      if (is2025) {
        if (holidayStart.isSameOrBefore(firstEnd)) {
            pushEvent(`${parentB}'s Christmas`, holidayStart.toDate(), firstEnd.toDate(), colorB, EVENT_COLORS.BLACK);
        }
        const secondStart = xmasHandover.clone().add(1, 'second');
        if (secondStart.isSameOrBefore(holidayEnd)) {
            pushEvent(`${parentA}'s Christmas`, secondStart.toDate(), holidayEnd.toDate(), colorA, EVENT_COLORS.BLACK);
        }
      } else {
        if (holidayStart.isSameOrBefore(firstEnd)) {
            pushEvent(`${parentA}'s Christmas`, holidayStart.toDate(), firstEnd.toDate(), colorA, EVENT_COLORS.BLACK);
        }
        const secondStart = xmasHandover.clone().add(1, 'second');
        if (secondStart.isSameOrBefore(holidayEnd)) {
            pushEvent(`${parentB}'s Christmas`, secondStart.toDate(), holidayEnd.toDate(), colorB, EVENT_COLORS.BLACK);
        }
      }
      continue;
    }

    const totalDays = holidayEnd.diff(holidayStart, 'days');

    if (totalDays <= 11 && totalDays > 0) {
      const handoverTime = holidayStart.month() === 3 ? '10am' : '6pm';
      const half = Math.floor(totalDays / 2);
      let start = holidayStart.clone();

      let end = moment.min(start.clone().add(half, 'days').endOf('day'), holidayEnd);
      pushEvent(`${parent}'s Week - Handover ${handoverTime}`, start.toDate(), end.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);

      parentIndex = 1 - parentIndex;
      parent = parents[parentIndex];

      start = end.clone().add(1, 'second');
      if (start.isSameOrBefore(holidayEnd)) {
        pushEvent(`${parent}'s Week - Handover ${handoverTime}`, start.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
      }
    } else {
      const isoWeekday = handover.isoWeekday || 5; // Friday 
      const hour = handover.hour || 18;
      const minute = handover.minute || 0;

      let firstAnchor = holidayStart.clone().isoWeekday(isoWeekday).hour(hour).minute(minute).second(0);
      if (firstAnchor.isBefore(holidayStart)) firstAnchor = firstAnchor.add(1, 'week');

      let blockStart = firstAnchor.clone();

      if (blockStart.isAfter(holidayEnd)) {
        pushEvent(`${parent}'s Week`, holidayStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
      } else {
        if (holidayStart.isBefore(blockStart)) {
          pushEvent(`${parent}'s Week - Handover ${hour}:${String(minute).padStart(2, '0')}`, holidayStart.toDate(), blockStart.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
          parentIndex = 1 - parentIndex;
          parent = parents[parentIndex];
        }

        while (blockStart.isSameOrBefore(holidayEnd)) {
          const nextAnchor = blockStart.clone().add(1, 'week');
          const blockEnd = moment.min(nextAnchor, holidayEnd.clone());

          pushEvent(`${parent}'s Week - Handover ${hour}:${String(minute).padStart(2, '0')}`, blockStart.toDate(), blockEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);

          blockStart = nextAnchor;
          parentIndex = 1 - parentIndex;
          parent = parents[parentIndex];
        }
      }
    }
  }
}

function calculateTermTime(eventsList: CalendarEvent[], terms: any[], parents: string[], insets: any[], bankHolidays: any[], pushEvent: any, parentColors: string[], rules: any[]) {
  const parentA = parents[0];
  const colorA = parentColors[0];
  const parentB = parents[1];
  const colorB = parentColors[1];

  const lastHolidayParentBefore = (date: Date) => {
    const cutoff = date.getTime();
    let best = null;
    for (const e of eventsList) {
      const pIndex = e.title.includes(parentA) ? 0 : e.title.includes(parentB) ? 1 : null;
      if (pIndex === null) continue;
      
      const endMs = new Date(e.end).getTime();
      const startMs = new Date(e.start).getTime();
      if (endMs <= cutoff && endMs >= startMs) {
        if (!best || endMs > best.endMs) best = { parentIndex: pIndex, endMs };
      }
    }
    return best ? best.parentIndex : null;
  };

  for (let termIndex = 0; termIndex < terms.length; termIndex++) {
    const term = terms[termIndex];
    const starterParentFromHoliday = lastHolidayParentBefore(new Date(new Date(term.startDate).getTime() - 1));

    let parentWeekendIndex: 0 | 1;
    if (starterParentFromHoliday !== null) {
      parentWeekendIndex = starterParentFromHoliday === 0 ? 0 : 1;
    } else {
      parentWeekendIndex = term.dadStarts ? 1 : 0;
    }

    const cursor = new Date(term.startDate);
    const termEnd = new Date(term.endDate);

    while (cursor <= termEnd) {
      const mCursor = moment(cursor);
      const day = cursor.getDay(); // 0=Sun..6=Sat

      // Check if it's an INSET or Bank Holiday
      let isSkipDay = false;
      for (const bh of bankHolidays) {
        if (bh.date && moment(bh.date).isSame(mCursor, 'day')) isSkipDay = true;
      }
      for (const inset of insets) {
        if (inset.startDate) {
          const dStart = moment(inset.startDate).startOf('day');
          const dEnd = inset.endDate ? moment(inset.endDate).endOf('day') : dStart.clone().endOf('day');
          if (mCursor.isBetween(dStart, dEnd, 'day', '[]')) isSkipDay = true;
        }
      }

      // Generate School block (only if this is a real school term, not a synthesized continuous trailing term)
      if (term.simulateSchool !== false && day >= 1 && day <= 5 && !isSkipDay) {
        const schoolStart = new Date(cursor);
        schoolStart.setHours(8, 40, 0, 0);
        const schoolEnd = new Date(cursor);
        schoolEnd.setHours(15, 10, 0, 0);
        pushEvent('School', schoolStart, schoolEnd, '#D3D3D3', EVENT_COLORS.BLACK);
      }

      const latestReturn = new Date(term.endDate);
      latestReturn.setDate(latestReturn.getDate() - 1);
      latestReturn.setHours(23, 59, 59, 999);

      for (const rule of rules) {
        if (day === rule.startDay) {
          const [sh, sm] = rule.startTime.split(':').map(Number);
          const [eh, em] = rule.endTime.split(':').map(Number);

          const pickup = new Date(cursor);
          pickup.setHours(sh, sm, 0, 0);

          let daysToAdd = rule.endDay - rule.startDay;
          if (daysToAdd <= 0) daysToAdd += 7; // overnight or multi-day
          
          const drop = new Date(pickup);
          drop.setDate(drop.getDate() + daysToAdd);
          drop.setHours(eh, em, 0, 0);

          if (pickup >= new Date(term.startDate) && drop <= latestReturn) {
            const pName = parents[rule.parent];
            const pColor = parentColors[rule.parent];
            const title = rule.frequency === 'alternating' ? `${pName}'s Alternating Block` : `${pName}'s Recurring Block`;

            if (rule.frequency === 'weekly') {
              pushEvent(title, pickup, drop, pColor, EVENT_COLORS.BLACK);
            } else if (rule.frequency === 'alternating') {
              if (parentWeekendIndex === rule.parent) {
                pushEvent(title, pickup, drop, pColor, EVENT_COLORS.BLACK);
              }
            }
          }
        }
      }

      // Flip alternation tracker on Sunday evening so Mon-Sun shares identical tracker index
      if (day === 0) { 
         parentWeekendIndex = (1 - parentWeekendIndex) as 0 | 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
}

// ---------------------------------------------------------
// Term Gap Filler (Fills non-assigned time during terms for Parent A)
// ---------------------------------------------------------
function fillTermGapsForParentA(eventsList: CalendarEvent[], terms: any[], parents: string[], pushEvent: any, parentColors: string[]) {
  const parentA = parents[0];
  const parentB = parents[1];
  const colorA = parentColors[0];

  for (const term of terms) {
    if (!term.startDate || !term.endDate) continue;

    const termStart = moment.tz(new Date(term.startDate), 'Europe/London').startOf('day');
    const termEnd = moment.tz(new Date(term.endDate), 'Europe/London').endOf('day');
    const termStartMs = termStart.valueOf();
    const termEndMs = termEnd.valueOf();

    // Find all overlapping substantive events (exclude simple allDay badges unless they are Overrides)
    const overlapping = eventsList.filter(e => {
      const eStartMs = new Date(e.start).getTime();
      let eEndMs = new Date(e.end).getTime();
      
      if (e.allDay) {
        eEndMs += 24 * 60 * 60 * 1000 - 1;
      }

      const isSchoolBlock = e.title === 'School';
      const isOverride = e.title.startsWith('*');
      const isParentBlock = e.title.toLowerCase().includes(parentA.toLowerCase()) || 
                            e.title.toLowerCase().includes(parentB.toLowerCase());
      
      const isRealBlock = (!e.allDay && isParentBlock) || isOverride || isSchoolBlock;

      return isRealBlock && eStartMs < termEndMs && eEndMs > termStartMs;
    });

    // Sort chronologically by start time
    overlapping.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let currentCursorMs = termStartMs;

    for (const ovEvent of overlapping) {
      const eStartMs = new Date(ovEvent.start).getTime();
      let eEndMs = new Date(ovEvent.end).getTime();
      if (ovEvent.allDay) {
         eEndMs += 24 * 60 * 60 * 1000 - 1;
      }

      if (eStartMs > currentCursorMs) {
        eventsList.push({
          id: `gen-bg-${eventsList.length + 1}`,
          title: `${parentA}'s Time`,
          start: new Date(currentCursorMs).toISOString(),
          end: new Date(eStartMs).toISOString(),
          allDay: false,
          backgroundColor: colorA,
          textColor: EVENT_COLORS.BLACK,
          display: 'block'
        });
      }

      if (eEndMs > currentCursorMs) {
        currentCursorMs = eEndMs;
      }
    }

    if (termEndMs > currentCursorMs) {
      eventsList.push({
        id: `gen-bg-${eventsList.length + 1}`,
        title: `${parentA}'s Time`,
        start: new Date(currentCursorMs).toISOString(),
        end: new Date(termEndMs).toISOString(),
        allDay: false,
        backgroundColor: colorA,
        textColor: EVENT_COLORS.BLACK,
        display: 'block'
      });
    }
  }
}
