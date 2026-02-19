# ⚡ Quick Start Guide

**For experienced developers who want to get started fast.**

## Prerequisites Check
```bash
node --version    # Need v16+
npm --version
psql --version    # Need PostgreSQL 12+
```

## 1. Database Setup (One-time)
```bash
# Create database
psql -U suthikshaaghoram -c "CREATE DATABASE travelapp;"

# Import schema
cd backend
psql -U suthikshaaghoram -d travelapp -f db.sql
node run_migration.js
```

## 2. Backend Setup
```bash
cd backend
npm install

# Edit .env file (update DB_USER, DB_PASSWORD if needed)
# Then start:
npm start
```

## 3. Frontend Setup (New Terminal)
```bash
cd /path/to/travelapp
npm install
npm run web
```

## 4. Optional: Seed Mock Data
```bash
cd backend
node scripts/seed_tamilnadu_travelers.js
```

## Test Login
- Email: `traveler@example.com`
- Password: `password`

## URLs
- Backend: http://localhost:5001
- Frontend: http://localhost:8081

---

**For detailed instructions, see `RUN_INSTRUCTIONS.md`**
