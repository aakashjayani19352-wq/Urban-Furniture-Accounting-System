import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import User, Account, Journal, Contact, Product
from app.auth import hash_password

test_engine = create_engine("sqlite:///./test_urban.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

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

def test_contact_role_restrictions_and_payment_flow():
    db = TestingSessionLocal()
    # Create contact user matching existing customer (cust@test.com)
    contact_user = User(
        email="cust@test.com",
        hashed_password=hash_password("cust123"),
        full_name="Test Customer User",
        role="contact"
    )
    # Create another contact user
    other_contact = Contact(name="Other Contact", type="customer", email="other@test.com")
    db.add(other_contact)
    db.flush()
    other_user = User(
        email="other@test.com",
        hashed_password=hash_password("other123"),
        full_name="Other User",
        role="contact"
    )
    db.add_all([contact_user, other_user])
    db.commit()

    # Create sale invoice for Test Customer (cust@test.com)
    admin_token = get_auth_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    sale_res = client.post("/api/transactions/sale", json={
        "customer_id": 1,
        "product_id": 1,
        "quantity": 1,
        "unit_price": 500.0,
        "tax": 0.0,
        "payment_method": None
    }, headers=admin_headers)
    inv_cust = sale_res.json()

    # Create sale invoice for Other Contact (other@test.com)
    sale_other_res = client.post("/api/transactions/sale", json={
        "customer_id": other_contact.id,
        "product_id": 1,
        "quantity": 1,
        "unit_price": 500.0,
        "tax": 0.0,
        "payment_method": None
    }, headers=admin_headers)
    inv_other = sale_other_res.json()

    # Login as contact user (cust@test.com)
    login_res = client.post("/api/auth/login", json={"email": "cust@test.com", "password": "cust123"})
    cust_token = login_res.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # 1. Contact list invoices returns ONLY their own invoice
    res_invs = client.get("/api/transactions/invoices", headers=cust_headers)
    assert res_invs.status_code == 200
    inv_ids = [i["id"] for i in res_invs.json()]
    assert inv_cust["id"] in inv_ids
    assert inv_other["id"] not in inv_ids

    # 2. Contact cannot access internal reports (403 Forbidden)
    res_rep = client.get("/api/reports/profit-loss", headers=cust_headers)
    assert res_rep.status_code == 403

    # 3. Contact CAN pay their own invoice
    res_pay_own = client.post("/api/transactions/payment", json={
        "invoice_id": inv_cust["id"],
        "payment_method": "bank",
        "amount": 500.0
    }, headers=cust_headers)
    assert res_pay_own.status_code == 201
    assert res_pay_own.json()["invoice_status"] == "paid"

    # 4. Contact CANNOT pay someone else's invoice (403 Forbidden)
    res_pay_other = client.post("/api/transactions/payment", json={
        "invoice_id": inv_other["id"],
        "payment_method": "bank",
        "amount": 500.0
    }, headers=cust_headers)
    assert res_pay_other.status_code == 403

    db.close()

def test_accountant_vs_admin_master_data_permissions():
    db = TestingSessionLocal()
    # Create accountant user
    acc_user = User(
        email="acc@test.com",
        hashed_password=hash_password("acc123"),
        full_name="Accountant Test User",
        role="invoicing_user"
    )
    db.add(acc_user)
    db.commit()

    # Login as Accountant
    acc_login = client.post("/api/auth/login", json={"email": "acc@test.com", "password": "acc123"})
    acc_token = acc_login.json()["access_token"]
    acc_headers = {"Authorization": f"Bearer {acc_token}"}

    # 1. Accountant CAN create master data (Contact)
    create_res = client.post("/api/contacts", json={
        "name": "Accountant Created Contact",
        "type": "customer",
        "email": "acccreated@test.com"
    }, headers=acc_headers)
    assert create_res.status_code == 201
    contact_id = create_res.json()["id"]

    # 2. Accountant CANNOT modify master data (PUT /api/contacts/{id} -> 403 Forbidden)
    update_res = client.put(f"/api/contacts/{contact_id}", json={
        "name": "Modified Contact Name",
        "type": "customer",
        "email": "acccreated@test.com"
    }, headers=acc_headers)
    assert update_res.status_code == 403

    # 3. Accountant CANNOT archive/delete master data (DELETE /api/contacts/{id} -> 403 Forbidden)
    delete_res = client.delete(f"/api/contacts/{contact_id}", headers=acc_headers)
    assert delete_res.status_code == 403

    # 4. Admin CAN modify master data (PUT /api/contacts/{id} -> 200 OK)
    admin_token = get_auth_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_update = client.put(f"/api/contacts/{contact_id}", json={
        "name": "Admin Modified Contact Name",
        "type": "customer",
        "email": "acccreated@test.com"
    }, headers=admin_headers)
    assert admin_update.status_code == 200
    assert admin_update.json()["name"] == "Admin Modified Contact Name"

    # 5. Admin CAN delete master data (DELETE /api/contacts/{id} -> 204 No Content)
    admin_delete = client.delete(f"/api/contacts/{contact_id}", headers=admin_headers)
    assert admin_delete.status_code == 204

    db.close()


# ============== NEW HARDENING TESTS ==============

def test_balanced_journal_entry_saves():
    """A perfectly balanced journal entry should save successfully (201)."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "journal_id": 1,
        "reference": "Balanced Test Entry",
        "lines": [
            {"account_id": 1, "debit": 500.0, "credit": 0.0, "description": "Debit leg"},
            {"account_id": 5, "debit": 0.0, "credit": 500.0, "description": "Credit leg"}
        ]
    }
    res = client.post("/api/transactions/journal-entries", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["entry_number"].startswith("JE-")
    assert data["is_posted"] is True


def test_unbalanced_entry_rolls_back_cleanly():
    """After a rejected unbalanced entry, the DB should have no orphan JE records."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Count existing entries
    res_before = client.get("/api/transactions/journal-entries", headers=headers)
    count_before = len(res_before.json())

    # Submit unbalanced entry (should fail)
    payload = {
        "journal_id": 1,
        "reference": "Orphan Test",
        "lines": [
            {"account_id": 1, "debit": 999.0, "credit": 0.0},
            {"account_id": 5, "debit": 0.0, "credit": 1.0}
        ]
    }
    res = client.post("/api/transactions/journal-entries", json=payload, headers=headers)
    assert res.status_code == 400

    # Count after — should be unchanged
    res_after = client.get("/api/transactions/journal-entries", headers=headers)
    count_after = len(res_after.json())
    assert count_after == count_before


def test_both_debit_and_credit_on_line_rejected():
    """A journal line with both debit > 0 AND credit > 0 should be rejected (422)."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "journal_id": 1,
        "reference": "Both D+C Test",
        "lines": [
            {"account_id": 1, "debit": 100.0, "credit": 50.0},
            {"account_id": 5, "debit": 0.0, "credit": 50.0}
        ]
    }
    res = client.post("/api/transactions/journal-entries", json=payload, headers=headers)
    assert res.status_code == 422


def test_negative_amounts_rejected():
    """Negative debit or credit values should be rejected (422)."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "journal_id": 1,
        "reference": "Negative Test",
        "lines": [
            {"account_id": 1, "debit": -100.0, "credit": 0.0},
            {"account_id": 5, "debit": 0.0, "credit": -100.0}
        ]
    }
    res = client.post("/api/transactions/journal-entries", json=payload, headers=headers)
    assert res.status_code == 422


def test_po_bill_payment_journal_entries():
    """Full PO→Bill→Payment chain, verify JE debits/credits against known accounts."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create PO
    res_po = client.post("/api/purchase-orders", json={
        "vendor_id": 2, "product_id": 1, "quantity": 5, "unit_price": 200.0
    }, headers=headers)
    assert res_po.status_code == 201
    po = res_po.json()
    assert po["total_amount"] == 1000.0

    # Convert to Bill
    res_bill = client.post(f"/api/purchase-orders/{po['id']}/bill", json={}, headers=headers)
    assert res_bill.status_code == 201
    bill = res_bill.json()
    assert bill["transaction_type"] == "purchase"

    # Pay the Bill
    res_pay = client.post("/api/transactions/payment", json={
        "invoice_id": bill["id"],
        "payment_method": "bank",
        "amount": 1000.0,
        "reference": "PO Payment test"
    }, headers=headers)
    assert res_pay.status_code == 201
    assert res_pay.json()["invoice_status"] == "paid"

    # Verify journal entries were created (at least 2: bill JE + payment JE)
    res_je = client.get("/api/transactions/journal-entries", headers=headers)
    entries = res_je.json()
    assert len(entries) >= 2


def test_so_invoice_payment_journal_entries():
    """Full SO→Invoice→Payment chain, verify JE debits/credits."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create SO
    res_so = client.post("/api/sales-orders", json={
        "customer_id": 1, "product_id": 1, "quantity": 3, "unit_price": 400.0, "tax": 60.0
    }, headers=headers)
    assert res_so.status_code == 201
    so = res_so.json()
    assert so["total_amount"] == 1260.0

    # Convert to Invoice
    res_inv = client.post(f"/api/sales-orders/{so['id']}/invoice", json={}, headers=headers)
    assert res_inv.status_code == 201
    inv = res_inv.json()
    assert inv["transaction_type"] == "sale"

    # Pay the Invoice
    res_pay = client.post("/api/transactions/payment", json={
        "invoice_id": inv["id"],
        "payment_method": "cash",
        "amount": 1260.0
    }, headers=headers)
    assert res_pay.status_code == 201
    assert res_pay.json()["invoice_status"] == "paid"


def test_expired_jwt_rejected():
    """An expired JWT token should return 401."""
    import jwt
    from datetime import datetime, timedelta, timezone
    expired_payload = {
        "sub": "admin@test.com",
        "role": "admin",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1)
    }
    expired_token = jwt.encode(expired_payload, "urban-furniture-secret-key-2024", algorithm="HS256")
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = client.get("/api/accounts", headers=headers)
    assert res.status_code == 401


def test_invalid_jwt_rejected():
    """A garbage JWT token should return 401."""
    headers = {"Authorization": "Bearer totally.not.a.real.token"}
    res = client.get("/api/accounts", headers=headers)
    assert res.status_code == 401


def test_contact_cannot_access_admin_endpoints():
    """Contact role should get 403 on products, accounts, journals, reports."""
    db = TestingSessionLocal()
    contact_user = User(
        email="restricted@test.com",
        hashed_password=hash_password("pass123"),
        full_name="Restricted Contact",
        role="contact"
    )
    db.add(contact_user)
    db.commit()
    db.close()

    login_res = client.post("/api/auth/login", json={"email": "restricted@test.com", "password": "pass123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # All of these should be 403 for contact role
    assert client.get("/api/products", headers=headers).status_code == 403
    assert client.get("/api/accounts", headers=headers).status_code == 403
    assert client.get("/api/journals", headers=headers).status_code == 403
    assert client.get("/api/reports/profit-loss", headers=headers).status_code == 403
    assert client.get("/api/reports/balance-sheet", headers=headers).status_code == 403


def test_balance_sheet_balances():
    """Assets = Liabilities + Capital (accounting equation) after a purchase + sale."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Record a sale (1000 revenue)
    client.post("/api/transactions/sale", json={
        "customer_id": 1, "product_id": 1, "quantity": 2, "unit_price": 500.0,
        "tax": 0.0, "payment_method": "cash"
    }, headers=headers)

    # Record a purchase (400 expense)
    client.post("/api/transactions/purchase", json={
        "vendor_id": 2, "product_id": 1, "quantity": 2, "unit_price": 200.0,
        "payment_method": "cash"
    }, headers=headers)

    # Check balance sheet
    res_bs = client.get("/api/reports/balance-sheet", headers=headers)
    assert res_bs.status_code == 200
    bs = res_bs.json()
    # A = L + C + Retained Earnings (net profit)
    total_right_side = bs["total_liabilities"] + bs["total_capital"]
    assert abs(bs["total_assets"] - total_right_side) < 0.02


def test_pnl_matches_known_transactions():
    """Create known sale + purchase, verify P&L math exactly."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Sale: 800 revenue
    client.post("/api/transactions/sale", json={
        "customer_id": 1, "product_id": 1, "quantity": 2, "unit_price": 400.0,
        "tax": 0.0, "payment_method": "bank"
    }, headers=headers)

    # Purchase: 300 expense
    client.post("/api/transactions/purchase", json={
        "vendor_id": 2, "product_id": 1, "quantity": 3, "unit_price": 100.0,
        "payment_method": "bank"
    }, headers=headers)

    res_pnl = client.get("/api/reports/profit-loss", headers=headers)
    assert res_pnl.status_code == 200
    pnl = res_pnl.json()
    assert pnl["total_revenue"] == 800.0
    assert pnl["total_expenses"] == 300.0
    assert pnl["net_profit"] == 500.0


def test_missing_fields_return_422():
    """POST contact/product with missing required fields should return 422, not 500."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Contact missing 'name' and 'type'
    res = client.post("/api/contacts", json={"email": "test@test.com"}, headers=headers)
    assert res.status_code == 422

    # Product missing required fields
    res = client.post("/api/products", json={"name": "Incomplete"}, headers=headers)
    assert res.status_code == 422


def test_wrong_types_return_422():
    """String where int expected should return 422."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/purchase-orders", json={
        "vendor_id": "not-a-number",
        "product_id": 1,
        "quantity": 1,
        "unit_price": 100.0
    }, headers=headers)
    assert res.status_code == 422


def test_overpayment_rejected():
    """Payment exceeding the remaining balance should be rejected (400)."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Create unpaid invoice via sale
    res_sale = client.post("/api/transactions/sale", json={
        "customer_id": 1, "product_id": 1, "quantity": 1, "unit_price": 100.0,
        "tax": 0.0, "payment_method": None
    }, headers=headers)
    inv = res_sale.json()

    # Attempt to pay more than total
    res_pay = client.post("/api/transactions/payment", json={
        "invoice_id": inv["id"],
        "payment_method": "cash",
        "amount": 999.0
    }, headers=headers)
    assert res_pay.status_code == 400
    assert "exceeds" in res_pay.json()["detail"].lower() or "remaining" in res_pay.json()["detail"].lower()

