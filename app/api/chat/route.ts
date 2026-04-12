import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendChatNotification } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json({ error: "Missing scheduleId" }, { status: 400 });
    }

    // Security check: Make sure user either owns the schedule, or is a shared co-parent to this schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    const share = await prisma.scheduleShare.findUnique({
      where: { scheduleId_email: { scheduleId, email: session.user.email } }
    });

    if (schedule?.userId !== (session.user as any).id && !share) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch the messages
    const messages = await prisma.message.findMany({
      where: { scheduleId },
      include: {
        sender: {
           select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' } // Oldest to newest
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId, content } = await req.json();

    if (!scheduleId || !content || content.trim() === "") {
       return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Security check
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    const share = await prisma.scheduleShare.findUnique({
      where: { scheduleId_email: { scheduleId, email: session.user.email } }
    });

    if (schedule?.userId !== (session.user as any).id && !share) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const message = await prisma.message.create({
       data: {
          scheduleId,
          senderId: (session.user as any).id,
          content: content.trim()
       },
       include: {
          sender: { select: { id: true, name: true, email: true } }
       }
    });

    // --- EMAIL NOTIFICATION TRIGGER ---
    const fullSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
         user: { select: { email: true } },
         shares: { select: { email: true, status: true } }
      }
    });

    if (fullSchedule) {
       const senderId = (session.user as any).id;
       const senderName = message.sender?.name || session.user.email?.split('@')[0] || 'A Parent';
       
       let targetEmails: string[] = [];
       if (fullSchedule.userId === senderId) {
          // Owner is sending. Email all shares.
          targetEmails = fullSchedule.shares.map(s => s.email);
       } else {
          // A Co-parent is sending. Email the owner.
          if (fullSchedule.user.email) targetEmails = [fullSchedule.user.email];
       }

       // Fire and forget
       for (const email of targetEmails) {
          if (email) {
             sendChatNotification(email, senderName).catch(console.error);
          }
       }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT() {
   return NextResponse.json({ error: "Method Not Allowed. Messages are immutable." }, { status: 405 });
}

export async function DELETE() {
   return NextResponse.json({ error: "Method Not Allowed. Messages cannot be deleted." }, { status: 405 });
}
