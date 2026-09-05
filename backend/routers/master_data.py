from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.get("/contacts")
def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get paginated contacts.
    Only authenticated users can access this. Contact role users might need 
    filtering to only see themselves, but for now we enforce authentication.
    """
    # If the user is a 'Contact', they should probably only see their own record.
    if current_user.role == models.RoleEnum.contact:
        if current_user.contact_id:
            return db.query(models.Contact).filter(models.Contact.id == current_user.contact_id).all()
        return []

    # Admin and Accountant can see paginated list
    return db.query(models.Contact).offset(skip).limit(limit).all()
