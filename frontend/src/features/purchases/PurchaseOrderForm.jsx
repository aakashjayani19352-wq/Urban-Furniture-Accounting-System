import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PurchaseOrderForm() {
  const [formData, setFormData] = useState({ vendorId: '', productId: '', quantity: 1, price: 0 });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /api/purchases
    navigate('/purchases');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Vendor ID</label>
          <input required className="border p-2 w-full" value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} />
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create PO</button>
      </form>
    </div>
  );
}\n