import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function SalesOrderForm() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load customers and products from backend
    apiClient.get('/contacts?contact_type=customer').then(res => {
      const cList = res.data?.length > 0 ? res.data : [
        { id: 1, name: 'Tejas Office Solutions' },
        { id: 4, name: 'Nimesh Pathak' }
      ];
      setCustomers(cList);
      if (cList.length > 0) setCustomerId(cList[0].id);
    });

    apiClient.get('/products').then(res => {
      const pList = res.data?.length > 0 ? res.data : [
        { id: 1, name: 'Ergonomic Executive Desk', sales_price: 1200.0 },
        { id: 2, name: 'Mesh Chair', sales_price: 350.0 }
      ];
      setProducts(pList);
      if (pList.length > 0) {
        setProductId(pList[0].id);
        setUnitPrice(pList[0].sales_price || 200);
      }
    });
  }, []);

  const handleProductChange = (prodId) => {
    setProductId(prodId);
    const selected = products.find(p => String(p.id) === String(prodId));
    if (selected) {
      setUnitPrice(selected.sales_price || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/sales-orders', {
        customer_id: parseInt(customerId),
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
        unit_price: parseFloat(unitPrice),
        tax: parseFloat(tax) || 0.0
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/sales'), 1200);
    } catch (err) {
      alert(err.message || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  const total = (quantity * unitPrice) + (parseFloat(tax) || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-heading">Create Sales Order</h1>
          <p className="page-subtitle">Record a customer quotation or sales confirmation.</p>
        </div>
        <Link to="/sales" className="secondary-button">← Back to SOs</Link>
      </div>

      <div className="surface p-6 sm:p-8 relative">
        {showSuccess && (
          <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white p-3 rounded-t-xl text-center font-medium shadow">
            ✅ Sales Order created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Customer *</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.type || 'Customer'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Product *</label>
            <select
              required
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - Price: ₹{Number(p.sales_price).toFixed(2)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Tax (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border flex justify-between items-center">
            <span className="font-medium text-slate-700">Estimated Total (incl. Tax):</span>
            <span className="text-2xl font-bold text-slate-900">₹{total.toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/sales" className="secondary-button">Cancel</Link>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Creating SO...' : 'Create Sales Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}