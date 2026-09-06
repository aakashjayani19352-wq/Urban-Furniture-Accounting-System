import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { apiClient } from '../../api/apiClient';

export default function ContactPortal() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');

  const [payModalItem, setPayModalItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/transactions/invoices');
      const allInvoices = res.data || [];
      setInvoices(allInvoices.filter(i => i.transaction_type === 'sale'));
      setBills(allInvoices.filter(i => i.transaction_type === 'purchase'));
    } catch (err) {
      console.error('Failed to load contact invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/transactions/payment', {
        invoice_id: payModalItem.id,
        payment_method: paymentMethod,
        amount: parseFloat(payAmount) || (payModalItem.total_amount - payModalItem.paid_amount),
        reference: `Portal Payment for ${payModalItem.invoice_number}`
      });
      setActionSuccess(`Payment of ₹${payAmount} submitted successfully for ${payModalItem.invoice_number}!`);
      setPayModalItem(null);
      fetchContactData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Payment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const currentItems = activeTab === 'invoices' ? invoices : bills;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md dark:border-amber-500/15 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-extrabold text-slate-950 shadow-md shadow-amber-500/20">
              UF
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-amber-50">Urban Accounting — Contact Portal</h1>
              <p className="text-xs text-slate-500 dark:text-amber-400/70">Welcome back, {user?.full_name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition dark:border-amber-500/20 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-500/30 dark:text-amber-300">
              👤 Contact Role
            </span>
            <button
              onClick={logout}
              className="text-sm font-semibold text-slate-500 hover:text-red-600 transition dark:text-slate-400 dark:hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-amber-50">Account Statements & Invoices</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View customer invoices, vendor bills, and submit payments directly into the double-entry system.
          </p>
        </div>

        {actionSuccess && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200">
            ✅ {actionSuccess}
          </div>
        )}

        {/* Tab Selection */}
        <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 px-5 font-bold text-sm transition border-b-2 ${
              activeTab === 'invoices'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📄 Customer Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`pb-3 px-5 font-bold text-sm transition border-b-2 ${
              activeTab === 'bills'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📋 Vendor Bills ({bills.length})
          </button>
        </div>

        {/* Invoices / Bills Table */}
        <div className="surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Remaining Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      Loading financial statements...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No {activeTab === 'invoices' ? 'invoices' : 'bills'} found for your account.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const remaining = Math.max(0, (item.total_amount || 0) - (item.paid_amount || 0));
                    const isPaid = item.status === 'paid' || remaining <= 0.01;

                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-amber-600 dark:text-amber-400">{item.invoice_number}</td>
                        <td className="text-slate-600 dark:text-slate-400">
                          {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="font-semibold text-slate-900 dark:text-slate-100">₹{Number(item.total_amount).toFixed(2)}</td>
                        <td className="text-slate-600 dark:text-slate-400">₹{Number(item.paid_amount || 0).toFixed(2)}</td>
                        <td className="font-bold text-slate-900 dark:text-slate-100">₹{Number(remaining).toFixed(2)}</td>
                        <td>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                              isPaid
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                : item.paid_amount > 0
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isPaid ? 'Paid' : item.paid_amount > 0 ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                setPayModalItem(item);
                                setPayAmount(String(remaining.toFixed(2)));
                                setError(null);
                              }}
                              className="primary-button !bg-amber-500 hover:!bg-amber-400 text-slate-950 text-xs px-3 py-1.5 shadow-none font-bold"
                            >
                              💳 Pay Now
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {payModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="surface w-full max-w-md p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Submit Payment for {payModalItem.invoice_number}
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Total: <strong>₹{Number(payModalItem.total_amount).toFixed(2)}</strong> | Balance Due:{' '}
              <strong className="text-amber-600 dark:text-amber-400">₹{Number(payModalItem.total_amount - payModalItem.paid_amount).toFixed(2)}</strong>
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full"
                >
                  <option value="bank">Bank Transfer / Online</option>
                  <option value="cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label>Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalItem(null)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-button !bg-amber-500 hover:!bg-amber-400 text-slate-950 font-bold"
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
