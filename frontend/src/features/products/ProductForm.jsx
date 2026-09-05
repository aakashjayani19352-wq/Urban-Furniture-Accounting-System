import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductForm() {
  const [formData, setFormData] = useState({ name: '', price: 0 });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Name required');
    // TODO: POST /api/products
    navigate('/products');
  };

  return (
    <div className="form-surface"><h2 className="text-xl font-semibold text-slate-900 mb-1">Add product</h2><p className="mb-6 text-sm text-slate-500">Add an item to your catalogue.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Product Name *</label>
          <input required className="w-full px-3 py-2.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block">Price *</label>
          <input type="number" required className="w-full px-3 py-2.5" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </div>
        <div className="flex justify-end pt-2"><button type="submit" className="primary-button">Save product</button></div>
      </form>
    </div>
  );
}
