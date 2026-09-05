import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold text-xl">Urban Furniture</div>
        <nav className="p-4 space-y-2">
          <Link to="/" className="block p-2 hover:bg-gray-50">Dashboard</Link>
          <Link to="/contacts" className="block p-2 hover:bg-gray-50">Contacts</Link>
          <Link to="/products" className="block p-2 hover:bg-gray-50">Products</Link>
          <Link to="/accounts" className="block p-2 hover:bg-gray-50">Chart of Accounts</Link>
          <Link to="/purchases" className="block p-2 hover:bg-gray-50">Purchase Orders</Link>
          <Link to="/sales" className="block p-2 hover:bg-gray-50">Sales Orders</Link>
          <Link to="/budgets" className="block p-2 hover:bg-gray-50">Budgets</Link>
          <Link to="/reports" className="block p-2 hover:bg-gray-50">Reports</Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between">
          <div>Role: {user?.role}</div>
          <button onClick={logout} className="text-red-600">Logout</button>
        </header>
        <div className="p-6 overflow-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}\n