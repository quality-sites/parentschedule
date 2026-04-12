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
  extendedProps?: any;
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
    let type = 'routine';
    if (title.toLowerCase().includes('holiday') || title.toLowerCase().includes('christmas') || title.toLowerCase().includes('half') || title.toLowerCase().includes('week')) type = 'holiday';
    if (title.toLowerCase().includes('school')) type = 'school';

    eventsList.push({
      id: `gen-${eventsList.length + 1}`,
      title,
      start: convertToLondonTimeZone(start).toISOString(),
      end: convertToLondonTimeZone(end).toISOString(),
      allDay: false,
      backgroundColor: bg,
      textColor: txt,
      display: 'block',
      extendedProps: { type, configurable: true }
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
      extendedProps: { type: 'event', configurable: true }
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
    // Explicit initial starter parent is now used directly in calculateTermTime for the first term
    // without clobbering the holiday starter flag for the first term.

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
    calculateHolidays(eventsList, activeTerms, config, parents, holidayHandover, pushEvent, parentColors);

    // 2) Term-time / General routine
    calculateTermTime(eventsList, config, activeTerms, parents, insets, bankHolidays, pushEvent, parentColors, rules);
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
        let dStart, dEnd;
        let hasSpecificTime = false;

        if (ov.startDate.includes('T')) {
           // Precise time was provided
           hasSpecificTime = true;
           dStart = moment.tz(new Date(ov.startDate), 'Europe/London').toDate();
           dEnd = ov.endDate ? 
                  (ov.endDate.includes('T') ? moment.tz(new Date(ov.endDate), 'Europe/London').toDate() : moment.tz(new Date(ov.endDate), 'Europe/London').endOf('day').toDate()) 
                  : moment.tz(new Date(ov.startDate), 'Europe/London').toDate();
        } else {
           // Standard all-day override
           dStart = moment.tz(new Date(ov.startDate), 'Europe/London').startOf('day').toDate();
           dEnd = ov.endDate ? moment.tz(new Date(ov.endDate), 'Europe/London').endOf('day').toDate() : moment.tz(new Date(ov.startDate), 'Europe/London').endOf('day').toDate();
        }
        
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
          allDay: !hasSpecificTime,
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

function calculateHolidays(eventsList: CalendarEvent[], terms: any[], config: any, parents: string[], handover: any, pushEvent: any, parentColors: string[]) {
  const parentA = parents[0]; // Mum (Default)
  const colorA = parentColors[0];
  const parentB = parents[1]; // Dad (Assigned)
  const colorB = parentColors[1];

  for (let i = 0; i < terms.length - 1; i++) {
    const currentTerm = terms[i];
    const nextTerm = terms[i + 1];

    const holidayStart = moment(new Date(currentTerm.endDate)).tz('Europe/London').hour(15).minute(10).second(0);
    const holidayEnd = moment(new Date(nextTerm.startDate)).tz('Europe/London').hour(8).minute(40).second(0);

    if (!holidayStart.isSameOrBefore(holidayEnd)) continue;

    let parentIndex = currentTerm.dadStarts ? 1 : 0; // The holiday FOLLOWING currentTerm is governed by currentTerm's starter flag
    let parent = parents[parentIndex];



    const totalDays = holidayEnd.diff(holidayStart, 'days');
    let applyStrategy = currentTerm.holidayStrategy || 'auto';
    let splitConfig: any = currentTerm.customSplit || null;

    // Auto mappings
    if (applyStrategy === 'auto') {
       if (totalDays <= 11 && totalDays > 0) applyStrategy = 'split_half';
       else applyStrategy = 'weekly_alt';
    }

    if (applyStrategy === 'full_block') {
      pushEvent(`${parent}'s Holiday Block`, holidayStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
    } else if (applyStrategy === 'split_specific') {
      const { isoWeekday, hour = 13, minute = 0, exactDate, exactDates } = splitConfig || {};

      let safeDates: string[] = [];
      if (exactDates && Array.isArray(exactDates) && exactDates.length > 0) {
         safeDates = [...exactDates];
      } else if (exactDate) {
         safeDates = [exactDate];
      }

      if (safeDates.length > 0) {
         // User provided one or more exact calendar dates for the splits
         safeDates.sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

         let currentStart = holidayStart.clone();
         for (let i = 0; i < safeDates.length; i++) {
            let anchor = moment.tz(new Date(safeDates[i]), 'Europe/London');
            
            if (anchor.isSameOrBefore(currentStart)) continue;
            if (anchor.isAfter(holidayEnd)) break;

            pushEvent(`${parent}'s Holiday Block`, currentStart.toDate(), anchor.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
            
            parentIndex = 1 - parentIndex;
            parent = parents[parentIndex];
            currentStart = anchor.clone().add(1, 'second');
         }

         if (currentStart.isSameOrBefore(holidayEnd)) {
            pushEvent(`${parent}'s Holiday Block`, currentStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
         }
      } else {
         // Fallback to relative weekday (e.g., first Wednesday)
         const dw = isoWeekday || 3;
         let handoverAnchor = holidayStart.clone().isoWeekday(dw).hour(hour).minute(minute).second(0);
         if (handoverAnchor.isBefore(holidayStart)) {
            handoverAnchor.add(1, 'week');
         }

         if (handoverAnchor.isAfter(holidayEnd)) {
            pushEvent(`${parent}'s Holiday`, holidayStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
         } else {
            pushEvent(`${parent}'s Holiday Half`, holidayStart.toDate(), handoverAnchor.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
            
            parentIndex = 1 - parentIndex;
            parent = parents[parentIndex];

            const secondStart = handoverAnchor.clone().add(1, 'second');
            if (secondStart.isSameOrBefore(holidayEnd)) {
               pushEvent(`${parent}'s Holiday Half`, secondStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
            }
         }
      }
    } else if (applyStrategy === 'split_date') {
      // Split on a specific calendar date/time (e.g., Christmas Day at 16:00)
      const { month = 11, date = 25, hour = 16, minute = 0 } = splitConfig || {};

      let handoverAnchor = holidayStart.clone().month(month).date(date).hour(hour).minute(minute).second(0);

      // If the defined split date happens to fall outside the holiday window natively, default to full_block
      if (handoverAnchor.isAfter(holidayEnd) || handoverAnchor.isBefore(holidayStart)) {
         pushEvent(`${parent}'s Holiday`, holidayStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
      } else {
         pushEvent(`${parent}'s Holiday (Part 1)`, holidayStart.toDate(), handoverAnchor.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
         
         parentIndex = 1 - parentIndex;
         parent = parents[parentIndex];

         const secondStart = handoverAnchor.clone().add(1, 'second');
         if (secondStart.isSameOrBefore(holidayEnd)) {
            pushEvent(`${parent}'s Holiday (Part 2)`, secondStart.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
         }
      }
    } else if (applyStrategy === 'split_half') {
      const handoverTime = holidayStart.month() === 3 ? '10am' : '6pm';
      const half = Math.floor(totalDays / 2);
      let start = holidayStart.clone();

      let end = moment.min(start.clone().add(half, 'days').endOf('day'), holidayEnd);
      pushEvent(`${parent}'s Half`, start.toDate(), end.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);

      parentIndex = 1 - parentIndex;
      parent = parents[parentIndex];

      start = end.clone().add(1, 'second');
      if (start.isSameOrBefore(holidayEnd)) {
        pushEvent(`${parent}'s Half`, start.toDate(), holidayEnd.toDate(), parentIndex === 1 ? colorB : colorA, EVENT_COLORS.BLACK);
      }
    } else {
      // weekly_alt
      const lConf = splitConfig || handover;
      const isoWeekday = lConf.isoWeekday || 5; 
      const hour = lConf.hour || 18;
      const minute = lConf.minute || 0;

      let firstAnchor = holidayStart.clone().isoWeekday(isoWeekday).hour(hour).minute(minute).second(0);
      if (firstAnchor.isBefore(holidayStart)) {
         firstAnchor = firstAnchor.add(1, 'week');
      }

      // Ensure the starter gets a meaningful first block (at least ~4 days), rather than burning their turn on a 1-day weekend stub.
      if (firstAnchor.diff(holidayStart, 'days', true) < 4) {
         firstAnchor.add(1, 'week');
      }

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

function calculateTermTime(eventsList: CalendarEvent[], config: any, terms: any[], parents: string[], insets: any[], bankHolidays: any[], pushEvent: any, parentColors: string[], rules: any[]) {
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
      parentWeekendIndex = (termIndex === 0 && config.weekendStarterParent !== undefined) ? config.weekendStarterParent : (term.dadStarts ? 1 : 0);
    }

    const cursor = new Date(term.startDate);
    const termEnd = new Date(term.endDate);

    while (cursor <= termEnd) {
      const mCursor = moment(cursor);
      const day = cursor.getDay(); // 0=Sun..6=Sat

      // --- PHASE RESET HOOK ---
      // Check if the current cursor date matches any 'phaseResets' in the config
      if (config.phaseResets && Array.isArray(config.phaseResets)) {
        for (const pr of config.phaseResets) {
           if (pr.startDate && pr.parent !== undefined) {
              const prDate = moment.tz(new Date(pr.startDate), 'Europe/London').startOf('day');
              if (mCursor.isSame(prDate, 'day')) {
                 parentWeekendIndex = pr.parent as 0 | 1;
              }
           }
        }
      }

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
        // Only render substantive gaps (>= 20 hours). This skips short daily school drops and overnight sleeping gaps, highlighting clear chunks like weekends.
        if (eStartMs - currentCursorMs >= 20 * 60 * 60 * 1000) {
          let blockTitle = `${parentA}'s Time`;
          const dtStart = moment.tz(new Date(currentCursorMs), 'Europe/London');
          const dtEnd = moment.tz(new Date(eStartMs), 'Europe/London');
          
          if (dtStart.hour() !== 0 || dtStart.minute() !== 0) {
             blockTitle = `${dtStart.format('HH:mm')} - ${blockTitle}`;
          }
          if (dtEnd.hour() !== 0 || dtEnd.minute() !== 0) {
             blockTitle = `${blockTitle} (until ${dtEnd.format('HH:mm')})`;
          }

          eventsList.push({
            id: `gen-bg-${eventsList.length + 1}`,
            title: blockTitle,
            start: new Date(currentCursorMs).toISOString(),
            end: new Date(eStartMs).toISOString(),
            allDay: false,
            backgroundColor: colorA,
            textColor: EVENT_COLORS.BLACK,
            display: 'block'
          });
        }
      }

      if (eEndMs > currentCursorMs) {
        currentCursorMs = eEndMs;
      }
    }

    if (termEndMs > currentCursorMs) {
      if (termEndMs - currentCursorMs >= 20 * 60 * 60 * 1000) {
        let blockTitle = `${parentA}'s Time`;
        const dtStart = moment.tz(new Date(currentCursorMs), 'Europe/London');
        const dtEnd = moment.tz(new Date(termEndMs), 'Europe/London');
        
        if (dtStart.hour() !== 0 || dtStart.minute() !== 0) {
           blockTitle = `${dtStart.format('HH:mm')} - ${blockTitle}`;
        }
        // Normally termEnd is 23:59:59 so checking specifically for 0 won't work well, but it's end of day so we don't strictly need it.
        // But if someone sets an exact termEndMs we can capture it.
        if (dtEnd.hour() > 0 && dtEnd.hour() < 23) {
           blockTitle = `${blockTitle} (until ${dtEnd.format('HH:mm')})`;
        }

        eventsList.push({
          id: `gen-bg-${eventsList.length + 1}`,
          title: blockTitle,
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
}
