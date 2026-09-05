from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Account, JournalEntry, JournalEntryLine, AnalyticAccount, Budget, User
from app.schemas import ProfitLossReport, BalanceSheetReport, BudgetReport
from app.auth import require_role

router = APIRouter(prefix="/api/reports", tags=["Financial Reports"])

@router.get("/profit-loss", response_model=ProfitLossReport)
def profit_loss(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    query = db.query(
        Account.code, Account.name, Account.type,
        func.sum(JournalEntryLine.debit).label("total_debit"),
        func.sum(JournalEntryLine.credit).label("total_credit")
    ).join(JournalEntryLine, Account.id == JournalEntryLine.account_id)\
     .join(JournalEntry, JournalEntryLine.journal_entry_id == JournalEntry.id)\
     .filter(Account.type.in_(["income", "expense"]))

    if start_date:
        query = query.filter(JournalEntry.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(JournalEntry.date <= datetime.fromisoformat(end_date))

    results = query.group_by(Account.id, Account.code, Account.name, Account.type).all()

    rev_breakdown, exp_breakdown = [], []
    tot_rev, tot_exp = 0.0, 0.0

    for r in results:
        net = (r.total_credit or 0.0) - (r.total_debit or 0.0) if r.type == "income" else (r.total_debit or 0.0) - (r.total_credit or 0.0)
        item = {"account_code": r.code, "account_name": r.name, "amount": round(net, 2)}
        if r.type == "income":
            rev_breakdown.append(item)
            tot_rev += net
        else:
            exp_breakdown.append(item)
            tot_exp += net

    return {
        "period_start": start_date,
        "period_end": end_date,
        "total_revenue": round(tot_rev, 2),
        "total_expenses": round(tot_exp, 2),
        "net_profit": round(tot_rev - tot_exp, 2),
        "revenue_breakdown": rev_breakdown,
        "expense_breakdown": exp_breakdown
    }

@router.get("/balance-sheet", response_model=BalanceSheetReport)
def balance_sheet(
    as_of_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    as_of = datetime.fromisoformat(as_of_date) if as_of_date else datetime.now(timezone.utc)


    results = db.query(
        Account.code, Account.name, Account.type,
        func.sum(JournalEntryLine.debit).label("total_debit"),
        func.sum(JournalEntryLine.credit).label("total_credit")
    ).join(JournalEntryLine, Account.id == JournalEntryLine.account_id)\
     .join(JournalEntry, JournalEntryLine.journal_entry_id == JournalEntry.id)\
     .filter(JournalEntry.date <= as_of)\
     .group_by(Account.id, Account.code, Account.name, Account.type).all()

    pnl = profit_loss(end_date=as_of.isoformat(), db=db, current_user=current_user)
    net_profit = pnl["net_profit"]

    assets, liab, cap = [], [], []
    tot_asset, tot_liab, tot_cap = 0.0, 0.0, 0.0

    for r in results:
        deb, cred = r.total_debit or 0.0, r.total_credit or 0.0
        if r.type == "asset":
            bal = deb - cred
            assets.append({"account_code": r.code, "account_name": r.name, "balance": round(bal, 2)})
            tot_asset += bal
        elif r.type == "liability":
            bal = cred - deb
            liab.append({"account_code": r.code, "account_name": r.name, "balance": round(bal, 2)})
            tot_liab += bal
        elif r.type == "capital":
            bal = cred - deb
            cap.append({"account_code": r.code, "account_name": r.name, "balance": round(bal, 2)})
            tot_cap += bal

    if net_profit != 0:
        cap.append({"account_code": "RET-EARN", "account_name": "Current Net Profit", "balance": net_profit})
        tot_cap += net_profit

    return {
        "as_of_date": as_of.isoformat(),
        "total_assets": round(tot_asset, 2),
        "total_liabilities": round(tot_liab, 2),
        "total_capital": round(tot_cap, 2),
        "net_profit": net_profit,
        "assets_breakdown": assets,
        "liabilities_breakdown": liab,
        "capital_breakdown": cap
    }

@router.get("/budget", response_model=BudgetReport)
def budget_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    budgets = db.query(Budget).all()
    items = []
    for b in budgets:
        analytic = db.query(AnalyticAccount).filter(AnalyticAccount.id == b.analytic_account_id).first()
        a_name = analytic.name if analytic else "General"
        a_type = analytic.type if analytic else "expenses"

        sum_line = db.query(
            func.sum(JournalEntryLine.debit).label("deb"),
            func.sum(JournalEntryLine.credit).label("cred")
        ).filter(JournalEntryLine.analytic_account_id == b.analytic_account_id).first()

        deb = sum_line.deb or 0.0
        cred = sum_line.cred or 0.0
        actual = (deb - cred) if a_type == "expenses" else (cred - deb)
        actual = round(actual, 2)

        items.append({
            "budget_id": b.id,
            "budget_name": b.name,
            "analytic_account_name": a_name,
            "type": a_type,
            "planned_amount": b.planned_amount,
            "actual_amount": actual,
            "variance": round(b.planned_amount - actual, 2),
            "achievement_percentage": round((actual / b.planned_amount * 100), 1) if b.planned_amount > 0 else 0.0
        })
    return {"items": items}
