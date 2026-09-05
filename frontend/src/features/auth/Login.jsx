import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('Admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-200">U</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to Urban Furniture Accounting.</p></div>
        <div className="surface p-6 sm:p-8"><h2 className="mb-5 text-lg font-semibold text-slate-900">Choose your workspace role</h2><form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2.5">
              <option>Admin</option>
              <option>Invoicing User</option>
              <option>Contact</option>
            </select>
          </div>
          <button type="submit" className="primary-button w-full">Continue</button>
        </form>
      </div>
      </div>
    </div>
  );
}
