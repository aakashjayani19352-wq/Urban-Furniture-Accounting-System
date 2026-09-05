from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    admin = "Admin"
    accountant = "Invoicing User"
    contact = "Contact"

class ContactTypeEnum(str, enum.Enum):
    customer = "Customer"
    vendor = "Vendor"
    both = "Both"

class ProductTypeEnum(str, enum.Enum):
    goods = "Goods"
    service = "Service"
    combo = "Combo"

class AccountTypeEnum(str, enum.Enum):
    asset = "Asset"
    liability = "Liability"
    expense = "Expense"
    income = "Income"
    capital = "Capital"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.contact)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    contact = relationship("Contact", back_populates="user")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(ContactTypeEnum))
    email = Column(String, unique=True, index=True)
    mobile = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    profile_image = Column(String, nullable=True)
    user = relationship("User", back_populates="contact", uselist=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(ProductTypeEnum))
    sales_price = Column(Float)
    cost_price = Column(Float)
    category = Column(String)

class ChartOfAccounts(Base):
    __tablename__ = "chart_of_accounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(Enum(AccountTypeEnum))
    
class Journal(Base):
    __tablename__ = "journals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    default_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True)
    default_account = relationship("ChartOfAccounts")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journals.id"))
    date = Column(Date, default=datetime.utcnow)
    reference = Column(String)
    journal = relationship("Journal")
    lines = relationship("JournalEntryLine", back_populates="entry")

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"))
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"))
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("ChartOfAccounts")

class AnalyticAccount(Base):
    __tablename__ = "analytic_accounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # Income or Expenses

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    period_start = Column(Date)
    period_end = Column(Date)
    responsible_person_id = Column(Integer, ForeignKey("users.id"))
    analytic_account_id = Column(Integer, ForeignKey("analytic_accounts.id"))
    planned_amount = Column(Float)
    
    responsible_person = relationship("User")
    analytic_account = relationship("AnalyticAccount")

# Sales and Purchase Models
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("contacts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Integer)
    unit_price = Column(Float)
    status = Column(String, default="Draft") # Draft, Billed
    vendor = relationship("Contact")
    product = relationship("Product")

class VendorBill(Base):
    __tablename__ = "vendor_bills"
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    invoice_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="Unpaid") # Unpaid, Paid
    po = relationship("PurchaseOrder")

class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("contacts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Integer)
    unit_price = Column(Float)
    tax = Column(Float)
    status = Column(String, default="Draft") # Draft, Invoiced
    customer = relationship("Contact")
    product = relationship("Product")

class CustomerInvoice(Base):
    __tablename__ = "customer_invoices"
    id = Column(Integer, primary_key=True, index=True)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"))
    invoice_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="Unpaid") # Unpaid, Paid
    so = relationship("SalesOrder")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    date = Column(Date)
    payment_type = Column(String) # Customer Payment, Vendor Payment
    reference_id = Column(Integer) # Bill ID or Invoice ID
