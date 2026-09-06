import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.routes import auth_routes, contacts, products, transactions, reports, budgets
from app.seed import seed_database

# Configure request logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("urban_accounting")

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
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# D4: Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 1)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)")
    return response

# D3: Global exception handler — never return raw stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please contact support if this persists."}
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

