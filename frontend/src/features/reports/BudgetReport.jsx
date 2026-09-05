import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../api/apiClient';

export default function BudgetReport() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reports/budget').then(res => {
      setItems(res.data?.items || []);
      setLoading(false);
    });
  }, []);

  const chartData = items.map(b => ({
    name: b.budget_name,
    Planned: b.planned_amount,
    Actual: b.actual_amount
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-heading">Budget vs Actual Financial Report</h1>
          <p className="page-subtitle">Track planned amounts versus actual expenses recorded against analytic cost centers.</p>
        </div>
      </div>

      <div className="surface p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Planned vs Actual Expenditure</h2>
        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-400">
            {loading ? 'Loading budget report...' : 'No budget items defined'}
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Planned" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="surface overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b font-bold text-slate-800 text-sm">Budget Analysis Table</div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Budget Name</th>
                <th>Cost Center / Analytic</th>
                <th>Type</th>
                <th className="text-right">Planned ($)</th>
                <th className="text-right">Actual ($)</th>
                <th className="text-right">Variance ($)</th>
                <th className="text-right">Achievement</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400">
                    No budget data available
                  </td>
                </tr>
              ) : (
                items.map((b) => (
                  <tr key={b.budget_id}>
                    <td className="font-semibold text-slate-900">{b.budget_name}</td>
                    <td className="text-slate-600">{b.analytic_account_name}</td>
                    <td>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                        {b.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-900">${Number(b.planned_amount).toFixed(2)}</td>
                    <td className="text-right font-bold text-emerald-600">${Number(b.actual_amount).toFixed(2)}</td>
                    <td className={`text-right font-bold ${b.variance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${Number(b.variance).toFixed(2)}
                    </td>
                    <td className="text-right">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        b.achievement_percentage <= 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.achievement_percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}