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
      <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="page-heading">Chart of Accounts</h1><p className="page-subtitle">Organize your financial accounts.</p></div>
        <Link to="/accounts/new" className="primary-button">New account</Link>
      </div>
      <div className="surface"><div className="overflow-x-auto"><table className="data-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}><td className="font-medium text-slate-900">{acc.name}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{acc.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
    </div>
  );
}
