from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models, schemas
from .routers import auth, transactions, reports, master_data

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Urban Furniture Accounting System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(master_data.router, prefix="/api/master-data", tags=["Master Data"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def read_root():
    return {"message": "Urban Furniture Accounting API is running"}
