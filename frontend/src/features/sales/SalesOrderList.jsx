import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invModalOrder, setInvModalOrder] = useState(null);
  const [payModalOrder, setPayModalOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [payAmount, setPayAmount] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiClient.get('/sales-orders');
    setOrders(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/sales-orders/${invModalOrder.id}/invoice`, {});
      setActionSuccess(`SO #${invModalOrder.id} successfully converted to Customer Invoice! Journal Entry posted.`);
      setInvModalOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to generate invoice');
    }
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions/payment', {
        invoice_id: payModalOrder.invoice_id,
        payment_method: paymentMethod,
        amount: parseFloat(payAmount) || payModalOrder.total_amount,
        reference: `Payment for SO Invoice #${payModalOrder.id}`
      });
      setActionSuccess(`Payment of ₹${payAmount} received via ${paymentMethod}! Journal Entry posted.`);
      setPayModalOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Payment reception failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Sales Orders & Invoices</h1>
          <p className="page-subtitle">Manage customer orders, generate invoices, and receive payments.</p>
        </div>
        <Link to="/sales/new" className="primary-button">+ New Sales Order</Link>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
          ✅ {actionSuccess}
        </div>
      )}

      <div className="surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>SO #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    {loading ? 'Loading sales orders...' : 'No sales orders recorded yet.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerName = order.customer?.name || order.customer || 'Customer';
                  const productName = order.product?.name || order.product || 'Product';
                  const total = order.total_amount || ((order.quantity * order.unit_price) + (order.tax || 0)) || 0;
                  const isInvoiced = order.status?.toLowerCase() === 'invoiced';

                  return (
                    <tr key={order.id}>
                      <td className="font-semibold text-blue-600">SO-{String(order.id).padStart(4, '0')}</td>
                      <td className="font-medium text-slate-900">{customerName}</td>
                      <td className="text-slate-600">{productName}</td>
                      <td className="text-slate-700">{order.quantity || order.qty}</td>
                      <td className="text-slate-700">₹{Number(order.unit_price).toFixed(2)}</td>
                      <td className="text-slate-700">₹{Number(order.tax || 0).toFixed(2)}</td>
                      <td className="font-semibold text-slate-900">₹{Number(total).toFixed(2)}</td>
                      <td>
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isInvoiced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isInvoiced ? 'Invoiced' : 'Draft SO'}
                        </span>
                      </td>
                      <td>
                        {!isInvoiced ? (
                          <button
                            onClick={() => setInvModalOrder(order)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            Generate Invoice →
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPayModalOrder(order);
                              setPayAmount(String(total));
                            }}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            💵 Receive Payment
                          </button>
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

      {/* Generate Invoice Modal */}
      {invModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Generate Customer Invoice for SO #{invModalOrder.id}</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will create a Customer Invoice of <strong>₹{Number(invModalOrder.total_amount).toFixed(2)}</strong> and automatically post a double-entry Journal Entry (Debit Accounts Receivable, Credit Sales Revenue).
            </p>
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInvModalOrder(null)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button bg-blue-600 hover:bg-blue-700">
                  Confirm & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {payModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Receive Customer Payment</h3>
            <p className="text-sm text-slate-500 mb-4">
              Record incoming payment for Invoice #{payModalOrder.id} into Cash or Bank.
            </p>
            <form onSubmit={handleReceivePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Payment Account</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOrder(null)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button bg-emerald-600 hover:bg-emerald-700">
                  Record Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
