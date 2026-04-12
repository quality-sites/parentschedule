import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ChatApp from "./ChatApp";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { schedules: true },
  });

  const sharedSchedules = await prisma.scheduleShare.findMany({
    where: { email: session.user.email },
    include: { schedule: true },
  });

  if (!user && sharedSchedules.length === 0) {
    redirect("/auth/signin");
  }

  const schedule = user?.schedules?.[0] || sharedSchedules?.[0]?.schedule || null;

  return (
    <div className="mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Co-Parenting Chat</h1>
          <p className="text-gray-500">
            A secure, legally-binding messaging platform for parents.
          </p>
        </div>
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-x-2 rounded-md bg-white border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 whitespace-nowrap"
          >
             &larr; Back to Calendar
          </Link>
        </div>
      </div>

      {schedule ? (
        <ChatApp scheduleId={schedule.id} currentUserId={(session.user as any).id || user?.id} />
      ) : (
        <div className="bg-amber-50 p-6 rounded-lg text-amber-700 text-center">
            You must configure your initial schedule settings before you can use the Chat feature.
        </div>
      )}
    </div>
  );
}
