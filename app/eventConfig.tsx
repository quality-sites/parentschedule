import { EVENT_COLORS } from './constants/constants'; 

// Separate arrays for different categories
const birthdayEvents: any[] = [
  {
    title: "Mother's Birthday",
    month: 6,
    day: 2,
    backgroundColor: EVENT_COLORS.PINK,
  },
  {
    title: "Father's Birthday",
    month: 11,
    day: 28,
    backgroundColor: EVENT_COLORS.BLUE,
  },
  {
    title: "Emre's Birthday",
    month: 8,
    day: 24,
    backgroundColor: EVENT_COLORS.LIGHTBLUE,
    textColor: 'black',
  },
  {
    title: "Ozcan's Birthday",
    month: 9,
    day: 25,
    backgroundColor: EVENT_COLORS.LIGHTBLUE,
    textColor: 'black',
  },
];

const bankHolidayEvents: any[] = [];

// Define the bank holidays for multiple years
const bankHolidays = [
  { title: "New Year's Day", date: '2024-01-01' },
  { title: "Good Friday", date: '2024-03-29' },
  { title: "Easter Monday", date: '2024-04-01' },
  { title: "Early May bank holiday", date: '2024-05-06' },
  { title: "Spring bank holiday", date: '2024-05-27' },
  { title: "Summer bank holiday", date: '2024-08-26' },
  { title: "Christmas Day", date: '2024-12-25' },
  { title: "Boxing Day", date: '2024-12-26' },
  // 2025 bank holidays
  { title: "New Year's Day", date: '2025-01-01' },
  { title: "Good Friday", date: '2025-04-18' },
  { title: "Easter Monday", date: '2025-04-21' },
  { title: "Early May bank holiday", date: '2025-05-05' },
  { title: "Spring bank holiday", date: '2025-05-26' },
  { title: "Summer bank holiday", date: '2025-08-25' },
  { title: "Christmas Day", date: '2025-12-25' },
  { title: "Boxing Day", date: '2025-12-26' },
  // 2026 bank holidays (example placeholders)
  { title: "New Year's Day", date: '2026-01-01' },
  { title: "Good Friday", date: '2026-04-03' },
  { title: "Easter Monday", date: '2026-04-06' },
  { title: "Early May bank holiday", date: '2026-05-04' },
  { title: "Spring bank holiday", date: '2026-05-25' },
  { title: "Summer bank holiday", date: '2026-08-31' },
  { title: "Christmas Day", date: '2026-12-25' },
  { title: "Boxing Day", date: '2026-12-28' },
];

// Add yellow background and black text for all
bankHolidays.forEach((holiday) => {
    bankHolidayEvents.push({
        title: holiday.title,
        date: holiday.date,
        backgroundColor: EVENT_COLORS.YELLOW,
        textColor: 'black',
    });
});

const otherEvents: any[] = [
  {
    title: "Mother's Day (10 am on Sunday till school)",
    date: '2024-05-08',
    backgroundColor: EVENT_COLORS.PINK,
  },
  {
    title: "Father's Day (10 am on Sunday till school)",
    date: '2024-06-19',
    backgroundColor: EVENT_COLORS.BLUE,
  },
  {
    title: "Mother's Day (10 am on Sunday till school)",
    date: '2025-03-30',
    backgroundColor: EVENT_COLORS.PINK,
  },
  {
    title: "Father's Day (10 am on Sunday till school)",
    date: '2025-06-15',
    backgroundColor: EVENT_COLORS.BLUE,
  },
  // School term and inset dates 2025-26
  {
    title: "INSET Day",
    date: '2025-09-01',
    backgroundColor: EVENT_COLORS.LIGHTPINK,
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "INSET Day",
    date: '2025-09-02',
    backgroundColor: EVENT_COLORS.LIGHTPINK,
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "Term Start",
    date: '2025-09-03',
    backgroundColor: EVENT_COLORS.LIGHTBLUE,
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "Term End",
    date: '2025-12-19',
    backgroundColor: EVENT_COLORS.RICHBLUE,
    textColor: EVENT_COLORS.WHITE,
  },
  {
    title: "Term Start",
    date: '2026-01-05',
    backgroundColor: EVENT_COLORS.LIGHTBLUE,
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "Term End",
    date: '2026-03-27',
    backgroundColor: EVENT_COLORS.RICHBLUE,
    textColor: EVENT_COLORS.WHITE,
  },
  {
    title: "Term Start",
    date: '2026-04-13',
    backgroundColor: EVENT_COLORS.LIGHTBLUE,
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "Term End",
    date: '2026-07-20',
    backgroundColor: EVENT_COLORS.RICHBLUE,
    textColor: EVENT_COLORS.WHITE,
  },
  {
    title: "INSET Day",
    date: '2025-10-18',
    backgroundColor: '#FFA500', // Orange
    textColor: EVENT_COLORS.WHITE,
  },
  {
    title: "INSET Day",
    date: '2026-07-21',
    backgroundColor: '#90EE90', // Light green
    textColor: EVENT_COLORS.BLACK,
  },
  {
    title: "INSET Day",
    date: '2026-07-22',
    backgroundColor: '#90EE90', // Light green
    textColor: EVENT_COLORS.BLACK,
  },
];

export const eventConfig = [...birthdayEvents, ...bankHolidayEvents, ...otherEvents];
