import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function JournalForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState('sales');
  const [defaultAccountId, setDefaultAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/accounts').then(res => {
      setAccounts(res.data || []);
      if (res.data?.length > 0) setDefaultAccountId(res.data[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Journal name is required');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await apiClient.post('/journals', {
        name: name.trim(),
        type,
        default_account_id: defaultAccountId ? parseInt(defaultAccountId) : null
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/journals'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-surface relative max-w-xl">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white p-3 rounded-t-xl text-center font-medium shadow">
          ✅ Journal saved successfully! Redirecting...
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Accounting Journal</h2>
          <p className="text-sm text-slate-500">Books used to group and organize similar accounting transactions.</p>
        </div>
        <Link to="/journals" className="secondary-button">← Back</Link>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Journal Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sales Journal, Bank Journal"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Journal Type *</label>
          <select
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="sales">Sales (Customer Invoices)</option>
            <option value="purchase">Purchase (Vendor Bills)</option>
            <option value="bank">Bank (Electronic Payments & Receipts)</option>
            <option value="cash">Cash (Physical Cash Transactions)</option>
            <option value="general">General (Adjustments & Opening Balances)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Default Account</label>
          <select
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={defaultAccountId}
            onChange={e => setDefaultAccountId(e.target.value)}
          >
            <option value="">None / Unassigned</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link to="/journals" className="secondary-button">Cancel</Link>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Saving...' : 'Save Journal'}
          </button>
        </div>
      </form>
    </div>
  );
}