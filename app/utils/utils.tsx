// src/utils/utils.ts
import moment from 'moment-timezone';
import { customStartDate, termDates, OverrideDates, EVENT_COLORS, EVENT_HANDOVER } from '../constants/constants';
import { Event } from '../types/types';

// Helper: convert any Date to "Europe/London"
const convertToLondonTimeZone = (date: Date) => {
  return moment(date).tz('Europe/London').toDate();
};

// Generate a timed event
export const generateEvent = (
  eventsList: Event[],
  title: string,
  start: Date,
  end: Date,
  backgroundColor?: string,
  textColor?: string
) => {
  const londonStart = convertToLondonTimeZone(start);
  const londonEnd = convertToLondonTimeZone(end);

  eventsList.push({
    title,
    start: londonStart.toISOString(),
    end: londonEnd.toISOString(),
    allDay: false,
    id: eventsList.length + 1,
    backgroundColor,
    textColor,
  });
};

// Generate an all-day event that repeats annually on the same month/day
export const generateRepeatedDatesEvent = (
  eventsList: Event[],
  title: string,
  month: number,
  day: number,
  backgroundColor: string,
  textColor?: string,
) => {
  const startYear = customStartDate.getFullYear();
  const endYear = startYear + 1;

  for (let year = startYear; year <= endYear; year++) {
    const eventDate = moment.tz({ year, month: month - 1, day }, 'Europe/London').toDate();

    eventsList.push({
      title,
      start: eventDate.toISOString(),
      end: eventDate.toISOString(),
      allDay: true,
      backgroundColor,
      textColor,
      id: eventsList.length + 1,
    });
  }
};

// Generate an all-day, one-off event only if it sits within a term
export const generateOneOffEvent = (
  eventsList: Event[],
  title: string,
  eventDate: Date,
  backgroundColor: string,
  textColor?: string
) => {
  const eventMoment = moment(eventDate);
  const term = termDates.find(t =>
    eventMoment.isSameOrAfter(moment(t.startDate)) &&
    eventMoment.isSameOrBefore(moment(t.endDate))
  );

  if (term) {
    const d = convertToLondonTimeZone(eventDate);
    eventsList.push({
      title,
      start: d.toISOString(),
      end: d.toISOString(),
      allDay: true,
      backgroundColor,
      textColor,
      id: eventsList.length + 1,
    });
  }
};

/**
 * calculateHolidays
 *
 * Splits the gap between terms into alternating parent blocks.
 * Key points:
 *  - For long holidays, blocks are anchored to EVENT_HANDOVER (weekday+time, e.g. Fri 18:00).
 *  - dadStarts on the *preceding term* picks who has the first holiday block.
 *  - **Christmas special case**: Default Mother-then-Father, except **2025 only** where Father starts.
 */
export const calculateHolidays = (eventsList: Event[]) => {
  const holidays: Array<{
    title: string;
    start: Date;
    end: Date;
    backgroundColor: string;
  }> = [];

  const parents = ['Dad', 'Mom']; // index 0 = Dad, 1 = Mom

  for (let i = 0; i < termDates.length - 1; i++) {
    const currentTerm = termDates[i];
    const nextTerm = termDates[i + 1];

    // Holiday window runs the day after currentTerm ends through the day before nextTerm starts
    const holidayStart = moment(currentTerm.endDate).tz('Europe/London').add(1, 'day').startOf('day');
    const holidayEnd = moment(nextTerm.startDate).tz('Europe/London').subtract(1, 'day').endOf('day');

    if (!holidayStart.isSameOrBefore(holidayEnd)) continue;

    // Who starts? If current term says dadStarts, Dad begins this holiday; else Mom.
    let parentIndex = currentTerm.dadStarts ? 0 : 1;
    let parent = parents[parentIndex];

    // --- Christmas special case (December) ---
    if (holidayStart.month() === 11) {
      const is2025 = holidayStart.year() === 2025;

      // Handover time on Christmas Day: 25 Dec 16:00
      const xmasHandover = holidayStart.clone().date(25).hour(16).minute(0).second(0);
      const firstEnd = moment.min(xmasHandover, holidayEnd);

      if (is2025) {
        // 2025 ONLY: Father from end of school -> Dec 25 16:00
        if (holidayStart.isSameOrBefore(firstEnd)) {
          generateEvent(
            eventsList,
            "Father's Christmas",
            holidayStart.toDate(),
            firstEnd.toDate(),
            EVENT_COLORS.RICHBLUE
          );
        }
        // Then Mother: Dec 25 16:00 -> until the day before school returns
        const secondStart = xmasHandover.clone().add(1, 'second');
        if (secondStart.isSameOrBefore(holidayEnd)) {
          generateEvent(
            eventsList,
            "Mother's Christmas",
            secondStart.toDate(),
            holidayEnd.toDate(),
            EVENT_COLORS.LIGHTPINK
          );
        }
      } else {
        // Default (all other years): Mother first, then Father
        if (holidayStart.isSameOrBefore(firstEnd)) {
          generateEvent(
            eventsList,
            "Mother's Christmas",
            holidayStart.toDate(),
            firstEnd.toDate(),
            EVENT_COLORS.LIGHTPINK
          );
        }
        const secondStart = xmasHandover.clone().add(1, 'second');
        if (secondStart.isSameOrBefore(holidayEnd)) {
          generateEvent(
            eventsList,
            "Father's Christmas",
            secondStart.toDate(),
            holidayEnd.toDate(),
            EVENT_COLORS.RICHBLUE
          );
        }
      }

      // Done with this holiday window
      continue;
    }

    // Duration in *days* (inclusive bounds handled by startOf/endOf above)
    const totalDays = holidayEnd.diff(holidayStart, 'days');

    // --- Short holidays (<= 11 days): single split in the middle ---
    if (totalDays <= 11 && totalDays > 0) {
      const handoverTime =
        holidayStart.month() === 11 ? '4pm' :
        holidayStart.month() === 3  ? '10am' :
        '6pm';

      const half = Math.floor(totalDays / 2);
      let start = holidayStart.clone();

      // First half
      let end = moment.min(start.clone().add(half, 'days').endOf('day'), holidayEnd);
      holidays.push({
        title: `${parent}'s Week - Handover ${handoverTime}`,
        start: start.toDate(),
        end: end.toDate(),
        backgroundColor: parent === 'Dad' ? EVENT_COLORS.RICHBLUE : EVENT_COLORS.LIGHTPINK,
      });

      // Switch parent for second half
      parentIndex = 1 - parentIndex;
      parent = parents[parentIndex];

      start = end.clone().add(1, 'second'); // prevent overlap
      if (start.isSameOrBefore(holidayEnd)) {
        holidays.push({
          title: `${parent}'s Week - Handover ${handoverTime}`,
          start: start.toDate(),
          end: holidayEnd.toDate(),
          backgroundColor: parent === 'Dad' ? EVENT_COLORS.RICHBLUE : EVENT_COLORS.LIGHTPINK,
        });
      }
    } else {
      // --- Long holidays: weekly blocks anchored to EVENT_HANDOVER ---
      const { isoWeekday, hour, minute } = EVENT_HANDOVER;

      // First anchor at/after the holidayStart
      let firstAnchor = holidayStart.clone()
        .isoWeekday(isoWeekday)   // 1=Mon..7=Sun
        .hour(hour)
        .minute(minute)
        .second(0);

      if (firstAnchor.isBefore(holidayStart)) {
        firstAnchor = firstAnchor.add(1, 'week');
      }

      // If holiday starts *after* the anchor day for that week, we start at next week's anchor
      let blockStart = firstAnchor.clone();

      // Safety: If the holiday ends before any anchor occurs; give whole block to starting parent
      if (blockStart.isAfter(holidayEnd)) {
        holidays.push({
          title: `${parent}'s Week - Handover ${hour}:${String(minute).padStart(2, '0')}`,
          start: holidayStart.toDate(),
          end: holidayEnd.toDate(),
          backgroundColor: parent === 'Dad' ? EVENT_COLORS.RICHBLUE : EVENT_COLORS.LIGHTPINK,
        });
      } else {
        // If there is a gap from holidayStart up to the first anchor, give it to the starting parent
        if (holidayStart.isBefore(blockStart)) {
          holidays.push({
            title: `${parent}'s Week - Handover ${hour}:${String(minute).padStart(2, '0')}`,
            start: holidayStart.toDate(),
            end: blockStart.toDate(),
            backgroundColor: parent === 'Dad' ? EVENT_COLORS.RICHBLUE : EVENT_COLORS.LIGHTPINK,
          });
          // Switch parent at anchor
          parentIndex = 1 - parentIndex;
          parent = parents[parentIndex];
        }

        // Now do weekly blocks from anchor to end
        while (blockStart.isSameOrBefore(holidayEnd)) {
          const nextAnchor = blockStart.clone().add(1, 'week');
          const blockEnd = moment.min(nextAnchor, holidayEnd.clone());

          holidays.push({
            title: `${parent}'s Week - Handover ${hour}:${String(minute).padStart(2, '0')}`,
            start: blockStart.toDate(),
            end: blockEnd.toDate(),
            backgroundColor: parent === 'Dad' ? EVENT_COLORS.RICHBLUE : EVENT_COLORS.LIGHTPINK,
          });

          // Advance
          blockStart = nextAnchor;
          parentIndex = 1 - parentIndex;
          parent = parents[parentIndex];
        }
      }
    }
  }

  // Push generated holiday events into the main list
  holidays.forEach(h =>
    generateEvent(eventsList, h.title, h.start, h.end, h.backgroundColor)
  );

  return holidays;
};

// Replace/force events from OverrideDates (INSET, Bank Holidays, one-offs)
export const overrideEvent = (eventsList: Event[]) => {
  for (const override of OverrideDates) {
    const { title, startDate, endDate, backgroundColor, textColor, allDay } = override;

    const londonStartDate = convertToLondonTimeZone(startDate);
    const londonEndDate = convertToLondonTimeZone(endDate);

    // Remove existing events that have the same title (single instance)
    const idx = eventsList.findIndex(e => e.title === title);
    if (idx !== -1) eventsList.splice(idx, 1);

    eventsList.push({
      title,
      start: londonStartDate.toISOString(),
      end: londonEndDate.toISOString(),
      allDay: !!allDay,
      backgroundColor,
      textColor,
      id: eventsList.length + 1,
    });
  }
};
