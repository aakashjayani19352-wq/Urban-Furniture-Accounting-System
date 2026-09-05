import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@urbanfurniture.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithCredentials, login: setRoleDirectly } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithCredentials(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (roleName, demoEmail, demoPass) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithCredentials(demoEmail, demoPass);
    } catch {
      setRoleDirectly(roleName);
    }
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-200">
            UF
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Urban Furniture</h1>
          <p className="mt-2 text-sm text-slate-500">Double-Entry Accounting & Financial Management</p>
        </div>

        <div className="surface p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-3 text-center">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                onClick={() => quickLogin('Admin', 'admin@urbanfurniture.com', 'admin123')}
                className="px-2 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-center"
              >
                👑 Admin
              </button>
              <button 
                type="button" 
                onClick={() => quickLogin('Invoicing User', 'accountant@urbanfurniture.com', 'accountant123')}
                className="px-2 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition text-center"
              >
                📊 Accountant
              </button>
              <button 
                type="button" 
                onClick={() => quickLogin('Contact', 'customer@tejas.com', 'customer123')}
                className="px-2 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition text-center"
              >
                👤 Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
