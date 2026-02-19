-- Add place_id and place_name columns
ALTER TABLE crowd_data
ADD COLUMN IF NOT EXISTS place_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS place_name VARCHAR(255);

-- Ensure standardized time slots (optional cleanup if data exists)
-- UPDATE crowd_data SET time_slot = 'Morning' WHERE time_slot NOT IN ('Morning', 'Afternoon', 'Evening');

-- Add unique constraint for upserts (drop if exists to be safe)
ALTER TABLE crowd_data DROP CONSTRAINT IF EXISTS unique_place_date_slot;

ALTER TABLE crowd_data
ADD CONSTRAINT unique_place_date_slot UNIQUE (place_id, date, time_slot);
