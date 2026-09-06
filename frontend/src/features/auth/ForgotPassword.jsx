import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function ForgotPassword() {
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const hasMinLength = newPassword.length > 8;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hasMinLength || !hasLower || !hasUpper || !hasSpecial) {
      setError('New password must be more than 8 characters and include uppercase, lowercase, and a special character.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(loginOrEmail, newPassword);
      setSuccess('Password reset successfully! Redirecting to Sign In...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] px-5 py-12 flex items-center justify-center transition-colors duration-200">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-500 transition dark:text-slate-400">
          ← Back to Sign In
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition dark:border-amber-500/20 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl opacity-70" />

      <div className="w-full max-w-md pt-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/30">
            UF
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-amber-50">Reset Password</h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-amber-400/70">Recover access to your account</p>
        </div>

        <div className="surface p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold">Enter Login Id or Email</label>
              <input
                type="text"
                required
                placeholder="e.g. admin_user or admin@urbanfurniture.com"
                value={loginOrEmail}
                onChange={(e) => setLoginOrEmail(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold">Enter New Password</label>
              <input
                type="password"
                required
                placeholder="Must be >8 chars with Aa1@"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm"
              />
              {newPassword && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                  <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {hasMinLength ? '✓' : '○'} &gt;8 Characters
                  </span>
                  <span className={hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {hasUpper ? '✓' : '○'} Uppercase letter
                  </span>
                  <span className={hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {hasLower ? '✓' : '○'} Lowercase letter
                  </span>
                  <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {hasSpecial ? '✓' : '○'} Special character
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold">Re-Enter Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm"
              />
              {confirmPassword && (
                <p className={`mt-1 text-[11px] font-medium ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="primary-button w-full mt-2">
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Remember your credentials?{' '}
            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-500 transition dark:text-amber-400">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
