from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, User
from app.schemas import ProductCreate, ProductResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if product_type:
        query = query.filter(Product.type == product_type)
    return query.all()

@router.get("/{id}", response_model=ProductResponse)
def get_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "invoicing_user"]))
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{id}", status_code=204)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None
