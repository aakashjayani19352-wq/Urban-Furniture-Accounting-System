import os
import time
import shutil
import subprocess
import pyttsx3
from playwright.sync_api import sync_playwright

AUDIO_DIR = os.path.abspath("demo_media/audio")
VIDEO_DIR = os.path.abspath("demo_media/video")
OUTPUT_MP4 = os.path.abspath("urban_furniture_demo_walkthrough.mp4")
ARTIFACT_DIR = r"C:\Users\123\.gemini\antigravity-ide\brain\d1e45706-c280-40e4-9cab-fd5841de716e"
ARTIFACT_MP4 = os.path.join(ARTIFACT_DIR, "urban_furniture_demo_walkthrough.mp4")
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# Narration script segments for ~5 minutes
SECTIONS = [
    {
        "id": "01_intro",
        "title": "Welcome & Landing Page",
        "narration": (
            "Welcome to the comprehensive demonstration of the Urban Furniture Accounting System. "
            "This enterprise-grade application is a full-stack, double-entry financial enterprise resource planning platform "
            "engineered with FastAPI, SQLite, SQLAlchemy, and a high-performance React frontend. "
            "Here on the landing page, we can observe live corporate metrics, core double-entry capabilities, "
            "and seamless dark and light mode theme switching designed for maximum visual comfort and high contrast."
        ),
        "url": "http://localhost:5173/landing",
    },
    {
        "id": "02_auth_signup",
        "title": "Authentication & Sign Up Specification",
        "narration": (
            "Moving to authentication, we have engineered full compliance with our Excalidraw specification. "
            "On the Sign Up page, users can register with a unique Login Id between six and twelve characters, "
            "a unique email address, and a high-security password requiring uppercase, lowercase, special characters, "
            "and a length exceeding eight characters. Self-registration automatically assigns the standard invoicing user role."
        ),
        "url": "http://localhost:5173/signup",
    },
    {
        "id": "03_auth_login",
        "title": "Login & Password Recovery",
        "narration": (
            "The login screen supports flexible sign in with either Login Id or Email address. "
            "If credentials do not match, the exact specification error message, 'Invalid Login Id or Password', is raised. "
            "Users can also seamlessly access the Forgot Password recovery screen to securely reset their credentials. "
            "Let's sign in using our system administrator credentials."
        ),
        "url": "http://localhost:5173/login",
    },
    {
        "id": "04_dashboard",
        "title": "Executive Financial Dashboard",
        "narration": (
            "Upon signing in, administrators and accountants arrive at the Executive Dashboard. "
            "Here, real-time key performance indicators display total sales revenue, operating expenses, net profit, "
            "and unpaid customer invoices, all localized in Indian Rupees. "
            "Recent transactions, rapid actions, and live financial charts provide immediate operational clarity."
        ),
        "url": "http://localhost:5173/",
    },
    {
        "id": "05_user_management",
        "title": "User Administration & Role Assignment",
        "narration": (
            "Under the Administration menu, we have the User Management console. "
            "Administrators can inspect all system accounts and their active roles, including Administrator, Accountant, and Portal User. "
            "Clicking Create User opens our wireframe-aligned creation modal, enabling role radio-button selection "
            "and strict credential enforcement directly from within the application."
        ),
        "url": "http://localhost:5173/users",
    },
    {
        "id": "06_master_data",
        "title": "Master Data: Contacts, Products, COA & Journals",
        "narration": (
            "Now let us examine Master Data. The Contacts Directory maintains over thirty-five verified customers and suppliers "
            "with quick filtering and live receivable balances. "
            "Our Product Catalog contains over thirty commercial furniture items, ergonomic chairs, and modular workstations, "
            "with transparent sales and cost pricing in Indian Rupees. "
            "Next, the Chart of Accounts defines standard Assets, Liabilities, Capital, Income, and Expenses, "
            "paired with our five dedicated financial journals: Sales, Purchase, Bank, Cash, and General Ledger."
        ),
        "url": "http://localhost:5173/contacts",
    },
    {
        "id": "07_purchasing_budgets",
        "title": "Purchasing, Budgets & Non-Blocking Warnings",
        "narration": (
            "Next is the Procurement and Budgeting engine. We maintain eight active cost centers with planned budgets. "
            "When creating a Purchase Order, if an order amount exceeds the approved remaining budget for that cost center, "
            "our non-blocking warning modal alerts the procurement officer while allowing legitimate confirmation. "
            "Confirmed purchase orders automatically convert to vendor bills, allowing partial or full payment registration "
            "that instantly updates the payable balance and posts the underlying journal entries."
        ),
        "url": "http://localhost:5173/purchases",
    },
    {
        "id": "08_sales_cycle",
        "title": "Sales Cycle: Order to Invoice to Cash",
        "narration": (
            "In the Sales module, we track client sales orders through invoice creation and payment collection. "
            "Each confirmed sales order generates a customer invoice. "
            "When customer payments are registered, the invoice transitions from unpaid to partial or paid in full, "
            "and the accounts receivable balance automatically reconciles against the bank or cash account."
        ),
        "url": "http://localhost:5173/sales",
    },
    {
        "id": "09_general_ledger",
        "title": "Double-Entry General Ledger & Hardened Controls",
        "narration": (
            "At the heart of the system is the General Ledger. "
            "Over two hundred and thirty journal entries are seeded and tracked with mathematical precision. "
            "Every single entry guarantees total debits strictly equal total credits. "
            "Our audit pass enforces clean database rollbacks, disallows negative lines, "
            "and prevents both debit and credit on the same line, delivering an institutional-grade accounting foundation."
        ),
        "url": "http://localhost:5173/journal-entries",
    },
    {
        "id": "10_reports",
        "title": "Real-Time Financial Reports",
        "narration": (
            "Management reporting provides instant financial intelligence. "
            "The Profit and Loss Statement calculates gross margin and net profit from all operating transactions. "
            "The Balance Sheet displays assets, liabilities, and equity, confirming that the fundamental accounting equation "
            "remains in exact equilibrium. "
            "Additionally, the Budget Variance report tracks planned versus actual expenditure across each analytic cost center."
        ),
        "url": "http://localhost:5173/reports/profit-loss",
    },
    {
        "id": "11_portal_conclusion",
        "title": "Customer Portal & Conclusion",
        "narration": (
            "Finally, let us sign out and examine the Customer Portal. "
            "Logging in as a client restricts the view exclusively to their own invoices and bills. "
            "Customers can review payment statuses and settle outstanding dues directly from their dedicated portal. "
            "With full test coverage, robust dark mode styling, Indian Rupee currency localization, and complete Excalidraw alignment, "
            "the Urban Furniture Accounting System is ready for production review. Thank you!"
        ),
        "url": "http://localhost:5173/login",
    }
]

def generate_voiceover():
    full_audio_path = os.path.join(AUDIO_DIR, "full_voiceover.wav")
    if os.path.exists(full_audio_path) and os.path.getsize(full_audio_path) > 1000000:
        print(f"Full voiceover audio already exists ({os.path.getsize(full_audio_path)} bytes), using existing file.", flush=True)
        return full_audio_path

    print("Generating full voiceover audio using pyttsx3...", flush=True)
    full_text = " ... \n\n".join(s["narration"] for s in SECTIONS)
    engine = pyttsx3.init()
    engine.setProperty("rate", 145)
    engine.save_to_file(full_text, full_audio_path)
    engine.runAndWait()
    print(f"Full voiceover generated: {full_audio_path}, size: {os.path.getsize(full_audio_path)} bytes", flush=True)
    return full_audio_path

def record_browser_actions():
    print("Launching Microsoft Edge via Playwright with video recording...", flush=True)
    # Clear old recordings in VIDEO_DIR
    for f in os.listdir(VIDEO_DIR):
        try:
            os.remove(os.path.join(VIDEO_DIR, f))
        except Exception:
            pass

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=["--window-size=1280,720"]
        )
        context = browser.new_context(
            record_video_dir=VIDEO_DIR,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        # Step 1: Landing Page
        print("1. Demonstrating Landing Page...", flush=True)
        page.goto("http://localhost:5173/landing", wait_until="networkidle")
        time.sleep(3)
        page.mouse.wheel(0, 400)
        time.sleep(3)
        page.mouse.wheel(0, 500)
        time.sleep(4)
        theme_btn = page.query_selector("button:has-text('Light'), button:has-text('Dark')")
        if theme_btn:
            theme_btn.click()
            time.sleep(2)
            theme_btn.click()
            time.sleep(2)
        page.mouse.wheel(0, -900)
        time.sleep(3)
        page.click("text=Sign In")
        time.sleep(3)

        # Step 2: Sign Up Page (Excalidraw spec)
        print("2. Demonstrating Sign Up Page...", flush=True)
        page.click("text=Sign Up")
        time.sleep(3)
        page.fill("input[placeholder='e.g. jayan_user']", "demo_acct")
        time.sleep(1)
        page.fill("input[placeholder='name@example.com']", "demo@urbanfurniture.com")
        time.sleep(1)
        page.fill("input[placeholder='Must be >8 chars with Aa1@']", "Secret@2026")
        time.sleep(2)
        page.fill("input[placeholder='Re-enter password to match']", "Secret@2026")
        time.sleep(4)
        page.click("text=Back to Sign In")
        time.sleep(2)

        # Step 3: Login & Forgot Password
        print("3. Demonstrating Login & Forgot Password...", flush=True)
        page.click("text=Forgot Password")
        time.sleep(4)
        page.click("text=Back to Sign In")
        time.sleep(3)
        # Login as Admin
        admin_btn = page.query_selector("button:has-text('Admin')")
        if admin_btn:
            admin_btn.click()
        else:
            page.fill("input[type='text']", "admin_user")
            page.fill("input[type='password']", "admin123")
            page.click("button:has-text('SIGN IN')")
        time.sleep(5)

        # Step 4: Executive Dashboard
        print("4. Demonstrating Executive Dashboard...", flush=True)
        page.wait_for_url("http://localhost:5173/")
        time.sleep(4)
        theme_btn = page.query_selector("header button[title*='Theme']")
        if theme_btn:
            theme_btn.click()
            time.sleep(3)
            theme_btn.click()
            time.sleep(2)
        page.mouse.wheel(0, 350)
        time.sleep(4)
        page.mouse.wheel(0, -350)
        time.sleep(3)

        # Step 5: User Management
        print("5. Demonstrating User Management...", flush=True)
        page.click("text=User Accounts & Roles")
        time.sleep(4)
        page.click("a[href='/users/new']")
        time.sleep(5)
        page.click("text=Cancel")
        time.sleep(3)

        # Step 6: Master Data
        print("6. Demonstrating Master Data...", flush=True)
        page.click("text=Contacts Directory")
        time.sleep(4)
        page.click("button:has-text('Vendors')")
        time.sleep(3)
        page.click("button:has-text('Customers')")
        time.sleep(3)
        page.click("button:has-text('All Contacts')")
        time.sleep(2)
        
        # Product catalog
        page.click("text=Product Catalog")
        time.sleep(4)
        page.mouse.wheel(0, 300)
        time.sleep(3)
        page.mouse.wheel(0, -300)
        time.sleep(2)

        # Chart of Accounts
        page.click("text=Chart of Accounts")
        time.sleep(4)
        page.mouse.wheel(0, 300)
        time.sleep(2)
        page.mouse.wheel(0, -300)

        # Financial Journals
        page.click("text=Financial Journals")
        time.sleep(4)

        # Step 7: Purchasing & Budgets
        print("7. Demonstrating Purchasing & Budgets...", flush=True)
        page.click("text=Cost Center Budgets")
        time.sleep(4)
        page.click("text=Purchase Orders & Bills")
        time.sleep(4)
        page.click("a[href='/purchases/new']")
        time.sleep(4)
        page.click("text=Cancel")
        time.sleep(3)

        # Step 8: Sales Cycle
        print("8. Demonstrating Sales Orders & Invoices...", flush=True)
        page.click("text=Sales Orders & Invoices")
        time.sleep(4)
        page.click("a[href='/sales/new']")
        time.sleep(4)
        page.click("text=Cancel")
        time.sleep(3)
        page.mouse.wheel(0, 300)
        time.sleep(3)
        page.mouse.wheel(0, -300)
        time.sleep(2)

        # Step 9: General Ledger
        print("9. Demonstrating General Ledger Journal Entries...", flush=True)
        page.click("text=General Ledger Entries")
        time.sleep(5)
        page.mouse.wheel(0, 400)
        time.sleep(4)
        page.mouse.wheel(0, -400)
        time.sleep(3)

        # Step 10: Reports
        print("10. Demonstrating Reports...", flush=True)
        page.click("text=Profit & Loss Statement")
        time.sleep(5)
        page.mouse.wheel(0, 300)
        time.sleep(3)
        page.mouse.wheel(0, -300)

        page.click("text=Balance Sheet")
        time.sleep(5)
        page.mouse.wheel(0, 300)
        time.sleep(3)
        page.mouse.wheel(0, -300)

        page.click("text=Budget Variance Report")
        time.sleep(5)

        # Step 11: Customer Portal
        print("11. Demonstrating Customer Portal...", flush=True)
        page.click("text=Sign out")
        time.sleep(2)
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        time.sleep(3)
        cust_btn = page.query_selector("button:has-text('Customer')")
        if cust_btn:
            cust_btn.click()
        else:
            page.fill("input[placeholder*='Login Id']", "customer_1")
            page.fill("input[type='password']", "customer123")
            page.click("button:has-text('SIGN IN')")
        time.sleep(6)
        page.mouse.wheel(0, 300)
        time.sleep(4)

        print("Recording completed. Closing browser...", flush=True)
        context.close()
        browser.close()

def find_recorded_video():
    files = [os.path.join(VIDEO_DIR, f) for f in os.listdir(VIDEO_DIR) if f.endswith(('.webm', '.mp4'))]
    if not files:
        raise RuntimeError("No recorded video found in " + VIDEO_DIR)
    files.sort(key=os.path.getmtime, reverse=True)
    return files[0]

def merge_video_and_audio(video_path, audio_path):
    print(f"Merging video ({video_path}) and voiceover audio ({audio_path})...", flush=True)
    cmd = (
        f'ffmpeg -y -i "{video_path}" -i "{audio_path}" '
        f'-filter_complex "[0:v]fps=30,format=yuv420p[v]" '
        f'-map "[v]" -map 1:a '
        f'-c:v libx264 -preset fast -crf 22 '
        f'-c:a aac -b:a 192k '
        f'-shortest "{OUTPUT_MP4}"'
    )
    print("Executing:", cmd, flush=True)
    subprocess.run(cmd, shell=True, check=True)
    print(f"Successfully generated: {OUTPUT_MP4}", flush=True)
    
    # Copy to artifacts directory
    shutil.copy2(OUTPUT_MP4, ARTIFACT_MP4)
    print(f"Copied final demonstration video to artifact directory: {ARTIFACT_MP4}", flush=True)

if __name__ == "__main__":
    audio_path = generate_voiceover()
    record_browser_actions()
    video_path = find_recorded_video()
    merge_video_and_audio(video_path, audio_path)
    print("ALL DONE! Demonstration video ready.", flush=True)
