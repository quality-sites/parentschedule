import { PrismaClient } from '@prisma/client';
import { generateEventsFromConfig } from '../lib/engine';
import moment from 'moment-timezone';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ include: { schedules: true } });
  if (!user || user.schedules.length === 0) {
    console.log("No schedule found");
    return;
  }
  
  const schedule = user.schedules[0];
  const config = JSON.parse(schedule.data);
  const events = generateEventsFromConfig(config);
  
  // Check for any overlaps
  let overlapFound = false;
  const sortedEvents = events.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    // Ignore allDay events and birthdays/insets for overlap check between Mom and Dad
    if (current.allDay || next.allDay) continue;
    
    const currEnd = new Date(current.end).getTime();
    const nextStart = new Date(next.start).getTime();
    
    const isMomOrDadCurr = current.title.includes("Dad") || current.title.includes("Mom");
    const isMomOrDadNext = next.title.includes("Dad") || next.title.includes("Mom");

    if (isMomOrDadCurr && isMomOrDadNext && currEnd > nextStart) {
      console.log(`OVERLAP DETECTED:`);
      console.log(`1. ${current.title}: ${current.start} -> ${current.end}`);
      console.log(`2. ${next.title}: ${next.start} -> ${next.end}`);
      overlapFound = true;
    }
  }

  if (!overlapFound) {
    console.log("No mathematical overlaps found between Mom and Dad timed events!");
  }
}

main().finally(() => prisma.$disconnect());
