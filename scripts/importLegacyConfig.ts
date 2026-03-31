import { PrismaClient } from '@prisma/client';
import { termDates, OverrideDates, EVENT_HANDOVER } from '../example-sites/NextJSCalendarTut-main/app/constants/constants';
import { eventConfig } from '../example-sites/NextJSCalendarTut-main/app/eventConfig';
import { EVENT_COLORS } from '../lib/engine';

const prisma = new PrismaClient();

async function main() {
  // Find the first user to attach the schedule to
  let user = await prisma.user.findFirst();
  
  if (!user) {
    // Optionally create a dummy user if none exists
    console.log("No user found in the database. Creating a dummy user...");
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
      }
    });
  }

  // We are mapping the legacy configs into the new engine JSON format
  // eventConfig contains both birthdays, bank holidays, and insets/terms combined.
  
  // Try to categorise the eventConfig logically based on titles or colours
  const bankHolidays = eventConfig.filter((e: any) => e.backgroundColor === EVENT_COLORS.YELLOW || e.title.toLowerCase().includes('bank holiday'));
  const birthdays = eventConfig.filter((e: any) => e.title.toLowerCase().includes('birthday'));
  
  // Include INSET days from both eventConfig and OverrideDates
  const insetsFromEventConfig = eventConfig.filter((e: any) => e.title.toLowerCase().includes('inset'));
  const insetsFromOverrides = OverrideDates.filter((e: any) => e.title.toLowerCase().includes('inset'));
  
  const insets = [
    ...insetsFromEventConfig.map(i => ({ title: i.title, startDate: i.date })),
    ...insetsFromOverrides.map(i => ({ title: i.title, startDate: i.startDate, endDate: i.endDate }))
  ];

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
  };

  const manualOverrides = OverrideDates.filter((e: any) => !e.title.toLowerCase().includes('inset')).map((o: any) => {
    return {
      title: o.title,
      startDate: formatDate(o.startDate),
      endDate: formatDate(o.endDate),
      // Parent 0 is Dad, Parent 1 is Mom.
      parent: o.title.toLowerCase().includes("dad") ? 0 : 1 
    };
  });

  const parsedConfig = {
    parents: ["Dad", "Mom"],
    terms: termDates.map((t: any) => ({
      startDate: formatDate(t.startDate),
      endDate: formatDate(t.endDate),
      dadStarts: t.dadStarts
    })),
    startDate: '2023-09-04',
    weekendStarterParent: 0,
    holidayHandover: EVENT_HANDOVER,
    bankHolidays: bankHolidays.map((b: any) => ({ title: b.title, date: formatDate(b.date || b.startDate) })),
    birthdays: birthdays.map((b: any) => ({ title: b.title, month: b.month, day: b.day })),
    insets: insets.map((i: any) => ({
      title: i.title,
      startDate: formatDate(i.startDate),
      endDate: formatDate(i.endDate) || formatDate(i.startDate)
    })),
    overrides: manualOverrides.map((o: any) => ({
      title: o.title,
      parent: o.parent,
      startDate: formatDate(o.startDate),
      endDate: formatDate(o.endDate)
    }))
  };

  const schedule = await prisma.schedule.create({
    data: {
      userId: user.id,
      title: "Migrated Legacy Schedule",
      type: "custom",
      data: JSON.stringify(parsedConfig, null, 2),
    }
  });

  console.log(`✅ Successfully added the config into a new Schedule!`);
  console.log(`Schedule ID: ${schedule.id}`);
  console.log(`Assigned to User: ${user.email || user.name || user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed to add config", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
