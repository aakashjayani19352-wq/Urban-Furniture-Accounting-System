# Urban Furniture Accounting System

This is a monorepo for the Urban Furniture Accounting System.

## Project Structure

- `/backend` — FastAPI project with SQLAlchemy, Pydantic, Alembic, python-jose + passlib.
- `/frontend` — React app scaffolded with Vite, Tailwind CSS, React Router, Recharts.

## Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Start the PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
