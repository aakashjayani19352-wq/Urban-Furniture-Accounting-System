import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold text-xl">Urban Furniture</div>
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          <Link to="/" className="block p-2 hover:bg-gray-50 text-gray-700 font-medium">Dashboard</Link>
          <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Master Data</div>
          <Link to="/contacts" className="block p-2 hover:bg-gray-50 text-gray-700">Contacts</Link>
          <Link to="/products" className="block p-2 hover:bg-gray-50 text-gray-700">Products</Link>
          <Link to="/accounts" className="block p-2 hover:bg-gray-50 text-gray-700">Chart of Accounts</Link>
          <Link to="/journals" className="block p-2 hover:bg-gray-50 text-gray-700">Journals</Link>
          
          <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Transactions</div>
          <Link to="/purchases" className="block p-2 hover:bg-gray-50 text-gray-700">Purchase Orders</Link>
          <Link to="/sales" className="block p-2 hover:bg-gray-50 text-gray-700">Sales Orders</Link>
          <Link to="/journal-entries" className="block p-2 hover:bg-gray-50 text-gray-700">Journal Entries</Link>
          
          <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Budgets & Reports</div>
          <Link to="/budgets" className="block p-2 hover:bg-gray-50 text-gray-700">Budgets</Link>
          <Link to="/reports/balance-sheet" className="block p-2 hover:bg-gray-50 text-gray-700">Balance Sheet</Link>
          <Link to="/reports/profit-loss" className="block p-2 hover:bg-gray-50 text-gray-700">Profit & Loss</Link>
          <Link to="/reports" className="block p-2 hover:bg-gray-50 text-gray-700">Budget Report</Link>
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
}