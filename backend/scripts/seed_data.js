const db = require('../config/db');
const bcrypt = require('bcrypt');

const FIRST_NAMES = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Karthik", "Rohan", "Diya", "Ananya", "Priya", "Lakshmi", "Meera", "Sofia", "Rahul", "Vikram"];
const LAST_NAMES = ["Kumar", "Reddy", "Sharma", "Nair", "Pillai", "Iyer", "Rao", "Sundar", "Rajan", "Menon", "Balaji", "Krishnan"];
const CITIES = ["Kodaikanal", "Ooty", "Madurai", "Chennai", "Kanyakumari", "Coimbatore", "Munnar"];
const PLACES_KODAI = [
    { id: 'kodai_1', name: "Coaker's Walk" },
    { id: 'kodai_2', name: "Bryant Park" },
    { id: 'kodai_3', name: "Kodai Lake" },
    { id: 'kodai_4', name: "Pillar Rocks" },
    { id: 'kodai_5', name: "Silver Cascade Falls" },
    { id: 'kodai_6', name: "Guna Caves" }
];

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random date in next 30 days
const randomDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));

    // Format: DD/MM/YYYY
    const day = String(futureDate.getDate()).padStart(2, '0');
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = futureDate.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper for DB formatted date (YYYY-MM-DD)
const formatDbDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

const seed = async () => {
    console.log('--- Starting Mock Data Generation ---');
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create 50 Travelers
        console.log('Creating 50 Travelers...');
        const userIds = [];
        for (let i = 0; i < 50; i++) {
            const name = `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`;
            const email = `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 1000)}@example.com`;

            // Check if email exists (simple skip)
            const check = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (check.rows.length > 0) continue;

            const res = await db.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [name, email, hashedPassword, 'traveler']
            );
            userIds.push(res.rows[0].id);
        }
        console.log(`Created ${userIds.length} new users.`);

        // 2. Create Trips & City Crowd Data
        console.log('Creating Trips...');
        for (const userId of userIds) {
            // Each user makes 1-3 trips
            const numTrips = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numTrips; j++) {
                // 60% chance of Kodaikanal
                const destination = Math.random() < 0.6 ? 'Kodaikanal' : random(CITIES);
                const travelDate = randomDate();
                const travelers = Math.floor(Math.random() * 4) + 1; // 1-4 people
                const timeSlot = random(['Morning', 'Afternoon', 'Evening']);

                // Insert Trip
                await db.query(
                    'INSERT INTO trips (user_id, origin, destination, travel_date, transport_mode, travellers_count) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, random(CITIES), destination, travelDate, 'Car', travelers]
                );

                // Update Crowd Data (City Level)
                const formattedDate = formatDbDate(travelDate);
                // Check existing city crowd data (place_id is usually null or city name for city-level aggregation?)
                // Actually based on tripController, it uses 'destination' column.
                // But locationController uses 'place_id'.
                // Let's stick to update logic from tripController:
                // "SELECT * FROM crowd_data WHERE destination = $1 AND date = $2 AND time_slot = $3"

                const checkCityCrowd = await db.query(
                    "SELECT * FROM crowd_data WHERE destination = $1 AND date = $2 AND time_slot = $3",
                    [destination, formattedDate, timeSlot]
                );

                if (checkCityCrowd.rows.length > 0) {
                    await db.query(
                        "UPDATE crowd_data SET visitor_count = visitor_count + $1 WHERE id = $2",
                        [travelers, checkCityCrowd.rows[0].id]
                    );
                } else {
                    await db.query(
                        "INSERT INTO crowd_data (destination, place_name, time_slot, visitor_count, date) VALUES ($1, $2, $3, $4, $5)",
                        [destination, destination, timeSlot, travelers, formattedDate]
                    );
                }

                // 3. If Destination is Kodaikanal, simulate visits to tourist places
                if (destination === 'Kodaikanal') {
                    // Visit 2-3 places
                    const numVisits = Math.floor(Math.random() * 2) + 2;
                    const places = Array.from(PLACES_KODAI).sort(() => 0.5 - Math.random()).slice(0, numVisits);

                    for (const place of places) {
                        // Using ON CONFLICT logic from locationController
                        // place_id, place_name, date, time_slot
                        // Note: unique constraint might be (place_id, date, time_slot)
                        const query = `
                            INSERT INTO crowd_data (destination, place_id, place_name, date, time_slot, visitor_count)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT (place_id, date, time_slot)
                            DO UPDATE SET visitor_count = crowd_data.visitor_count + $6;
                        `;
                        // Note: Need 'destination' column in insert if not nullable?
                        // Let's check schema first to be sure about columns.
                        // Assuming 'destination' is required or nice to have.

                        await db.query(query, [destination, place.id, place.name, formattedDate, timeSlot, travelers]);
                    }
                }
            }
        }

        console.log('Mock Data Generation Completed Successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        process.exit();
    }
};

seed();
