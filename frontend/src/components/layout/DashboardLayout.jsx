import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useTheme } from '../../features/theme/ThemeContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navLink = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white/80 backdrop-blur-lg lg:flex lg:flex-col dark:border-amber-500/15 dark:bg-slate-900/90">
        <div className="border-b border-slate-100 px-6 py-5 dark:border-amber-500/15">
          <Link to="/landing" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 font-extrabold text-slate-950 shadow-md shadow-amber-500/20">
              UF
            </div>
            <div>
              <div className="font-bold tracking-tight text-slate-900 dark:text-amber-50">Urban Accounting</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-amber-400/70">Financial Control Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink end to="/" className={navLink}>
            <span className="text-base">⌂</span> Dashboard Overview
          </NavLink>

          <div className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-amber-400/70">
            Master Data
          </div>
          <NavLink to="/contacts" className={navLink}>
            <span className="text-base">👤</span> Contacts Directory
          </NavLink>
          <NavLink to="/products" className={navLink}>
            <span className="text-base">📦</span> Product Catalog
          </NavLink>
          <NavLink to="/accounts" className={navLink}>
            <span className="text-base">▤</span> Chart of Accounts
          </NavLink>
          <NavLink to="/journals" className={navLink}>
            <span className="text-base">▧</span> Financial Journals
          </NavLink>

          <div className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-amber-400/70">
            Transactions
          </div>
          <NavLink to="/purchases" className={navLink}>
            <span className="text-base">↓</span> Purchase Orders & Bills
          </NavLink>
          <NavLink to="/sales" className={navLink}>
            <span className="text-base">↑</span> Sales Orders & Invoices
          </NavLink>
          <NavLink to="/journal-entries" className={navLink}>
            <span className="text-base">≡</span> General Ledger Entries
          </NavLink>

          <div className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-amber-400/70">
            Reports & Budgets
          </div>
          <NavLink to="/budgets" className={navLink}>
            <span className="text-base">🎯</span> Cost Center Budgets
          </NavLink>
          <NavLink to="/reports/balance-sheet" className={navLink}>
            <span className="text-base">▥</span> Balance Sheet
          </NavLink>
          <NavLink to="/reports/profit-loss" className={navLink}>
            <span className="text-base">⌁</span> Profit & Loss Statement
          </NavLink>
          <NavLink to="/reports" className={navLink}>
            <span className="text-base">▦</span> Budget Variance Report
          </NavLink>

          <div className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-amber-400/70">
            Administration
          </div>
          <NavLink to="/users" className={navLink}>
            <span className="text-base">⚙</span> User Accounts & Roles
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur-lg sm:px-8 dark:border-amber-500/15 dark:bg-slate-900/80">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-sm font-extrabold text-slate-950">
              UF
            </div>
            <span className="font-bold text-slate-900 dark:text-amber-50">Urban Accounting</span>
          </div>

          <div className="hidden text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-amber-400/70 lg:block">
            Double-Entry Accounting & ERP Engine
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition dark:border-amber-500/20 dark:bg-slate-800/80 dark:text-amber-200 dark:hover:bg-slate-700/80"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            <span className="hidden rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold capitalize text-amber-700 border border-amber-500/30 sm:inline dark:text-amber-300">
              Role: {user?.role?.replace('_', ' ')}
            </span>

            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-500 transition hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
