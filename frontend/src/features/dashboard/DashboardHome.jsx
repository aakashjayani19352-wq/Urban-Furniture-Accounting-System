import { Link } from 'react-router-dom';

export default function DashboardHome() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8"><p className="text-sm font-medium text-blue-600">Business overview</p><h1 className="page-heading mt-1">Good morning</h1><p className="page-subtitle">Here is a snapshot of your financial activity.</p></div>
      
      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface border-t-4 border-t-blue-500 p-5"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales</h3><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">$12,450</p><p className="mt-2 text-sm text-emerald-600">↑ 12.5% this month</p>
        </div>
        <div className="surface border-t-4 border-t-violet-500 p-5"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchases</h3><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">$8,320</p><p className="mt-2 text-sm text-slate-500">18 orders this month</p>
        </div>
        <div className="surface border-t-4 border-t-emerald-500 p-5"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Profit</h3><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">$4,130</p><p className="mt-2 text-sm text-emerald-600">33.2% margin</p>
        </div>
        <div className="surface border-t-4 border-t-amber-500 p-5"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Contacts</h3><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">24</p><p className="mt-2 text-sm text-slate-500">Customers and vendors</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Quick actions</h2><p className="mt-1 text-sm text-slate-500">Start common business tasks.</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/sales/new" className="surface p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"><div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-xl text-blue-600">↑</div><div className="font-semibold text-slate-900">Create sales order</div><p className="mt-1 text-sm text-slate-500">Record a customer order.</p>
        </Link>
        <Link to="/purchases/new" className="surface p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"><div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-xl text-violet-600">↓</div><div className="font-semibold text-slate-900">Create purchase order</div><p className="mt-1 text-sm text-slate-500">Order items from a vendor.</p>
        </Link>
        <Link to="/contacts/new" className="surface p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-xl text-emerald-600">+</div><div className="font-semibold text-slate-900">Add a contact</div><p className="mt-1 text-sm text-slate-500">Add a customer or vendor.</p>
        </Link>
      </div>
    </div>
  );
}
