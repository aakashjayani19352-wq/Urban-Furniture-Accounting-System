import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Contact name is required');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      await apiClient.post('/contacts', formData);
      setShowSuccess(true);
      setTimeout(() => navigate('/contacts'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-surface relative max-w-2xl">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white p-3 rounded-t-xl text-center font-medium shadow">
          ✅ Contact saved successfully! Redirecting...
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add New Contact</h2>
          <p className="text-sm text-slate-500">Create a customer, vendor, or shared contact master entry.</p>
        </div>
        <Link to="/contacts" className="secondary-button">← Back</Link>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nimesh Pathak"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Contact Type *</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="both">Both (Customer & Vendor)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Email Address *</label>
            <input
              type="email"
              required
              placeholder="nimesh@example.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Mobile Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.mobile}
              onChange={e => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600">Street Address</label>
          <input
            type="text"
            placeholder="Office 402, High Street"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">City</label>
            <input
              type="text"
              placeholder="Mumbai"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">State</label>
            <input
              type="text"
              placeholder="Maharashtra"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Pincode</label>
            <input
              type="text"
              placeholder="400001"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={formData.pincode}
              onChange={e => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link to="/contacts" className="secondary-button">Cancel</Link>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
