import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function CreateUser() {
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('invoicing_user'); // default Accountant
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createUser } = useAuth();
  const navigate = useNavigate();

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
      await createUser({
        name,
        full_name: name,
        login_id: loginId,
        email,
        role,
        password
      });
      setSuccess('User created successfully in database!');
      setTimeout(() => {
        navigate('/users');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-amber-50">Create User</h1>
          <p className="text-xs text-slate-500 dark:text-amber-400/70 mt-1">Add system administrators, accountants, and portal users</p>
        </div>
        <Link to="/users" className="secondary-button text-xs">
          ← Back to Users
        </Link>
      </div>

      <div className="surface p-6 sm:p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-lg font-extrabold text-slate-950 shadow-md">
            UF
          </div>
          <h2 className="text-sm font-bold text-slate-700 dark:text-amber-200 uppercase tracking-wider">User Account Registration</h2>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aakash Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold">Login id</label>
              <span className={`text-[10px] font-semibold ${loginId.length >= 6 && loginId.length <= 12 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {loginId.length}/12 (6-12 chars)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. aakash_admin"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value.toLowerCase())}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold">E-mail id</label>
            <input
              type="email"
              required
              placeholder="user@urbanfurniture.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-2">Role</label>
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-800/60 dark:border-amber-500/20">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="radio"
                  name="role"
                  value="contact"
                  checked={role === 'contact'}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-amber-500"
                />
                User (Portal)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="radio"
                  name="role"
                  value="invoicing_user"
                  checked={role === 'invoicing_user'}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-amber-500"
                />
                Accountant
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-amber-500"
                />
                Administrator
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold">Password</label>
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

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-amber-500/20">
            <button type="submit" disabled={loading} className="primary-button flex-1">
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="secondary-button flex-1 text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
