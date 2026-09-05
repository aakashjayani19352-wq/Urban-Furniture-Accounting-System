// Mock Data
const mockData = {
  '/api/contacts': [
    { id: 1, name: 'Azure Furniture', email: 'contact@azure.com', type: 'Vendor' },
    { id: 2, name: 'Nimesh Pathak', email: 'nimesh@example.com', type: 'Customer' },
    { id: 3, name: 'Rahul Sharma', email: 'rahul@example.com', type: 'Vendor' }
  ],
  '/api/products': [
    { id: 1, name: 'Office Chair', price: 150.00 },
    { id: 2, name: 'Wooden Table', price: 300.00 },
    { id: 3, name: 'Sofa', price: 800.00 }
  ],
  '/api/accounts': [
    { id: 1, name: 'Cash', type: 'Asset' },
    { id: 2, name: 'Bank', type: 'Asset' },
    { id: 3, name: 'Purchases Expense', type: 'Expense' },
    { id: 4, name: 'Sales Income', type: 'Income' }
  ],
  '/api/purchases': [
    { id: 'PO-001', vendor: 'Azure Furniture', product: 'Wooden Table', qty: 10, total: 3000, status: 'Billed' },
    { id: 'PO-002', vendor: 'Rahul Sharma', product: 'Office Chair', qty: 5, total: 750, status: 'Draft' }
  ],
  '/api/sales': [
    { id: 'SO-001', customer: 'Nimesh Pathak', product: 'Office Chair', qty: 5, total: 750, status: 'Invoiced' }
  ]
};

// TODO: Replace with real endpoint paths and Axios/fetch when backend is ready
export const apiClient = {
  get: async (url) => { 
    console.log('GET', url); 
    return { data: mockData[url] || [] }; 
  },
  post: async (url, data) => { 
    console.log('POST', url, data); 
    return { data: { id: Math.floor(Math.random() * 1000), ...data } }; 
  },
  put: async (url, data) => { 
    console.log('PUT', url, data); 
    return { data }; 
  },
  delete: async (url) => { 
    console.log('DELETE', url); 
    return { data: true }; 
  },
};