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
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.contact, nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    contact = relationship("Contact", back_populates="user")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(Enum(ContactTypeEnum), index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    profile_image = Column(String, nullable=True)
    user = relationship("User", back_populates="contact", uselist=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(Enum(ProductTypeEnum), index=True, nullable=False)
    sales_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    category = Column(String, nullable=False)

class ChartOfAccounts(Base):
    __tablename__ = "chart_of_accounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(Enum(AccountTypeEnum), index=True, nullable=False)
    
class Journal(Base):
    __tablename__ = "journals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    default_account_id = Column(Integer, ForeignKey("chart_of_accounts.id", ondelete="SET NULL"), nullable=True)
    default_account = relationship("ChartOfAccounts")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journals.id"), nullable=False, index=True)
    date = Column(Date, default=datetime.utcnow, nullable=False, index=True)
    reference = Column(String, nullable=True)
    journal = relationship("Journal")
    lines = relationship("JournalEntryLine", back_populates="entry", cascade="all, delete-orphan")

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=False, index=True)
    debit = Column(Float, default=0.0, nullable=False)
    credit = Column(Float, default=0.0, nullable=False)
    entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("ChartOfAccounts")

class AnalyticAccount(Base):
    __tablename__ = "analytic_accounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Income or Expenses

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    responsible_person_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    analytic_account_id = Column(Integer, ForeignKey("analytic_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    planned_amount = Column(Float, nullable=False)
    
    responsible_person = relationship("User")
    analytic_account = relationship("AnalyticAccount")

# Sales and Purchase Models
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("contacts.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    status = Column(String, default="Draft", nullable=False) # Draft, Billed
    vendor = relationship("Contact")
    product = relationship("Product")

class VendorBill(Base):
    __tablename__ = "vendor_bills"
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=False)
    status = Column(String, default="Unpaid", nullable=False) # Unpaid, Paid
    po = relationship("PurchaseOrder")

class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("contacts.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    status = Column(String, default="Draft", nullable=False) # Draft, Invoiced
    customer = relationship("Contact")
    product = relationship("Product")

class CustomerInvoice(Base):
    __tablename__ = "customer_invoices"
    id = Column(Integer, primary_key=True, index=True)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=False)
    status = Column(String, default="Unpaid", nullable=False) # Unpaid, Paid
    so = relationship("SalesOrder")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False, index=True)
    payment_type = Column(String, nullable=False) # Customer Payment, Vendor Payment
    reference_id = Column(Integer, nullable=False) # Bill ID or Invoice ID
