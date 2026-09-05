import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChartOfAccountsForm() {
  const [formData, setFormData] = useState({ name: '', type: 'Asset' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Name required');
    // TODO: POST /api/accounts
    navigate('/accounts');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Account Name *</label>
          <input required className="border p-2 w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block">Type</label>
          <select className="border p-2 w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Asset</option>
            <option>Liability</option>
            <option>Income</option>
            <option>Expense</option>
            <option>Capital</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}