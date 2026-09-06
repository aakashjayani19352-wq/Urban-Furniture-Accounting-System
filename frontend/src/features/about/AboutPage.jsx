import { Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

export default function AboutPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const team = [
    {
      name: 'Aakash Jayani',
      handle: 'aakashjayani19352-wq',
      url: 'https://github.com/aakashjayani19352-wq',
      role: 'Full-Stack Lead & Integration',
      description: 'Complete frontend UI/UX, 19 interactive screens & modals, Recharts dashboards, API client, repository architecture & integration.'
    },
    {
      name: 'Chandan Shah',
      handle: 'chandan-shah226',
      url: 'https://github.com/chandan-shah226',
      role: 'Backend Core & Architecture',
      description: 'FastAPI application setup, SQLite/PostgreSQL database models, RESTful endpoints, seed data engine, JWT authentication & RBAC.'
    },
    {
      name: 'Rudra Patel',
      handle: 'Rudrapatel0806',
      url: 'https://github.com/Rudrapatel0806',
      role: 'Ledger & Accounting Engine',
      description: 'Double-entry journal entry generation, transactional integrity validation, automated document posting workflows, and testing suites.'
    }
  ];

  const hostLinks = [
    {
      label: 'Frontend Application Host',
      url: 'http://localhost:5173',
      badge: 'Client SPA',
      desc: 'Interactive React 19 + Tailwind CSS single page web application'
    },
    {
      label: 'Backend API Server Host',
      url: 'http://localhost:8001',
      badge: 'FastAPI Core',
      desc: 'High-performance REST API with double-entry validation and JWT RBAC'
    },
    {
      label: 'Interactive Swagger Documentation',
      url: 'http://localhost:8001/docs',
      badge: 'OpenAPI v3',
      desc: 'Live interactive API documentation and testing workbench'
    },
    {
      label: 'GitHub Repository',
      url: 'https://github.com/aakashjayani19352-wq/Urban-Furniture-Accounting-System',
      badge: 'Source Code',
      desc: 'Official team repository with complete git history and branches'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md dark:border-amber-500/15 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-extrabold text-slate-950 shadow-md shadow-amber-500/20">
              UF
            </div>
            <div>
              <div className="font-bold tracking-tight text-slate-900 dark:text-amber-50">Urban Accounting</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-amber-400/70">About System & Team</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition dark:border-amber-500/20 dark:bg-slate-800/80 dark:text-amber-200 dark:hover:bg-slate-700/80"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <Link
              to={user ? (user.role === 'contact' ? '/portal' : '/') : '/landing'}
              className="primary-button !py-1.5 text-xs font-bold"
            >
              ← Back to {user ? 'Workspace' : 'Home'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Banner */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Platform Information & Host Reference
          </div>
          <h1 className="page-heading mt-3">About Urban Accounting System</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm sm:text-base leading-relaxed">
            A production-grade, double-entry financial ERP system designed specifically for modern furniture manufacturing, retail, and commercial operations.
          </p>
        </div>

        {/* Live Host Links */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🌐</span> System Host Links & Endpoints
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {hostLinks.map((item, idx) => (
              <div key={idx} className="surface surface-hover p-5 border border-slate-200 dark:border-amber-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {item.label}
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/20">
                    {item.badge}
                  </span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base font-extrabold text-blue-600 dark:text-amber-400 hover:underline break-all"
                >
                  {item.url} ↗
                </a>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Contributors */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>👥</span> Engineering Team & Core Contributors
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {team.map((member, idx) => (
              <div key={idx} className="surface surface-hover p-6 border border-slate-200 dark:border-amber-500/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-2xl border border-amber-500/30 mb-4">
                    👤
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">{member.name}</h3>
                  <a
                    href={member.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    @{member.handle} ↗
                  </a>
                  <div className="mt-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-amber-200">
                    {member.role}
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Double Entry Principles */}
        <div className="surface p-6 border border-slate-200 dark:border-amber-500/20 rounded-2xl">
          <h2 className="text-base font-bold mb-2 flex items-center gap-2">
            <span>⚖️</span> Architecture & Financial Guarantees
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-300 mt-4">
            <div>
              <span className="font-bold text-amber-500">Double-Entry Integrity:</span> Every journal entry mathematically validates Debit == Credit before saving.
            </div>
            <div>
              <span className="font-bold text-amber-500">Automated Flows:</span> Seamless conversion of POs into Vendor Bills and SOs into Customer Invoices.
            </div>
            <div>
              <span className="font-bold text-amber-500">Analytic Cost Centers:</span> Real-time budget allocation and expenditure variance tracking.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
