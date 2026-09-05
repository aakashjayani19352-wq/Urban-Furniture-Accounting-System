from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Account, Journal, JournalEntry, JournalEntryLine, 
    Invoice, Payment, Contact, Product, User,
    PurchaseOrder, SalesOrder
)
from app.schemas import (
    AccountCreate, AccountResponse, JournalCreate, JournalResponse,
    SaleTransactionCreate, PurchaseTransactionCreate, PaymentCreate,
    InvoiceResponse, JournalEntryCreate, JournalEntryResponse,
    PurchaseOrderCreate, PurchaseOrderResponse, ConvertToBillRequest,
    SalesOrderCreate, SalesOrderResponse, ConvertToInvoiceRequest
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Transactions & Accounting"])

# Helper function to create & validate balanced journal entry
def create_balanced_entry(db: Session, journal_id: int, lines: list, reference: str = None):
    total_debit = sum(round(float(l.get("debit", 0.0)), 2) for l in lines)
    total_credit = sum(round(float(l.get("credit", 0.0)), 2) for l in lines)

    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Unbalanced journal entry: Total Debit ({total_debit:.2f}) does not equal Total Credit ({total_credit:.2f})"
        )

    count = db.query(JournalEntry).count() + 1
    entry_num = f"JE-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:04d}"

    entry = JournalEntry(
        journal_id=journal_id,
        entry_number=entry_num,
        reference=reference,
        is_posted=True
    )
    db.add(entry)
    db.flush()

    for line in lines:
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

# Chart of Accounts Endpoints
@router.get("/accounts", response_model=List[AccountResponse])
def list_accounts(account_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Account)
    if account_type:
        query = query.filter(Account.type == account_type)
    return query.order_by(Account.code.asc()).all()

@router.post("/accounts", response_model=AccountResponse, status_code=201)
def create_account(
    data: AccountCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    if db.query(Account).filter(Account.code == data.code).first():
        raise HTTPException(status_code=400, detail="Account code already exists")
    acc = Account(**data.model_dump())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

# Journals Endpoints
@router.get("/journals", response_model=List[JournalResponse])
def list_journals(db: Session = Depends(get_db)):
    return db.query(Journal).all()

# Direct Journal Entry Creation
@router.post("/transactions/journal-entries", response_model=JournalEntryResponse, status_code=201)
def create_custom_journal_entry(
    data: JournalEntryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    lines_dicts = [l.model_dump() for l in data.lines]
    entry = create_balanced_entry(db, data.journal_id, lines_dicts, data.reference)
    db.commit()
    db.refresh(entry)
    return entry

# Sale Transaction Flow
@router.post("/transactions/sale", response_model=InvoiceResponse, status_code=201)
def record_sale(
    data: SaleTransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    customer = db.query(Contact).filter(Contact.id == data.customer_id).first()
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not customer or not product:
        raise HTTPException(status_code=404, detail="Customer or Product not found")

    total_amount = round((data.quantity * data.unit_price) + data.tax, 2)
    journal = db.query(Journal).filter(Journal.type == "sales").first()
    if not journal:
        journal = Journal(name="Sales Journal", type="sales")
        db.add(journal)
        db.flush()

    ar_acc = db.query(Account).filter(Account.code == "1100").first() or db.query(Account).filter(Account.type == "asset").first()
    sales_acc = db.query(Account).filter(Account.code == "4000").first() or db.query(Account).filter(Account.type == "income").first()

    debit_acc_id = ar_acc.id
    if data.payment_method == "cash":
        debit_acc_id = (db.query(Account).filter(Account.code == "1010").first() or ar_acc).id
    elif data.payment_method == "bank":
        debit_acc_id = (db.query(Account).filter(Account.code == "1020").first() or ar_acc).id

    lines = [
        {"account_id": debit_acc_id, "debit": total_amount, "credit": 0.0, "description": f"Sale to {customer.name}", "analytic_account_id": data.analytic_account_id},
        {"account_id": sales_acc.id, "debit": 0.0, "credit": total_amount, "description": f"Revenue for {product.name}", "analytic_account_id": data.analytic_account_id}
    ]

    is_paid = data.payment_method in ["cash", "bank"]
    count = db.query(Invoice).count() + 1
    inv_num = f"INV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:04d}"

    try:
        entry = create_balanced_entry(db, journal.id, lines, f"Sale #{product.name}")
        invoice = Invoice(
            transaction_type="sale",
            contact_id=customer.id,
            invoice_number=inv_num,
            total_amount=total_amount,
            paid_amount=total_amount if is_paid else 0.0,
            status="paid" if is_paid else "unpaid",
            journal_entry_id=entry.id
        )
        db.add(invoice)
        if is_paid:
            db.add(Payment(invoice=invoice, payment_method=data.payment_method, amount=total_amount, reference="Sale Payment", journal_entry_id=entry.id))
        db.commit()
        db.refresh(invoice)
        return invoice
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# Purchase Transaction Flow
@router.post("/transactions/purchase", response_model=InvoiceResponse, status_code=201)
def record_purchase(
    data: PurchaseTransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    vendor = db.query(Contact).filter(Contact.id == data.vendor_id).first()
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not vendor or not product:
        raise HTTPException(status_code=404, detail="Vendor or Product not found")

    total_amount = round(data.quantity * data.unit_price, 2)
    journal = db.query(Journal).filter(Journal.type == "purchase").first()
    if not journal:
        journal = Journal(name="Purchase Journal", type="purchase")
        db.add(journal)
        db.flush()

    exp_acc = db.query(Account).filter(Account.code == "5000").first() or db.query(Account).filter(Account.type == "expense").first()
    ap_acc = db.query(Account).filter(Account.code == "2000").first() or db.query(Account).filter(Account.type == "liability").first()

    credit_acc_id = ap_acc.id
    if data.payment_method == "cash":
        credit_acc_id = (db.query(Account).filter(Account.code == "1010").first() or ap_acc).id
    elif data.payment_method == "bank":
        credit_acc_id = (db.query(Account).filter(Account.code == "1020").first() or ap_acc).id

    lines = [
        {"account_id": exp_acc.id, "debit": total_amount, "credit": 0.0, "description": f"Purchase from {vendor.name}", "analytic_account_id": data.analytic_account_id},
        {"account_id": credit_acc_id, "debit": 0.0, "credit": total_amount, "description": f"Payable for {product.name}", "analytic_account_id": data.analytic_account_id}
    ]

    is_paid = data.payment_method in ["cash", "bank"]
    count = db.query(Invoice).count() + 1
    bill_num = f"BILL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:04d}"

    try:
        entry = create_balanced_entry(db, journal.id, lines, f"Purchase #{product.name}")
        bill = Invoice(
            transaction_type="purchase",
            contact_id=vendor.id,
            invoice_number=bill_num,
            total_amount=total_amount,
            paid_amount=total_amount if is_paid else 0.0,
            status="paid" if is_paid else "unpaid",
            journal_entry_id=entry.id
        )
        db.add(bill)
        if is_paid:
            db.add(Payment(invoice=bill, payment_method=data.payment_method, amount=total_amount, reference="Purchase Payment", journal_entry_id=entry.id))
        db.commit()
        db.refresh(bill)
        return bill
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# Payment Processing
@router.post("/transactions/payment", status_code=201)
def record_payment(
    data: PaymentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    invoice = db.query(Invoice).filter(Invoice.id == data.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice or Bill not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Duplicate payment error: Invoice is already fully paid")

    remaining = round(invoice.total_amount - invoice.paid_amount, 2)
    if data.amount > remaining + 0.01:
        raise HTTPException(status_code=400, detail=f"Payment amount ({data.amount}) exceeds remaining balance ({remaining})")

    j_type = "cash" if data.payment_method == "cash" else "bank"
    journal = db.query(Journal).filter(Journal.type == j_type).first()
    if not journal:
        journal = Journal(name=f"{j_type.capitalize()} Journal", type=j_type)
        db.add(journal)
        db.flush()

    pay_acc = db.query(Account).filter(Account.code == ("1010" if data.payment_method == "cash" else "1020")).first() or db.query(Account).filter(Account.type == "asset").first()

    if invoice.transaction_type == "sale":
        ar_acc = db.query(Account).filter(Account.code == "1100").first() or db.query(Account).filter(Account.type == "asset").first()
        lines = [
            {"account_id": pay_acc.id, "debit": data.amount, "credit": 0.0, "description": f"Payment for {invoice.invoice_number}"},
            {"account_id": ar_acc.id, "debit": 0.0, "credit": data.amount, "description": f"Clear AR for {invoice.invoice_number}"}
        ]
    else:
        ap_acc = db.query(Account).filter(Account.code == "2000").first() or db.query(Account).filter(Account.type == "liability").first()
        lines = [
            {"account_id": ap_acc.id, "debit": data.amount, "credit": 0.0, "description": f"Payment for {invoice.invoice_number}"},
            {"account_id": pay_acc.id, "debit": 0.0, "credit": data.amount, "description": f"Clear AP for {invoice.invoice_number}"}
        ]

    try:
        entry = create_balanced_entry(db, journal.id, lines, f"Payment for {invoice.invoice_number}")
        payment = Payment(
            invoice_id=invoice.id,
            payment_method=data.payment_method,
            amount=data.amount,
            reference=data.reference or f"Payment for {invoice.invoice_number}",
            journal_entry_id=entry.id
        )
        db.add(payment)
        invoice.paid_amount = round(invoice.paid_amount + data.amount, 2)
        invoice.status = "paid" if invoice.paid_amount >= invoice.total_amount - 0.01 else "partial"
        db.commit()
        return {"message": "Payment recorded successfully", "payment_id": payment.id, "invoice_status": invoice.status}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/invoices", response_model=List[InvoiceResponse])
def list_invoices(
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if current_user.role == "contact":
        query = query.join(Contact).filter(Contact.email == current_user.email)
    elif transaction_type:
        query = query.filter(Invoice.transaction_type == transaction_type)
    return query.order_by(Invoice.date.desc()).all()

# List Journal Entries
@router.get("/transactions/journal-entries", response_model=List[JournalEntryResponse])
def list_journal_entries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(JournalEntry).order_by(JournalEntry.date.desc()).all()

# Create Journal
@router.post("/journals", response_model=JournalResponse, status_code=201)
def create_journal(
    data: JournalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    j = Journal(**data.model_dump())
    db.add(j)
    db.commit()
    db.refresh(j)
    return j

# Purchase Orders Endpoints
@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
def list_purchase_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(PurchaseOrder)
    if current_user.role == "contact":
        query = query.join(Contact).filter(Contact.email == current_user.email)
    return query.order_by(PurchaseOrder.created_at.desc()).all()

@router.post("/purchase-orders", response_model=PurchaseOrderResponse, status_code=201)
def create_purchase_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    vendor = db.query(Contact).filter(Contact.id == data.vendor_id).first()
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not vendor or not product:
        raise HTTPException(status_code=404, detail="Vendor or Product not found")
    
    total = round(data.quantity * data.unit_price, 2)
    po = PurchaseOrder(
        vendor_id=data.vendor_id,
        product_id=data.product_id,
        quantity=data.quantity,
        unit_price=data.unit_price,
        total_amount=total,
        status="draft"
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return po

@router.post("/purchase-orders/{id}/bill", response_model=InvoiceResponse, status_code=201)
def convert_po_to_bill(
    id: int,
    data: ConvertToBillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    if po.status == "billed":
        raise HTTPException(status_code=400, detail="Purchase Order is already billed")

    vendor = db.query(Contact).filter(Contact.id == po.vendor_id).first()
    product = db.query(Product).filter(Product.id == po.product_id).first()

    journal = db.query(Journal).filter(Journal.type == "purchase").first()
    if not journal:
        journal = Journal(name="Purchase Journal", type="purchase")
        db.add(journal)
        db.flush()

    exp_acc = db.query(Account).filter(Account.code == "5000").first() or db.query(Account).filter(Account.type == "expense").first()
    ap_acc = db.query(Account).filter(Account.code == "2000").first() or db.query(Account).filter(Account.type == "liability").first()

    lines = [
        {"account_id": exp_acc.id, "debit": po.total_amount, "credit": 0.0, "description": f"Bill for PO #{po.id} - {vendor.name}"},
        {"account_id": ap_acc.id, "debit": 0.0, "credit": po.total_amount, "description": f"Payable for PO #{po.id} - {product.name}"}
    ]

    count = db.query(Invoice).count() + 1
    bill_num = f"BILL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:04d}"

    try:
        entry = create_balanced_entry(db, journal.id, lines, f"Vendor Bill for PO #{po.id}")
        bill = Invoice(
            transaction_type="purchase",
            contact_id=vendor.id,
            invoice_number=bill_num,
            date=data.invoice_date or datetime.now(timezone.utc),
            due_date=data.due_date,
            total_amount=po.total_amount,
            paid_amount=0.0,
            status="unpaid",
            journal_entry_id=entry.id
        )
        db.add(bill)
        db.flush()

        po.status = "billed"
        po.invoice_id = bill.id
        db.commit()
        db.refresh(bill)
        return bill
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

# Sales Orders Endpoints
@router.get("/sales-orders", response_model=List[SalesOrderResponse])
def list_sales_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(SalesOrder)
    if current_user.role == "contact":
        query = query.join(Contact).filter(Contact.email == current_user.email)
    return query.order_by(SalesOrder.created_at.desc()).all()

@router.post("/sales-orders", response_model=SalesOrderResponse, status_code=201)
def create_sales_order(
    data: SalesOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    customer = db.query(Contact).filter(Contact.id == data.customer_id).first()
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not customer or not product:
        raise HTTPException(status_code=404, detail="Customer or Product not found")
    
    total = round((data.quantity * data.unit_price) + data.tax, 2)
    so = SalesOrder(
        customer_id=data.customer_id,
        product_id=data.product_id,
        quantity=data.quantity,
        unit_price=data.unit_price,
        tax=data.tax,
        total_amount=total,
        status="draft"
    )
    db.add(so)
    db.commit()
    db.refresh(so)
    return so

@router.post("/sales-orders/{id}/invoice", response_model=InvoiceResponse, status_code=201)
def convert_so_to_invoice(
    id: int,
    data: ConvertToInvoiceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    so = db.query(SalesOrder).filter(SalesOrder.id == id).first()
    if not so:
        raise HTTPException(status_code=404, detail="Sales Order not found")
    if so.status == "invoiced":
        raise HTTPException(status_code=400, detail="Sales Order is already invoiced")

    customer = db.query(Contact).filter(Contact.id == so.customer_id).first()
    product = db.query(Product).filter(Product.id == so.product_id).first()

    journal = db.query(Journal).filter(Journal.type == "sales").first()
    if not journal:
        journal = Journal(name="Sales Journal", type="sales")
        db.add(journal)
        db.flush()

    ar_acc = db.query(Account).filter(Account.code == "1100").first() or db.query(Account).filter(Account.type == "asset").first()
    sales_acc = db.query(Account).filter(Account.code == "4000").first() or db.query(Account).filter(Account.type == "income").first()

    lines = [
        {"account_id": ar_acc.id, "debit": so.total_amount, "credit": 0.0, "description": f"Invoice for SO #{so.id} - {customer.name}"},
        {"account_id": sales_acc.id, "debit": 0.0, "credit": so.total_amount, "description": f"Revenue for SO #{so.id} - {product.name}"}
    ]

    count = db.query(Invoice).count() + 1
    inv_num = f"INV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:04d}"

    try:
        entry = create_balanced_entry(db, journal.id, lines, f"Customer Invoice for SO #{so.id}")
        invoice = Invoice(
            transaction_type="sale",
            contact_id=customer.id,
            invoice_number=inv_num,
            date=data.invoice_date or datetime.now(timezone.utc),
            due_date=data.due_date,
            total_amount=so.total_amount,
            paid_amount=0.0,
            status="unpaid",
            journal_entry_id=entry.id
        )
        db.add(invoice)
        db.flush()

        so.status = "invoiced"
        so.invoice_id = invoice.id
        db.commit()
        db.refresh(invoice)
        return invoice
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
