import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Fetch the logs
    const logs = await prisma.auditLog.findMany({
      where: { scheduleId },
      include: {
        user: {
           select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
