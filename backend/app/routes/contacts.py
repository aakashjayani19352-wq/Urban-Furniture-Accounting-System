from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Contact, User, Invoice, SalesOrder, PurchaseOrder
from app.schemas import ContactCreate, ContactResponse
from app.auth import get_current_user, require_role, get_contact_id_for_user

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

@router.post("", response_model=ContactResponse, status_code=201)
def create_contact(
    data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    contact = Contact(**data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.get("", response_model=List[ContactResponse])
def list_contacts(
    contact_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Contact)
    if current_user.role == "contact":
        contact_id = get_contact_id_for_user(db, current_user)
        if not contact_id:
            return []
        query = query.filter(Contact.id == contact_id)
    elif contact_type:
        query = query.filter(or_(Contact.type == contact_type, Contact.type == "both"))
    return query.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=ContactResponse)
def get_contact(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = db.query(Contact).filter(Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if current_user.role == "contact":
        contact_id = get_contact_id_for_user(db, current_user)
        if not contact_id or contact.id != contact_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return contact

@router.put("/{id}", response_model=ContactResponse)
def update_contact(
    id: int,
    data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    contact = db.query(Contact).filter(Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in data.model_dump().items():
        setattr(contact, key, value)
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{id}", status_code=204)
def delete_contact(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    contact = db.query(Contact).filter(Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Check for linked financial documents in the ledger
    linked_invoices = db.query(Invoice).filter(Invoice.contact_id == id).count()
    linked_so = db.query(SalesOrder).filter(SalesOrder.customer_id == id).count()
    linked_po = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == id).count()

    if linked_invoices > 0 or linked_so > 0 or linked_po > 0:
        docs = []
        if linked_invoices:
            docs.append(f"{linked_invoices} invoice(s)/bill(s)")
        if linked_so:
            docs.append(f"{linked_so} sales order(s)")
        if linked_po:
            docs.append(f"{linked_po} purchase order(s)")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete contact '{contact.name}': has {', '.join(docs)} linked in the financial ledger."
        )

    # Disassociate any linked users first
    linked_users = db.query(User).filter(User.contact_id == id).all()
    for u in linked_users:
        u.contact_id = None

    db.delete(contact)
    db.commit()
    return None
