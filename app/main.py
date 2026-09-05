from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth_routes, contacts, products, accounts, journals, transactions, reports

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Urban Furniture Accounting System API",
    description="Hackathon accounting backend supporting double-entry ledger, master data, transactions, and live financial reporting.",
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
app.include_router(accounts.router)
app.include_router(journals.router)
app.include_router(transactions.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "system": "Urban Furniture Accounting System API",
        "status": "online",
        "docs": "/docs"
    }
