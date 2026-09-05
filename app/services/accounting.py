from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models import (
    Account, Journal, JournalEntry, JournalEntryLine, 
    Invoice, Payment, Contact, Product, AnalyticAccount, Budget
)
from app.schemas import (
    SaleTransactionCreate, PurchaseTransactionCreate, PaymentCreate,
    JournalEntryCreate
)

def generate_entry_number(db: Session, prefix: str = "JE") -> str:
    count = db.query(JournalEntry).count() + 1
    return f"{prefix}-{datetime.utcnow().strftime('%Y%m%d')}-{count:04d}"

def generate_invoice_number(db: Session, prefix: str = "INV") -> str:
    count = db.query(Invoice).count() + 1
    return f"{prefix}-{datetime.utcnow().strftime('%Y%m%d')}-{count:04d}"

def get_account_by_code_or_type(db: Session, code: str, default_type: str) -> Account:
    account = db.query(Account).filter(Account.code == code).first()
    if not account:
        account = db.query(Account).filter(Account.type == default_type).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing default {default_type} account in Chart of Accounts"
        )
    return account

def validate_and_create_journal_entry(
    db: Session,
    journal_id: int,
    lines_data: List[Dict],
    reference: Optional[str] = None,
    entry_date: Optional[datetime] = None
) -> JournalEntry:
    total_debit = sum(round(float(line.get("debit", 0.0)), 2) for line in lines_data)
    total_credit = sum(round(float(line.get("credit", 0.0)), 2) for line in lines_data)

    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unbalanced journal entry: Total Debit ({total_debit:.2f}) does not equal Total Credit ({total_credit:.2f})"
        )

    entry = JournalEntry(
        journal_id=journal_id,
        entry_number=generate_entry_number(db),
        date=entry_date or datetime.utcnow(),
        reference=reference,
        is_posted=True
    )
    db.add(entry)
    db.flush()

    for line in lines_data:
        entry_line = JournalEntryLine(
            journal_entry_id=entry.id,
            account_id=line["account_id"],
            analytic_account_id=line.get("analytic_account_id"),
            debit=round(float(line.get("debit", 0.0)), 2),
            credit=round(float(line.get("credit", 0.0)), 2),
            description=line.get("description", reference)
        )
        db.add(entry_line)

    return entry

def create_sale_transaction(db: Session, data: SaleTransactionCreate) -> Invoice:
    contact = db.query(Contact).filter(Contact.id == data.customer_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Customer contact not found")
    
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    subtotal = round(data.quantity * data.unit_price, 2)
    total_amount = round(subtotal + data.tax, 2)

    sales_journal = db.query(Journal).filter(Journal.type == "sales").first()
    if not sales_journal:
        sales_journal = Journal(name="Sales Journal", type="sales")
        db.add(sales_journal)
        db.flush()

    ar_account = get_account_by_code_or_type(db, "1100", "asset")
    sales_account = get_account_by_code_or_type(db, "4000", "income")

    debit_account_id = ar_account.id
    if data.payment_method == "cash":
        cash_acc = get_account_by_code_or_type(db, "1010", "asset")
        debit_account_id = cash_acc.id
    elif data.payment_method == "bank":
        bank_acc = get_account_by_code_or_type(db, "1020", "asset")
        debit_account_id = bank_acc.id

    lines = [
        {
            "account_id": debit_account_id,
            "debit": total_amount,
            "credit": 0.0,
            "description": f"Sale to {contact.name} - {product.name}",
            "analytic_account_id": data.analytic_account_id
        },
        {
            "account_id": sales_account.id,
            "debit": 0.0,
            "credit": total_amount,
            "description": f"Sales Revenue for {product.name}",
            "analytic_account_id": data.analytic_account_id
        }
    ]

    is_paid = data.payment_method in ["cash", "bank"]
    invoice_status = "paid" if is_paid else "unpaid"
    paid_amount = total_amount if is_paid else 0.0

    try:
        journal_entry = validate_and_create_journal_entry(
            db, journal_id=sales_journal.id, lines_data=lines, reference=f"Sale #{product.name}"
        )

        invoice = Invoice(
            transaction_type="sale",
            contact_id=contact.id,
            invoice_number=generate_invoice_number(db, "INV"),
            total_amount=total_amount,
            paid_amount=paid_amount,
            status=invoice_status,
            journal_entry_id=journal_entry.id
        )
        db.add(invoice)

        if is_paid:
            payment = Payment(
                invoice=invoice,
                payment_method=data.payment_method,
                amount=total_amount,
                reference="Immediate Sale Payment",
                journal_entry_id=journal_entry.id
            )
            db.add(payment)

        db.commit()
        db.refresh(invoice)
        return invoice
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def create_purchase_transaction(db: Session, data: PurchaseTransactionCreate) -> Invoice:
    contact = db.query(Contact).filter(Contact.id == data.vendor_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Vendor contact not found")
    
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    total_amount = round(data.quantity * data.unit_price, 2)

    purchase_journal = db.query(Journal).filter(Journal.type == "purchase").first()
    if not purchase_journal:
        purchase_journal = Journal(name="Purchase Journal", type="purchase")
        db.add(purchase_journal)
        db.flush()

    expense_account = get_account_by_code_or_type(db, "5000", "expense")
    ap_account = get_account_by_code_or_type(db, "2000", "liability")

    credit_account_id = ap_account.id
    if data.payment_method == "cash":
        cash_acc = get_account_by_code_or_type(db, "1010", "asset")
        credit_account_id = cash_acc.id
    elif data.payment_method == "bank":
        bank_acc = get_account_by_code_or_type(db, "1020", "asset")
        credit_account_id = bank_acc.id

    lines = [
        {
            "account_id": expense_account.id,
            "debit": total_amount,
            "credit": 0.0,
            "description": f"Purchase from {contact.name} - {product.name}",
            "analytic_account_id": data.analytic_account_id
        },
        {
            "account_id": credit_account_id,
            "debit": 0.0,
            "credit": total_amount,
            "description": f"Payable for {product.name}",
            "analytic_account_id": data.analytic_account_id
        }
    ]

    is_paid = data.payment_method in ["cash", "bank"]
    invoice_status = "paid" if is_paid else "unpaid"
    paid_amount = total_amount if is_paid else 0.0

    try:
        journal_entry = validate_and_create_journal_entry(
            db, journal_id=purchase_journal.id, lines_data=lines, reference=f"Purchase #{product.name}"
        )

        bill = Invoice(
            transaction_type="purchase",
            contact_id=contact.id,
            invoice_number=generate_invoice_number(db, "BILL"),
            total_amount=total_amount,
            paid_amount=paid_amount,
            status=invoice_status,
            journal_entry_id=journal_entry.id
        )
        db.add(bill)

        if is_paid:
            payment = Payment(
                invoice=bill,
                payment_method=data.payment_method,
                amount=total_amount,
                reference="Immediate Purchase Payment",
                journal_entry_id=journal_entry.id
            )
            db.add(payment)

        db.commit()
        db.refresh(bill)
        return bill
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def process_payment(db: Session, data: PaymentCreate) -> Payment:
    invoice = db.query(Invoice).filter(Invoice.id == data.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice or Bill not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Duplicate payment error: Invoice is already fully paid")

    remaining_balance = round(invoice.total_amount - invoice.paid_amount, 2)
    if data.amount > remaining_balance + 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"Payment amount ({data.amount:.2f}) exceeds outstanding amount ({remaining_balance:.2f})"
        )

    payment_journal_type = "cash" if data.payment_method == "cash" else "bank"
    journal = db.query(Journal).filter(Journal.type == payment_journal_type).first()
    if not journal:
        journal = Journal(name=f"{payment_journal_type.capitalize()} Journal", type=payment_journal_type)
        db.add(journal)
        db.flush()

    payment_account_code = "1010" if data.payment_method == "cash" else "1020"
    payment_account = get_account_by_code_or_type(db, payment_account_code, "asset")

    if invoice.transaction_type == "sale":
        ar_account = get_account_by_code_or_type(db, "1100", "asset")
        lines = [
            {"account_id": payment_account.id, "debit": data.amount, "credit": 0.0, "description": f"Payment received for {invoice.invoice_number}"},
            {"account_id": ar_account.id, "debit": 0.0, "credit": data.amount, "description": f"Clear AR for {invoice.invoice_number}"}
        ]
    else:
        ap_account = get_account_by_code_or_type(db, "2000", "liability")
        lines = [
            {"account_id": ap_account.id, "debit": data.amount, "credit": 0.0, "description": f"Payment made for {invoice.invoice_number}"},
            {"account_id": payment_account.id, "debit": 0.0, "credit": data.amount, "description": f"Clear AP for {invoice.invoice_number}"}
        ]

    try:
        entry = validate_and_create_journal_entry(
            db, journal_id=journal.id, lines_data=lines, reference=f"Payment for {invoice.invoice_number}"
        )

        payment = Payment(
            invoice_id=invoice.id,
            payment_method=data.payment_method,
            amount=data.amount,
            reference=data.reference or f"Payment for {invoice.invoice_number}",
            journal_entry_id=entry.id
        )
        db.add(payment)

        invoice.paid_amount = round(invoice.paid_amount + data.amount, 2)
        if invoice.paid_amount >= invoice.total_amount - 0.01:
            invoice.status = "paid"
        else:
            invoice.status = "partial"

        db.commit()
        db.refresh(payment)
        return payment
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def calculate_profit_and_loss(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict:
    query = db.query(
        Account.id, Account.code, Account.name, Account.type,
        func.sum(JournalEntryLine.debit).label("total_debit"),
        func.sum(JournalEntryLine.credit).label("total_credit")
    ).join(JournalEntryLine, Account.id == JournalEntryLine.account_id)\
     .join(JournalEntry, JournalEntryLine.journal_entry_id == JournalEntry.id)\
     .filter(Account.type.in_(["income", "expense"]))

    if start_date:
        query = query.filter(JournalEntry.date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.date <= end_date)

    query = query.group_by(Account.id, Account.code, Account.name, Account.type)
    results = query.all()

    revenue_breakdown = []
    expense_breakdown = []
    total_revenue = 0.0
    total_expenses = 0.0

    for acc in results:
        net_amount = (acc.total_credit or 0.0) - (acc.total_debit or 0.0) if acc.type == "income" else (acc.total_debit or 0.0) - (acc.total_credit or 0.0)
        item = {"account_code": acc.code, "account_name": acc.name, "amount": round(net_amount, 2)}
        if acc.type == "income":
            revenue_breakdown.append(item)
            total_revenue += net_amount
        else:
            expense_breakdown.append(item)
            total_expenses += net_amount

    net_profit = round(total_revenue - total_expenses, 2)
    return {
        "period_start": start_date.isoformat() if start_date else None,
        "period_end": end_date.isoformat() if end_date else None,
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": net_profit,
        "revenue_breakdown": revenue_breakdown,
        "expense_breakdown": expense_breakdown
    }

def calculate_balance_sheet(db: Session, as_of_date: Optional[datetime] = None) -> Dict:
    as_of = as_of_date or datetime.utcnow()
    query = db.query(
        Account.id, Account.code, Account.name, Account.type,
        func.sum(JournalEntryLine.debit).label("total_debit"),
        func.sum(JournalEntryLine.credit).label("total_credit")
    ).join(JournalEntryLine, Account.id == JournalEntryLine.account_id)\
     .join(JournalEntry, JournalEntryLine.journal_entry_id == JournalEntry.id)\
     .filter(JournalEntry.date <= as_of)\
     .group_by(Account.id, Account.code, Account.name, Account.type)

    results = query.all()

    assets_breakdown = []
    liabilities_breakdown = []
    capital_breakdown = []

    total_assets = 0.0
    total_liabilities = 0.0
    total_capital = 0.0

    # Also compute retained earnings (net profit up to as_of_date)
    pnl = calculate_profit_and_loss(db, end_date=as_of)
    net_profit = pnl["net_profit"]

    for acc in results:
        debit = acc.total_debit or 0.0
        credit = acc.total_credit or 0.0
        if acc.type == "asset":
            balance = debit - credit
            assets_breakdown.append({"account_code": acc.code, "account_name": acc.name, "balance": round(balance, 2)})
            total_assets += balance
        elif acc.type == "liability":
            balance = credit - debit
            liabilities_breakdown.append({"account_code": acc.code, "account_name": acc.name, "balance": round(balance, 2)})
            total_liabilities += balance
        elif acc.type == "capital":
            balance = credit - debit
            capital_breakdown.append({"account_code": acc.code, "account_name": acc.name, "balance": round(balance, 2)})
            total_capital += balance

    if net_profit != 0:
        capital_breakdown.append({"account_code": "RET-EARN", "account_name": "Current Period Net Profit (Retained Earnings)", "balance": net_profit})
        total_capital += net_profit

    return {
        "as_of_date": as_of.isoformat(),
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "total_capital": round(total_capital, 2),
        "net_profit": net_profit,
        "assets_breakdown": assets_breakdown,
        "liabilities_breakdown": liabilities_breakdown,
        "capital_breakdown": capital_breakdown
    }

def calculate_budget_report(db: Session) -> List[Dict]:
    budgets = db.query(Budget).all()
    items = []
    for b in budgets:
        analytic = db.query(AnalyticAccount).filter(AnalyticAccount.id == b.analytic_account_id).first()
        analytic_name = analytic.name if analytic else "Unknown"
        analytic_type = analytic.type if analytic else "expenses"

        lines_sum = db.query(
            func.sum(JournalEntryLine.debit).label("total_debit"),
            func.sum(JournalEntryLine.credit).label("total_credit")
        ).filter(JournalEntryLine.analytic_account_id == b.analytic_account_id).first()

        debit = lines_sum.total_debit or 0.0
        credit = lines_sum.total_credit or 0.0

        actual = (debit - credit) if analytic_type == "expenses" else (credit - debit)
        actual = round(actual, 2)
        variance = round(b.planned_amount - actual, 2)
        pct = round((actual / b.planned_amount * 100.0), 1) if b.planned_amount > 0 else 0.0

        items.append({
            "budget_id": b.id,
            "budget_name": b.name,
            "analytic_account_name": analytic_name,
            "type": analytic_type,
            "planned_amount": b.planned_amount,
            "actual_amount": actual,
            "variance": variance,
            "achievement_percentage": pct
        })
    return items
