import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Customer' });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return alert('Name and email required');
    // TODO: POST /api/contacts
    console.log('Saving', formData);
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => navigate('/contacts'), 1500);
  };

  return (
    <div className="form-surface relative">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-t mb-4">
          ✅ Contact saved successfully! Redirecting...
        </div>
      )}
      <h2 className="text-xl font-semibold text-slate-900 mb-1 mt-2">Add contact</h2><p className="mb-6 text-sm text-slate-500">Create a customer or vendor record.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name *</label>
          <input required className="w-full px-3 py-2.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block">Email *</label>
          <input type="email" required className="w-full px-3 py-2.5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block">Type</label>
          <select className="w-full px-3 py-2.5" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Customer</option>
            <option>Vendor</option>
            <option>Both</option>
          </select>
        </div>
        <div className="flex justify-end pt-2"><button type="submit" className="primary-button">Save contact</button></div>
      </form>
    </div>
  );
}
