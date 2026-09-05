from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="invoicing_user", nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    contact = relationship("Contact")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    email = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    invoices = relationship("Invoice", back_populates="contact")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    sales_price = Column(Float, nullable=False, default=0.0)
    cost_price = Column(Float, nullable=False, default=0.0)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    journal_lines = relationship("JournalEntryLine", back_populates="account")

class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    default_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)

    default_account = relationship("Account")
    entries = relationship("JournalEntry", back_populates="journal")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journals.id"), nullable=False)
    entry_number = Column(String, unique=True, index=True, nullable=False)
    date = Column(DateTime, default=utc_now, nullable=False)
    reference = Column(String, nullable=True)
    is_posted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    journal = relationship("Journal", back_populates="entries")
    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    analytic_account_id = Column(Integer, ForeignKey("analytic_accounts.id"), nullable=True)
    debit = Column(Float, default=0.0, nullable=False)
    credit = Column(Float, default=0.0, nullable=False)
    description = Column(String, nullable=True)

    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account", back_populates="journal_lines")
    analytic_account = relationship("AnalyticAccount", back_populates="journal_lines")

class AnalyticAccount(Base):
    __tablename__ = "analytic_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    journal_lines = relationship("JournalEntryLine", back_populates="analytic_account")
    budgets = relationship("Budget", back_populates="analytic_account")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    responsible_person = Column(String, nullable=True)
    analytic_account_id = Column(Integer, ForeignKey("analytic_accounts.id"), nullable=False)
    planned_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utc_now)

    analytic_account = relationship("AnalyticAccount", back_populates="budgets")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    date = Column(DateTime, default=utc_now, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String, default="unpaid")
    total_amount = Column(Float, nullable=False, default=0.0)
    paid_amount = Column(Float, nullable=False, default=0.0)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True)

    contact = relationship("Contact", back_populates="invoices")
    journal_entry = relationship("JournalEntry")
    payments = relationship("Payment", back_populates="invoice")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    payment_method = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=utc_now, nullable=False)
    reference = Column(String, nullable=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True)

    invoice = relationship("Invoice", back_populates="payments")
    journal_entry = relationship("JournalEntry")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="draft", nullable=False)  # draft, billed
    created_at = Column(DateTime, default=utc_now)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)

    vendor = relationship("Contact")
    product = relationship("Product")
    bill = relationship("Invoice")

class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    tax = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="draft", nullable=False)  # draft, invoiced
    created_at = Column(DateTime, default=utc_now)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)

    customer = relationship("Contact")
    product = relationship("Product")
    invoice = relationship("Invoice")

