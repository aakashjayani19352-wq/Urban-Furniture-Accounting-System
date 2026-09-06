import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billModalOrder, setBillModalOrder] = useState(null);
  const [payModalOrder, setPayModalOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [payAmount, setPayAmount] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiClient.get('/purchase-orders');
    setOrders(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConvertToBill = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/purchase-orders/${billModalOrder.id}/bill`, {});
      setActionSuccess(`PO #${billModalOrder.id} successfully converted to Vendor Bill! Journal Entry posted.`);
      setBillModalOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to convert to bill');
    }
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions/payment', {
        invoice_id: payModalOrder.invoice_id,
        payment_method: paymentMethod,
        amount: parseFloat(payAmount) || payModalOrder.total_amount,
        reference: `Payment for PO Bill #${payModalOrder.id}`
      });
      setActionSuccess(`Payment of ₹${payAmount} registered via ${paymentMethod}! Journal Entry posted.`);
      setPayModalOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Payment registration failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Purchase Orders & Bills</h1>
          <p className="page-subtitle">Manage procurement, convert POs to Vendor Bills, and record payments.</p>
        </div>
        <Link to="/purchases/new" className="primary-button">+ New Purchase Order</Link>
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
                <th>PO #</th>
                <th>Vendor</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    {loading ? 'Loading purchase orders...' : 'No purchase orders recorded yet.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const vendorName = order.vendor?.name || order.vendor || 'Vendor';
                  const productName = order.product?.name || order.product || 'Product';
                  const total = order.total_amount || (order.quantity * order.unit_price) || 0;
                  const isBilled = order.status?.toLowerCase() === 'billed';

                  return (
                    <tr key={order.id}>
                      <td className="font-semibold text-blue-600">PO-{String(order.id).padStart(4, '0')}</td>
                      <td className="font-medium text-slate-900">{vendorName}</td>
                      <td className="text-slate-600">{productName}</td>
                      <td className="text-slate-700">{order.quantity || order.qty}</td>
                      <td className="text-slate-700">₹{Number(order.unit_price).toFixed(2)}</td>
                      <td className="font-semibold text-slate-900">₹{Number(total).toFixed(2)}</td>
                      <td>
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isBilled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isBilled ? 'Billed' : 'Draft PO'}
                        </span>
                      </td>
                      <td>
                        {!isBilled ? (
                          <button
                            onClick={() => setBillModalOrder(order)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-violet-50 text-violet-700 hover:bg-violet-100 transition"
                          >
                            Convert to Bill →
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPayModalOrder(order);
                              setPayAmount(String(total));
                            }}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            💳 Register Payment
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

      {/* Convert to Bill Modal */}
      {billModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Convert PO #{billModalOrder.id} to Vendor Bill</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will create a Vendor Bill of <strong>₹{Number(billModalOrder.total_amount).toFixed(2)}</strong> and automatically post a double-entry Journal Entry (Debit Purchase Expense, Credit Accounts Payable).
            </p>
            <form onSubmit={handleConvertToBill} className="space-y-4">
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBillModalOrder(null)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button bg-violet-600 hover:bg-violet-700">
                  Confirm & Post Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Payment Modal */}
      {payModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Register Vendor Payment</h3>
            <p className="text-sm text-slate-500 mb-4">
              Record payment for Bill #{payModalOrder.id} to clear Accounts Payable.
            </p>
            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Payment Method</label>
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
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
