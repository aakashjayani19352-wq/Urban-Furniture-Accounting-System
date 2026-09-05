import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navLink = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-lg font-bold text-white">U</div><div><div className="font-semibold text-slate-900">Urban Furniture</div><div className="text-xs text-slate-500">Accounting</div></div></div></div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink end to="/" className={navLink}><span>⌂</span>Dashboard</NavLink>
          <div className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Master data</div>
          <NavLink to="/contacts" className={navLink}><span>♧</span>Contacts</NavLink>
          <NavLink to="/products" className={navLink}><span>□</span>Products</NavLink>
          <NavLink to="/accounts" className={navLink}><span>▤</span>Chart of Accounts</NavLink>
          <NavLink to="/journals" className={navLink}><span>▧</span>Journals</NavLink>
          
          <div className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Transactions</div>
          <NavLink to="/purchases" className={navLink}><span>↓</span>Purchase Orders</NavLink>
          <NavLink to="/sales" className={navLink}><span>↑</span>Sales Orders</NavLink>
          <NavLink to="/journal-entries" className={navLink}><span>≡</span>Journal Entries</NavLink>
          
          <div className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Reports</div>
          <NavLink to="/budgets" className={navLink}><span>◫</span>Budgets</NavLink>
          <NavLink to="/reports/balance-sheet" className={navLink}><span>▥</span>Balance Sheet</NavLink>
          <NavLink to="/reports/profit-loss" className={navLink}><span>⌁</span>Profit & Loss</NavLink>
          <NavLink to="/reports" className={navLink}><span>▦</span>Budget Report</NavLink>
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8"><div className="font-semibold text-slate-800 lg:hidden">Urban Furniture</div><div className="hidden text-sm text-slate-500 lg:block">Manage your business with confidence.</div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline">{user?.role}</span><button onClick={logout} className="text-sm font-semibold text-slate-500 transition hover:text-red-600">Sign out</button></div>
        </header>
        <div className="flex-1 overflow-auto p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
