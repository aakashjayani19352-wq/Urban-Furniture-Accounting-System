from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..utils.accounting import create_journal_entry_core

router = APIRouter()

@router.post("/journal-entries", response_model=schemas.JournalEntryOut)
def create_journal_entry(
    entry_in: schemas.JournalEntryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only Admin or Accountant can create journal entries
    if current_user.role == models.RoleEnum.contact:
        raise HTTPException(status_code=403, detail="Not authorized to create journal entries")
        
    db_entry = create_journal_entry_core(
        db=db,
        journal_id=entry_in.journal_id,
        entry_date=entry_in.date,
        reference=entry_in.reference,
        lines=entry_in.lines
    )
    db.commit() # Commit the transaction
    db.refresh(db_entry)
    return db_entry
