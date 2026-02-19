CREATE TABLE IF NOT EXISTS destination_places (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_destination_places_city ON destination_places(city);
