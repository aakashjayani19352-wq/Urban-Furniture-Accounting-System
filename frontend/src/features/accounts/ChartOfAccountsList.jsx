import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ChartOfAccountsList() {
  const [accounts, setAccounts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/accounts').then(res => {
      setAccounts(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = accounts.filter(a => {
    if (filterType === 'all') return true;
    return a.type?.toLowerCase() === filterType.toLowerCase();
  });

  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'capital': return 'bg-emerald-100 text-emerald-800';
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Chart of Accounts (COA)</h1>
          <p className="page-subtitle">Standard ledger structure classified into Assets, Liabilities, Capital, Income, and Expenses.</p>
        </div>
        <Link to="/accounts/new" className="primary-button">+ New Account</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'asset', 'liability', 'capital', 'income', 'expense'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
              filterType === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Classification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    {loading ? 'Loading ledger accounts...' : 'No accounts found for this category.'}
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => (
                  <tr key={acc.id}>
                    <td className="font-mono font-bold text-blue-600">{acc.code}</td>
                    <td className="font-medium text-slate-900">{acc.name}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${getTypeBadge(acc.type)}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                        ● Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
