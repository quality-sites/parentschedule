import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { title, type, data } = await req.json();

    const schedule = await prisma.schedule.create({
      data: {
        userId: user.id,
        title,
        type,
        data,
      },
    });

    await prisma.auditLog.create({
      data: {
        scheduleId: schedule.id,
        userId: user.id,
        action: "Initial Schedule Created",
        details: JSON.stringify({ title, type, data: JSON.parse(data) }),
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { schedules: true },
    });

    const sharedSchedules = await prisma.scheduleShare.findMany({
      where: { email: session.user.email, role: "EDITOR" },
      include: { schedule: true },
    });

    if (!user && sharedSchedules.length === 0) {
       return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const targetScheduleId = user?.schedules?.[0]?.id || sharedSchedules?.[0]?.schedule?.id;

    if (!targetScheduleId) {
      return NextResponse.json({ error: "No editable schedule found" }, { status: 404 });
    }

    const { title, type, data } = await req.json();

    const schedule = await prisma.schedule.update({
      where: { id: targetScheduleId },
      data: {
        title,
        type,
        data,
      },
    });

    await prisma.auditLog.create({
      data: {
        scheduleId: targetScheduleId,
        userId: user!.id,
        action: "Schedule Configuration Updated",
        details: JSON.stringify({ title, type, data: JSON.parse(data) }),
      }
    });

    return NextResponse.json(schedule, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
