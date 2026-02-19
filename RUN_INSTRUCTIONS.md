# 🚀 Travel App - Complete Run Instructions

This guide provides step-by-step instructions to set up and run the Travel App project from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

### Verify Installation

```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 8.x or higher
psql --version    # Should show PostgreSQL 12.x or higher
```

---

## 🗄️ Step 1: Database Setup

### 1.1 Start PostgreSQL Service

**macOS:**
```bash
brew services start postgresql
# OR
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**
```bash
sudo systemctl start postgresql
# OR
sudo service postgresql start
```

**Windows:**
- Start PostgreSQL from Services (services.msc)
- Or use pgAdmin GUI

### 1.2 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres
# OR (if using your username)
psql -U suthikshaaghoram

# Create database
CREATE DATABASE travelapp;

# Exit psql
\q
```

### 1.3 Import Database Schema

```bash
cd backend
psql -U suthikshaaghoram -d travelapp -f db.sql
```

**Note:** Replace `suthikshaaghoram` with your PostgreSQL username if different.

### 1.4 Run Migrations

```bash
cd backend
node run_migration.js
```

This creates the `place_crowd_slots` table for crowd management.

---

## ⚙️ Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This installs all required packages:
- express
- pg (PostgreSQL client)
- bcrypt
- jsonwebtoken
- cors
- dotenv
- axios

### 2.3 Configure Environment Variables

Create or edit `.env` file in the `backend/` directory:

```env
PORT=5001
DB_USER=suthikshaaghoram
DB_HOST=127.0.0.1
DB_NAME=travelapp
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key
GEOAPIFY_API_KEY=f0a5bbb601034e5faf56848113e90e34
```

**Important:** Update these values according to your PostgreSQL setup:
- `DB_USER`: Your PostgreSQL username
- `DB_PASSWORD`: Your PostgreSQL password
- `DB_HOST`: Usually `localhost` or `127.0.0.1`
- `JWT_SECRET`: Change to a secure random string for production

### 2.4 Start Backend Server

```bash
npm start
```

You should see:
```
Server is running on port 5001
Connected to the PostgreSQL database
Database connected successfully
```

**Keep this terminal open!** The backend server must stay running.

### 2.5 Verify Backend is Running

Open a new terminal and test:

```bash
curl http://localhost:5001/
```

Expected response: `Travel App API is running`

---

## 🎨 Step 3: Frontend Setup

### 3.1 Navigate to Root Directory

Open a **new terminal window** (keep backend running) and navigate to project root:

```bash
cd /path/to/travelapp
# OR if already in backend directory
cd ..
```

### 3.2 Install Frontend Dependencies

```bash
npm install
```

This installs:
- React Native
- Expo
- React Navigation
- Axios
- And other frontend dependencies

### 3.3 Start Frontend Application

**Option A: Web Version (Recommended for testing)**
```bash
npm run web
```

**Option B: Expo Development Server**
```bash
npm start
```

Then press:
- `w` for web
- `i` for iOS simulator (macOS only)
- `a` for Android emulator

The app will open at `http://localhost:8081` (web) or in your Expo Go app.

---

## 🎯 Step 4: Seed Mock Data (Optional but Recommended)

To populate the database with Tamil Nadu-focused mock data for presentation:

```bash
cd backend
node scripts/show_sample_data.js  # View existing data
node scripts/seed_tamilnadu_travelers.js  # Add more mock data
```

This creates:
- 100 travelers with Tamil names
- 250+ trips to Tamil Nadu destinations
- 460+ place visit records with crowd data

---

## 🔐 Step 5: Test Accounts

Use these accounts to login and test the application:

| Role | Email | Password |
|------|-------|----------|
| **Traveler** | `traveler@example.com` | `password` |
| **Provider** | `provider@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |

**Note:** If these accounts don't exist, register new ones or run the seed script.

---

## ✅ Step 6: Verify Everything Works

### 6.1 Test Backend API

```bash
# Test root endpoint
curl http://localhost:5001/

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@example.com","password":"password"}'
```

### 6.2 Test Frontend

1. Open browser to `http://localhost:8081`
2. You should see the login screen
3. Login with test credentials
4. Navigate through the app

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem: Port 5001 already in use**
```bash
# Find process using port 5001
lsof -ti:5001

# Kill the process
kill -9 <PID>
# OR
pkill -f "node.*server.js"
```

**Problem: Database connection failed**
- Check PostgreSQL is running: `psql -U your_username -d travelapp -c "SELECT 1;"`
- Verify `.env` file has correct credentials
- Check database exists: `psql -U your_username -l | grep travelapp`

**Problem: Module not found**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Problem: Expo cache errors**
```bash
# Clear Expo cache
expo start -c
# OR
rm -rf node_modules .expo
npm install
npm start
```

**Problem: Port 8081 already in use**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

**Problem: Metro bundler errors**
```bash
# Reset Metro cache
npm start -- --reset-cache
```

### Database Issues

**Problem: Tables don't exist**
```bash
cd backend
psql -U your_username -d travelapp -f db.sql
node run_migration.js
```

**Problem: Migration errors**
- Check if migrations already ran: `psql -U your_username -d travelapp -c "\dt"`
- Drop and recreate database if needed (WARNING: deletes all data)

---

## 📱 Running on Mobile Devices

### iOS (macOS only)

1. Install Xcode and iOS Simulator
2. Run: `npm start`
3. Press `i` to open iOS simulator
4. Or scan QR code with Expo Go app on iPhone

### Android

1. Install Android Studio and set up emulator
2. Run: `npm start`
3. Press `a` to open Android emulator
4. Or scan QR code with Expo Go app on Android

### Physical Device

1. Install Expo Go app from App Store/Play Store
2. Run: `npm start`
3. Scan QR code with Expo Go app
4. Ensure phone and computer are on same WiFi network

---

## 🔄 Daily Workflow

### Starting the Project

1. **Terminal 1 - Start PostgreSQL** (if not running as service)
   ```bash
   # Usually runs as service, skip if already running
   ```

2. **Terminal 1 - Start Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Terminal 2 - Start Frontend**
   ```bash
   cd /path/to/travelapp
   npm run web
   ```

### Stopping the Project

- Press `Ctrl+C` in each terminal
- Backend and frontend will stop
- PostgreSQL usually runs as a service (don't stop unless needed)

---

## 📊 Useful Commands

### Backend Commands

```bash
cd backend

# Start server
npm start

# View sample data
node scripts/show_sample_data.js

# Seed mock data
node scripts/seed_tamilnadu_travelers.js

# Run migrations
node run_migration.js
```

### Frontend Commands

```bash
# Start web version
npm run web

# Start Expo dev server
npm start

# Start iOS (macOS only)
npm run ios

# Start Android
npm run android

# Clear cache and start
npm start -- --reset-cache
```

### Database Commands

```bash
# Connect to database
psql -U your_username -d travelapp

# View all tables
\dt

# View users
SELECT * FROM users LIMIT 10;

# View trips
SELECT * FROM trips LIMIT 10;

# View crowd data
SELECT * FROM place_crowd_slots LIMIT 10;

# Exit psql
\q
```

---

## 🌐 API Endpoints Reference

### Base URL
```
http://localhost:5001/api
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token

### Trips (Requires Authentication)
- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get user's trips

### Places
- `GET /api/places?city=Kodaikanal` - Get places for a city
- `GET /api/location/places/crowd-slots?destination=Kodaikanal&place_name=Kodai%20Lake&date=2026-03-15` - Get crowd data
- `POST /api/location/places/visit` - Record a visit

### Resources (Requires Authentication)
- `GET /api/resources` - Get resources
- `GET /api/resources/nearby` - Get nearby resources

---

## 📝 Project Structure

```
travelapp/
├── backend/
│   ├── config/
│   │   └── db.js          # Database configuration
│   ├── controllers/       # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── migrations/        # Database migrations
│   ├── scripts/           # Utility scripts
│   ├── .env               # Environment variables
│   └── server.js          # Server entry point
├── screens/               # React Native screens
├── components/            # Reusable components
├── services/              # API service
├── package.json           # Frontend dependencies
└── README.md              # Project documentation
```

---

## 🎓 Quick Start Summary

```bash
# 1. Setup Database
psql -U your_username -c "CREATE DATABASE travelapp;"
cd backend
psql -U your_username -d travelapp -f db.sql
node run_migration.js

# 2. Setup Backend
cd backend
npm install
# Edit .env file with your database credentials
npm start

# 3. Setup Frontend (new terminal)
cd /path/to/travelapp
npm install
npm run web

# 4. Seed Mock Data (optional)
cd backend
node scripts/seed_tamilnadu_travelers.js
```

---

## 🆘 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Verify all prerequisites are installed
3. Check that PostgreSQL is running
4. Verify `.env` file has correct credentials
5. Check terminal output for error messages
6. Review the README.md for additional information

---

## 📄 Additional Resources

- **Mock Data Reference**: See `MOCK_DATA_REFERENCE.md`
- **API Documentation**: See `README.md`
- **Project README**: See `README.md`

---

**Last Updated:** February 19, 2026

**Happy Coding! 🚀**
