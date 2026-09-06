import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { useAuth } from '../auth/AuthContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    const res = await apiClient.get('/products');
    setProducts(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (confirm(`Delete product "${name}"?`)) {
      try {
        await apiClient.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Product Master Data</h1>
          <p className="page-subtitle">Item catalog, stock classification, sales prices, and purchase costs.</p>
        </div>
        <Link to="/products/new" className="primary-button">+ Add Product</Link>
      </div>

      <div className="surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Classification</th>
                <th className="text-right">Sales Price</th>
                <th className="text-right">Cost Price</th>
                <th className="text-right">Unit Margin</th>
                {user?.role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    {loading ? 'Loading catalog items...' : 'No products found.'}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const sPrice = p.sales_price || p.price || 0;
                  const cPrice = p.cost_price || 0;
                  const margin = sPrice - cPrice;

                  return (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-900">{p.name}</td>
                      <td className="text-slate-600">{p.category || 'General'}</td>
                      <td>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 capitalize">
                          {p.type || 'goods'}
                        </span>
                      </td>
                      <td className="text-right font-bold text-slate-900">₹{Number(sPrice).toFixed(2)}</td>
                      <td className="text-right text-slate-600">₹{Number(cPrice).toFixed(2)}</td>
                      <td className={`text-right font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₹{Number(margin).toFixed(2)}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="text-right">
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
