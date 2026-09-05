from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

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
        
    total_debit = sum(line.debit for line in entry_in.lines)
    total_credit = sum(line.credit for line in entry_in.lines)
    
    # Check if total debit equals total credit
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"Validation Error: Total Debit ({total_debit}) must equal Total Credit ({total_credit})."
        )
        
    # db session acts as a transaction context
    db_entry = models.JournalEntry(
        journal_id=entry_in.journal_id,
        date=entry_in.date,
        reference=entry_in.reference
    )
    db.add(db_entry)
    db.flush() # Get the auto-incremented ID
    
    for line in entry_in.lines:
        db_line = models.JournalEntryLine(
            entry_id=db_entry.id,
            account_id=line.account_id,
            debit=line.debit,
            credit=line.credit
        )
        db.add(db_line)
        
    db.commit() # Save everything or nothing
    db.refresh(db_entry)
    return db_entry
