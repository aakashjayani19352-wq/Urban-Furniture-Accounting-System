import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../api/apiClient';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ProfitLoss() {
  const [report, setReport] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    revenue_breakdown: [],
    expense_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reports/profit-loss').then(res => {
      if (res.data) setReport(res.data);
      setLoading(false);
    });
  }, []);

  const expenseChartData = (report.expense_breakdown || []).map(e => ({
    name: e.account_name,
    value: Math.abs(e.amount)
  }));

  const revenueExpenseComparison = [
    { category: 'Total Figures', Revenue: report.total_revenue || 0, Expenses: report.total_expenses || 0, 'Net Profit': report.net_profit || 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-heading">Profit & Loss (P&L) Statement</h1>
          <p className="page-subtitle">Operating income from product sales minus purchases and expenses.</p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border">
          Real-time general ledger calculation
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface p-6 border-t-4 border-t-emerald-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue / Income</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600">₹{Number(report.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-slate-500">Sales orders & recognized income</p>
        </div>
        <div className="surface p-6 border-t-4 border-t-red-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Operating Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">₹{Number(report.total_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-xs text-slate-500">COGS, vendor bills & operating costs</p>
        </div>
        <div className="surface p-6 border-t-4 border-t-blue-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Profit</h3>
          <p className={`mt-2 text-3xl font-bold ${report.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ₹{Number(report.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {report.total_revenue > 0 ? `${((report.net_profit / report.total_revenue) * 100).toFixed(1)}% profit margin` : '0% margin'}
          </p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Expenses Breakdown</h2>
          {expenseChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">No expense lines recorded</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseChartData.map((_, index) => (
                      <Cell key={`cell-exp-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Income vs Expense Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10b981" />
                <Bar dataKey="Expenses" fill="#ef4444" />
                <Bar dataKey="Net Profit" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3 border-b border-slate-200/80 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-100 text-sm">Revenue Accounts</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {report.revenue_breakdown?.map((r, i) => (
                <tr key={i}>
                  <td>{r.account_code} - {r.account_name}</td>
                  <td className="text-right font-semibold text-emerald-600">₹{Number(r.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="surface">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3 border-b border-slate-200/80 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-100 text-sm">Expense Accounts</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {report.expense_breakdown?.map((e, i) => (
                <tr key={i}>
                  <td>{e.account_code} - {e.account_name}</td>
                  <td className="text-right font-semibold text-red-600">₹{Number(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
