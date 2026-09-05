from datetime import datetime, timedelta
from app.database import engine, SessionLocal, Base
from app.models import (
    User, Contact, Product, Account, Journal, AnalyticAccount, Budget, Invoice
)
from app.auth import hash_password
from app.services.accounting import (
    create_sale_transaction, create_purchase_transaction, process_payment,
    validate_and_create_journal_entry
)
from app.schemas import SaleTransactionCreate, PurchaseTransactionCreate, PaymentCreate

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@urbanfurniture.com").first():
            print("Database already contains seed data.")
            return

        print("Seeding Chart of Accounts...")
        accounts_data = [
            {"code": "1010", "name": "Cash", "type": "asset"},
            {"code": "1020", "name": "Bank Account", "type": "asset"},
            {"code": "1100", "name": "Accounts Receivable", "type": "asset"},
            {"code": "2000", "name": "Accounts Payable", "type": "liability"},
            {"code": "3000", "name": "Share Capital", "type": "capital"},
            {"code": "4000", "name": "Sales Revenue", "type": "income"},
            {"code": "5000", "name": "Purchase Expense / COGS", "type": "expense"},
            {"code": "5100", "name": "Office Rent Expense", "type": "expense"}
        ]
        account_map = {}
        for acc in accounts_data:
            existing = db.query(Account).filter(Account.code == acc["code"]).first()
            if existing:
                account_map[acc["code"]] = existing
            else:
                a = Account(**acc)
                db.add(a)
                db.flush()
                account_map[acc["code"]] = a

        print("Seeding Default Journals...")
        journals_data = [
            {"name": "Sales Journal", "type": "sales", "default_account_id": account_map["4000"].id},
            {"name": "Purchase Journal", "type": "purchase", "default_account_id": account_map["5000"].id},
            {"name": "Bank Journal", "type": "bank", "default_account_id": account_map["1020"].id},
            {"name": "Cash Journal", "type": "cash", "default_account_id": account_map["1010"].id},
            {"name": "General Journal", "type": "general", "default_account_id": None}
        ]
        general_journal = None
        for j_data in journals_data:
            j = Journal(**j_data)
            db.add(j)
            db.flush()
            if j.type == "general":
                general_journal = j

        print("Seeding Users...")
        admin = User(
            email="admin@urbanfurniture.com",
            hashed_password=hash_password("admin123"),
            full_name="System Admin",
            role="admin"
        )
        accountant = User(
            email="accountant@urbanfurniture.com",
            hashed_password=hash_password("accountant123"),
            full_name="Lead Accountant",
            role="invoicing_user"
        )
        contact_user = User(
            email="customer@tejas.com",
            hashed_password=hash_password("customer123"),
            full_name="Tejas Office Client",
            role="contact"
        )
        db.add_all([admin, accountant, contact_user])
        db.flush()

        print("Seeding Contacts...")
        customer = Contact(
            name="Tejas Office Solutions",
            type="customer",
            email="customer@tejas.com",
            mobile="+91 9876543210",
            address="101 Business Hub, Mumbai",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001"
        )
        vendor = Contact(
            name="WoodCraft Timber Supplies",
            type="vendor",
            email="sales@woodcraft.com",
            mobile="+91 9123456789",
            address="45 Industrial Estate, Pune",
            city="Pune",
            state="Maharashtra",
            pincode="411001"
        )
        db.add_all([customer, vendor])
        db.flush()

        print("Seeding Products...")
        p1 = Product(name="Ergonomic Executive Desk", type="goods", sales_price=1200.0, cost_price=700.0, category="Desks")
        p2 = Product(name="Mesh Chair", type="goods", sales_price=350.0, cost_price=180.0, category="Chairs")
        p3 = Product(name="Assembly & Setup Service", type="service", sales_price=150.0, cost_price=50.0, category="Services")
        db.add_all([p1, p2, p3])
        db.flush()

        print("Seeding Analytic Accounts & Budgets...")
        analytic1 = AnalyticAccount(name="Showroom Expansion", type="expenses")
        analytic2 = AnalyticAccount(name="Q3 Online Sales Drive", type="income")
        db.add_all([analytic1, analytic2])
        db.flush()

        budget1 = Budget(
            name="Showroom Fitout Budget",
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow() + timedelta(days=60),
            responsible_person="System Admin",
            analytic_account_id=analytic1.id,
            planned_amount=10000.0
        )
        db.add(budget1)
        db.flush()

        print("Seeding Initial Capital Entry ($50,000)...")
        initial_lines = [
            {"account_id": account_map["1020"].id, "debit": 50000.0, "credit": 0.0, "description": "Initial Capital Deposit"},
            {"account_id": account_map["3000"].id, "debit": 0.0, "credit": 50000.0, "description": "Share Capital Credit"}
        ]
        validate_and_create_journal_entry(db, journal_id=general_journal.id, lines_data=initial_lines, reference="Initial Capital")
        db.commit()

        print("Seeding Initial Sample Transactions...")
        # 1. Purchase stock from vendor
        purchase_data = PurchaseTransactionCreate(
            vendor_id=vendor.id,
            product_id=p1.id,
            quantity=5,
            unit_price=700.0,
            payment_method="bank",
            analytic_account_id=analytic1.id
        )
        create_purchase_transaction(db, purchase_data)

        # 2. Sale to customer
        sale_data = SaleTransactionCreate(
            customer_id=customer.id,
            product_id=p1.id,
            quantity=2,
            unit_price=1200.0,
            tax=100.0,
            payment_method=None # unpaid invoice
        )
        inv = create_sale_transaction(db, sale_data)

        # 3. Partial payment received
        payment_data = PaymentCreate(
            invoice_id=inv.id,
            payment_method="bank",
            amount=1500.0,
            reference="NEFT Payment 9871"
        )
        process_payment(db, payment_data)

        print("Successfully seeded demo data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
