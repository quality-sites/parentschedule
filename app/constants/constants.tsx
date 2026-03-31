// Set your custom start date here
export const customStartDate = new Date();
export const customEndDate = new Date('2027-07-31');

export const termDates = [
  // Existing term dates
  { startDate: new Date('2023-09-04'), endDate: new Date('2023-10-13'), dadStarts: true },
  { startDate: new Date('2023-10-31'), endDate: new Date('2023-12-19'), dadStarts: true },
  { startDate: new Date('2024-01-04'), endDate: new Date('2024-02-17'), dadStarts: true },
  { startDate: new Date('2024-02-26'), endDate: new Date('2024-03-29'), dadStarts: true },
  { startDate: new Date('2024-04-15'), endDate: new Date('2024-05-24'), dadStarts: true },
  { startDate: new Date('2024-06-02'), endDate: new Date('2024-07-24'), dadStarts: false },

  // 2024–2025
  { startDate: new Date('2024-09-04'), endDate: new Date('2024-10-25'), dadStarts: true },
  { startDate: new Date('2024-11-04'), endDate: new Date('2024-12-20'), dadStarts: false },

  // Spring 2025
  { startDate: new Date('2025-01-06'), endDate: new Date('2025-02-14'), dadStarts: true },
  { startDate: new Date('2025-02-24'), endDate: new Date('2025-04-04'), dadStarts: false },

  // Summer 2025
  { startDate: new Date('2025-04-22'), endDate: new Date('2025-05-23'), dadStarts: true },
  { startDate: new Date('2025-06-02'), endDate: new Date('2025-07-22'), dadStarts: true },

  // 2025–2026
  { startDate: new Date('2025-09-01'), endDate: new Date('2025-10-24'), dadStarts: true },
  { startDate: new Date('2025-11-03'), endDate: new Date('2025-12-19'), dadStarts: false },

  // Spring 2026 (split around half-term: Mon 16–Fri 20 Feb)
  { startDate: new Date('2026-01-05'), endDate: new Date('2026-02-13'), dadStarts: false },
  { startDate: new Date('2026-02-23'), endDate: new Date('2026-03-27'), dadStarts: false },

  // Summer 2026 (split around half-term: Mon 25–Fri 29 May)
  { startDate: new Date('2026-04-13'), endDate: new Date('2026-05-22'), dadStarts: false },
  { startDate: new Date('2026-06-01'), endDate: new Date('2026-07-20'), dadStarts: false },

  // Autumn 2026 (adds the July→September holiday window)
  { startDate: new Date('2026-09-02'), endDate: new Date('2026-10-23'), dadStarts: true },
  { startDate: new Date('2026-11-02'), endDate: new Date('2026-12-18'), dadStarts: false },
];

// Define event colors
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

// unchanged from your file; you may optionally add nonTeaching: true to INSET/Bank Holidays
export const OverrideDates = [
  {
    title: "*Mother's Time (Midweek)",
    startDate: new Date('2024-01-02'),
    endDate: new Date('2024-01-04'),
    dadStarts: true,
    backgroundColor: EVENT_COLORS.RED,
    textColor: EVENT_COLORS.WHITE,
    allDay: true
  },
  { title: "INSET Day", startDate: new Date('2024-10-18'), endDate: new Date('2024-10-18'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-06-27'), endDate: new Date('2025-06-27'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-07-21'), endDate: new Date('2025-07-21'), backgroundColor: '#90EE90', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-07-22'), endDate: new Date('2025-07-22'), backgroundColor: '#90EE90', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-09-01'), endDate: new Date('2025-09-01'), backgroundColor: '#FFB6C1', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-09-02'), endDate: new Date('2025-09-02'), backgroundColor: '#FFB6C1', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-07-21'), endDate: new Date('2026-07-21'), backgroundColor: '#90EE90', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-07-22'), endDate: new Date('2026-07-22'), backgroundColor: '#90EE90', textColor: EVENT_COLORS.BLACK, allDay: true },
  { title: "INSET Day", startDate: new Date('2025-10-17'), endDate: new Date('2025-10-17'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-01-05'), endDate: new Date('2026-01-05'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-02-13'), endDate: new Date('2026-02-13'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-06-26'), endDate: new Date('2026-06-26'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "INSET Day", startDate: new Date('2026-07-20'), endDate: new Date('2026-07-20'), backgroundColor: '#FFA500', textColor: EVENT_COLORS.WHITE, allDay: true },

  // 2025-2026 Bank Holidays
  { title: "Bank Holiday - Christmas Day", startDate: new Date('2025-12-25'), endDate: new Date('2025-12-25'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "Bank Holiday - Boxing Day", startDate: new Date('2025-12-26'), endDate: new Date('2025-12-26'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "Bank Holiday - New Year's Day", startDate: new Date('2026-01-01'), endDate: new Date('2026-01-01'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
    {
    title: "*Dad's Time (Midweek)",
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-01'),
    backgroundColor: EVENT_COLORS.BLUE,
    textColor: EVENT_COLORS.WHITE,
    allDay: true
  },
  { title: "Bank Holiday - Good Friday", startDate: new Date('2026-04-03'), endDate: new Date('2026-04-03'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "Bank Holiday - Easter Monday", startDate: new Date('2026-04-06'), endDate: new Date('2026-04-06'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "Bank Holiday - Early May Bank Holiday", startDate: new Date('2026-05-04'), endDate: new Date('2026-05-04'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
  { title: "Bank Holiday - Spring Bank Holiday", startDate: new Date('2026-05-25'), endDate: new Date('2026-05-25'), backgroundColor: '#FF0000', textColor: EVENT_COLORS.WHITE, allDay: true },
];

// Holiday cadence (used by holiday engine)
export const EVENT_HANDOVER = {
  /** Friday (ISO 1=Mon..7=Sun) */
  isoWeekday: 5,
  hour: 18,
  minute: 0,
};
