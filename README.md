# 🌍 Travel App - Smart Tourism Management System

A comprehensive role-based travel assistance platform that connects travelers with service providers and helps manage tourist crowds efficiently using real-time data.

## ✨ Key Features

### 1. 👥 Role-Based Access Control
- **Traveler**: Plan trips, view destinations, check crowd levels, book resources.
- **Service Provider**: Manage resources (hotels, guides, taxis), update availability.
- **Admin**: Oversee platform activity, manage users and locations.

### 2. 📊 Time Slot Crowd Management (New!)
- **Real-time Crowd Tracking**: View potential crowd levels for specific times of day.
- **Smart Planning**: "Best Time to Visit" suggestions based on historical data.
- **Live Updates**: Crowd counts update instantly when users mark their visits.
- **Granular Data**: Morning / Noon / Evening slots for precise planning.

### 3. 🗺️ Interactive Destination Guide
- Detailed information cards for tourist spots.
- Integrated map navigation and direct calling features.
- Emergency service highlighting (Police, Hospital).

---

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo), React Navigation, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens).

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone & Install Dependencies

**Frontend:**
```bash
# In the root directory
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Database Setup

1.  **Start PostgreSQL service** if not running.
2.  **Create Database**:
    ```sql
    CREATE DATABASE travelapp;
    ```
3.  **Import Schema & Data**:
    ```bash
    psql -d travelapp -f backend/db.sql
    ```
4.  **Run Migrations (for Crowd System)**:
    ```bash
    cd backend
    node run_migration.js
    ```
5.  **Seed Initial Data (Optional)**:
    ```bash
    node scripts/seed_place_slots.js
    ```

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5001
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=travelapp
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_secret_key_here
GEOAPIFY_API_KEY=your_api_key_here
```

---

## 🏃‍♂️ Running the Application

### Step 1: Start Backend Server
```bash
cd backend
npm start
```
*Server runs on http://localhost:5001*

### Step 2: Start Frontend Application
```bash
# In a new terminal window (root directory)
npm run web
```
*App opens at http://localhost:8081*

---

## 🔐 Login Credentials (Test Accounts)

| Role | Email | Password |
|------|-------|----------|
| **Traveler** | `traveler@example.com` | `password` |
| **Provider** | `provider@example.com` | `password` |
| **Admin** | `admin@example.com` | `password` |

> **Note**: For the Traveler account, verify the password is `password` (not `password123`).

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` - Create new account.
- `POST /api/auth/login` - Authenticate user & get token.

### Places & Crowd
- `GET /api/places?city=Concord` - Fetch cached or live places.
- `GET /api/places/crowd-slots` - Get visitor counts for a place/date.
- `POST /api/places/visit` - Record a visit for a specific time slot.

---

## 📱 Project Structure

```
travelapp/
├── App.js                 # Main Entry Point & Navigation
├── components/            # Reusable UI Components (Cards, Buttons)
├── screens/               # App Screens
│   ├── LoginScreen.js     # Authentication Logic
│   ├── TravelerDashboard.js # Main User Hub
│   ├── DestinationInfoScreen.js # Place Details & Crowd UI
│   └── ...
├── services/              # API Integration (Axios)
└── backend/               # Server-side Code
    ├── controlllers/      # Business Logic
    ├── routes/            # API Endpoints
    ├── models/            # Database Queries
    └── migrations/        # Database Schema Updates
```

---

*Documentation updated on Feb 19, 2026*
