import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { schedules: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Get first schedule or pass null
  const schedule = user.schedules[0] || null;

  return (
    <div className="mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Custody Rules Configuration</h1>
          <p className="text-gray-500">
            Configure your specific custody schedule. These rules will be mathematically calculated to populate your calendar.
          </p>
        </div>
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-x-2 rounded-md bg-white border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap"
          >
             &larr; Back to Calendar
          </Link>
        </div>
      </div>

      <SettingsForm existingSchedule={schedule} />
    </div>
  );
}
