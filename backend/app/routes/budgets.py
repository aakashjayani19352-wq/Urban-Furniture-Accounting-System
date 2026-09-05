from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AnalyticAccount, Budget, User
from app.schemas import (
    AnalyticAccountCreate, AnalyticAccountResponse,
    BudgetCreate, BudgetResponse
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Analytic Accounts & Budgets"])

@router.get("/analytic-accounts", response_model=List[AnalyticAccountResponse])
def list_analytic_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AnalyticAccount).order_by(AnalyticAccount.name.asc()).all()

@router.post("/analytic-accounts", response_model=AnalyticAccountResponse, status_code=201)
def create_analytic_account(
    data: AnalyticAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    account = AnalyticAccount(**data.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.get("/budgets", response_model=List[BudgetResponse])
def list_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Budget).order_by(Budget.created_at.desc()).all()

@router.post("/budgets", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    analytic = db.query(AnalyticAccount).filter(AnalyticAccount.id == data.analytic_account_id).first()
    if not analytic:
        raise HTTPException(status_code=404, detail="Analytic Account not found")

    budget = Budget(**data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget
