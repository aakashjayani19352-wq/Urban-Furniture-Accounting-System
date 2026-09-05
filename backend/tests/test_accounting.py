import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.main import app
from backend.database import get_db, Base
from backend.models import RoleEnum, ContactTypeEnum, ProductTypeEnum, AccountTypeEnum, User, Journal, ChartOfAccounts, Contact, Product, JournalEntry, JournalEntryLine, PurchaseOrder, VendorBill, SalesOrder, CustomerInvoice, Payment
from backend.routers.auth import get_current_user

from sqlalchemy.pool import StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user():
    return User(id=1, username="admin", role=RoleEnum.admin)

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    db = TestingSessionLocal()
    
    admin = User(username="admin", hashed_password="pw", role=RoleEnum.admin)
    j_pur = Journal(name="Purchase Journal", type="Purchase")
    j_sales = Journal(name="Sales Journal", type="Sales")
    j_bank = Journal(name="Bank Journal", type="Bank")
    acc_exp = ChartOfAccounts(name="Purchase Expense", type=AccountTypeEnum.expense)
    acc_ap = ChartOfAccounts(name="Accounts Payable", type=AccountTypeEnum.liability)
    
    db.add_all([admin, j_pur, j_sales, j_bank, acc_exp, acc_ap])
    db.commit()
    
    yield
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_balanced_journal_entry():
    db = TestingSessionLocal()
    journal = db.query(Journal).first()
    acc1 = db.query(ChartOfAccounts).filter_by(name="Purchase Expense").first()
    acc2 = db.query(ChartOfAccounts).filter_by(name="Accounts Payable").first()
    
    response = client.post(
        "/api/transactions/journal-entries",
        json={
            "journal_id": journal.id,
            "date": str(date.today()),
            "reference": "Test Entry",
            "lines": [
                {"account_id": acc1.id, "debit": 100.0, "credit": 0.0},
                {"account_id": acc2.id, "debit": 0.0, "credit": 100.0}
            ]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reference"] == "Test Entry"

def test_unbalanced_journal_entry_fails():
    db = TestingSessionLocal()
    journal = db.query(Journal).first()
    acc1 = db.query(ChartOfAccounts).filter_by(name="Purchase Expense").first()
    acc2 = db.query(ChartOfAccounts).filter_by(name="Accounts Payable").first()
    
    response = client.post(
        "/api/transactions/journal-entries",
        json={
            "journal_id": journal.id,
            "date": str(date.today()),
            "reference": "Bad Entry",
            "lines": [
                {"account_id": acc1.id, "debit": 100.0, "credit": 0.0},
                {"account_id": acc2.id, "debit": 0.0, "credit": 50.0}
            ]
        }
    )
    assert response.status_code == 400
    assert "must equal Total Credit" in response.json()["detail"]

def test_vendor_bill_conversion_creates_journal_entry():
    db = TestingSessionLocal()
    contact = Contact(name="Vendor X", type=ContactTypeEnum.vendor, email="v@v.com", mobile="1", city="A", state="B", pincode="C")
    product = Product(name="Chair", type=ProductTypeEnum.goods, sales_price=100, cost_price=50, category="Furniture")
    db.add_all([contact, product])
    db.commit()
    
    response = client.post(
        "/api/documents/purchase-orders",
        json={
            "vendor_id": contact.id,
            "product_id": product.id,
            "qty": 10,
            "unit_price": 50.0
        }
    )
    assert response.status_code == 200
    po_id = response.json()["id"]
    
    bill_response = client.post(
        f"/api/documents/purchase-orders/{po_id}/bill",
        json={
            "invoice_date": str(date.today()),
            "due_date": str(date.today())
        }
    )
    assert bill_response.status_code == 200
    
    entries = db.query(JournalEntry).all()
    assert len(entries) == 1
    assert entries[0].reference == f"Bill for PO {po_id}"
    
    lines = db.query(JournalEntryLine).all()
    assert len(lines) == 2
    assert sum(l.debit for l in lines) == 500.0
    assert sum(l.credit for l in lines) == 500.0
