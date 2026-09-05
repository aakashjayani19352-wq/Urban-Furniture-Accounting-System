import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, SessionLocal
from app.models import User, Account, Journal, Contact, Product
from app.auth import hash_password

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create admin user
    admin = User(
        email="admin@test.com",
        hashed_password=hash_password("admin123"),
        full_name="Admin Test",
        role="admin"
    )
    db.add(admin)
    
    # Create default accounts
    acc_cash = Account(code="1010", name="Cash", type="asset")
    acc_ar = Account(code="1100", name="AR", type="asset")
    acc_ap = Account(code="2000", name="AP", type="liability")
    acc_cap = Account(code="3000", name="Capital", type="capital")
    acc_sales = Account(code="4000", name="Sales", type="income")
    acc_exp = Account(code="5000", name="COGS", type="expense")
    db.add_all([acc_cash, acc_ar, acc_ap, acc_cap, acc_sales, acc_exp])

    # Create default journals
    j_sales = Journal(name="Sales Journal", type="sales", default_account_id=acc_sales.id)
    j_pur = Journal(name="Purchase Journal", type="purchase", default_account_id=acc_exp.id)
    db.add_all([j_sales, j_pur])

    # Create contact & product
    cust = Contact(name="Test Customer", type="customer", email="cust@test.com")
    vend = Contact(name="Test Vendor", type="vendor", email="vend@test.com")
    prod = Product(name="Test Chair", type="goods", sales_price=500.0, cost_price=250.0)
    db.add_all([cust, vend, prod])

    db.commit()
    db.close()

def get_auth_token():
    res = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    return res.json()["access_token"]

def test_unbalanced_journal_entry_rejection():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Unbalanced entry: Debit 100 vs Credit 80
    payload = {
        "journal_id": 1,
        "reference": "Unbalanced Test",
        "lines": [
            {"account_id": 1, "debit": 100.0, "credit": 0.0},
            {"account_id": 5, "debit": 0.0, "credit": 80.0}
        ]
    }
    res = client.post("/api/transactions/journal-entries", json=payload, headers=headers)
    assert res.status_code == 400
    assert "Unbalanced journal entry" in res.json()["detail"]

def test_sale_purchase_payment_flow_and_reports():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Record Sale (Unpaid Invoice)
    sale_payload = {
        "customer_id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 500.0,
        "tax": 50.0,
        "payment_method": None
    }
    res_sale = client.post("/api/transactions/sale", json=sale_payload, headers=headers)
    assert res_sale.status_code == 201
    invoice = res_sale.json()
    assert invoice["total_amount"] == 1050.0
    assert invoice["status"] == "unpaid"

    # 2. Record Payment for Sale
    payment_payload = {
        "invoice_id": invoice["id"],
        "payment_method": "cash",
        "amount": 1050.0
    }
    res_pay = client.post("/api/transactions/payment", json=payment_payload, headers=headers)
    assert res_pay.status_code == 201
    assert res_pay.json()["invoice_status"] == "paid"

    # 3. Duplicate payment attempt should fail
    res_dup = client.post("/api/transactions/payment", json=payment_payload, headers=headers)
    assert res_dup.status_code == 400
    assert "already fully paid" in res_dup.json()["detail"]

    # 4. Profit & Loss Report should reflect sales revenue
    res_pnl = client.get("/api/reports/profit-loss", headers=headers)
    assert res_pnl.status_code == 200
    pnl = res_pnl.json()
    assert pnl["total_revenue"] == 1050.0
    assert pnl["net_profit"] == 1050.0

    # 5. Balance Sheet Report should balance Assets == Capital/Retained Earnings
    res_bs = client.get("/api/reports/balance-sheet", headers=headers)
    assert res_bs.status_code == 200
    bs = res_bs.json()
    assert bs["total_assets"] == 1050.0
    assert bs["total_capital"] == 1050.0

def test_purchase_order_to_bill_and_payment_flow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Purchase Order
    po_payload = {
        "vendor_id": 2,
        "product_id": 1,
        "quantity": 4,
        "unit_price": 250.0
    }
    res_po = client.post("/api/purchase-orders", json=po_payload, headers=headers)
    assert res_po.status_code == 201
    po = res_po.json()
    assert po["total_amount"] == 1000.0
    assert po["status"] == "draft"

    # 2. Convert PO to Vendor Bill
    res_bill = client.post(f"/api/purchase-orders/{po['id']}/bill", json={}, headers=headers)
    assert res_bill.status_code == 201
    bill = res_bill.json()
    assert bill["total_amount"] == 1000.0
    assert bill["status"] == "unpaid"

    # 3. Pay the Vendor Bill
    pay_payload = {
        "invoice_id": bill["id"],
        "payment_method": "bank",
        "amount": 1000.0,
        "reference": "Bank transfer for PO Bill"
    }
    res_pay = client.post("/api/transactions/payment", json=pay_payload, headers=headers)
    assert res_pay.status_code == 201
    assert res_pay.json()["invoice_status"] == "paid"

def test_sales_order_to_invoice_and_payment_flow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Sales Order
    so_payload = {
        "customer_id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 500.0,
        "tax": 100.0
    }
    res_so = client.post("/api/sales-orders", json=so_payload, headers=headers)
    assert res_so.status_code == 201
    so = res_so.json()
    assert so["total_amount"] == 1100.0
    assert so["status"] == "draft"

    # 2. Convert SO to Customer Invoice
    res_inv = client.post(f"/api/sales-orders/{so['id']}/invoice", json={}, headers=headers)
    assert res_inv.status_code == 201
    inv = res_inv.json()
    assert inv["total_amount"] == 1100.0
    assert inv["status"] == "unpaid"

    # 3. Pay the Customer Invoice
    pay_payload = {
        "invoice_id": inv["id"],
        "payment_method": "cash",
        "amount": 1100.0,
        "reference": "Cash received for SO Invoice"
    }
    res_pay = client.post("/api/transactions/payment", json=pay_payload, headers=headers)
    assert res_pay.status_code == 201
    assert res_pay.json()["invoice_status"] == "paid"

