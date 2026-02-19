CREATE TABLE place_crowd_slots (
  id SERIAL PRIMARY KEY,
  destination TEXT NOT NULL,
  place_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  time_slot TEXT CHECK (time_slot IN ('morning','noon','evening')),
  visitor_count INT DEFAULT 0
);
