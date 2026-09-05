import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiClient.get('/api/sales').then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="page-heading">Sales Orders</h1><p className="page-subtitle">Track orders from your customers.</p></div>
        <Link to="/sales/new" className="primary-button">New sales order</Link>
      </div>
      <div className="surface"><div className="overflow-x-auto"><table className="data-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}><td className="font-semibold text-blue-600">{order.id}</td><td className="font-medium text-slate-900">{order.customer}</td><td className="text-slate-500">{order.product} (x{order.qty})</td><td className="font-medium text-slate-900">${order.total.toFixed(2)}</td><td>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Invoiced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
