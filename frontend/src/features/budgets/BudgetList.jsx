import { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAnalyticModal, setShowAnalyticModal] = useState(false);
  const [bName, setBName] = useState('');
  const [bAmount, setBAmount] = useState('');
  const [bAnalyticId, setBAnalyticId] = useState('');
  const [aName, setAName] = useState('');
  const [aType, setAType] = useState('expenses');
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [bRes, aRes] = await Promise.all([
      apiClient.get('/budgets'),
      apiClient.get('/analytic-accounts')
    ]);
    setBudgets(bRes.data || []);
    setAnalytics(aRes.data || []);
    if (aRes.data?.length > 0) setBAnalyticId(aRes.data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnalytic = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/analytic-accounts', {
        name: aName,
        type: aType
      });
      setSuccessMsg(`Analytic Account "${aName}" created!`);
      setAName('');
      setShowAnalyticModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create analytic account');
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 2);

      await apiClient.post('/budgets', {
        name: bName,
        start_date: now.toISOString(),
        end_date: nextMonth.toISOString(),
        responsible_person: 'Finance Manager',
        analytic_account_id: parseInt(bAnalyticId),
        planned_amount: parseFloat(bAmount)
      });
      setSuccessMsg(`Budget "${bName}" created!`);
      setBName('');
      setBAmount('');
      setShowBudgetModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create budget');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Budgets & Analytic Accounts</h1>
          <p className="page-subtitle">Track project, department, or business unit budgets against actual ledger expenses.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAnalyticModal(true)} className="secondary-button">
            + New Analytic Account
          </button>
          <button onClick={() => setShowBudgetModal(true)} className="primary-button">
            + New Budget
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
          ✅ {successMsg}
        </div>
      )}

      {/* Budgets Table */}
      <div className="surface">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Active Budgets</h2>
          <span className="text-xs text-slate-500">{budgets.length} Budgets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Budget Name</th>
                <th>Analytic Account</th>
                <th>Responsible</th>
                <th>Planned Amount</th>
                <th>Period</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    {loading ? 'Loading budgets...' : 'No budgets defined yet.'}
                  </td>
                </tr>
              ) : (
                budgets.map((b) => {
                  const analyticObj = analytics.find(a => a.id === b.analytic_account_id);
                  const aName = analyticObj?.name || 'General';

                  return (
                    <tr key={b.id}>
                      <td className="font-semibold text-slate-900">{b.name}</td>
                      <td>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                          {aName}
                        </span>
                      </td>
                      <td className="text-slate-600">{b.responsible_person || 'Finance Admin'}</td>
                      <td className="font-bold text-slate-900">${Number(b.planned_amount).toFixed(2)}</td>
                      <td className="text-xs text-slate-500">
                        {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytic Accounts Table */}
      <div className="surface">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Analytic Accounts (Cost Centers)</h2>
          <span className="text-xs text-slate-500">{analytics.length} Accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cost Center Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {analytics.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-slate-400">
                    {loading ? 'Loading analytic accounts...' : 'No analytic accounts defined yet.'}
                  </td>
                </tr>
              ) : (
                analytics.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-slate-900">{a.name}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        a.type === 'expenses' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {a.type?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Analytic Modal */}
      {showAnalyticModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create Analytic Account</h3>
            <form onSubmit={handleCreateAnalytic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Campaign Q1"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Type</label>
                <select
                  value={aType}
                  onChange={(e) => setAType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="expenses">Expenses</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAnalyticModal(false)} className="secondary-button">
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Analytic Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create New Budget</h3>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Budget Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Showroom Fitout Budget"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Analytic Account *</label>
                <select
                  required
                  value={bAnalyticId}
                  onChange={(e) => setBAnalyticId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  {analytics.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Planned Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="10000"
                  value={bAmount}
                  onChange={(e) => setBAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="secondary-button">
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}