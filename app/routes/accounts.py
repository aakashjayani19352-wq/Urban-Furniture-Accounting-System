from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Account, User
from app.schemas import AccountCreate, AccountResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/accounts", tags=["Chart of Accounts"])

@router.post("", response_model=AccountResponse, status_code=201)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    existing = db.query(Account).filter(Account.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account code already exists")

    account = Account(**data.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.get("", response_model=List[AccountResponse])
def list_accounts(
    account_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Account)
    if account_type:
        query = query.filter(Account.type == account_type)
    return query.order_by(Account.code.asc()).all()

@router.get("/{id}", response_model=AccountResponse)
def get_account(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(Account.id == id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
