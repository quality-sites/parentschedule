"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShareManager from "./ShareManager";
import AuditManager from "./AuditManager";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function Pagination({ page, totalItems, perPage, onPageChange }: { page: number, totalItems: number, perPage: number, onPageChange: (p: number) => void }) {
  const totalPages = Math.ceil(totalItems / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-md">
      <div className="flex flex-1 justify-between sm:hidden">
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">Showing <span className="font-medium">{(page - 1) * perPage + 1}</span> to <span className="font-medium">{Math.min(page * perPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results</p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
              <span className="sr-only">Previous</span>
              &larr;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button type="button" key={i} onClick={() => onPageChange(i + 1)} className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === i + 1 ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'} focus:z-20 focus:outline-offset-0`}>
                {i + 1}
              </button>
            ))}
            <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
              <span className="sr-only">Next</span>
              &rarr;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function SettingsForm({ existingSchedule, role = "OWNER" }: { existingSchedule: any; role?: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('basic');
  const [activeTermYear, setActiveTermYear] = useState<string>('All');
  const [activePage, setActivePage] = useState(1);
  const [editingTermSplitIdx, setEditingTermSplitIdx] = useState<number | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUrlState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const hash = window.location.hash.replace('#', '');
        
        const active = tab || hash;
        if (active && ['basic', 'routines', 'events', 'exceptions', 'history', 'sharing'].includes(active)) {
          setActiveTab(active);
        }
        
        const year = params.get('year');
        if (year) {
          setActiveTermYear(year);
        }

        const page = params.get('page');
        if (page) setActivePage(parseInt(page));
      }
    };
    
    // Parse on initial mount
    handleUrlState();
    
    // Parse when query string changes without remount
    window.addEventListener('popstate', handleUrlState);
    window.addEventListener('hashchange', handleUrlState);
    return () => {
      window.removeEventListener('popstate', handleUrlState);
      window.removeEventListener('hashchange', handleUrlState);
    };
  }, []);

  const updateUrlParams = (tab: string, year: string, page: number) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', tab);
      if (year !== 'All') {
        params.set('year', year);
      } else {
        params.delete('year');
      }
      if (page > 1) {
        params.set('page', page.toString());
      } else {
        params.delete('page');
      }
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActivePage(1);
    updateUrlParams(tabId, activeTermYear, 1);
  };

  const handleTermYearChange = (year: string) => {
    setActiveTermYear(year);
    setActivePage(1);
    updateUrlParams(activeTab, year, 1);
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
    updateUrlParams(activeTab, activeTermYear, page);
  };

  const scrollToMessage = () => {
    setTimeout(() => {
      // scroll to center so it's clearly visible and not stuck right under the navbar
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Setup' },
    { id: 'routines', label: 'Routines' },
    { id: 'events', label: 'Dates & Events' },
    { id: 'exceptions', label: 'Exceptions' },
    { id: 'history', label: 'History' },
  ];

  if (role === "OWNER") {
    tabs.push({ id: 'sharing', label: 'Sharing' });
  }

  const defaultData = {
    parents: ["Mum", "Dad"],
    parentColors: ["#FFB6C1", "#ADD8E6"],
    terms: [],
    bankHolidays: [],
    insets: [],
    birthdays: [],
    rules: [
      { id: "leg-wed", parent: 1, startDay: 3, startTime: "15:10", endDay: 4, endTime: "08:40", frequency: "weekly" },
      { id: "leg-fri", parent: 1, startDay: 5, startTime: "15:10", endDay: 1, endTime: "08:40", frequency: "alternating" }
    ],
    holidayHandover: { hour: 18, minute: 0 },
    christmasHandover: { strategy: "split_half", day: 25, hour: 16, minute: 0 }
  };

  const [config, setConfig] = useState(() => {
    if (existingSchedule?.data) {
      try {
        const parsed = JSON.parse(existingSchedule.data);
        if (!parsed.rules) {
           parsed.rules = [
             { id: "leg-wed", parent: 1, startDay: 3, startTime: "15:10", endDay: 4, endTime: "08:40", frequency: "weekly" },
             { id: "leg-fri", parent: 1, startDay: 5, startTime: "15:10", endDay: 1, endTime: "08:40", frequency: "alternating" }
           ];
        }
        return { ...defaultData, ...parsed };
      } catch (e) {}
    }
    return defaultData;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (config.parentColors && config.parentColors[0] === config.parentColors[1]) {
      setMessage("Error: Parent colors must be different to clearly highlight the schedule.");
      scrollToMessage();
      return;
    }

    setIsSaving(true);
    setMessage("");

    // Validate Terms
    if (config.terms) {
      for (let i = 0; i < config.terms.length; i++) {
        const term = config.terms[i];
        if (term.startDate && term.endDate && new Date(term.endDate) < new Date(term.startDate)) {
          setMessage(`Error: In Term ${i + 1}, the End Date cannot be before the Start Date.`);
          setActiveTab('events');
          scrollToMessage();
          setIsSaving(false);
          return;
        }
      }
    }

    // Validate Insets
    if (config.insets) {
      for (let i = 0; i < config.insets.length; i++) {
        const ins = config.insets[i];
        if (ins.startDate && ins.endDate && new Date(ins.endDate) < new Date(ins.startDate)) {
          setMessage(`Error: In Inset Day ${i + 1}, the End Date cannot be before the Start Date.`);
          setActiveTab('events');
          scrollToMessage();
          setIsSaving(false);
          return;
        }
      }
    }

    // Validate Overrides
    if (config.overrides) {
      for (let i = 0; i < config.overrides.length; i++) {
        const ov = config.overrides[i];
        if (ov.startDate && ov.endDate && new Date(ov.endDate) < new Date(ov.startDate)) {
          setMessage(`Error: In Exception ${i + 1}, the End Date cannot be before the Start Date.`);
          setActiveTab('exceptions');
          scrollToMessage();
          setIsSaving(false);
          return;
        }
      }
    }

    try {
      const payload = {
        title: "Standard Custody Schedule",
        type: "alternating_weekend_midweek",
        data: JSON.stringify(config)
      };

      const res = await fetch("/api/schedule", {
        method: existingSchedule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage("Schedule configuration saved successfully!");
        router.refresh();
      } else {
        setMessage("Failed to save configuration.");
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
      scrollToMessage();
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = (parentKey: string, key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] || {}), [key]: value }
    }));
  };

  const termYears = Array.from(new Set(
    (config.terms || []).map((t: any) => t.startDate && t.startDate.includes('-') ? t.startDate.split('-')[0] : "No Date")
  )).sort() as string[];

  const overrideYears = Array.from(new Set(
    (config.overrides || []).map((o: any) => o.startDate && o.startDate.includes('-') ? o.startDate.split('-')[0] : "No Date")
  )).sort() as string[];

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mb-16">
      <form onSubmit={handleSave} className="space-y-10">
        <div ref={messageRef}></div>
        {message && (
          <div className={`p-4 rounded-md ${message.includes("success") ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <fieldset disabled={role === "VIEWER"} className="space-y-10">
        {/* TAB: BASIC SETUP */}
        {activeTab === 'basic' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* PARENTS */}
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Parent Profiles</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>How to use this site:</strong> The calendar mathematically fills all unallocated time with <strong>Parent A (Default Parent)</strong>. Therefore, the easiest way to build your schedule is to ONLY define routines and events for <strong>Parent B (Assigned Parent)</strong>. The system will automatically construct the rest of the calendar for you!
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Parent A (Default Parent)</label>
                  <p className="text-xs text-gray-500 mb-2">Time mathematically defaults to them when not allocated.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      title="Parent A Color"
                      type="color"
                      value={config.parentColors?.[0] || "#FFB6C1"}
                      onChange={(e) => updateConfig('parentColors', [e.target.value, config.parentColors?.[1] || "#ADD8E6"])}
                      className="h-9 w-9 p-0 border-0 rounded-md cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={config.parents[0]} 
                      onChange={(e) => updateConfig('parents', [e.target.value, config.parents[1]])}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent B (Assigned Parent)</label>
                  <p className="text-xs text-gray-500 mb-2">You will add specific rules and events for them.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      title="Parent B Color"
                      type="color"
                      value={config.parentColors?.[1] || "#ADD8E6"}
                      onChange={(e) => updateConfig('parentColors', [config.parentColors?.[0] || "#FFB6C1", e.target.value])}
                      className="h-9 w-9 p-0 border-0 rounded-md cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={config.parents[1]} 
                      onChange={(e) => updateConfig('parents', [config.parents[0], e.target.value])}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* GLOBAL TIMELINE */}
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Global Timeline</h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule Start Date</label>
                  <input 
                    type="date" 
                    value={config.startDate ? config.startDate.split('T')[0] : ""} 
                    onChange={(e) => updateConfig('startDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Weekend Parent</label>
                  <select 
                    value={config.weekendStarterParent || 0} 
                    onChange={(e) => updateConfig('weekendStarterParent', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-sm focus:outline-none"
                  >
                    <option value={0}>{config.parents[0]} (Parent A - Default)</option>
                    <option value={1}>{config.parents[1]} (Parent B - Assigned)</option>
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">If you don't define school term splits below, the schedule will mathematically repeat continuously in 2-year cycles starting from this date.</p>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-md font-medium leading-6 text-gray-900 pb-3">Rotation Phase Resets</h4>
                <p className="text-sm text-gray-500 pb-2">Use this to force the mathematically Alternating recurring patterns to restart tracking from a specific date. Useful after holidays.</p>
                <div className="mt-2 space-y-4">
                  {(config.phaseResets || []).map((reset: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-4 bg-purple-50 p-4 rounded-md border border-purple-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Restart Date</label>
                        <input type="date" value={reset.startDate ? reset.startDate.split('T')[0] : ""} onChange={(e) => { const n = [...(config.phaseResets || [])]; n[idx].startDate = e.target.value; updateConfig('phaseResets', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Alternating Cycle Begins With...</label>
                        <select value={reset.parent !== undefined ? reset.parent : 0} onChange={(e) => { const n = [...(config.phaseResets || [])]; n[idx].parent = parseInt(e.target.value); updateConfig('phaseResets', n); }} className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm">
                           <option value={0}>{config.parents[0]} (Parent A)</option>
                           <option value={1}>{config.parents[1]} (Parent B)</option>
                        </select>
                      </div>
                      <div className="mt-5">
                        <button type="button" onClick={() => updateConfig('phaseResets', (config.phaseResets || []).filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => updateConfig('phaseResets', [...(config.phaseResets || []), { startDate: '', parent: 0 }])} className="text-purple-600 hover:text-purple-800 text-sm font-medium">+ Add Rotation Reset</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: ROUTINES */}
        {activeTab === 'routines' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* DYNAMIC TERM RULES */}
            <section>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Term Time Rules Configuration</h3>
              </div>
              <p className="text-sm text-gray-500 mt-2 pb-2">
                Define the recurring blocks of time assigned to <strong>Parent B ({config.parents[1]})</strong>. All unassigned gaps will automatically default to <strong>Parent A ({config.parents[0]})</strong>.
              </p>
              
              <div className="mt-4 space-y-4">
                {(config.rules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Assigned Parent</label>
                      <select value={rule.parent} onChange={(e) => { const n = [...config.rules]; n[idx].parent = parseInt(e.target.value); updateConfig('rules', n); }} className="mt-1 block w-40 rounded-md border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
                        <option value={1}>{config.parents[1]} (Parent B)</option>
                        <option value={0}>{config.parents[0]} (Parent A)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Frequency</label>
                      <select value={rule.frequency} onChange={(e) => { const n = [...config.rules]; n[idx].frequency = e.target.value; updateConfig('rules', n); }} className="mt-1 block w-32 rounded-md border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
                        <option value="weekly">Weekly</option>
                        <option value="alternating">Alternating</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Start Day</label>
                      <select value={rule.startDay} onChange={(e) => { const n = [...config.rules]; n[idx].startDay = parseInt(e.target.value); updateConfig('rules', n); }} className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
                        {DAYS_OF_WEEK.map(d => <option key={`start-${d.value}`} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Start Time</label>
                      <input type="time" value={rule.startTime} onChange={(e) => { const n = [...config.rules]; n[idx].startTime = e.target.value; updateConfig('rules', n); }} className="mt-1 block rounded-md border-gray-300 px-3 py-1.5 text-sm w-28 bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">End Day</label>
                      <select value={rule.endDay} onChange={(e) => { const n = [...config.rules]; n[idx].endDay = parseInt(e.target.value); updateConfig('rules', n); }} className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
                        {DAYS_OF_WEEK.map(d => <option key={`end-${d.value}`} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">End Time</label>
                      <input type="time" value={rule.endTime} onChange={(e) => { const n = [...config.rules]; n[idx].endTime = e.target.value; updateConfig('rules', n); }} className="mt-1 block rounded-md border-gray-300 px-3 py-1.5 text-sm w-28 bg-white focus:outline-none" />
                    </div>
                    <div className="mt-5">
                      <button type="button" onClick={() => updateConfig('rules', config.rules.filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => updateConfig('rules', [...(config.rules || []), { id: `rule-${Date.now()}`, parent: 1, startDay: 5, startTime: "15:10", endDay: 1, endTime: "08:40", frequency: "alternating" }])} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add New Rule</button>
              </div>
            </section>
          </div>
        )}
        
        {/* TAB: DATES & EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ARRAYS: TERMS AND DATABASES */}
            <section>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900">School Term Dates</h3>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      Important Note on Alternating Weekends:
                    </p>
                    <div className="text-sm text-blue-700 mt-1 space-y-2">
                      <p>How you set your term boundaries directly controls your post-holiday weekend rotation! Use one of these two options:</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li><strong>To immediately flip the rotation:</strong> End the preceding term precisely on a <strong>Friday</strong>. The engine will smoothly toggle parity, ensuring the <em>other</em> parent gets the very first weekend back.</li>
                        <li><strong>To delay the rotation:</strong> Set the returning term's Start Date to a <strong>Monday</strong>. This extends the holiday through the weekend, delaying the start of the weekend routine until the following week.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {termYears.length > 0 && (
                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <button
                      type="button"
                      onClick={() => handleTermYearChange('All')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTermYear === 'All'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All Years
                    </button>
                    {termYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleTermYearChange(year)}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTermYear === year
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {(() => {
                  const mappedItems = (config.terms || []).map((t: any, i: number) => ({ ...t, _origIdx: i }));
                  const filtered = mappedItems.filter((t: any) => {
                    const termYear = t.startDate && t.startDate.includes('-') ? t.startDate.split('-')[0] : "No Date";
                    return activeTermYear === 'All' || termYear === activeTermYear;
                  });
                  const paginated = filtered.slice((activePage - 1) * 10, activePage * 10);

                  return (
                    <>
                      {paginated.map((term: any) => {
                        const idx = term._origIdx;
                        return (
                          <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Start Date</label>
                              <input type="date" value={term.startDate ? term.startDate.split('T')[0] : ""} onChange={(e) => { const n = [...config.terms]; n[idx].startDate = e.target.value; updateConfig('terms', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">End Date</label>
                              <input type="date" min={term.startDate ? term.startDate.split('T')[0] : ""} value={term.endDate ? term.endDate.split('T')[0] : ""} onChange={(e) => { const n = [...config.terms]; n[idx].endDate = e.target.value; updateConfig('terms', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Holiday After Term Starts With</label>
                              <select value={term.dadStarts ? "true" : "false"} onChange={(e) => { const n = [...config.terms]; n[idx].dadStarts = e.target.value === "true"; updateConfig('terms', n); }} className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm">
                                <option value="false">{config.parents[0]} (Parent A)</option>
                                <option value="true">{config.parents[1]} (Parent B)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Holiday Split Method</label>
                              <select value={term.holidayStrategy || 'auto'} onChange={(e) => { 
                                const n = [...config.terms]; 
                                n[idx].holidayStrategy = e.target.value; 
                                if (e.target.value === 'split_specific' && (!n[idx].customSplit || (!n[idx].customSplit.exactDates && !n[idx].customSplit.exactDate))) {
                                  let defaultDate = '';
                                  if (n[idx].endDate) {
                                     defaultDate = `${n[idx].endDate.split('T')[0]}T16:00`;
                                  }
                                  n[idx].customSplit = { ...n[idx].customSplit, exactDates: [defaultDate] };
                                }
                                updateConfig('terms', n); 
                              }} className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm">
                                <option value="auto">Auto-Split (Smart Length)</option>
                                <option value="split_specific">Custom Specific Handover</option>
                                <option value="full_block">Entire Holiday To Starter</option>
                              </select>
                              {term.holidayStrategy === 'split_specific' && (
                                <div className="mt-2 text-xs flex justify-between text-gray-600 bg-gray-100 p-2 rounded border border-gray-200">
                                  <div>
                                    {(() => {
                                       const dates = term.customSplit?.exactDates || (term.customSplit?.exactDate ? [term.customSplit.exactDate] : []);
                                       if (dates.length === 0) return <span>Edit to configure date</span>;
                                       
                                       return (
                                         <div className="space-y-1 mt-1 mb-1">
                                           <div className="font-semibold text-gray-700 mb-1.5">Handover Dates & Times</div>
                                           {dates.map((d: string, i: number) => {
                                              if (!d) return null;
                                              try {
                                                const [datePart, timePart] = d.split('T');
                                                const [year, month, day] = datePart.split('-');
                                                return <div key={i}>{i + 1}. {day}/{month}/{year}, {timePart}</div>;
                                              } catch (e) {
                                                return <div key={i}>{i + 1}. {d}</div>;
                                              }
                                           })}
                                         </div>
                                       );
                                    })()}
                                  </div>
                                  <button type="button" onClick={() => setEditingTermSplitIdx(idx)} className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 self-start mt-1 flex-shrink-0">Edit</button>
                                </div>
                              )}
                            </div>
                            <div className="mt-5">
                              <button type="button" onClick={() => updateConfig('terms', config.terms.filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                            </div>
                          </div>
                        );
                      })}
                      <Pagination page={activePage} totalItems={filtered.length} perPage={10} onPageChange={handlePageChange} />
                    </>
                  );
                })()}

                <button type="button" onClick={() => {
                  updateConfig('terms', [...config.terms, { startDate: '', endDate: '', dadStarts: true }]);
                  handleTermYearChange('All');
                }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Term</button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Birthdays</h3>
              <div className="mt-4 space-y-4">
                {config.birthdays.map((bday: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Title</label>
                      <input type="text" value={bday.title} onChange={(e) => { const n = [...config.birthdays]; n[idx].title = e.target.value; updateConfig('birthdays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" placeholder="e.g. John's Bday" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Month (1-12)</label>
                      <input type="number" min="1" max="12" value={bday.month} onChange={(e) => { const n = [...config.birthdays]; n[idx].month = parseInt(e.target.value); updateConfig('birthdays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm w-20" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Day (1-31)</label>
                      <input type="number" min="1" max="31" value={bday.day} onChange={(e) => { const n = [...config.birthdays]; n[idx].day = parseInt(e.target.value); updateConfig('birthdays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm w-20" />
                    </div>
                    <div className="mt-5">
                      <button type="button" onClick={() => updateConfig('birthdays', config.birthdays.filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => updateConfig('birthdays', [...config.birthdays, { title: '', month: 1, day: 1 }])} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Birthday</button>
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Bank Holidays & One-Off Events</h3>
              <div className="mt-4 space-y-4">
                {config.bankHolidays.map((bh: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Title</label>
                      <input type="text" value={bh.title} onChange={(e) => { const n = [...config.bankHolidays]; n[idx].title = e.target.value; updateConfig('bankHolidays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" placeholder="e.g. Christmas Day" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Date</label>
                      <input type="date" value={bh.date ? bh.date.split('T')[0] : ""} onChange={(e) => { const n = [...config.bankHolidays]; n[idx].date = e.target.value; updateConfig('bankHolidays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                    </div>
                    <div className="mt-5">
                      <button type="button" onClick={() => updateConfig('bankHolidays', config.bankHolidays.filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => updateConfig('bankHolidays', [...config.bankHolidays, { title: '', date: '' }])} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Event</button>
              </div>
            </section>
          </div>
        )}

        {/* TAB: EXCEPTIONS */}
        {activeTab === 'exceptions' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Overrides (Correction Measure)</h3>
              <p className="text-sm text-gray-500 mt-2 pb-2">Use this to force an override for unique situations where the standard inputs don't cover.</p>
              
              {overrideYears.length > 0 && (
                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <button
                      type="button"
                      onClick={() => handleTermYearChange('All')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTermYear === 'All'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All Years
                    </button>
                    {overrideYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleTermYearChange(year)}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTermYear === year
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {(() => {
                  const mappedItems = (config.overrides || []).map((o: any, i: number) => ({ ...o, _origIdx: i }));
                  const filtered = mappedItems.filter((o: any) => {
                    const overYear = o.startDate && o.startDate.includes('-') ? o.startDate.split('-')[0] : "No Date";
                    return activeTermYear === 'All' || overYear === activeTermYear;
                  });
                  const paginated = filtered.slice((activePage - 1) * 10, activePage * 10);

                  return (
                    <>
                      {paginated.map((over: any) => {
                        const idx = over._origIdx;
                        return (
                          <div key={idx} className="flex flex-wrap items-center gap-4 bg-red-50 p-4 rounded-md border border-red-100">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Override Title</label>
                              <input type="text" value={over.title} onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].title = e.target.value; updateConfig('overrides', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm w-48" placeholder="e.g. Trade Day" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Override Parent</label>
                              <select value={over.parent !== undefined ? over.parent : 0} onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].parent = parseInt(e.target.value); updateConfig('overrides', n); }} className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm">
                                <option value={0}>{config.parents[0]} (Parent A)</option>
                                <option value={1}>{config.parents[1]} (Parent B)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Start Date & Time</label>
                              <input 
                                type="datetime-local" 
                                value={over.startDate ? (over.startDate.includes('T') ? over.startDate.substring(0, 16) : `${over.startDate}T00:00`) : ""} 
                                onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].startDate = e.target.value; updateConfig('overrides', n); }} 
                                className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">End Date & Time</label>
                              <input 
                                type="datetime-local" 
                                min={over.startDate ? (over.startDate.includes('T') ? over.startDate.substring(0, 16) : `${over.startDate}T00:00`) : ""} 
                                value={over.endDate ? (over.endDate.includes('T') ? over.endDate.substring(0, 16) : `${over.endDate}T00:00`) : ""} 
                                onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].endDate = e.target.value; updateConfig('overrides', n); }} 
                                className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" 
                              />
                            </div>
                            <div className="mt-5">
                              <button type="button" onClick={() => updateConfig('overrides', (config.overrides || []).filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                            </div>
                          </div>
                        );
                      })}
                      <Pagination page={activePage} totalItems={filtered.length} perPage={10} onPageChange={handlePageChange} />
                    </>
                  );
                })()}
                <button type="button" onClick={() => {
                  updateConfig('overrides', [...(config.overrides || []), { title: '', parent: 0, startDate: '', endDate: '' }]);
                  handleTermYearChange('All');
                }} className="text-red-600 hover:text-red-800 text-sm font-medium">+ Add Override</button>
              </div>
            </section>
          </div>
        )}

        {/* TAB: SHARING */}
        {activeTab === 'sharing' && role === "OWNER" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Co-Parent Access Management</h3>
              <p className="text-sm text-gray-500 mt-2 pb-4">Invite the co-parent so they can instantly view this calendar from their own dashboard. You can choose whether they have View Only access or Admin Edit privileges.</p>
              {existingSchedule ? (
                 <ShareManager scheduleId={existingSchedule.id} />
              ) : (
                 <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md">Please save your initial schedule configuration first before inviting the co-parent.</p>
              )}
            </section>
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Immutable Audit Ledger</h3>
              <p className="text-sm text-gray-500 mt-2 pb-4">A complete, tamper-proof history of every change made to this schedule's configuration. This ledger cannot be deleted by any user.</p>
              {existingSchedule ? (
                 <AuditManager scheduleId={existingSchedule.id} />
              ) : (
                 <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md">Please save your initial schedule configuration first before viewing the history.</p>
              )}
            </section>
          </div>
        )}
        </fieldset>

        <div className="flex justify-end pt-4 mb-20">
          {role === "VIEWER" ? (
             <p className="text-sm text-gray-500 mr-4 self-center font-medium">You have View-Only access. Only the owner can make changes.</p>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 disabled:bg-indigo-300 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          )}
        </div>
      </form>

      {/* CUSTOM SPLIT MODAL */}
      {editingTermSplitIdx !== null && config.terms[editingTermSplitIdx] && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Configure Custom Handover</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Handover Dates & Times</label>
                <div className="space-y-3 mt-2">
                  {(() => {
                    const customSplit = config.terms[editingTermSplitIdx]?.customSplit || {};
                    const dates = customSplit.exactDates || (customSplit.exactDate ? [customSplit.exactDate] : [""]);
                    
                    return dates.map((ddate: string, dIdx: number) => (
                      <div key={dIdx} className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium text-xs w-6">{dIdx + 1}.</span>
                        <input 
                          type="datetime-local" 
                          min={config.terms[editingTermSplitIdx]?.endDate ? `${config.terms[editingTermSplitIdx].endDate.split('T')[0]}T00:00` : undefined}
                          value={ddate || ""} 
                          onChange={(e) => {
                            const n = [...config.terms];
                            const current = n[editingTermSplitIdx].customSplit || {};
                            const newDates = [...dates];
                            newDates[dIdx] = e.target.value;
                            n[editingTermSplitIdx].customSplit = { ...current, exactDates: newDates };
                            updateConfig('terms', n);
                          }} 
                          className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm shadow-sm"
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const n = [...config.terms];
                            const current = n[editingTermSplitIdx].customSplit || {};
                            const newDates = dates.filter((_:any, index:number) => index !== dIdx);
                            n[editingTermSplitIdx].customSplit = { ...current, exactDates: newDates };
                            updateConfig('terms', n);
                          }}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Remove this split"
                        >
                          ✕
                        </button>
                      </div>
                    ));
                  })()}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => {
                    const n = [...config.terms];
                    const current = n[editingTermSplitIdx]?.customSplit || {};
                    const currentDates = current.exactDates || (current.exactDate ? [current.exactDate] : []);
                    
                    let defaultNewDate = '';
                    if (currentDates.length > 0 && currentDates[currentDates.length - 1]) {
                       // Default to 1 day after the last date
                       try {
                         const lastDate = new Date(currentDates[currentDates.length - 1]);
                         lastDate.setDate(lastDate.getDate() + 1);
                         defaultNewDate = lastDate.toISOString().slice(0, 16);
                       } catch(e) {}
                    } else if (n[editingTermSplitIdx]?.endDate) {
                       defaultNewDate = `${n[editingTermSplitIdx].endDate.split('T')[0]}T16:00`;
                   }
                    
                    n[editingTermSplitIdx].customSplit = { ...current, exactDates: [...currentDates, defaultNewDate] };
                    updateConfig('terms', n);
                  }}
                  className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  + Add Another Checkpoint
                </button>

                <p className="mt-4 text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 p-2 rounded">
                  <strong>How multi-splits work:</strong> The holiday will be recursively chopped at each checkpoint you define. Custody smoothly flips to the other parent precisely at each date, bouncing back and forth. <br/>
                  <em>The dates must fall sequentially within the holiday window (after {config.terms[editingTermSplitIdx]?.endDate ? config.terms[editingTermSplitIdx].endDate.split('T')[0] : 'term end'}).</em>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                type="button" 
                onClick={() => setEditingTermSplitIdx(null)} 
                className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
