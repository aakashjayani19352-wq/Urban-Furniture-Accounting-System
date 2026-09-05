import { Link } from 'react-router-dom';

export default function BudgetList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budgets & Analytic Accounts</h1>
        <div className="space-x-2">
            <Link to="/budgets/analytic" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition">Manage Analytic Accounts</Link>
            <Link to="/budgets/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">New Budget</Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 text-gray-500">
        <p>List of planned budgets and their analytic mappings will appear here. (TODO: GET /api/budgets)</p>
      </div>
    </div>
  );
}