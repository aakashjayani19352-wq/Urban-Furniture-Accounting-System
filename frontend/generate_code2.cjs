const fs = require('fs');
const path = require('path');

const files = {
  'src/features/accounts/ChartOfAccountsList.jsx': `
import { Link } from 'react-router-dom';

export default function ChartOfAccountsList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Link to="/accounts/new" className="bg-blue-600 text-white px-4 py-2 rounded">New Account</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of accounts will appear here. (TODO: GET /api/accounts)</p>
      </div>
    </div>
  );
}
`,
  'src/features/accounts/ChartOfAccountsForm.jsx': `
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
`,
  'src/features/purchases/PurchaseOrderForm.jsx': `
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
}
`,
  'src/features/sales/SalesOrderForm.jsx': `
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
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content.trim() + '\\n');
}
console.log('Done writing additional files.');
