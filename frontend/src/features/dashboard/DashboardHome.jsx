import { Link } from 'react-router-dom';

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">$12,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Purchases</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">$8,320</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Net Profit</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">$4,130</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Contacts</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/sales/new" className="bg-white p-4 rounded shadow hover:bg-gray-50 text-blue-600 font-medium text-center">
          + Create Sales Order
        </Link>
        <Link to="/purchases/new" className="bg-white p-4 rounded shadow hover:bg-gray-50 text-purple-600 font-medium text-center">
          + Create Purchase Order
        </Link>
        <Link to="/contacts/new" className="bg-white p-4 rounded shadow hover:bg-gray-50 text-green-600 font-medium text-center">
          + Add New Contact
        </Link>
      </div>
    </div>
  );
}
