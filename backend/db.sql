-- Connect to your database before running this script
-- psql -U your_username -d your_database -f db.sql

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('traveler', 'provider', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trips Table (for Travelers)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    travel_date VARCHAR(255) NOT NULL, -- Storing as string to match frontend format
    return_date VARCHAR(255),
    transport_mode VARCHAR(100) NOT NULL,
    travellers_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Resources Table (for Providers)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- hotel, hospital, restaurant, etc.
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    description TEXT,
    availability BOOLEAN DEFAULT TRUE,
    emergency_service BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
