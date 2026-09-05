# Urban Furniture Accounting System - Backend Core

A hackathon-ready double-entry accounting backend built with **FastAPI**, **SQLAlchemy**, **Pydantic v2**, and **PostgreSQL** (with instant SQLite fallback for fast local testing).

---

## Features

- **Master Data Management**: CRUD APIs for Contacts (Customers/Vendors), Products (Goods/Services), Chart of Accounts, and Journals.
- **Double-Entry Accounting Engine**: Automatically generates balanced journal entries for Sales Orders, Invoices, Purchase Bills, and Payments.
- **Strict Validation**: Rejects unbalanced journal entries (`Total Debit != Total Credit`) inside database transactions.
- **Role-Based Authentication**: Clean JWT authentication with 3 user roles (`admin`, `invoicing_user`, `contact`).
- **Live Financial Reports**: Real-time aggregation of **Profit & Loss**, **Balance Sheet**, and **Budget Reports** from live journal entry line items.

---

## Quick Start (Local Setup)

### 1. Install Dependencies

Ensure Python 3.10+ is installed, then run:

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

*Note: If PostgreSQL is not running locally, the application automatically uses SQLite (`urban_accounting.db`) so you can run and evaluate the system immediately.*

### 3. (Optional) Run PostgreSQL via Docker Compose

```bash
docker-compose up -d
```

### 4. Seed Demo Data

Populate default Chart of Accounts, admin user, sample contacts, products, journals, analytic accounts, budgets, and transactions:

```bash
python seed.py
```

Demo Login Credentials:
- **Admin**: `admin@urbanfurniture.com` / `admin123`
- **Accountant**: `accountant@urbanfurniture.com` / `accountant123`
- **Client**: `customer@tejas.com` / `customer123`

### 5. Launch FastAPI Backend Server

```bash
uvicorn app.main:app --reload
```

The backend server runs locally at:
- **Root**: `http://localhost:8000`
- **Interactive Swagger OpenAPI Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Running Automated Verification Tests

```bash
python -m pytest -v
```

---

## Main API Endpoints Summary

### Authentication
- `POST /api/auth/signup`: Register user
- `POST /api/auth/login`: Authenticate and receive JWT access token
- `GET /api/auth/me`: Get active user profile

### Master Data
- `GET /api/contacts` | `POST /api/contacts` | `PUT /api/contacts/{id}`
- `GET /api/products` | `POST /api/products` | `PUT /api/products/{id}`
- `GET /api/accounts` | `POST /api/accounts` (Chart of Accounts)
- `GET /api/journals` | `POST /api/journals`

### Accounting Transactions
- `POST /api/transactions/sale`: Create Sale Order / Invoice (auto-generates journal entry)
- `POST /api/transactions/purchase`: Create Purchase / Vendor Bill (auto-generates journal entry)
- `POST /api/transactions/payment`: Register Payment (Cash/Bank)
- `POST /api/transactions/journal-entries`: Post custom double-entry journal entry

### Live Financial Reports
- `GET /api/reports/profit-loss`: Revenue, Expenses, and Net Profit
- `GET /api/reports/balance-sheet`: Assets = Liabilities + Equity / Capital
- `GET /api/reports/budget`: Planned vs. Actual budget performance
