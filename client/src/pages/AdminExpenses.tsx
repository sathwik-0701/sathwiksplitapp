import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Expense } from '../types';
import { Receipt } from 'lucide-react';

export const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/admin/expenses')
      .then((res) => {
        if (res.data?.success) setExpenses(res.data.expenses);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Expenses Audit</h1>
        <p className="text-slate-400 text-sm mt-1">Full platform ledger of recorded expenses.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading system expenses...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Description</th>
                  <th className="p-4">Group</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Paid By</th>
                  <th className="p-4">Split Strategy</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{exp.description}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{(exp.groupId as any)?.name || 'Group'}</td>
                    <td className="p-4 font-mono font-bold text-base text-amber-400">₹{(exp.amount / 100).toFixed(2)}</td>
                    <td className="p-4 text-slate-300">{exp.paidBy?.name || 'User'}</td>
                    <td className="p-4 capitalize text-slate-400">{exp.splitType}</td>
                    <td className="p-4 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
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
