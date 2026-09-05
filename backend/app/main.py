from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth_routes, contacts, products, transactions, reports, budgets
from app.seed import seed_database

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

# Auto-seed initial accounts, journals, and demo users if empty
try:
    seed_database()
except Exception as e:
    print(f"Startup seed notice: {e}")

app = FastAPI(
    title="Urban Furniture Accounting System API",
    description="Double-entry accounting system API for Urban Furniture.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_routes.router)
app.include_router(contacts.router)
app.include_router(products.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "system": "Urban Furniture Accounting System",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "contacts": "/api/contacts",
            "products": "/api/products",
            "accounts": "/api/accounts",
            "journals": "/api/journals",
            "transactions": "/api/transactions",
            "purchase_orders": "/api/purchase-orders",
            "sales_orders": "/api/sales-orders",
            "budgets": "/api/budgets",
            "reports": "/api/reports"
        }
    }
