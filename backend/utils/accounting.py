from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from .. import models, schemas
from fastapi import HTTPException

def create_journal_entry_core(
    db: Session, 
    journal_id: int, 
    entry_date: date, 
    reference: Optional[str], 
    lines: List[schemas.JournalEntryLineCreate]
) -> models.JournalEntry:
    """
    Creates a balanced JournalEntry.
    Raises HTTPException (400) if debit != credit.
    """
    total_debit = sum(line.debit for line in lines)
    total_credit = sum(line.credit for line in lines)
    
    # We use a small tolerance for floating point comparison, or exact round
    if round(total_debit, 2) != round(total_credit, 2):
        raise HTTPException(
            status_code=400, 
            detail=f"Validation Error: Total Debit ({total_debit}) must equal Total Credit ({total_credit})."
        )
        
    db_entry = models.JournalEntry(
        journal_id=journal_id,
        date=entry_date,
        reference=reference
    )
    db.add(db_entry)
    db.flush() # Get the auto-incremented ID
    
    for line in lines:
        db_line = models.JournalEntryLine(
            entry_id=db_entry.id,
            account_id=line.account_id,
            debit=line.debit,
            credit=line.credit
        )
        db.add(db_line)
        
    # We don't commit here so that the caller can include this in a larger transaction
    return db_entry
