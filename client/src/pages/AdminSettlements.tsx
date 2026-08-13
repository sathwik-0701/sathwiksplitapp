import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settlement } from '../types';

export const AdminSettlements: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/admin/settlements')
      .then((res) => {
        if (res.data?.success) setSettlements(res.data.settlements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Settlement Audit Log</h1>
        <p className="text-slate-400 text-sm mt-1">Platform ledger of completed settlement transfers.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading settlements...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Group</th>
                  <th className="p-4">Payer (From)</th>
                  <th className="p-4">Recipient (To)</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {settlements.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{(s.groupId as any)?.name || 'Group'}</td>
                    <td className="p-4 text-rose-300 font-semibold">{s.fromUser?.name}</td>
                    <td className="p-4 text-emerald-300 font-semibold">{s.toUser?.name}</td>
                    <td className="p-4 font-mono font-bold text-base text-emerald-400">₹{(s.amount / 100).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
