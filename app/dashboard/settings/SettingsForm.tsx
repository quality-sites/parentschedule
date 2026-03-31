"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function SettingsForm({ existingSchedule }: { existingSchedule: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Setup' },
    { id: 'routines', label: 'Routines' },
    { id: 'events', label: 'Dates & Events' },
    { id: 'exceptions', label: 'Exceptions' },
  ];

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
    holidayHandover: { hour: 18, minute: 0 }
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
      return;
    }

    setIsSaving(true);
    setMessage("");

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
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = (parentKey: string, key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [parentKey]: { ...prev[parentKey], [key]: value }
    }));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mb-16">
      <form onSubmit={handleSave} className="space-y-10">
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
                onClick={() => setActiveTab(tab.id)}
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
                    value={config.startDate || ""} 
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

            {/* HOLIDAY HANDOVER */}
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">Holiday Handover Defaults</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Handover Hour (24h)</label>
                  <input 
                    type="number" min="0" max="23" 
                    value={config.holidayHandover.hour} 
                    onChange={(e) => updateNestedConfig('holidayHandover', 'hour', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Handover Minute</label>
                  <input 
                    type="number" min="0" max="59" 
                    value={config.holidayHandover.minute} 
                    onChange={(e) => updateNestedConfig('holidayHandover', 'minute', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
                </div>
              </div>
            </section>
          </div>
        )}
        
        {/* TAB: DATES & EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ARRAYS: TERMS AND DATABASES */}
            <section>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b border-gray-200 pb-3">School Term Dates</h3>
              <div className="mt-4 space-y-4">
                {config.terms.map((term: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Start Date</label>
                      <input type="date" value={term.startDate} onChange={(e) => { const n = [...config.terms]; n[idx].startDate = e.target.value; updateConfig('terms', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">End Date</label>
                      <input type="date" value={term.endDate} onChange={(e) => { const n = [...config.terms]; n[idx].endDate = e.target.value; updateConfig('terms', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Preceding Holiday Starter</label>
                      <select value={term.dadStarts ? "true" : "false"} onChange={(e) => { const n = [...config.terms]; n[idx].dadStarts = e.target.value === "true"; updateConfig('terms', n); }} className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm">
                        <option value="false">{config.parents[0]} (Parent A)</option>
                        <option value="true">{config.parents[1]} (Parent B)</option>
                      </select>
                    </div>
                    <div className="mt-5">
                      <button type="button" onClick={() => updateConfig('terms', config.terms.filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => updateConfig('terms', [...config.terms, { startDate: '', endDate: '', dadStarts: true }])} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Term</button>
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
                      <input type="date" value={bh.date} onChange={(e) => { const n = [...config.bankHolidays]; n[idx].date = e.target.value; updateConfig('bankHolidays', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
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
              <div className="mt-2 space-y-4">
                {(config.overrides || []).map((over: any, idx: number) => (
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
                      <label className="block text-xs font-medium text-gray-700">Start Date</label>
                      <input type="date" value={over.startDate} onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].startDate = e.target.value; updateConfig('overrides', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">End Date</label>
                      <input type="date" value={over.endDate} onChange={(e) => { const n = [...(config.overrides || [])]; n[idx].endDate = e.target.value; updateConfig('overrides', n); }} className="mt-1 block rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                    </div>
                    <div className="mt-5">
                      <button type="button" onClick={() => updateConfig('overrides', (config.overrides || []).filter((_:any, i:number) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => updateConfig('overrides', [...(config.overrides || []), { title: '', parent: 0, startDate: '', endDate: '' }])} className="text-red-600 hover:text-red-800 text-sm font-medium">+ Add Override</button>
              </div>
            </section>
          </div>
        )}

        <div className="flex justify-end pt-4 mb-20">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 disabled:bg-indigo-300 transition-colors"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
