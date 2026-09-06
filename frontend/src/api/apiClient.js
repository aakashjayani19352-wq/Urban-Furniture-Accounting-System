const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Fallback Mock Data in case backend is offline
const fallbackMockData = {
  '/contacts': [
    { id: 1, name: 'Tejas Office Solutions', email: 'customer@tejas.com', type: 'customer', mobile: '+91 9876543210', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { id: 2, name: 'WoodCraft Timber Supplies', email: 'sales@woodcraft.com', type: 'vendor', mobile: '+91 9123456789', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    { id: 3, name: 'Azure Furniture', email: 'contact@azure.com', type: 'vendor', mobile: '+91 9988776655', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
  ],
  '/products': [
    { id: 1, name: 'Ergonomic Executive Desk', sales_price: 1200.0, cost_price: 700.0, category: 'Desks', type: 'goods' },
    { id: 2, name: 'Mesh Chair', sales_price: 350.0, cost_price: 180.0, category: 'Chairs', type: 'goods' },
    { id: 3, name: 'Office Sofa Combo', sales_price: 1800.0, cost_price: 1100.0, category: 'Sofas', type: 'combo' }
  ],
  '/accounts': [
    { id: 1, code: '1010', name: 'Cash', type: 'asset', is_active: true },
    { id: 2, code: '1020', name: 'Bank Account', type: 'asset', is_active: true },
    { id: 3, code: '1100', name: 'Accounts Receivable', type: 'asset', is_active: true },
    { id: 4, code: '2000', name: 'Accounts Payable', type: 'liability', is_active: true },
    { id: 5, code: '3000', name: 'Share Capital', type: 'capital', is_active: true },
    { id: 6, code: '4000', name: 'Sales Revenue', type: 'income', is_active: true },
    { id: 7, code: '5000', name: 'Purchase Expense / COGS', type: 'expense', is_active: true }
  ],
  '/journals': [
    { id: 1, name: 'Sales Journal', type: 'sales' },
    { id: 2, name: 'Purchase Journal', type: 'purchase' },
    { id: 3, name: 'Bank Journal', type: 'bank' },
    { id: 4, name: 'Cash Journal', type: 'cash' },
    { id: 5, name: 'General Journal', type: 'general' }
  ],
  '/purchase-orders': [
    { id: 1, vendor_id: 2, product_id: 1, quantity: 5, unit_price: 700.0, total_amount: 3500.0, status: 'draft', vendor: { name: 'WoodCraft Timber Supplies' }, product: { name: 'Ergonomic Executive Desk' } }
  ],
  '/sales-orders': [
    { id: 1, customer_id: 1, product_id: 2, quantity: 3, unit_price: 350.0, tax: 50.0, total_amount: 1100.0, status: 'draft', customer: { name: 'Tejas Office Solutions' }, product: { name: 'Mesh Chair' } }
  ],
  '/transactions/invoices': [
    { id: 1, transaction_type: 'sale', contact_id: 1, invoice_number: 'INV-20260905-0001', total_amount: 1050.0, paid_amount: 1050.0, status: 'paid', date: new Date().toISOString() }
  ],
  '/transactions/journal-entries': [
    { 
      id: 1, 
      entry_number: 'JE-INIT-001', 
      reference: 'Initial Capital Deposit', 
      date: new Date().toISOString(),
      lines: [
        { account_id: 2, debit: 50000.0, credit: 0.0, description: 'Initial Cash Deposit' },
        { account_id: 5, debit: 0.0, credit: 50000.0, description: 'Capital Credit' }
      ]
    }
  ],
  '/reports/profit-loss': {
    total_revenue: 18000.0,
    total_expenses: 13000.0,
    net_profit: 5000.0,
    revenue_breakdown: [{ account_code: '4000', account_name: 'Sales Revenue', amount: 18000.0 }],
    expense_breakdown: [
      { account_code: '5000', account_name: 'COGS', amount: 9000.0 },
      { account_code: '5100', account_name: 'Office Rent Expense', amount: 4000.0 }
    ]
  },
  '/reports/balance-sheet': {
    as_of_date: new Date().toISOString(),
    total_assets: 55000.0,
    total_liabilities: 0.0,
    total_capital: 55000.0,
    net_profit: 5000.0,
    assets_breakdown: [
      { account_code: '1010', account_name: 'Cash', balance: 5000.0 },
      { account_code: '1020', account_name: 'Bank Account', balance: 50000.0 }
    ],
    liabilities_breakdown: [],
    capital_breakdown: [
      { account_code: '3000', account_name: 'Share Capital', balance: 50000.0 },
      { account_code: 'RET-EARN', account_name: 'Current Net Profit', balance: 5000.0 }
    ]
  },
  '/reports/budget': {
    items: [
      { budget_id: 1, budget_name: 'Showroom Fitout Budget', analytic_account_name: 'Showroom Expansion', type: 'expenses', planned_amount: 10000.0, actual_amount: 4000.0, variance: 6000.0, achievement_percentage: 40.0 }
    ]
  }
};

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiClient = {
  get: async (endpoint) => {
    // Normalise endpoint
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    try {
      const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return { data };
      }
    } catch (err) {
      console.warn(`[apiClient] Backend request failed for ${cleanEndpoint}, using fallback:`, err.message);
    }
    // Fallback if offline
    return { data: fallbackMockData[cleanEndpoint] || [] };
  },

  post: async (endpoint, payload) => {
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    try {
      const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return { data };
      } else {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Request failed');
      }
    } catch (err) {
      console.error(`[apiClient] POST error on ${cleanEndpoint}:`, err.message);
      throw err;
    }
  },

  put: async (endpoint, payload) => {
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    try {
      const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return { data };
      } else {
        const err = await res.json().catch(() => ({ detail: 'Update failed' }));
        throw new Error(err.detail || 'Update failed');
      }
    } catch (err) {
      console.error(`[apiClient] PUT error on ${cleanEndpoint}:`, err.message);
      throw err;
    }
  },

  delete: async (endpoint) => {
    const cleanEndpoint = endpoint.replace(/^\/api/, '');
    try {
      const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return { data: true };
      } else {
        const err = await res.json().catch(() => ({ detail: 'Delete failed' }));
        throw new Error(err.detail || 'Delete failed');
      }
    } catch (err) {
      console.error(`[apiClient] DELETE error on ${cleanEndpoint}:`, err.message);
      throw err;
    }
  },

  // Auth Helpers
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};