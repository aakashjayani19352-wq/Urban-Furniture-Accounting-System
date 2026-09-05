import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../api/apiClient';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function BalanceSheet() {
  const [report, setReport] = useState({
    total_assets: 0,
    total_liabilities: 0,
    total_capital: 0,
    net_profit: 0,
    assets_breakdown: [],
    liabilities_breakdown: [],
    capital_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reports/balance-sheet').then(res => {
      if (res.data) setReport(res.data);
      setLoading(false);
    });
  }, []);

  const assetChartData = report.assets_breakdown?.map(a => ({
    name: a.account_name,
    value: Math.abs(a.balance)
  })) || [];

  const equityLiabChartData = [
    ...(report.capital_breakdown || []).map(c => ({ name: c.account_name, value: Math.abs(c.balance) })),
    ...(report.liabilities_breakdown || []).map(l => ({ name: l.account_name, value: Math.abs(l.balance) }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-heading">Balance Sheet Statement</h1>
          <p className="page-subtitle">Real-time snapshot of Assets, Liabilities, and Capital calculated from general ledger lines.</p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border">
          As of: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface p-6 border-t-4 border-t-blue-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Assets</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">${Number(report.total_assets || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-slate-500">Cash, Bank, Accounts Receivable</p>
        </div>
        <div className="surface p-6 border-t-4 border-t-red-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Liabilities</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">${Number(report.total_liabilities || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-slate-500">Accounts Payable & Obligations</p>
        </div>
        <div className="surface p-6 border-t-4 border-t-emerald-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Equity & Capital</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${Number(report.total_capital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-slate-500">Share Capital + Retained Earnings (${Number(report.net_profit || 0).toFixed(2)})</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Assets Composition</h2>
          {assetChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">No asset lines recorded</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {assetChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Liabilities & Capital Distribution</h2>
          {equityLiabChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">No equity/liability lines recorded</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={equityLiabChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {equityLiabChartData.map((_, index) => (
                      <Cell key={`cell-eq-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface">
          <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-800 text-sm">Assets Breakdown</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {report.assets_breakdown?.map((a, i) => (
                <tr key={i}>
                  <td>{a.account_code} - {a.account_name}</td>
                  <td className="text-right font-semibold text-slate-800">${Number(a.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="surface">
          <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-800 text-sm">Liabilities & Equity Breakdown</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {report.liabilities_breakdown?.map((l, i) => (
                <tr key={`l-${i}`}>
                  <td>{l.account_code} - {l.account_name}</td>
                  <td className="text-right font-semibold text-slate-800">${Number(l.balance).toFixed(2)}</td>
                </tr>
              ))}
              {report.capital_breakdown?.map((c, i) => (
                <tr key={`c-${i}`}>
                  <td>{c.account_code} - {c.account_name}</td>
                  <td className="text-right font-semibold text-emerald-700">${Number(c.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
