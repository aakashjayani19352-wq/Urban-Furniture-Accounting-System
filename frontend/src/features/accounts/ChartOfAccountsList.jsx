import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ChartOfAccountsList() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    apiClient.get('/api/accounts').then(res => setAccounts(res.data));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chart of Accounts</h1>
        <Link to="/accounts/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">New Account</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}