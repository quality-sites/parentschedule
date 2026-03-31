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

    if (!user || user.schedules.length === 0) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const { title, type, data } = await req.json();

    const schedule = await prisma.schedule.update({
      where: { id: user.schedules[0].id },
      data: {
        title,
        type,
        data,
      },
    });

    return NextResponse.json(schedule, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
