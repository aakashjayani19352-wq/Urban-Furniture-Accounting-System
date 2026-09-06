import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function SignUp() {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Password complexity checks
  const hasMinLength = password.length > 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);
  const isValidLoginId = loginId.length >= 6 && loginId.length <= 12 && /^[a-zA-Z0-9_]+$/.test(loginId);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidLoginId) {
      setError('Login Id must be unique and between 6-12 characters (alphanumeric or underscores).');
      return;
    }

    if (!hasMinLength || !hasLower || !hasUpper || !hasSpecial) {
      setError('Password must be more than 8 characters and include uppercase, lowercase, and a special character.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        login_id: loginId,
        email,
        full_name: fullName || loginId,
        password,
        role: 'invoicing_user'
      });
      setSuccess('Account created successfully! Redirecting to Sign In...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-amber-50">Sign Up Page</h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-amber-400/70">Create your Invoicing & Accounting Account</p>
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold">Enter Login Id</label>
                <span className={`text-[10px] font-semibold ${loginId.length >= 6 && loginId.length <= 12 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {loginId.length}/12 (6-12 chars)
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. jayan_user"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value.toLowerCase())}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold">Enter Email Id</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold">Enter Password</label>
              <input
                type="password"
                required
                placeholder="Must be >8 chars with Aa1@"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm"
              />
              {password && (
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
                placeholder="Re-enter password to match"
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
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-500 transition dark:text-amber-400">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
