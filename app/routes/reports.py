from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import ProfitLossReport, BalanceSheetReport, BudgetReport
from app.services.accounting import (
    calculate_profit_and_loss, calculate_balance_sheet, calculate_budget_report
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/reports", tags=["Financial Reports"])

@router.get("/profit-loss", response_model=ProfitLossReport)
def get_profit_loss_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    s_date = datetime.fromisoformat(start_date) if start_date else None
    e_date = datetime.fromisoformat(end_date) if end_date else None
    return calculate_profit_and_loss(db, start_date=s_date, end_date=e_date)

@router.get("/balance-sheet", response_model=BalanceSheetReport)
def get_balance_sheet_report(
    as_of_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    as_of = datetime.fromisoformat(as_of_date) if as_of_date else None
    return calculate_balance_sheet(db, as_of_date=as_of)

@router.get("/budget", response_model=BudgetReport)
def get_budget_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    items = calculate_budget_report(db)
    return {"items": items}
