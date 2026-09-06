from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

# Auth & User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)
    full_name: str
    role: str = "invoicing_user" # admin, invoicing_user, contact

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Contact Schemas
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: Literal["customer", "vendor", "both"]
    email: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None

class ContactResponse(ContactCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: Literal["goods", "service", "combo"]
    sales_price: float = Field(..., ge=0.0)
    cost_price: float = Field(..., ge=0.0)
    category: Optional[str] = None

class ProductResponse(ProductCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Account Schemas
class AccountCreate(BaseModel):
    code: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    type: Literal["asset", "liability", "expense", "income", "capital"]

class AccountResponse(AccountCreate):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Journal Schemas
class JournalCreate(BaseModel):
    name: str
    type: str # sales, purchase, bank, cash, general
    default_account_id: Optional[int] = None

class JournalResponse(JournalCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Analytic Account & Budget Schemas
class AnalyticAccountCreate(BaseModel):
    name: str
    type: str # income, expenses

class AnalyticAccountResponse(AnalyticAccountCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class BudgetCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    responsible_person: Optional[str] = None
    analytic_account_id: int
    planned_amount: float = Field(..., gt=0.0)

class BudgetResponse(BudgetCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Transaction & Invoice Schemas
class SaleTransactionCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: float = Field(..., gt=0.0)
    unit_price: float = Field(..., ge=0.0)
    tax: float = Field(default=0.0, ge=0.0)
    payment_method: Optional[str] = None # cash, bank, or null if unpaid invoice
    analytic_account_id: Optional[int] = None

class PurchaseTransactionCreate(BaseModel):
    vendor_id: int
    product_id: int
    quantity: float = Field(..., gt=0.0)
    unit_price: float = Field(..., ge=0.0)
    payment_method: Optional[str] = None # cash, bank, or null if unpaid bill
    analytic_account_id: Optional[int] = None

class PaymentCreate(BaseModel):
    invoice_id: int
    payment_method: str # cash, bank
    amount: float = Field(..., gt=0.0)
    reference: Optional[str] = None

# Journal Entry Line Schema
class JournalEntryLineSchema(BaseModel):
    account_id: int
    debit: float = Field(default=0.0, ge=0.0)
    credit: float = Field(default=0.0, ge=0.0)
    description: Optional[str] = None
    analytic_account_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='after')
    def check_not_both_debit_and_credit(self):
        if self.debit > 0 and self.credit > 0:
            raise ValueError('A journal line cannot have both debit and credit > 0')
        return self

class JournalEntryCreate(BaseModel):
    journal_id: int
    reference: Optional[str] = None
    date: Optional[datetime] = None
    lines: List[JournalEntryLineSchema]

class JournalEntryResponse(BaseModel):
    id: int
    entry_number: str
    date: datetime
    reference: Optional[str]
    is_posted: bool = True
    lines: List[JournalEntryLineSchema]

    model_config = ConfigDict(from_attributes=True)

class InvoiceResponse(BaseModel):
    id: int
    transaction_type: str
    contact_id: int
    invoice_number: str
    date: datetime
    due_date: Optional[datetime]
    status: str
    total_amount: float
    paid_amount: float
    journal_entry_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

# Report Schemas
class ProfitLossReport(BaseModel):
    period_start: Optional[str]
    period_end: Optional[str]
    total_revenue: float
    total_expenses: float
    net_profit: float
    revenue_breakdown: list
    expense_breakdown: list

class BalanceSheetReport(BaseModel):
    as_of_date: str
    total_assets: float
    total_liabilities: float
    total_capital: float
    net_profit: float
    assets_breakdown: list
    liabilities_breakdown: list
    capital_breakdown: list

class BudgetReportItem(BaseModel):
    budget_id: int
    budget_name: str
    analytic_account_name: str
    type: str
    planned_amount: float
    actual_amount: float
    variance: float
    achievement_percentage: float

class BudgetReport(BaseModel):
    items: List[BudgetReportItem]

# Document Flow Schemas (PO & SO)
class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0.0)

class PurchaseOrderResponse(BaseModel):
    id: int
    vendor_id: int
    product_id: int
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    created_at: datetime
    invoice_id: Optional[int] = None
    vendor: Optional[ContactResponse] = None
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConvertToBillRequest(BaseModel):
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None

class SalesOrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0.0)
    tax: float = Field(default=0.0, ge=0.0)

class SalesOrderResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    unit_price: float
    tax: float
    total_amount: float
    status: str
    created_at: datetime
    invoice_id: Optional[int] = None
    customer: Optional[ContactResponse] = None
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConvertToInvoiceRequest(BaseModel):
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
