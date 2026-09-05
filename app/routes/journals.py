from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Journal, AnalyticAccount, Budget, User
from app.schemas import (
    JournalCreate, JournalResponse, 
    AnalyticAccountCreate, AnalyticAccountResponse,
    BudgetCreate, BudgetResponse
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/journals", tags=["Journals & Budgets"])

@router.post("", response_model=JournalResponse, status_code=201)
def create_journal(
    data: JournalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    journal = Journal(**data.model_dump())
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal

@router.get("", response_model=List[JournalResponse])
def list_journals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Journal).all()

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

@router.get("/analytic-accounts", response_model=List[AnalyticAccountResponse])
def list_analytic_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AnalyticAccount).all()

@router.post("/budgets", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    budget = Budget(**data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.get("/budgets", response_model=List[BudgetResponse])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Budget).all()
