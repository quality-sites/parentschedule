"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pagination } from "./SettingsForm";

function compareConfig(oldData: any, newData: any) {
  const changes: string[] = [];
  
  if (!oldData && newData) {
    changes.push("Initial schedule configuration created from baseline.");
    return changes;
  }
  if (!newData) return changes;

  if (JSON.stringify(oldData.parents) !== JSON.stringify(newData.parents)) {
     changes.push(`Updated Parent Profiles (${oldData.parents?.join(' & ') || 'Unknown'} -> ${newData.parents?.join(' & ') || 'Unknown'})`);
  }

  if (oldData.startDate !== newData.startDate) {
     changes.push(`Changed Schedule Start Date to ${newData.startDate || 'None'}`);
  }

  const compareArrays = (key: string, name: string, getLabel: (item: any) => string) => {
      const oldArr = Array.isArray(oldData[key]) ? oldData[key] : [];
      const newArr = Array.isArray(newData[key]) ? newData[key] : [];
      
      const oldStrs = oldArr.map((x: any) => JSON.stringify(x));
      const newStrs = newArr.map((x: any) => JSON.stringify(x));
      
      if (oldStrs.join('|') !== newStrs.join('|')) {
         const additions = newArr.filter((n: any) => !oldStrs.includes(JSON.stringify(n)));
         const deletions = oldArr.filter((o: any) => !newStrs.includes(JSON.stringify(o)));

         if (additions.length > 0 && deletions.length === 0) {
            additions.forEach((a: any) => changes.push(`Added ${name}: ${getLabel(a)}`));
         } else if (deletions.length > 0 && additions.length === 0) {
            deletions.forEach((d: any) => changes.push(`Removed ${name}: ${getLabel(d)}`));
         } else if (additions.length > 0 && deletions.length > 0) {
            changes.push(`Modified one or more existing ${name} configurations`);
         } else {
             changes.push(`Reordered ${name} sequence`);
         }
      }
  }

  compareArrays('rules', 'Routine Rule', r => `Start Day ${r.startDay}`);
  compareArrays('terms', 'School Term', t => `Starting ${t.startDate || 'Unknown'}`);
  compareArrays('overrides', 'Schedule Exception', o => `'${o.title || 'Untitled'}'`);
  compareArrays('bankHolidays', 'Bank Holiday', b => `'${b.title || 'Untitled'}'`);
  compareArrays('birthdays', 'Birthday', b => `'${b.title || 'Untitled'}'`);
  compareArrays('phaseResets', 'Rotation Phase Reset', p => `'${p.startDate || 'Unknown'}'`);

  if (changes.length === 0) {
     changes.push("Configuration saved, but no specific structural changes were detected.");
  }
  return changes;
}

export default function AuditManager({ scheduleId }: { scheduleId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageParam = searchParams.get('page');
  const activePage = pageParam ? parseInt(pageParam) : 1;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/schedule/audit?scheduleId=${scheduleId}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [scheduleId]);

  if (loading) {
     return <div className="p-8 text-center text-gray-500">Loading history ledger...</div>;
  }

  if (logs.length === 0) {
     return (
       <div className="bg-gray-50 border rounded-md p-6 flex flex-col items-center justify-center text-center">
         <p className="text-gray-600">No history found. The ledger is empty.</p>
       </div>
     );
  }

  const paginatedLogs = logs.slice((activePage - 1) * 10, activePage * 10);

  let modalChanges: string[] = [];
  let modalLogInfo: any = null;
  if (selectedLogId) {
     const globalIdx = logs.findIndex(l => l.id === selectedLogId);
     if (globalIdx !== -1) {
         modalLogInfo = logs[globalIdx];
         const currentData = modalLogInfo?.details ? JSON.parse(modalLogInfo.details)?.data : null;
         
         const previousLog = logs[globalIdx + 1] || null;
         const previousData = previousLog?.details ? JSON.parse(previousLog.details)?.data : null;
         
         modalChanges = compareConfig(previousData, currentData);
     }
  }

  return (
    <div className="bg-white border rounded-md overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date / Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedLogs.map((log) => (
            <tr key={log.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString(undefined, { 
                  year: 'numeric', month: 'short', day: 'numeric', 
                  hour: 'numeric', minute: '2-digit' 
                })}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                {log.user?.name || log.user?.email || "Unknown User"}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {log.action}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                <button
                  onClick={() => setSelectedLogId(log.id)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View<span className="sr-only">, {log.id}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-white border-t border-gray-200">
        <Pagination page={activePage} totalItems={logs.length} perPage={10} onPageChange={handlePageChange} />
      </div>

      {selectedLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historical Changes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Made by {modalLogInfo?.user?.name || modalLogInfo?.user?.email} on {modalLogInfo ? new Date(modalLogInfo.createdAt).toLocaleString() : ''}
              </p>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto">
              <ul className="space-y-3">
                {modalChanges.map((change, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700 items-start">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 block"></span>
                    <span dangerouslySetInnerHTML={{ __html: change.replace(/Added/g, '<strong class="text-green-600">Added</strong>').replace(/Removed/g, '<strong class="text-red-600">Removed</strong>').replace(/Modified/g, '<strong class="text-blue-600">Modified</strong>').replace(/Updated/g, '<strong class="text-blue-600">Updated</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedLogId(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
