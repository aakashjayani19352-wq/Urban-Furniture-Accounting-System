import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ContactList from './features/contacts/ContactList';
import ContactForm from './features/contacts/ContactForm';
import ProductList from './features/products/ProductList';
import ProductForm from './features/products/ProductForm';
import PurchaseOrderList from './features/purchases/PurchaseOrderList';
import PurchaseOrderForm from './features/purchases/PurchaseOrderForm';
import SalesOrderList from './features/sales/SalesOrderList';
import SalesOrderForm from './features/sales/SalesOrderForm';
import BudgetReport from './features/reports/BudgetReport';
import ChartOfAccountsList from './features/accounts/ChartOfAccountsList';
import ChartOfAccountsForm from './features/accounts/ChartOfAccountsForm';

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
            <Route path="purchases/new" element={<PurchaseOrderForm />} />
            <Route path="sales" element={<SalesOrderList />} />
            <Route path="sales/new" element={<SalesOrderForm />} />
            <Route path="budgets" element={<div>Budgets</div>} />
            <Route path="accounts" element={<ChartOfAccountsList />} />
            <Route path="accounts/new" element={<ChartOfAccountsForm />} />
            <Route path="reports" element={<BudgetReport />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;\n