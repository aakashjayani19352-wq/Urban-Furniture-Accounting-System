import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiClient.get('/api/purchases').then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="page-heading">Purchase Orders</h1><p className="page-subtitle">Track orders placed with your vendors.</p></div>
        <Link to="/purchases/new" className="primary-button">New purchase order</Link>
      </div>
      <div className="surface"><div className="overflow-x-auto"><table className="data-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}><td className="font-semibold text-blue-600">{order.id}</td><td className="font-medium text-slate-900">{order.vendor}</td><td className="text-slate-500">{order.product} (x{order.qty})</td><td className="font-medium text-slate-900">${order.total.toFixed(2)}</td><td>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Billed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
    </div>
  );
}
