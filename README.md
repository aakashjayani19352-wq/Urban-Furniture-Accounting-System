# Urban Furniture Accounting System

A production-grade, double-entry accounting and financial management web application built for the Urban Furniture hackathon problem statement.

---

## 🌟 Key Features

### 1. Master Data Management
- **Contact Master**: Manage Customers, Vendors, and Both with detailed address, city, state, pincode, email, and mobile info. Role-filtered for data privacy.
- **Product Master**: Manage Goods (stockable), Services, and Combo packages with automated unit profit margin calculation.
- **Chart of Accounts (COA)**: Standard accounting structure classified into Assets, Liabilities, Capital / Equity, Income, and Expenses.
- **Financial Journals**: Group transactions into dedicated books (Sales, Purchase, Bank, Cash, General).

### 2. Transaction Flow (Double-Entry State Machine)
- **Procure to Pay**:
  - Create Purchase Order (Draft) → **Convert to Vendor Bill** → Auto-generates balanced Journal Entry (Debit Purchase Expense / COGS, Credit Accounts Payable).
  - **Register Payment** via Bank or Cash → Auto-generates balanced Journal Entry (Debit Accounts Payable, Credit Bank/Cash).
- **Order to Cash**:
  - Create Sales Order (Draft) → **Generate Customer Invoice** → Auto-generates balanced Journal Entry (Debit Accounts Receivable, Credit Sales Revenue).
  - **Receive Payment** via Bank or Cash → Auto-generates balanced Journal Entry (Debit Bank/Cash, Credit Accounts Receivable).
- **Journal Entries Viewer & Manual Entry**:
  - View all ledger entries with individual debit/credit legs and verify that `Total Debit == Total Credit`.
  - Create custom balanced journal entries with real-time live balance validation.

### 3. Budgets & Analytic Accounts (Cost Centers)
- Tag transactions with Analytic Accounts (e.g. "Showroom Expansion", "Marketing").
- Set up planned budgets with periods, responsible managers, and track actual expenditure vs planned budget.

### 4. Real-Time Financial Reports (with Interactive Recharts)
- **Balance Sheet**: Assets = Liabilities + Capital + Current Net Profit (verified double-entry balance).
- **Profit & Loss (P&L)**: Operating revenue minus cost of goods sold and expenses = Net Profit.
- **Budget Report**: Planned amount vs actual expenditure vs variance & achievement percentage with interactive bar charts.

---

## 👥 Pre-seeded Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin (Business Owner)** | `admin@urbanfurniture.com` | `admin123` | Full administrative control, all master data, transactions, reports, and user management. |
| **Invoicing User (Accountant)** | `accountant@urbanfurniture.com` | `accountant123` | Create master data, record PO/SO/Bills/Invoices/Payments, and view reports. |
| **Contact (Customer / Vendor)** | `customer@tejas.com` | `customer123` | View own contact record, invoices, bills, and make payments. |

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python run.py
```
- API will be live at: **http://localhost:8000**
- Interactive Swagger API docs: **http://localhost:8000/docs**
- *Note*: The backend automatically connects to PostgreSQL if `DATABASE_URL` is set, and seamlessly falls back to local SQLite (`urban_accounting.db`) if Docker or Postgres is offline.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- Frontend will be live at: **http://localhost:5173**

---

## 🧪 Automated Testing

Run the complete backend double-entry and document workflow test suite:

```bash
cd backend
pytest tests/test_accounting.py -v
```

Verified tests:
1. `test_unbalanced_journal_entry_rejection`: Enforces `Debit == Credit` double-entry constraint.
2. `test_sale_purchase_payment_flow_and_reports`: Tests end-to-end sales, payments, P&L, and Balance Sheet calculations.
3. `test_purchase_order_to_bill_and_payment_flow`: Tests PO creation → conversion to Vendor Bill → payment registration.
4. `test_sales_order_to_invoice_and_payment_flow`: Tests SO creation → generation of Customer Invoice → payment receipt.
