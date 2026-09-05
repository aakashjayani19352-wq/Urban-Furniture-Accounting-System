from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Invoice, Payment, User
from app.schemas import (
    SaleTransactionCreate, PurchaseTransactionCreate, PaymentCreate,
    InvoiceResponse, JournalEntryCreate, JournalEntryResponse
)
from app.services.accounting import (
    create_sale_transaction, create_purchase_transaction, process_payment,
    validate_and_create_journal_entry
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.post("/sale", response_model=InvoiceResponse, status_code=201)
def record_sale(
    data: SaleTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    return create_sale_transaction(db, data)

@router.post("/purchase", response_model=InvoiceResponse, status_code=201)
def record_purchase(
    data: PurchaseTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    return create_purchase_transaction(db, data)

@router.post("/payment", status_code=201)
def record_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    payment = process_payment(db, data)
    return {
        "message": "Payment recorded successfully",
        "payment_id": payment.id,
        "amount": payment.amount,
        "invoice_status": payment.invoice.status
    }

@router.get("/invoices", response_model=List[InvoiceResponse])
def list_invoices(
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if current_user.role == "contact":
        from app.models import Contact
        contact = db.query(Contact).filter(Contact.email == current_user.email).first()
        if not contact:
            return []
        query = query.filter(Invoice.contact_id == contact.id)
    elif transaction_type:
        query = query.filter(Invoice.transaction_type == transaction_type)
    return query.order_by(Invoice.date.desc()).all()

@router.get("/invoices/{id}", response_model=InvoiceResponse)
def get_invoice(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice or Bill not found")

    if current_user.role == "contact":
        from app.models import Contact
        contact = db.query(Contact).filter(Contact.email == current_user.email).first()
        if not contact or invoice.contact_id != contact.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return invoice

@router.post("/journal-entries", response_model=JournalEntryResponse, status_code=201)
def create_custom_journal_entry(
    data: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    lines_dicts = [line.model_dump() for line in data.lines]
    entry = validate_and_create_journal_entry(
        db,
        journal_id=data.journal_id,
        lines_data=lines_dicts,
        reference=data.reference,
        entry_date=data.date
    )
    db.commit()
    db.refresh(entry)
    return entry
