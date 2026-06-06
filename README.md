# VendorBridge - Odoo x KSV Hackathon 2026

Odoo x KSV Hackathon 2026 submission by Team Vaibhav. Building innovative solutions using modern web technologies, real-time data, and clean UI/UX.

This project is a full-stack procurement and vendor management system (VendorBridge). It consists of a FastAPI backend and a React (Vite) frontend.

## Prerequisites

- Node.js (v18+)
- Python 3.10+

## 🚀 How to Run Locally

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and install the dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set up your environment variables:
```bash
cp .env.example .env
```
*(Make sure to update any database credentials or secret keys if necessary in the `.env` file).*

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the dependencies using npm:
```bash
npm install
```

---

## 💾 Database Initialization & Loading Demo Data

To test the application with pre-populated demo data, run the following scripts from the **root directory** of the project in your Python virtual environment:

**1. Initialize the Database** (Creates tables and basic roles):
```bash
python3 initialize_database.py
```

**2. Load Product Catalog** (Creates categories and random products):
```bash
PYTHONPATH=. python3 backend/seed_data.py
```

**3. Load Business Data** (Creates vendors, staff, RFQs, Quotations, and Purchase Orders):
```bash
PYTHONPATH=. python3 backend/seed_business_data.py
```

**4. Create Admin Account** (Optional but recommended):
```bash
PYTHONPATH=. python3 backend/create_admin.py
```

---

## ▶️ Running the Application

### Start the Backend Server
In your backend terminal (with the virtual environment activated), run:
```bash
cd backend
PYTHONPATH=.. python3 -m uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### Start the Frontend Server
In your frontend terminal, run:
```bash
cd frontend
npm run dev
```
The web application will be available at `http://127.0.0.1:5173`.

## 🔑 Default Login Credentials
If you generated business demo data, you can log in with:
- **Manager**: `manager@vendorbridge.com` / `password`
- **Procurement Officer**: `procurement@vendorbridge.com` / `password`
- **Financer**: `finance@vendorbridge.com` / `password`
- **Vendor**: `contact@techsupplyinc.com` / `vendor123` (or other seeded vendors)
