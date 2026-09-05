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
import JournalList from './features/accounts/JournalList';
import JournalForm from './features/accounts/JournalForm';
import JournalEntryList from './features/accounts/JournalEntryList';
import BudgetList from './features/budgets/BudgetList';
import BalanceSheet from './features/reports/BalanceSheet';
import ProfitLoss from './features/reports/ProfitLoss';
import DashboardHome from './features/dashboard/DashboardHome';
import LiveDemoPlayback from './features/demo/LiveDemoPlayback';

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
          <Route path="/demo" element={<div className="min-h-screen bg-slate-100 p-4 md:p-8"><LiveDemoPlayback /></div>} />
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="live-demo" element={<LiveDemoPlayback />} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="contacts/new" element={<ContactForm />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="purchases" element={<PurchaseOrderList />} />
            <Route path="purchases/new" element={<PurchaseOrderForm />} />
            <Route path="sales" element={<SalesOrderList />} />
            <Route path="sales/new" element={<SalesOrderForm />} />
            <Route path="budgets" element={<BudgetList />} />
            <Route path="budgets/new" element={<BudgetList />} />
            <Route path="budgets/analytic" element={<BudgetList />} />
            <Route path="accounts" element={<ChartOfAccountsList />} />
            <Route path="accounts/new" element={<ChartOfAccountsForm />} />
            <Route path="journals" element={<JournalList />} />
            <Route path="journals/new" element={<JournalForm />} />
            <Route path="journal-entries" element={<JournalEntryList />} />
            <Route path="reports" element={<BudgetReport />} />
            <Route path="reports/balance-sheet" element={<BalanceSheet />} />
            <Route path="reports/profit-loss" element={<ProfitLoss />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;