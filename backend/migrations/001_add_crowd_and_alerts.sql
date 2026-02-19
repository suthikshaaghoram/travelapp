-- Add Crowd Data Table
CREATE TABLE IF NOT EXISTS crowd_data (
    id SERIAL PRIMARY KEY,
    destination VARCHAR(255),
    place_name VARCHAR(255),
    time_slot VARCHAR(50),  -- morning/evening/night
    visitor_count INT DEFAULT 0,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    destination VARCHAR(255),
    message TEXT,
    severity VARCHAR(50), -- low, medium, high, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
