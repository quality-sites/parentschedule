"use client";

import { useState, useEffect } from "react";

export default function ShareManager({ scheduleId }: { scheduleId: string }) {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchShares();
  }, [scheduleId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schedule/share?scheduleId=${scheduleId}`);
      if (res.ok) {
        const data = await res.json();
        setShares(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setInviting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/schedule/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, email, role }),
      });

      if (res.ok) {
        setEmail("");
        setRole("VIEWER");
        setSuccess("Invitation successfully sent!");
        fetchShares();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to invite");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) return;
    
    try {
      const res = await fetch(`/api/schedule/share?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setShares(shares.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-gray-500">Loading shares...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleInvite} className="bg-white border rounded-md p-6 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Invite Co-Parent</h4>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">Co-Parent Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => {
                 setEmail(e.target.value);
                 setError("");
                 setSuccess("");
              }}
              className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" 
              placeholder="coparent@example.com"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">Access Level</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="VIEWER">View Only</option>
              <option value="EDITOR">Admin (Can Edit)</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={inviting}
            className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 whitespace-nowrap"
          >
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>

      {shares.length > 0 && (
        <div className="bg-white border rounded-md overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {shares.map((share) => (
                <tr key={share.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{share.email}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${share.role === 'EDITOR' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                       {share.role === "EDITOR" ? "Admin" : "Viewer"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {share.status === "PENDING" ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Signup
                      </span>
                    ) : (
                      <span className="text-indigo-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Active
                      </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => handleRevoke(share.id)} className="text-red-600 hover:text-red-900">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
