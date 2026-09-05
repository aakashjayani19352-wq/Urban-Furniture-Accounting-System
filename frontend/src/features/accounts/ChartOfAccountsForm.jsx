import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ChartOfAccountsForm() {
  const [formData, setFormData] = useState({ code: '', name: '', type: 'asset' });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setErrorMsg('Account code and name are required');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await apiClient.post('/accounts', {
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/accounts'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-surface relative max-w-xl">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white p-3 rounded-t-xl text-center font-medium shadow">
          ✅ Account saved successfully! Redirecting...
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Ledger Account</h2>
          <p className="text-sm text-slate-500">Classify financial transactions into Asset, Liability, Income, Expense, or Capital.</p>
        </div>
        <Link to="/accounts" className="secondary-button">← Back</Link>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Account Code *</label>
          <input
            type="text"
            required
            placeholder="e.g. 1030, 2100, 5200"
            className="w-full mt-1 px-3 py-2 border rounded-lg font-mono"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Account Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Petty Cash, Office Supplies Expense"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Account Classification *</label>
          <select
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="asset">Asset (Cash, Bank, Debtors/AR)</option>
            <option value="liability">Liability (Creditors/AP, Loans)</option>
            <option value="capital">Capital / Equity (Share Capital)</option>
            <option value="income">Income / Revenue (Sales Income)</option>
            <option value="expense">Expense (Purchases, Rent, Utility)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link to="/accounts" className="secondary-button">Cancel</Link>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Saving...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}