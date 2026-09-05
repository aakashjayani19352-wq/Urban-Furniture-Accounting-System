import { Link } from 'react-router-dom';

export default function ChartOfAccountsList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Link to="/accounts/new" className="bg-blue-600 text-white px-4 py-2 rounded">New Account</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of accounts will appear here. (TODO: GET /api/accounts)</p>
      </div>
    </div>
  );
}