import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'goods',
    sales_price: 0,
    cost_price: 0,
    category: 'Furniture'
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await apiClient.post('/products', {
        name: formData.name,
        type: formData.type,
        sales_price: parseFloat(formData.sales_price) || 0.0,
        cost_price: parseFloat(formData.cost_price) || 0.0,
        category: formData.category
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-surface relative max-w-2xl">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white p-3 rounded-t-xl text-center font-medium shadow">
          ✅ Product saved successfully! Redirecting...
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Product Master</h2>
          <p className="text-sm text-slate-500">Configure catalog item, cost, selling price, and category.</p>
        </div>
        <Link to="/products" className="secondary-button">← Back</Link>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Product Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ergonomic Executive Desk"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Type *</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="goods">Goods (Stockable)</option>
              <option value="service">Service</option>
              <option value="combo">Combo Package</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Category</label>
            <input
              type="text"
              placeholder="e.g. Desks, Chairs, Tables"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Sales Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.sales_price}
              onChange={e => setFormData({ ...formData, sales_price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Cost (Purchase Price) (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.cost_price}
              onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link to="/products" className="secondary-button">Cancel</Link>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
