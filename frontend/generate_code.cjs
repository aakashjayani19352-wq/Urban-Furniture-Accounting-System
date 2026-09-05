const fs = require('fs');
const path = require('path');

const files = {
  'src/api/apiClient.js': `
// TODO: Replace with real endpoint paths when backend is ready
export const apiClient = {
  get: async (url) => { console.log('GET', url); return { data: [] }; },
  post: async (url, data) => { console.log('POST', url, data); return { data }; },
  put: async (url, data) => { console.log('PUT', url, data); return { data }; },
  delete: async (url) => { console.log('DELETE', url); return { data: true }; },
};
`,
  'src/features/auth/AuthContext.jsx': `
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role) => setUser({ role });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`,
  'src/features/auth/Login.jsx': `
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('Admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
              <option>Admin</option>
              <option>Invoicing User</option>
              <option>Contact</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
`,
  'src/components/layout/DashboardLayout.jsx': `
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold text-xl">Urban Furniture</div>
        <nav className="p-4 space-y-2">
          <Link to="/" className="block p-2 hover:bg-gray-50">Dashboard</Link>
          <Link to="/contacts" className="block p-2 hover:bg-gray-50">Contacts</Link>
          <Link to="/products" className="block p-2 hover:bg-gray-50">Products</Link>
          <Link to="/accounts" className="block p-2 hover:bg-gray-50">Chart of Accounts</Link>
          <Link to="/purchases" className="block p-2 hover:bg-gray-50">Purchase Orders</Link>
          <Link to="/sales" className="block p-2 hover:bg-gray-50">Sales Orders</Link>
          <Link to="/budgets" className="block p-2 hover:bg-gray-50">Budgets</Link>
          <Link to="/reports" className="block p-2 hover:bg-gray-50">Reports</Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between">
          <div>Role: {user?.role}</div>
          <button onClick={logout} className="text-red-600">Logout</button>
        </header>
        <div className="p-6 overflow-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
`,
  'src/features/contacts/ContactList.jsx': `
import { Link } from 'react-router-dom';

export default function ContactList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link to="/contacts/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Contact</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of contacts will appear here. (TODO: GET /api/contacts)</p>
      </div>
    </div>
  );
}
`,
  'src/features/contacts/ContactForm.jsx': `
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Customer' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return alert('Name and email required');
    // TODO: POST /api/contacts
    console.log('Saving', formData);
    navigate('/contacts');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name *</label>
          <input required className="border p-2 w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block">Email *</label>
          <input type="email" required className="border p-2 w-full" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block">Type</label>
          <select className="border p-2 w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Customer</option>
            <option>Vendor</option>
            <option>Both</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
`,
  'src/features/products/ProductList.jsx': `
import { Link } from 'react-router-dom';

export default function ProductList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of products will appear here. (TODO: GET /api/products)</p>
      </div>
    </div>
  );
}
`,
  'src/features/products/ProductForm.jsx': `
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
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Product Name *</label>
          <input required className="border p-2 w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block">Price *</label>
          <input type="number" required className="border p-2 w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
`,
  'src/features/purchases/PurchaseOrderList.jsx': `
import { Link } from 'react-router-dom';

export default function PurchaseOrderList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Link to="/purchases/new" className="bg-blue-600 text-white px-4 py-2 rounded">New PO</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of POs will appear here. (TODO: GET /api/purchases)</p>
      </div>
    </div>
  );
}
`,
  'src/features/sales/SalesOrderList.jsx': `
import { Link } from 'react-router-dom';

export default function SalesOrderList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <Link to="/sales/new" className="bg-blue-600 text-white px-4 py-2 rounded">New SO</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of SOs will appear here. (TODO: GET /api/sales)</p>
      </div>
    </div>
  );
}
`,
  'src/features/reports/BudgetReport.jsx': `
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Marketing', Planned: 4000, Actual: 2400 },
  { name: 'Operations', Planned: 3000, Actual: 1398 },
  { name: 'IT', Planned: 2000, Actual: 9800 },
];

export default function BudgetReport() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Budget Report</h2>
      {/* TODO: Fetch real data from GET /api/reports/budget */}
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Planned" fill="#8884d8" />
        <Bar dataKey="Actual" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}
`,
  'src/App.jsx': `
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ContactList from './features/contacts/ContactList';
import ContactForm from './features/contacts/ContactForm';
import ProductList from './features/products/ProductList';
import ProductForm from './features/products/ProductForm';
import PurchaseOrderList from './features/purchases/PurchaseOrderList';
import SalesOrderList from './features/sales/SalesOrderList';
import BudgetReport from './features/reports/BudgetReport';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<div>Dashboard Home</div>} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="contacts/new" element={<ContactForm />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="purchases" element={<PurchaseOrderList />} />
            <Route path="sales" element={<SalesOrderList />} />
            <Route path="budgets" element={<div>Budgets</div>} />
            <Route path="accounts" element={<div>Chart of Accounts</div>} />
            <Route path="reports" element={<BudgetReport />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content.trim() + '\\n');
}
console.log('Done writing files.');
