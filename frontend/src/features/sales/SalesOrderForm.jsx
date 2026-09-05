import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SalesOrderForm() {
  const [formData, setFormData] = useState({ customerId: '', productId: '', quantity: 1, price: 0 });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /api/sales
    navigate('/sales');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Sales Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Customer ID</label>
          <input required className="border p-2 w-full" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} />
        </div>
        <div>
          <label className="block">Product ID</label>
          <input required className="border p-2 w-full" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block">Quantity</label>
            <input type="number" required className="border p-2 w-full" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div className="flex-1">
            <label className="block">Price</label>
            <input type="number" required className="border p-2 w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create SO</button>
      </form>
    </div>
  );
}