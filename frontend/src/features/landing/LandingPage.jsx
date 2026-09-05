import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090d16] text-amber-50 selection:bg-amber-400 selection:text-slate-950">
      {/* 🌟 ENTIRE FULLSCREEN SPLINE 3D SCENE BACKGROUND 🌟 */}
      <div className="fixed inset-0 z-0 h-full w-full overflow-hidden opacity-90">
        <iframe
          src="https://my.spline.design/mesasete-1ygyyafFYT5yWDBHSd288XWW/"
          className="h-full w-full border-0 scale-105"
          title="Urban Accounting Fullscreen 3D Spline Experience"
        />
      </div>

      {/* Subtle Dark Slate Ambient Overlay for High Content Legibility */}
      <div className="fixed inset-0 z-5 pointer-events-none bg-gradient-to-b from-[#090d16]/85 via-[#090d16]/50 to-[#090d16]/95" />

      {/* Ambient Amber Glow */}
      <div className="pointer-events-none fixed -top-40 left-1/2 z-6 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />

      {/* OVERLAY CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-amber-500/20 bg-[#090d16]/75 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-extrabold text-slate-950 shadow-lg shadow-amber-500/30">
                UF
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-amber-50">Urban Accounting</span>
                <span className="ml-2.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                  3D Slate Gold
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-amber-500/20 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-slate-800/80 transition backdrop-blur-md"
                title="Toggle Theme"
              >
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>

              {user ? (
                <Link
                  to={user.role === 'contact' ? '/portal' : '/'}
                  className="primary-button !bg-amber-400 hover:!bg-amber-300 text-slate-950 font-bold"
                >
                  Go to Workspace →
                </Link>
              ) : (
                <Link to="/login" className="primary-button !bg-amber-400 hover:!bg-amber-300 text-slate-950 font-bold">
                  Sign In / Open Portal
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Main Hero Overlay */}
        <main className="mx-auto my-auto w-full max-w-7xl px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-xl mb-6 shadow-lg shadow-amber-500/15">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Midnight Slate & Warm Amber Gold Edition
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl xl:text-7xl leading-[1.08] drop-shadow-2xl">
              Accounting, without the accounting clutter.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base text-slate-300 sm:text-xl max-w-2xl leading-relaxed drop-shadow-lg font-medium">
              Manage customer invoices, vendor bills, payments, and double-entry financial ledgers from an immersive 3D connected workspace.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(user ? (user.role === 'contact' ? '/portal' : '/') : '/login')}
                className="primary-button text-base px-8 py-4 !bg-amber-400 hover:!bg-amber-300 text-slate-950 font-extrabold shadow-2xl shadow-amber-500/40 transform hover:-translate-y-0.5 transition"
              >
                {user ? 'Open Dashboard' : 'Sign In to Workspace'} →
              </button>
              <a
                href="#features"
                className="secondary-button text-base px-7 py-4 !bg-slate-900/80 !text-amber-100 !border-amber-500/30 hover:!bg-slate-800/80 backdrop-blur-xl"
              >
                Explore System Capabilities ↓
              </a>
            </div>

            {/* Key Metric Glass Cards */}
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="glass-card p-5 backdrop-blur-2xl bg-slate-900/60 border-amber-500/20 hover:border-amber-400/40 transition">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Double-Entry</span>
                <p className="mt-1 text-sm font-semibold text-white">Total Debit == Total Credit</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Strict ledger validation</p>
              </div>

              <div className="glass-card p-5 backdrop-blur-2xl bg-slate-900/60 border-amber-500/20 hover:border-amber-400/40 transition">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Order-to-Cash</span>
                <p className="mt-1 text-sm font-semibold text-white">SO → Invoice → Payment</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Automated workflows</p>
              </div>

              <div className="glass-card p-5 backdrop-blur-2xl bg-slate-900/60 border-amber-500/20 hover:border-amber-400/40 transition">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Procure-to-Pay</span>
                <p className="mt-1 text-sm font-semibold text-white">PO → Bill → Settlement</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Analytic cost tracking</p>
              </div>
            </div>
          </div>
        </main>

        {/* Features Breakdown Overlay */}
        <section id="features" className="border-t border-amber-500/20 bg-[#090d16]/85 px-6 py-16 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Engineered Architecture</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Enterprise Double-Entry Accounting Core
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="glass-card p-6 backdrop-blur-xl bg-slate-900/80 border-amber-500/20 hover:border-amber-400/50 transition">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-xl text-amber-300 border border-amber-500/30">
                  ⚖️
                </div>
                <h3 className="text-base font-bold text-white">Double-Entry Ledger</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Real-time general ledger line entries validating debit and credit balancing for every transaction.
                </p>
              </div>

              <div className="glass-card p-6 backdrop-blur-xl bg-slate-900/80 border-amber-500/20 hover:border-amber-400/50 transition">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-xl text-amber-300 border border-amber-500/30">
                  📊
                </div>
                <h3 className="text-base font-bold text-white">Live Statements</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Instant Balance Sheet, Profit & Loss, and Analytic Cost Center Budget reports.
                </p>
              </div>

              <div className="glass-card p-6 backdrop-blur-xl bg-slate-900/80 border-amber-500/20 hover:border-amber-400/50 transition">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-xl text-amber-300 border border-amber-500/30">
                  🔒
                </div>
                <h3 className="text-base font-bold text-white">Role-Based Access</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Enforced security for Admin, Accountant, and restricted Contact customer portal accounts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-amber-500/20 bg-[#090d16] px-6 py-6 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-400">
            <div>© 2026 Urban Accounting. Double-Entry Accounting & ERP Engine.</div>
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-amber-300 transition font-medium">Sign In</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
