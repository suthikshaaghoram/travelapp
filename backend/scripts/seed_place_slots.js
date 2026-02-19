const db = require('../config/db');

const seedSlots = async () => {
    try {
        console.log("Fetching Kodaikanal places from cache...");
        // 1. Get places that already exist in the DB (cached from Geoapify)
        const places = await db.query("SELECT place_name FROM destination_places WHERE city ILIKE 'Kodaikanal'");

        if (places.rows.length === 0) {
            console.log("No cached places found! Please browse to the destination screen first to populate cache.");
            process.exit(0);
        }

        const today = new Date().toISOString().split('T')[0];
        const slots = ['morning', 'noon', 'evening'];

        console.log(`Seeding slots for ${places.rows.length} places...`);

        for (const place of places.rows) {
            for (const slot of slots) {
                // Random count between 5 and 50
                const count = Math.floor(Math.random() * 45) + 5;

                // Check if exists
                const check = await db.query(
                    "SELECT id FROM place_crowd_slots WHERE destination='Kodaikanal' AND place_name=$1 AND visit_date=$2 AND time_slot=$3",
                    [place.place_name, today, slot]
                );

                if (check.rows.length > 0) {
                    await db.query(
                        "UPDATE place_crowd_slots SET visitor_count = $1 WHERE id=$2",
                        [count, check.rows[0].id]
                    );
                } else {
                    await db.query(
                        "INSERT INTO place_crowd_slots (destination, place_name, visit_date, time_slot, visitor_count) VALUES ($1, $2, $3, $4, $5)",
                        ['Kodaikanal', place.place_name, today, slot, count]
                    );
                }
            }
        }
        console.log("Seeding complete!");

    } catch (err) {
        console.error("Error seeding slots:", err);
    } finally {
        process.exit();
    }
};

seedSlots();
