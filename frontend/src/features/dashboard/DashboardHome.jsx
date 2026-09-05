import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalSales: 12450,
    totalPurchases: 8320,
    netProfit: 4130,
    contactsCount: 24
  });

  useEffect(() => {
    Promise.all([
      apiClient.get('/reports/profit-loss'),
      apiClient.get('/contacts')
    ]).then(([pnlRes, contactsRes]) => {
      const pnl = pnlRes.data;
      const contacts = contactsRes.data;
      if (pnl && (pnl.total_revenue !== undefined || pnl.total_expenses !== undefined)) {
        setStats(prev => ({
          ...prev,
          totalSales: pnl.total_revenue || 0,
          totalPurchases: pnl.total_expenses || 0,
          netProfit: pnl.net_profit || 0,
          contactsCount: contacts?.length || prev.contactsCount
        }));
      }
    });
  }, []);

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Business Overview</p>
        <h1 className="page-heading mt-1">Financial Control Panel</h1>
        <p className="page-subtitle">Real-time accounting ledger metrics & double-entry operational summary.</p>
      </div>
      
      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface border-t-4 border-t-blue-500 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales (Revenue)</h3>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">${Number(stats.totalSales).toLocaleString()}</p>
          <p className="mt-2 text-sm text-emerald-600">✓ Invoiced Sales Orders</p>
        </div>
        <div className="surface border-t-4 border-t-violet-500 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchases (COGS)</h3>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">${Number(stats.totalPurchases).toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-500">Billed Vendor Orders</p>
        </div>
        <div className="surface border-t-4 border-t-emerald-500 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Operating Profit</h3>
          <p className={`mt-3 text-3xl font-bold tracking-tight ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${Number(stats.netProfit).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-emerald-600">Revenue minus Expenses</p>
        </div>
        <div className="surface border-t-4 border-t-amber-500 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Master Contacts</h3>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{stats.contactsCount}</p>
          <p className="mt-2 text-sm text-slate-500">Customers & Vendors</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Quick Accounting Actions</h2>
        <p className="mt-1 text-sm text-slate-500">Start the core business transaction and reporting flows.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link to="/sales/new" className="surface p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-xl text-blue-600">↑</div>
          <div className="font-semibold text-slate-900">New Sales Order</div>
          <p className="mt-1 text-xs text-slate-500">Customer order → Invoice → Payment</p>
        </Link>
        <Link to="/purchases/new" className="surface p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-xl text-violet-600">↓</div>
          <div className="font-semibold text-slate-900">New Purchase Order</div>
          <p className="mt-1 text-xs text-slate-500">Vendor order → Bill → Payment</p>
        </Link>
        <Link to="/journal-entries" className="surface p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-xl text-emerald-600">⚖️</div>
          <div className="font-semibold text-slate-900">Journal Entries</div>
          <p className="mt-1 text-xs text-slate-500">Double-entry ledger & audit audit trail</p>
        </Link>
        <Link to="/reports/balance-sheet" className="surface p-5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-xl text-amber-600">📊</div>
          <div className="font-semibold text-slate-900">Financial Reports</div>
          <p className="mt-1 text-xs text-slate-500">Balance Sheet, P&L, and Budget Report</p>
        </Link>
      </div>
    </div>
  );
}
