from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import date
from .models import RoleEnum, ContactTypeEnum, ProductTypeEnum, AccountTypeEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class DBBase(BaseModel):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    password: str
    role: RoleEnum
    contact_id: Optional[int] = None

class UserOut(DBBase):
    username: str
    role: RoleEnum
    contact_id: Optional[int]

class ChartOfAccountsCreate(BaseModel):
    name: str
    type: AccountTypeEnum

class ChartOfAccountsOut(DBBase, ChartOfAccountsCreate):
    pass

class JournalCreate(BaseModel):
    name: str
    type: str
    default_account_id: Optional[int] = None

class JournalOut(DBBase, JournalCreate):
    pass

class JournalEntryLineCreate(BaseModel):
    account_id: int
    debit: float = 0.0
    credit: float = 0.0

class JournalEntryCreate(BaseModel):
    journal_id: int
    date: date
    reference: Optional[str] = None
    lines: List[JournalEntryLineCreate]

class JournalEntryOut(DBBase):
    journal_id: int
    date: date
    reference: Optional[str]

class ProductCreate(BaseModel):
    name: str
    type: ProductTypeEnum
    sales_price: float
    cost_price: float
    category: str

class ProductOut(DBBase, ProductCreate):
    pass

class ContactCreate(BaseModel):
    name: str
    type: ContactTypeEnum
    email: str
    mobile: str
    city: str
    state: str
    pincode: str
    profile_image: Optional[str] = None

class ContactOut(DBBase, ContactCreate):
    pass

class SalesOrderCreate(BaseModel):
    customer_id: int
    product_id: int
    qty: int
    unit_price: float
    tax: float

class SalesOrderOut(DBBase, SalesOrderCreate):
    status: str

class PaymentCreate(BaseModel):
    amount: float
    date: date
    payment_type: str
    reference_id: int
