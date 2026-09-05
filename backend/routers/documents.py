from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..utils.accounting import create_journal_entry_core

router = APIRouter()

def get_or_create_account(db: Session, name: str, acc_type: models.AccountTypeEnum) -> int:
    acc = db.query(models.ChartOfAccounts).filter_by(name=name, type=acc_type).first()
    if not acc:
        acc = models.ChartOfAccounts(name=name, type=acc_type)
        db.add(acc)
        db.flush()
    return acc.id

def get_or_create_journal(db: Session, name: str, j_type: str) -> int:
    j = db.query(models.Journal).filter_by(name=name, type=j_type).first()
    if not j:
        j = models.Journal(name=name, type=j_type)
        db.add(j)
        db.flush()
    return j.id

@router.post("/purchase-orders", response_model=schemas.PurchaseOrderOut)
def create_purchase_order(
    po_in: schemas.PurchaseOrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    po = models.PurchaseOrder(**po_in.model_dump())
    db.add(po)
    db.commit()
    db.refresh(po)
    return po

@router.post("/purchase-orders/{id}/bill", response_model=schemas.VendorBillOut)
def convert_to_bill(
    id: int,
    bill_in: schemas.VendorBillCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    po = db.query(models.PurchaseOrder).filter_by(id=id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    if po.status == "Billed":
        raise HTTPException(status_code=400, detail="Already billed")
        
    bill = models.VendorBill(
        purchase_order_id=id,
        invoice_date=bill_in.invoice_date,
        due_date=bill_in.due_date,
        status="Unpaid"
    )
    db.add(bill)
    po.status = "Billed"
    db.flush()
    
    # Auto-create Journal Entry: Debit Expense, Credit Creditor
    journal_id = get_or_create_journal(db, "Purchase Journal", "Purchase")
    expense_acc_id = get_or_create_account(db, "Purchase Expense", models.AccountTypeEnum.expense)
    creditor_acc_id = get_or_create_account(db, "Accounts Payable", models.AccountTypeEnum.liability)
    
    total_amount = po.qty * po.unit_price
    lines = [
        schemas.JournalEntryLineCreate(account_id=expense_acc_id, debit=total_amount, credit=0.0),
        schemas.JournalEntryLineCreate(account_id=creditor_acc_id, debit=0.0, credit=total_amount)
    ]
    create_journal_entry_core(db, journal_id, bill_in.invoice_date, f"Bill for PO {po.id}", lines)
    db.commit()
    db.refresh(bill)
    return bill

@router.post("/vendor-bills/{id}/payment", response_model=schemas.PaymentOut)
def pay_vendor_bill(
    id: int,
    payment_in: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bill = db.query(models.VendorBill).filter_by(id=id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Vendor Bill not found")
    if bill.status == "Paid":
        raise HTTPException(status_code=400, detail="Already paid")
        
    payment = models.Payment(**payment_in.model_dump())
    db.add(payment)
    bill.status = "Paid"
    db.flush()
    
    # Auto-create Journal Entry: Debit Creditor, Credit Bank/Cash
    journal_id = get_or_create_journal(db, "Bank Journal", "Bank")
    creditor_acc_id = get_or_create_account(db, "Accounts Payable", models.AccountTypeEnum.liability)
    bank_acc_id = get_or_create_account(db, "Bank Account", models.AccountTypeEnum.asset)
    
    lines = [
        schemas.JournalEntryLineCreate(account_id=creditor_acc_id, debit=payment_in.amount, credit=0.0),
        schemas.JournalEntryLineCreate(account_id=bank_acc_id, debit=0.0, credit=payment_in.amount)
    ]
    create_journal_entry_core(db, journal_id, payment_in.date, f"Payment for Bill {bill.id}", lines)
    db.commit()
    db.refresh(payment)
    return payment

@router.post("/sales-orders", response_model=schemas.SalesOrderOut)
def create_sales_order(
    so_in: schemas.SalesOrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    so = models.SalesOrder(**so_in.model_dump())
    db.add(so)
    db.commit()
    db.refresh(so)
    return so

@router.post("/sales-orders/{id}/invoice", response_model=schemas.CustomerInvoiceOut)
def convert_to_invoice(
    id: int,
    inv_in: schemas.CustomerInvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    so = db.query(models.SalesOrder).filter_by(id=id).first()
    if not so:
        raise HTTPException(status_code=404, detail="Sales Order not found")
    if so.status == "Invoiced":
        raise HTTPException(status_code=400, detail="Already invoiced")
        
    invoice = models.CustomerInvoice(
        sales_order_id=id,
        invoice_date=inv_in.invoice_date,
        due_date=inv_in.due_date,
        status="Unpaid"
    )
    db.add(invoice)
    so.status = "Invoiced"
    db.flush()
    
    # Auto-create Journal Entry: Debit Debtor, Credit Sales Income
    journal_id = get_or_create_journal(db, "Sales Journal", "Sales")
    debtor_acc_id = get_or_create_account(db, "Accounts Receivable", models.AccountTypeEnum.asset)
    income_acc_id = get_or_create_account(db, "Sales Income", models.AccountTypeEnum.income)
    
    total_amount = (so.qty * so.unit_price) + so.tax
    lines = [
        schemas.JournalEntryLineCreate(account_id=debtor_acc_id, debit=total_amount, credit=0.0),
        schemas.JournalEntryLineCreate(account_id=income_acc_id, debit=0.0, credit=total_amount)
    ]
    create_journal_entry_core(db, journal_id, inv_in.invoice_date, f"Invoice for SO {so.id}", lines)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.post("/customer-invoices/{id}/payment", response_model=schemas.PaymentOut)
def pay_customer_invoice(
    id: int,
    payment_in: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    invoice = db.query(models.CustomerInvoice).filter_by(id=id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Customer Invoice not found")
    if invoice.status == "Paid":
        raise HTTPException(status_code=400, detail="Already paid")
        
    payment = models.Payment(**payment_in.model_dump())
    db.add(payment)
    invoice.status = "Paid"
    db.flush()
    
    # Auto-create Journal Entry: Debit Bank/Cash, Credit Debtor
    journal_id = get_or_create_journal(db, "Bank Journal", "Bank")
    bank_acc_id = get_or_create_account(db, "Bank Account", models.AccountTypeEnum.asset)
    debtor_acc_id = get_or_create_account(db, "Accounts Receivable", models.AccountTypeEnum.asset)
    
    lines = [
        schemas.JournalEntryLineCreate(account_id=bank_acc_id, debit=payment_in.amount, credit=0.0),
        schemas.JournalEntryLineCreate(account_id=debtor_acc_id, debit=0.0, credit=payment_in.amount)
    ]
    create_journal_entry_core(db, journal_id, payment_in.date, f"Payment for Invoice {invoice.id}", lines)
    db.commit()
    db.refresh(payment)
    return payment
