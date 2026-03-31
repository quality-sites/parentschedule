import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { generateEventsFromConfig } from '../../../lib/engine';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !(session.user as any).id) {
    // Return empty events if not logged in
    return NextResponse.json([]);
  }

  const userId = (session.user as any).id;
  
  // Fetch schedules for this user
  const schedules = await prisma.schedule.findMany({
    where: { userId },
    include: { events: true }
  });

  // Flatten events map for FullCalendar
  let events: any[] = [];
  
  for (const s of schedules) {
    // Check if there is dynamic JSON configuration data
    if (s.data) {
       try {
         const config = JSON.parse(s.data);
         const generated = generateEventsFromConfig(config);
         events = events.concat(generated);
       } catch (e) {
         console.error("Failed to parse schedule rule engine data: ", e);
       }
    }

    // Also include physical override events
    const physicalEvents = s.events.map((e: any) => ({
      id: e.id,
      title: e.title,
      start: e.start.toISOString(),
      end: e.end.toISOString(),
      allDay: e.allDay,
      extendedProps: {
        type: e.type,
        notes: e.notes
      }
    }));
    events = events.concat(physicalEvents);
  }

  return NextResponse.json(events);
}
