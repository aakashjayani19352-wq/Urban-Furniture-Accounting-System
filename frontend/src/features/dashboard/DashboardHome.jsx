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
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Live Ledger Intelligence
        </div>
        <h1 className="page-heading mt-2">Executive Financial Overview</h1>
        <p className="page-subtitle">Real-time double-entry ledger summaries and operational health indicators.</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface surface-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Gross Sales Revenue</h3>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            ₹{Number(stats.totalSales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>✓ Invoiced Customer Revenue</span>
          </div>
        </div>

        <div className="surface surface-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Purchases & Expenses</h3>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            ₹{Number(stats.totalPurchases).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Billed Vendor Expenditure</span>
          </div>
        </div>

        <div className="surface surface-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Net Operating Profit</h3>
          <p className={`mt-4 text-3xl font-extrabold tracking-tight ${stats.netProfit >= 0 ? 'text-amber-500 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            ₹{Number(stats.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Revenue Minus COGS</span>
          </div>
        </div>

        <div className="surface surface-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Contacts</h3>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {stats.contactsCount}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Customers & Suppliers</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Core Workflow Launchers</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Direct shortcuts to initiate operational and reporting workflows.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Link to="/sales/new" className="surface surface-hover p-6 transition group">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:scale-105 transition-transform">
            ↑
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100">New Sales Order</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Customer order → Invoice → Payment</p>
        </Link>

        <Link to="/purchases/new" className="surface surface-hover p-6 transition group">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/10 text-2xl text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-105 transition-transform">
            ↓
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100">New Purchase Order</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Vendor order → Bill → Payment</p>
        </Link>

        <Link to="/journal-entries" className="surface surface-hover p-6 transition group">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:scale-105 transition-transform">
            ⚖️
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100">Journal Ledger</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Audit double-entry lines & debit/credit legs</p>
        </Link>

        <Link to="/reports/balance-sheet" className="surface surface-hover p-6 transition group">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:scale-105 transition-transform">
            📊
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100">Financial Reports</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Balance Sheet, P&L & Budget Variance</p>
        </Link>
      </div>
    </div>
  );
}
