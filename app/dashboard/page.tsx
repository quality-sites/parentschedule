"use client"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { AmazonAffiliateProducts } from '@/components/AmazonAffiliateProducts';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 print:p-0 print:m-0 print:max-w-none">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 print:shadow-none print:border-none print:p-0 print:m-0">
        <div className="mb-6 flex justify-between items-end print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Calendar</h1>
            <p className="text-gray-500 mt-1">Manage your court-ordered custody schedule effortlessly.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
               onClick={() => window.print()}
               className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v-2.94a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.94ZM15 7.128v-.128a2.25 2.25 0 0 0-2.25-2.25h-1.5A2.25 2.25 0 0 0 9 7v.128c-.8.1-1.6.22-2.39.362M15 7.128c.8.1 1.6.22 2.39.362" />
              </svg>
              Print
            </button>
            <Link 
              href="/dashboard/chat" 
              className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              Chat
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Parenting Settings
            </Link>
          </div>
        </div>
        
        <div className="calendar-container overflow-hidden rounded-xl border border-gray-200 print:overflow-visible print:border-none print:shadow-none print:rounded-none">
          <FullCalendar
              plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin
              ]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events="/api/events"
              initialView="dayGridMonth"
              height="auto"
              contentHeight={600}
              eventContent={(info) => {
                let timeText = info.timeText;
                
                // Hide purely default midnight stamps (12a / 12:00a) 
                if (timeText && timeText.replace(/\s/g, '').toLowerCase().startsWith('12a')) {
                  timeText = '';
                }

                return (
                  <div className="flex px-1 w-full overflow-hidden">
                    {timeText && <div className="fc-event-time font-semibold mr-1 flex-shrink-0">{timeText}</div>}
                    <div className="fc-event-title whitespace-normal break-words leading-snug">{info.event.title}</div>
                  </div>
                );
              }}
              eventClick={(info) => {
                const type = info.event.extendedProps?.type?.toLowerCase();
                const isConfigurable = info.event.extendedProps?.configurable === true || type === 'override';
                
                if (!isConfigurable) return;
                
                const year = info.event.start?.getFullYear();
                const yearParam = year ? `&year=${year}` : '';

                if (type === 'routine') {
                  router.push(`/dashboard/settings?tab=routines${yearParam}`);
                } else if (type === 'override') {
                  router.push(`/dashboard/settings?tab=exceptions${yearParam}`);
                } else {
                  router.push(`/dashboard/settings?tab=events${yearParam}`);
                }
              }}
              eventMouseEnter={(info) => {
                const type = info.event.extendedProps?.type?.toLowerCase();
                const isConfigurable = info.event.extendedProps?.configurable === true || type === 'override';
                if (isConfigurable) {
                  info.el.style.cursor = 'pointer';
                  info.el.title = 'Click to configure this rule';
                }
              }}
            />
        </div>
        
        {/* Monetization Ad Block */}
        <div className="mt-12 bg-transparent rounded-xl p-4 print:hidden">
          <AmazonAffiliateProducts variant="carousel" title="Recommended for Co-Parents" maxProducts={6} />
        </div>
      </div>
    </div>
  )
}
