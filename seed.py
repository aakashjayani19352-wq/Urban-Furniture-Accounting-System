from datetime import datetime, timedelta, timezone
from app.database import engine, SessionLocal, Base
from app.models import (
    User, Contact, Product, Account, Journal, AnalyticAccount, Budget, Invoice, Payment, JournalEntry, JournalEntryLine
)
from app.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
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
        gen_journal = None
        for j_data in journals_data:
            j = db.query(Journal).filter(Journal.type == j_data["type"]).first()
            if not j:
                j = Journal(**j_data)
                db.add(j)
                db.flush()
            if j.type == "general":
                gen_journal = j

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
            full_name="Tejas Client",
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
        db.add_all([p1, p2])
        db.flush()

        print("Seeding Analytic Accounts & Budgets...")
        analytic1 = AnalyticAccount(name="Showroom Expansion", type="expenses")
        db.add(analytic1)
        db.flush()

        now_utc = datetime.now(timezone.utc)
        budget1 = Budget(
            name="Showroom Fitout Budget",
            start_date=now_utc - timedelta(days=30),
            end_date=now_utc + timedelta(days=60),
            responsible_person="System Admin",
            analytic_account_id=analytic1.id,
            planned_amount=10000.0
        )
        db.add(budget1)
        db.flush()


        print("Seeding Initial Capital Entry ($50,000)...")
        cap_entry = JournalEntry(journal_id=gen_journal.id, entry_number="JE-INIT-001", reference="Initial Capital Deposit", is_posted=True)
        db.add(cap_entry)
        db.flush()

        db.add_all([
            JournalEntryLine(journal_entry_id=cap_entry.id, account_id=account_map["1020"].id, debit=50000.0, credit=0.0, description="Initial Cash Deposit"),
            JournalEntryLine(journal_entry_id=cap_entry.id, account_id=account_map["3000"].id, debit=0.0, credit=50000.0, description="Capital Credit")
        ])
        db.commit()

        print("Successfully seeded demo data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
