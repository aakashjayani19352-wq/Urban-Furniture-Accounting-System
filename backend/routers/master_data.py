from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/contacts")
def get_contacts(db: Session = Depends(get_db)):
    return db.query(models.Contact).all()
