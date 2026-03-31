'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import AdBanner from '../components/AdBanner';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-white">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-50 to-white -z-10 w-full" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-0 -ml-20 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24 pb-20 text-center lg:pt-32 lg:pb-28">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Simplify sharing custody with the
            <span className="relative whitespace-nowrap text-indigo-600 block sm:inline mt-2 sm:mt-0 sm:ml-4">
              <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute top-2/3 left-0 h-[0.58em] w-full fill-indigo-300/50" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
              <span className="relative">CoParent Picker</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700 sm:text-xl leading-relaxed">
            Stop arguing over specific weekends and holidays. Our intelligent calendar engine takes your family court rules and instantly generates a conflict-free, long-term parenting schedule.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            {session ? (
              <Link href="/dashboard" className="group inline-flex items-center justify-center rounded-full py-3 px-8 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-indigo-600 outline-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-xl shadow-indigo-200 transition-all duration-300">
                Go to Dashboard
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <button onClick={() => signIn()} className="group inline-flex items-center justify-center rounded-full py-3 px-8 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-indigo-600 outline-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-xl shadow-indigo-200 transition-all duration-300">
                Get Started for Free
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
            <Link href="/how-to-use" className="group inline-flex ring-1 ring-slate-200 items-center justify-center rounded-full py-3 px-8 text-sm font-semibold focus:outline-none bg-white text-slate-900 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Primary Ad Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner text="Sponsored Placement" />
      </div>

      {/* Features Showcase */}
      <section className="bg-slate-50 w-full py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
              Designed specifically for court-ordered complexities.
            </h2>
            <p className="mt-4 text-lg text-slate-700">
              Generic calendars don't know what "Every 3rd weekend" or "Alternating Thanksgiving" means. We do.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Recurring Rules</h3>
              <p className="text-gray-600 leading-relaxed">
                Input your exact court order phrasing. From 2-2-3 splits to 50/50 rotations, our engine understands exactly what days belong to who.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Holiday Overrides</h3>
              <p className="text-gray-600 leading-relaxed">
                Set priority rules for Mother's Day, Father's Day, and alternating major holidays without messing up the underlying schedule.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Cloud Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Everything is backed up and bound to your account. Log in on any device, anytime, and print cleanly formatted PDF schedules for court.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Secondary Ad Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
        <AdBanner text="Premium Partner Placement" />
      </div>

    </div>
  );
}
