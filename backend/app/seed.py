from datetime import datetime, timedelta, timezone
from app.database import engine, SessionLocal, Base
from app.models import (
    User, Contact, Product, Account, Journal, AnalyticAccount, Budget, Invoice, Payment,
    JournalEntry, JournalEntryLine, PurchaseOrder, SalesOrder
)
from app.auth import hash_password

CUSTOMERS_DATA = [
    {"name": "Tejas Office Solutions", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "mobile": "+91 9820112233", "email": "customer@tejas.com", "address": "101 Business Hub, Nariman Point"},
    {"name": "Nexus Coworking Hub", "city": "Bengaluru", "state": "Karnataka", "pincode": "560001", "mobile": "+91 9845112233", "email": "facilities@nexuscowork.in", "address": "4th Floor, MG Road Tech Center"},
    {"name": "Vertex Tech Innovations", "city": "Hyderabad", "state": "Telangana", "pincode": "500081", "mobile": "+91 9849112233", "email": "procurement@vertextech.io", "address": "Hitech City Phase 2"},
    {"name": "Omnipresent Media Labs", "city": "Gurugram", "state": "Haryana", "pincode": "122002", "mobile": "+91 9811112233", "email": "admin@omnipresentmedia.com", "address": "DLF Cyber City, Tower B"},
    {"name": "Apex Architectural Studio", "city": "Pune", "state": "Maharashtra", "pincode": "411006", "mobile": "+91 9822112233", "email": "studio@apexarchitects.in", "address": "Koregaon Park Main Road"},
    {"name": "Sterling Financial Advisors", "city": "Mumbai", "state": "Maharashtra", "pincode": "400051", "mobile": "+91 9820223344", "email": "ops@sterlingwealth.com", "address": "Bandra Kurla Complex (BKC)"},
    {"name": "Horizon EduTech Academy", "city": "Noida", "state": "Uttar Pradesh", "pincode": "201301", "mobile": "+91 9818223344", "email": "admin@horizonedutech.org", "address": "Sector 62 Institutional Area"},
    {"name": "Quantum Cloud Systems", "city": "Bengaluru", "state": "Karnataka", "pincode": "560103", "mobile": "+91 9845223344", "email": "itops@quantumcloud.co", "address": "Outer Ring Road, Bellandur"},
    {"name": "Zenith Legal Associates", "city": "New Delhi", "state": "Delhi", "pincode": "110001", "mobile": "+91 9810223344", "email": "contact@zenithlegal.in", "address": "Barakhamba Road, Connaught Place"},
    {"name": "BlueWave Logistics Corp", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001", "mobile": "+91 9840223344", "email": "admin@bluewavelogistics.com", "address": "Parrys Corner, Port Area"},
    {"name": "Metro Healthcare Clinic", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380009", "mobile": "+91 9825223344", "email": "purchase@metroclinic.in", "address": "Ashram Road, Navrangpura"},
    {"name": "GreenLeaf Organic Cafe", "city": "Kolkata", "state": "West Bengal", "pincode": "700016", "mobile": "+91 9830223344", "email": "hello@greenleafcafe.in", "address": "Park Street Commercial Hub"},
    {"name": "Skylark Aerospace Labs", "city": "Bengaluru", "state": "Karnataka", "pincode": "560066", "mobile": "+91 9845334455", "email": "vendor@skylarklab.com", "address": "Whitefield Export Promotion Zone"},
    {"name": "Pinnacle Wealth Partners", "city": "Mumbai", "state": "Maharashtra", "pincode": "400013", "mobile": "+91 9820334455", "email": "admin@pinnaclewealth.in", "address": "Lower Parel Commercial Complex"},
    {"name": "UrbanSpire Co-living", "city": "Pune", "state": "Maharashtra", "pincode": "411057", "mobile": "+91 9822334455", "email": "housing@urbanspire.co", "address": "Hinjewadi Phase 1"},
    {"name": "CyberShield Security", "city": "Hyderabad", "state": "Telangana", "pincode": "500032", "mobile": "+91 9849334455", "email": "accounts@cybershield.io", "address": "Gachibowli IT Corridor"},
    {"name": "Aura Boutique Hotels", "city": "Jaipur", "state": "Rajasthan", "pincode": "302001", "mobile": "+91 9829334455", "email": "purchase@aurahotels.com", "address": "MI Road, Heritage Zone"},
    {"name": "InnovateX Design Studio", "city": "Chandigarh", "state": "Punjab", "pincode": "160017", "mobile": "+91 9814334455", "email": "creatives@innovatex.studio", "address": "Sector 17 Commercial Complex"},
    {"name": "Silverline Advertising", "city": "Indore", "state": "Madhya Pradesh", "pincode": "452001", "mobile": "+91 9826334455", "email": "media@silverlinead.com", "address": "AB Road Business District"},
    {"name": "PrimeEdge Advisory", "city": "Kochi", "state": "Kerala", "pincode": "682016", "mobile": "+91 9846334455", "email": "consult@primeedge.org", "address": "MG Road Corporate Plaza"},
    {"name": "Alpha Robotics Research", "city": "Bengaluru", "state": "Karnataka", "pincode": "560048", "mobile": "+91 9845445566", "email": "hardware@alpharobotics.ai", "address": "Hoodi Industrial Estate"},
    {"name": "BrightMinds International School", "city": "Surat", "state": "Gujarat", "pincode": "395007", "mobile": "+91 9825445566", "email": "trustee@brightminds.edu", "address": "Vesu University Road"}
]

VENDORS_DATA = [
    {"name": "WoodCraft Timber Supplies", "city": "Pune", "state": "Maharashtra", "pincode": "411001", "mobile": "+91 9123456789", "email": "sales@woodcraft.com", "address": "45 Industrial Estate, Hadapsar"},
    {"name": "Royal Oak Steel Fabricators", "city": "Ahmedabad", "state": "Gujarat", "pincode": "382445", "mobile": "+91 9123556789", "email": "orders@royaloaksteel.com", "address": "GIDC Vatva Phase 4"},
    {"name": "PrimeEdge Foam & Cushion Co", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600058", "mobile": "+91 9123667890", "email": "supplies@primeedgefoam.com", "address": "Ambattur Industrial Estate"},
    {"name": "EverLast Hardware & Fasteners", "city": "Rajkot", "state": "Gujarat", "pincode": "360002", "mobile": "+91 9123778901", "email": "info@everlasthardware.com", "address": "Aji GIDC Estate Road 2"},
    {"name": "VelvetTouch Upholstery & Textiles", "city": "Surat", "state": "Gujarat", "pincode": "395002", "mobile": "+91 9123889012", "email": "fabrics@velvettouch.in", "address": "Ring Road Textile Market"},
    {"name": "EcoBoard MDF & Plywood Mills", "city": "Nagpur", "state": "Maharashtra", "pincode": "440028", "mobile": "+91 9123990123", "email": "sales@ecoboardtimber.com", "address": "MIDC Butibori Industrial Zone"},
    {"name": "Precision Glass & Acrylics", "city": "Mumbai", "state": "Maharashtra", "pincode": "400072", "mobile": "+91 9124001234", "email": "glass@precisionacrylic.in", "address": "Saki Naka Andheri East"},
    {"name": "DuraCoat Powder Coating & Paint", "city": "Faridabad", "state": "Haryana", "pincode": "121001", "mobile": "+91 9124112345", "email": "orders@duracoatpaint.com", "address": "Sector 24 Industrial Area"},
    {"name": "SpeedyFleet Commercial Logistics", "city": "Navi Mumbai", "state": "Maharashtra", "pincode": "410208", "mobile": "+91 9124223456", "email": "dispatch@speedyfleet.co", "address": "Taloja Logistics Hub"},
    {"name": "Pacific Castors & Wheel Hubs", "city": "Coimbatore", "state": "Tamil Nadu", "pincode": "641018", "mobile": "+91 9124334567", "email": "sales@pacificcastors.com", "address": "Peelamedu Engineering Cluster"},
    {"name": "KraftBox Packaging Solutions", "city": "Vadodara", "state": "Gujarat", "pincode": "390010", "mobile": "+91 9124445678", "email": "pack@kraftboxsolutions.com", "address": "Makarpura GIDC Estate"},
    {"name": "Nordic Ergonomic Mechanisms", "city": "Bengaluru", "state": "Karnataka", "pincode": "560058", "mobile": "+91 9124556789", "email": "tech@nordicmech.in", "address": "Peenya Industrial Area 3rd Stage"},
    {"name": "Sparkle Electricals & Wire Harness", "city": "Delhi", "state": "Delhi", "pincode": "110092", "mobile": "+91 9124667890", "email": "supplies@sparkleelectric.in", "address": "Patparganj Industrial Area"}
]

PRODUCTS_DATA = [
    {"name": "Ergonomic Executive Desk", "type": "goods", "sales_price": 1200.0, "cost_price": 700.0, "category": "Desks"},
    {"name": "Motorized Standing Desk 140x70", "type": "goods", "sales_price": 850.0, "cost_price": 480.0, "category": "Desks"},
    {"name": "L-Shaped Corner Manager Desk", "type": "goods", "sales_price": 1450.0, "cost_price": 820.0, "category": "Desks"},
    {"name": "4-Pod Modular Workstation", "type": "goods", "sales_price": 2400.0, "cost_price": 1350.0, "category": "Desks"},
    {"name": "Minimalist Solid Oak Writing Table", "type": "goods", "sales_price": 620.0, "cost_price": 350.0, "category": "Desks"},
    {"name": "Compact Work-From-Home Desk", "type": "goods", "sales_price": 420.0, "cost_price": 230.0, "category": "Desks"},
    {"name": "Mesh High-Back Ergonomic Chair", "type": "goods", "sales_price": 350.0, "cost_price": 180.0, "category": "Chairs"},
    {"name": "Executive Italian Leather Recliner", "type": "goods", "sales_price": 780.0, "cost_price": 420.0, "category": "Chairs"},
    {"name": "Lumbar Support Task Chair", "type": "goods", "sales_price": 290.0, "cost_price": 150.0, "category": "Chairs"},
    {"name": "Cantilever Chrome Visitor Sled Chair", "type": "goods", "sales_price": 180.0, "cost_price": 95.0, "category": "Chairs"},
    {"name": "Drafting High Stool with Footring", "type": "goods", "sales_price": 240.0, "cost_price": 130.0, "category": "Chairs"},
    {"name": "Active Balance Wobble Stool", "type": "goods", "sales_price": 160.0, "cost_price": 85.0, "category": "Chairs"},
    {"name": "10-Person Boat-Shaped Boardroom Table", "type": "goods", "sales_price": 3200.0, "cost_price": 1800.0, "category": "Conference"},
    {"name": "Round 4-Seater Brainstorm Table", "type": "goods", "sales_price": 680.0, "cost_price": 380.0, "category": "Conference"},
    {"name": "Folding Training Table with Wheels", "type": "goods", "sales_price": 450.0, "cost_price": 240.0, "category": "Conference"},
    {"name": "Mobile Magnetic Glass Presentation Board", "type": "goods", "sales_price": 320.0, "cost_price": 170.0, "category": "Conference"},
    {"name": "3-Drawer Mobile Metal Pedestal", "type": "goods", "sales_price": 210.0, "cost_price": 110.0, "category": "Storage"},
    {"name": "Tambour Door Lateral Filing Credenza", "type": "goods", "sales_price": 750.0, "cost_price": 410.0, "category": "Storage"},
    {"name": "Industrial Bookshelf 5-Tier Heavy Duty", "type": "goods", "sales_price": 480.0, "cost_price": 260.0, "category": "Storage"},
    {"name": "8-Door Lockable Employee Locker", "type": "goods", "sales_price": 1100.0, "cost_price": 620.0, "category": "Storage"},
    {"name": "3-Seater Chesterfield Velvet Sofa", "type": "goods", "sales_price": 1800.0, "cost_price": 1050.0, "category": "Lounge"},
    {"name": "Mid-Century Modern Lounge Armchair", "type": "goods", "sales_price": 580.0, "cost_price": 320.0, "category": "Lounge"},
    {"name": "Solid Walnut Lowline Coffee Table", "type": "goods", "sales_price": 360.0, "cost_price": 190.0, "category": "Lounge"},
    {"name": "Curved Quartz Reception Desk with LED", "type": "goods", "sales_price": 2600.0, "cost_price": 1450.0, "category": "Lounge"},
    {"name": "Acoustic Soundproof Privacy Phone Booth", "type": "goods", "sales_price": 4500.0, "cost_price": 2600.0, "category": "Lounge"},
    {"name": "Workplace Ergonomic Audit & Layout Design", "type": "service", "sales_price": 500.0, "cost_price": 150.0, "category": "Services"},
    {"name": "On-Site Workstation Assembly & Cable Routing", "type": "service", "sales_price": 250.0, "cost_price": 100.0, "category": "Services"},
    {"name": "Annual Furniture Maintenance Contract (AMC)", "type": "service", "sales_price": 1200.0, "cost_price": 500.0, "category": "Services"},
    {"name": "C-Suite Executive Office Bundle", "type": "combo", "sales_price": 2800.0, "cost_price": 1600.0, "category": "Combos"},
    {"name": "Startup Rapid 4-Pod Office Package", "type": "combo", "sales_price": 3950.0, "cost_price": 2300.0, "category": "Combos"}
]

def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        contact_count = db.query(Contact).count()
        if not force and contact_count >= 30:
            print("Database already contains expanded 200+ demo data.")
            return

        print("Resetting database schema for clean 200+ demo data generation...")
        db.close()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

        print("Seeding Standard Chart of Accounts (COA)...")
        accounts_data = [
            {"code": "1010", "name": "Cash on Hand", "type": "asset"},
            {"code": "1020", "name": "Bank Account - HDFC Current", "type": "asset"},
            {"code": "1021", "name": "Bank Account - ICICI Operating", "type": "asset"},
            {"code": "1050", "name": "Petty Cash Reserve", "type": "asset"},
            {"code": "1100", "name": "Accounts Receivable", "type": "asset"},
            {"code": "1200", "name": "Finished Furniture Inventory", "type": "asset"},
            {"code": "1210", "name": "Raw Materials Timber & Foam", "type": "asset"},
            {"code": "1500", "name": "Plant & Woodworking Machinery", "type": "asset"},
            {"code": "1510", "name": "Office Fixtures & Showroom Fittings", "type": "asset"},
            {"code": "1520", "name": "Commercial Logistics Trucks", "type": "asset"},
            {"code": "2000", "name": "Accounts Payable", "type": "liability"},
            {"code": "2100", "name": "GST / Output Sales Tax Payable", "type": "liability"},
            {"code": "2200", "name": "Employee Wages Payable", "type": "liability"},
            {"code": "2300", "name": "HDFC Term Equipment Loan", "type": "liability"},
            {"code": "3000", "name": "Paid-up Share Capital", "type": "capital"},
            {"code": "3100", "name": "Retained Earnings", "type": "capital"},
            {"code": "4000", "name": "Furniture Sales Revenue", "type": "income"},
            {"code": "4100", "name": "Interior Design & Ergonomic Services", "type": "income"},
            {"code": "4200", "name": "Delivery & Assembly Income", "type": "income"},
            {"code": "5000", "name": "Cost of Goods Sold (COGS)", "type": "expense"},
            {"code": "5100", "name": "Factory & Showroom Rent", "type": "expense"},
            {"code": "5200", "name": "Staff Salaries & Wages", "type": "expense"},
            {"code": "5300", "name": "Factory Power & Utilities", "type": "expense"},
            {"code": "5400", "name": "Digital Marketing & Branding", "type": "expense"},
            {"code": "5500", "name": "Freight & Shipping Logistics", "type": "expense"}
        ]
        account_map = {}
        for acc in accounts_data:
            a = Account(**acc)
            db.add(a)
            db.flush()
            account_map[acc["code"]] = a

        print("Seeding Financial Journals...")
        journals_data = [
            {"name": "Sales Journal", "type": "sales", "default_account_id": account_map["4000"].id},
            {"name": "Purchase Journal", "type": "purchase", "default_account_id": account_map["5000"].id},
            {"name": "Bank Journal", "type": "bank", "default_account_id": account_map["1020"].id},
            {"name": "Cash Journal", "type": "cash", "default_account_id": account_map["1010"].id},
            {"name": "General Journal", "type": "general", "default_account_id": None}
        ]
        journal_map = {}
        for jd in journals_data:
            j = Journal(**jd)
            db.add(j)
            db.flush()
            journal_map[jd["type"]] = j

<<<<<<< HEAD
        print("Seeding Users...")
        users = [
            User(email="admin@urbanfurniture.com", hashed_password=hash_password("admin123"), full_name="Aakash Jayani (Owner)", role="admin"),
            User(email="accountant@urbanfurniture.com", hashed_password=hash_password("accountant123"), full_name="Chandan Shah (Chief Accountant)", role="invoicing_user"),
            User(email="clerk@urbanfurniture.com", hashed_password=hash_password("clerk123"), full_name="Rudra Patel (Ledger Officer)", role="invoicing_user"),
            User(email="customer@tejas.com", hashed_password=hash_password("customer123"), full_name="Tejas Sharma (Client Portal)", role="contact"),
            User(email="vendor@woodcraft.com", hashed_password=hash_password("vendor123"), full_name="Vikram Mehta (Timber Supplier)", role="contact")
        ]
        db.add_all(users)
        db.flush()

        print("Seeding Contacts (35 Customers & Vendors)...")
        contact_objs = []
        for c_data in CUSTOMERS_DATA:
            c = Contact(type="customer", **c_data)
            db.add(c)
            contact_objs.append(c)
        for v_data in VENDORS_DATA:
            v = Contact(type="vendor", **v_data)
            db.add(v)
            contact_objs.append(v)
        db.flush()

        customers = [c for c in contact_objs if c.type == "customer"]
        vendors = [c for c in contact_objs if c.type == "vendor"]

        print("Seeding Products (30 Items, Services, and Bundles)...")
        product_objs = []
        for p_data in PRODUCTS_DATA:
            p = Product(**p_data)
            db.add(p)
            product_objs.append(p)
=======
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
            role="contact",
            contact_id=customer.id
        )
        db.add_all([admin, accountant, contact_user])
        db.flush()

        print("Seeding Products...")
        p1 = Product(name="Ergonomic Executive Desk", type="goods", sales_price=1200.0, cost_price=700.0, category="Desks")
        p2 = Product(name="Mesh Chair", type="goods", sales_price=350.0, cost_price=180.0, category="Chairs")
        db.add_all([p1, p2])
>>>>>>> f769697 (Update accounting system)
        db.flush()

        print("Seeding Analytic Accounts (Cost Centers)...")
        analytics_data = [
            {"name": "Showroom Expansion Mumbai", "type": "expenses"},
            {"name": "Tech Park Retail Bengaluru", "type": "expenses"},
            {"name": "Digital Advertising & SEO", "type": "expenses"},
            {"name": "R&D Ergonomics Laboratory", "type": "expenses"},
            {"name": "Fleet Logistics & Warehousing", "type": "expenses"},
            {"name": "Factory Automation & Tooling", "type": "expenses"},
            {"name": "Customer Support & After-Sales", "type": "expenses"},
            {"name": "Executive Operations & Admin", "type": "expenses"}
        ]
        analytics_objs = []
        for ad in analytics_data:
            an = AnalyticAccount(**ad)
            db.add(an)
            analytics_objs.append(an)
        db.flush()

        print("Seeding Budgets (8 Planned Budgets)...")
        now_utc = datetime.now(timezone.utc)
        budgets_data = [
            {"name": "Mumbai Showroom Fitout Q1", "planned": 45000.0, "analytic": analytics_objs[0], "resp": "Aakash Jayani"},
            {"name": "Bengaluru Hub Launch", "planned": 35000.0, "analytic": analytics_objs[1], "resp": "Chandan Shah"},
            {"name": "Q1 Performance Marketing", "planned": 20000.0, "analytic": analytics_objs[2], "resp": "Rudra Patel"},
            {"name": "Eco-Mesh Chair R&D", "planned": 18000.0, "analytic": analytics_objs[3], "resp": "Aakash Jayani"},
            {"name": "Fleet Delivery Optimization", "planned": 25000.0, "analytic": analytics_objs[4], "resp": "Chandan Shah"},
            {"name": "CNC Wood Lathe Tooling", "planned": 30000.0, "analytic": analytics_objs[5], "resp": "Rudra Patel"},
            {"name": "Warranty & Customer Care", "planned": 12000.0, "analytic": analytics_objs[6], "resp": "Chandan Shah"},
            {"name": "Corporate Admin General", "planned": 15000.0, "analytic": analytics_objs[7], "resp": "Aakash Jayani"}
        ]
        for bd in budgets_data:
            b = Budget(
                name=bd["name"],
                start_date=now_utc - timedelta(days=60),
                end_date=now_utc + timedelta(days=120),
                responsible_person=bd["resp"],
                analytic_account_id=bd["analytic"].id,
                planned_amount=bd["planned"]
            )
            db.add(b)
        db.flush()

        print("Seeding Initial Equity Capital ($75,000)...")
        gen_journal = journal_map["general"]
        bank_journal = journal_map["bank"]
        cash_journal = journal_map["cash"]
        sales_journal = journal_map["sales"]
        purchase_journal = journal_map["purchase"]

        init_je = JournalEntry(
            journal_id=gen_journal.id,
            entry_number="JE-2026-0001",
            reference="Founding Share Capital Investment",
            date=now_utc - timedelta(days=80),
            is_posted=True
        )
        db.add(init_je)
        db.flush()
        db.add_all([
            JournalEntryLine(journal_entry_id=init_je.id, account_id=account_map["1020"].id, debit=75000.0, credit=0.0, description="HDFC Bank Initial Deposit"),
            JournalEntryLine(journal_entry_id=init_je.id, account_id=account_map["3000"].id, debit=0.0, credit=75000.0, description="Founders Paid-up Share Capital")
        ])

        print("Seeding 75 Purchase Orders, 65 Vendor Bills & 40 Payments...")
        po_objs = []
        bill_objs = []
        vendor_payments = []
        je_counter = 2

        for i in range(65):
            vend = vendors[i % len(vendors)]
            prod = product_objs[(i * 2) % len(product_objs)]
            qty = 2 + (i % 7) * 2
            unit_p = prod.cost_price
            tot = round(qty * unit_p, 2)
            days_ago = 88 - (i * 1.2)

            is_paid = i < 40

            bill_je = JournalEntry(
                journal_id=purchase_journal.id,
                entry_number=f"JE-2026-{je_counter:04d}",
                reference=f"Bill for PO #{i+1:03d} - {vend.name[:18]}",
                date=now_utc - timedelta(days=days_ago),
                is_posted=True
            )
            db.add(bill_je)
            db.flush()
            je_counter += 1

            db.add_all([
                JournalEntryLine(journal_entry_id=bill_je.id, account_id=account_map["5000"].id, debit=tot, credit=0.0, description=f"Purchase: {prod.name} x {qty}"),
                JournalEntryLine(journal_entry_id=bill_je.id, account_id=account_map["2000"].id, debit=0.0, credit=tot, description=f"AP: {vend.name}")
            ])

            inv = Invoice(
                transaction_type="purchase",
                contact_id=vend.id,
                invoice_number=f"BILL-2026-{i+1:04d}",
                date=now_utc - timedelta(days=days_ago),
                due_date=now_utc - timedelta(days=days_ago - 30),
                status="paid" if is_paid else "posted",
                total_amount=tot,
                paid_amount=tot if is_paid else 0.0,
                journal_entry_id=bill_je.id
            )
            db.add(inv)
            db.flush()
            bill_objs.append(inv)

            if is_paid:
                pay_je = JournalEntry(
                    journal_id=bank_journal.id if (i % 2 == 0) else cash_journal.id,
                    entry_number=f"JE-2026-{je_counter:04d}",
                    reference=f"Vendor Settlement BILL-2026-{i+1:04d}",
                    date=now_utc - timedelta(days=max(1.0, days_ago - 4)),
                    is_posted=True
                )
                db.add(pay_je)
                db.flush()
                je_counter += 1

                pay_acc = account_map["1020"].id if (i % 2 == 0) else account_map["1010"].id
                db.add_all([
                    JournalEntryLine(journal_entry_id=pay_je.id, account_id=account_map["2000"].id, debit=tot, credit=0.0, description=f"AP Clearance: {vend.name}"),
                    JournalEntryLine(journal_entry_id=pay_je.id, account_id=pay_acc, debit=0.0, credit=tot, description="Disbursement to Vendor")
                ])

                pmt = Payment(
                    invoice_id=inv.id,
                    payment_method="bank" if (i % 2 == 0) else "cash",
                    amount=tot,
                    date=now_utc - timedelta(days=max(1.0, days_ago - 4)),
                    reference=f"VPAY-2026-{i+1:04d}",
                    journal_entry_id=pay_je.id
                )
                db.add(pmt)
                vendor_payments.append(pmt)

            po = PurchaseOrder(
                vendor_id=vend.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=unit_p,
                total_amount=tot,
                status="billed",
                created_at=now_utc - timedelta(days=days_ago + 2),
                invoice_id=inv.id
            )
            db.add(po)
            po_objs.append(po)

        # 10 additional draft Purchase Orders
        for i in range(65, 75):
            vend = vendors[i % len(vendors)]
            prod = product_objs[(i * 3) % len(product_objs)]
            qty = 3 + (i % 5)
            unit_p = prod.cost_price
            tot = round(qty * unit_p, 2)
            po = PurchaseOrder(
                vendor_id=vend.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=unit_p,
                total_amount=tot,
                status="draft",
                created_at=now_utc - timedelta(days=5)
            )
            db.add(po)
            po_objs.append(po)

        print("Seeding 75 Sales Orders, 65 Customer Invoices & 40 Receipts...")
        so_objs = []
        invoice_objs = []
        customer_payments = []

        for i in range(65):
            cust = customers[i % len(customers)]
            prod = product_objs[(i * 3) % len(product_objs)]
            qty = 1 + (i % 5) * 2
            unit_p = prod.sales_price
            subtotal = qty * unit_p
            tax = round(subtotal * 0.08, 2)
            tot = round(subtotal + tax, 2)
            days_ago = 85 - (i * 1.2)

            is_paid = i < 40

            inv_je = JournalEntry(
                journal_id=sales_journal.id,
                entry_number=f"JE-2026-{je_counter:04d}",
                reference=f"Customer Invoice for SO #{i+1:03d} - {cust.name[:18]}",
                date=now_utc - timedelta(days=days_ago),
                is_posted=True
            )
            db.add(inv_je)
            db.flush()
            je_counter += 1

            db.add_all([
                JournalEntryLine(journal_entry_id=inv_je.id, account_id=account_map["1100"].id, debit=tot, credit=0.0, description=f"AR: {cust.name}"),
                JournalEntryLine(journal_entry_id=inv_je.id, account_id=account_map["4000"].id, debit=0.0, credit=tot, description=f"Sales: {prod.name} x {qty}")
            ])

            inv = Invoice(
                transaction_type="sale",
                contact_id=cust.id,
                invoice_number=f"INV-2026-{i+1:04d}",
                date=now_utc - timedelta(days=days_ago),
                due_date=now_utc - timedelta(days=days_ago - 20),
                status="paid" if is_paid else "posted",
                total_amount=tot,
                paid_amount=tot if is_paid else 0.0,
                journal_entry_id=inv_je.id
            )
            db.add(inv)
            db.flush()
            invoice_objs.append(inv)

            if is_paid:
                pay_je = JournalEntry(
                    journal_id=bank_journal.id if (i % 3 != 0) else cash_journal.id,
                    entry_number=f"JE-2026-{je_counter:04d}",
                    reference=f"Collection INV-2026-{i+1:04d}",
                    date=now_utc - timedelta(days=max(1.0, days_ago - 3)),
                    is_posted=True
                )
                db.add(pay_je)
                db.flush()
                je_counter += 1

                recv_acc = account_map["1020"].id if (i % 3 != 0) else account_map["1010"].id
                db.add_all([
                    JournalEntryLine(journal_entry_id=pay_je.id, account_id=recv_acc, debit=tot, credit=0.0, description="Collection from Customer"),
                    JournalEntryLine(journal_entry_id=pay_je.id, account_id=account_map["1100"].id, debit=0.0, credit=tot, description=f"AR Cleared: {cust.name}")
                ])

                pmt = Payment(
                    invoice_id=inv.id,
                    payment_method="bank" if (i % 3 != 0) else "cash",
                    amount=tot,
                    date=now_utc - timedelta(days=max(1.0, days_ago - 3)),
                    reference=f"CPAY-2026-{i+1:04d}",
                    journal_entry_id=pay_je.id
                )
                db.add(pmt)
                customer_payments.append(pmt)

            so = SalesOrder(
                customer_id=cust.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=unit_p,
                tax=tax,
                total_amount=tot,
                status="invoiced",
                created_at=now_utc - timedelta(days=days_ago + 1),
                invoice_id=inv.id
            )
            db.add(so)
            so_objs.append(so)

        # 10 additional draft Sales Orders
        for i in range(65, 75):
            cust = customers[i % len(customers)]
            prod = product_objs[(i * 4) % len(product_objs)]
            qty = 2 + (i % 4)
            unit_p = prod.sales_price
            subtotal = qty * unit_p
            tax = round(subtotal * 0.08, 2)
            tot = round(subtotal + tax, 2)
            so = SalesOrder(
                customer_id=cust.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=unit_p,
                tax=tax,
                total_amount=tot,
                status="draft",
                created_at=now_utc - timedelta(days=3)
            )
            db.add(so)
            so_objs.append(so)

        print("Seeding 19 Operating & Cost-Center Expense Journal Entries (Total JEs: 230)...")
        operating_expenses = [
            {"ref": "Factory & Showroom Lease Month 1", "exp_acc": "5100", "amt": 8500.0, "an": analytics_objs[0], "days": 75},
            {"ref": "Staff Salaries & Factory Wages Month 1", "exp_acc": "5200", "amt": 15000.0, "an": analytics_objs[7], "days": 70},
            {"ref": "Factory Electricity & Utility Grid Month 1", "exp_acc": "5300", "amt": 2800.0, "an": None, "days": 68},
            {"ref": "Google Ads & Social Media Marketing Month 1", "exp_acc": "5400", "amt": 4500.0, "an": analytics_objs[2], "days": 65},
            {"ref": "Showroom Interior Architectural Milestone 1", "exp_acc": "1510", "amt": 7200.0, "an": analytics_objs[0], "days": 60},
            {"ref": "Factory & Showroom Lease Month 2", "exp_acc": "5100", "amt": 8500.0, "an": analytics_objs[0], "days": 50},
            {"ref": "Staff Salaries & Factory Wages Month 2", "exp_acc": "5200", "amt": 15200.0, "an": analytics_objs[7], "days": 45},
            {"ref": "Factory Electricity & Utility Grid Month 2", "exp_acc": "5300", "amt": 2950.0, "an": None, "days": 43},
            {"ref": "Bengaluru Hub Launch Retail Branding", "exp_acc": "5400", "amt": 6000.0, "an": analytics_objs[1], "days": 40},
            {"ref": "Commercial Freight & Inter-State Shipping", "exp_acc": "5500", "amt": 3800.0, "an": analytics_objs[4], "days": 35},
            {"ref": "CNC Router Tooling & Carbide Bits", "exp_acc": "5000", "amt": 4200.0, "an": analytics_objs[5], "days": 30},
            {"ref": "Showroom Interior Fitout Milestone 2", "exp_acc": "1510", "amt": 5800.0, "an": analytics_objs[0], "days": 25},
            {"ref": "Factory & Showroom Lease Month 3", "exp_acc": "5100", "amt": 8500.0, "an": analytics_objs[0], "days": 20},
            {"ref": "Staff Salaries & Factory Wages Month 3", "exp_acc": "5200", "amt": 15500.0, "an": analytics_objs[7], "days": 18},
            {"ref": "Factory Electricity & Utility Grid Month 3", "exp_acc": "5300", "amt": 3100.0, "an": None, "days": 15},
            {"ref": "Ergonomic Lumbar Stress Analysis Testing", "exp_acc": "5000", "amt": 3600.0, "an": analytics_objs[3], "days": 12},
            {"ref": "Warranty Claims & Spare Part Servicing", "exp_acc": "5000", "amt": 2400.0, "an": analytics_objs[6], "days": 8},
            {"ref": "Fleet Route Fuel & Dispatch Optimization", "exp_acc": "5500", "amt": 4100.0, "an": analytics_objs[4], "days": 5},
            {"ref": "Digital Ads Performance Campaign Retargeting", "exp_acc": "5400", "amt": 5200.0, "an": analytics_objs[2], "days": 2}
        ]

        for opex in operating_expenses:
            op_je = JournalEntry(
                journal_id=bank_journal.id,
                entry_number=f"JE-2026-{je_counter:04d}",
                reference=opex["ref"],
                date=now_utc - timedelta(days=opex["days"]),
                is_posted=True
            )
            db.add(op_je)
            db.flush()
            je_counter += 1

            amt = opex["amt"]
            an_id = opex["an"].id if opex["an"] else None
            db.add_all([
                JournalEntryLine(journal_entry_id=op_je.id, account_id=account_map[opex["exp_acc"]].id, analytic_account_id=an_id, debit=amt, credit=0.0, description=opex["ref"]),
                JournalEntryLine(journal_entry_id=op_je.id, account_id=account_map["1020"].id, debit=0.0, credit=amt, description="HDFC Bank Operating Disbursement")
            ])

        db.commit()
        print("Successfully committed full 200+ Demo Dataset!")

        counts = {
            "Users": db.query(User).count(),
            "Accounts": db.query(Account).count(),
            "Journals": db.query(Journal).count(),
            "Contacts": db.query(Contact).count(),
            "Products": db.query(Product).count(),
            "Analytic Accounts": db.query(AnalyticAccount).count(),
            "Budgets": db.query(Budget).count(),
            "Purchase Orders": db.query(PurchaseOrder).count(),
            "Sales Orders": db.query(SalesOrder).count(),
            "Invoices / Bills": db.query(Invoice).count(),
            "Payments": db.query(Payment).count(),
            "Journal Entries": db.query(JournalEntry).count(),
            "Journal Entry Lines": db.query(JournalEntryLine).count(),
        }
        total_records = sum(counts.values())
        print(f"\n=================== DEMO DATA SUMMARY ===================")
        for entity, cnt in counts.items():
            print(f"  * {entity:22}: {cnt} records")
        print(f"---------------------------------------------------------")
        print(f"  TOTAL RECORDS SEEDED   : {total_records} records")
        print(f"=========================================================\n")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force=True)
