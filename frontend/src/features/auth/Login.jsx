import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@urbanfurniture.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithCredentials, login: setRoleDirectly } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await loginWithCredentials(email, password);
      if (loggedUser?.role === 'contact') {
        navigate('/portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (roleName, demoEmail, demoPass) => {
    setLoading(true);
    setError(null);
    let targetUser = null;
    try {
      targetUser = await loginWithCredentials(demoEmail, demoPass);
    } catch {
      targetUser = setRoleDirectly(roleName);
    }
    setLoading(false);
    if (targetUser?.role === 'contact' || roleName === 'Contact') {
      navigate('/portal');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] px-5 py-12 flex items-center justify-center transition-colors duration-200">
      {/* Top Bar for Landing Page & Theme Switcher */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/landing" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-500 transition dark:text-slate-400">
          ← Back to Landing Page
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition dark:border-amber-500/20 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Ambient Lighting Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl opacity-70" />

      <div className="w-full max-w-md pt-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/30">
            UF
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-amber-50">Urban Accounting</h1>
          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-amber-400/70">Double-Entry Financial ERP Workspace</p>
        </div>

        <div className="surface p-6 sm:p-8 shadow-xl">
          <h2 className="mb-5 text-base font-bold text-slate-900 dark:text-amber-100">Sign in to your account</h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold">Login Id</label>
              <input
                type="text"
                required
                placeholder="Enter Login Id or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold">Password</label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full mt-2">
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
            <div className="flex items-center justify-center gap-3 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link to="/forgot-password" className="hover:text-amber-500 transition">
                Forgot Password
              </Link>
              <span>|</span>
              <Link to="/signup" className="font-bold text-amber-600 hover:text-amber-500 transition dark:text-amber-400">
                Sign Up
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-amber-500/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-amber-400/70 mb-3 text-center">Quick Role Switcher</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('Admin', 'admin@urbanfurniture.com', 'admin123')}
                className="px-2 py-2 text-xs font-semibold bg-amber-50 text-amber-900 rounded-xl hover:bg-amber-100 transition text-center dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 border border-amber-500/30"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('Invoicing User', 'accountant@urbanfurniture.com', 'accountant123')}
                className="px-2 py-2 text-xs font-semibold bg-amber-50 text-amber-900 rounded-xl hover:bg-amber-100 transition text-center dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 border border-amber-500/30"
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => quickLogin('Contact', 'customer@tejas.com', 'customer123')}
                className="px-2 py-2 text-xs font-semibold bg-amber-50 text-amber-900 rounded-xl hover:bg-amber-100 transition text-center dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 border border-amber-500/30"
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
