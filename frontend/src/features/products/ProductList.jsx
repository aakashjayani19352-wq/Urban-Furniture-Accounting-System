import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiClient.get('/api/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="page-heading">Products</h1><p className="page-subtitle">Your catalogue and sales prices.</p></div>
        <Link to="/products/new" className="primary-button">Add product</Link>
      </div>
      <div className="surface"><div className="overflow-x-auto"><table className="data-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}><td className="font-medium text-slate-900">{product.name}</td><td className="font-medium text-slate-700">${product.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
    </div>
  );
}
