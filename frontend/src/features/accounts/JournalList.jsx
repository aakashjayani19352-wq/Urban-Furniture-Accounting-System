import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/journals').then(res => {
      setJournals(res.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Financial Journals</h1>
          <p className="page-subtitle">Organize and group transactions into dedicated books (Sales, Purchase, Bank, Cash, General).</p>
        </div>
        <Link to="/journals/new" className="primary-button">+ New Journal</Link>
      </div>

      <div className="surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Journal Name</th>
                <th>Journal Type</th>
                <th>Default Account</th>
              </tr>
            </thead>
            <tbody>
              {journals.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-slate-400">
                    {loading ? 'Loading journals...' : 'No journals found.'}
                  </td>
                </tr>
              ) : (
                journals.map(j => (
                  <tr key={j.id}>
                    <td className="font-semibold text-slate-900">{j.name}</td>
                    <td>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 capitalize">
                        {j.type}
                      </span>
                    </td>
                    <td className="text-slate-600">
                      {j.default_account_id ? `Account #${j.default_account_id}` : 'General / Unassigned'}
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