import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";

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

    // Verify ownership
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (schedule?.userId !== (session.user as any).id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const shares = await prisma.scheduleShare.findMany({
      where: { scheduleId },
      orderBy: { invitedAt: 'desc' }
    });

    return NextResponse.json(shares, { status: 200 });
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

    const { scheduleId, email, role } = await req.json();

    if (!scheduleId || !email) {
       return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Verify ownership
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (schedule?.userId !== (session.user as any).id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Upsert the invite
    const share = await prisma.scheduleShare.upsert({
      where: {
         scheduleId_email: { scheduleId, email }
      },
      update: {
         role: role || "VIEWER"
      },
      create: {
         scheduleId,
         email,
         role: role || "VIEWER",
         status: "PENDING"
      }
    });

    // Fire email async
    const inviterName = session.user.name || session.user.email?.split('@')[0] || "A Parent";
    sendInvitationEmail(email, inviterName).catch(console.error);

    return NextResponse.json(share, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json({ error: "Missing share id" }, { status: 400 });
    }

    const share = await prisma.scheduleShare.findUnique({
       where: { id: shareId },
       include: { schedule: true }
    });

    if (!share) {
       return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (share.schedule.userId !== (session.user as any).id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.scheduleShare.delete({
       where: { id: shareId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
