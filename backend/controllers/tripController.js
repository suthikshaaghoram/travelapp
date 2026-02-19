const db = require('../config/db');

exports.createTrip = async (req, res) => {
    const { origin, destination, travel_date, return_date, transport_mode, travellers_count } = req.body;
    const user_id = req.user.id; // From auth middleware

    try {
        const newTrip = await db.query(
            'INSERT INTO trips (user_id, origin, destination, travel_date, return_date, transport_mode, travellers_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, origin, destination, travel_date, return_date, transport_mode, travellers_count]
        );

        // Update Crowd Data
        // travel_date format is expected to be string or date object. 
        // Need to extract time slot (Morning/Evening/Night) from date or ask user?
        // For now, let's assume random or default to 'Morning' if not provided, 
        // OR better: derive from current time if booking for today, else 'Day'.
        // Simplified Logic: 
        const datePart = travel_date.split(',')[0]; // Assuming "DD/MM/YYYY, HH:mm am/pm" format from frontend

        // Simple logic to determine time slot or just aggregate by date
        // Let's assume the user selects a time slot in the frontend, but if not, we default.
        // The requested feature says "Identify destination & selected time slot". 
        // We need to add time_slot to the trip request or derive it.
        // For this step, I will add a default "General" time slot if not present, 
        // but ideally we should update the frontend to send it.

        const timeSlot = req.body.time_slot || 'Morning';

        // Formatted Date for DB (YYYY-MM-DD). Input "25/11/2024" -> "2024-11-25"
        // If input is "DD/MM/YYYY, ...", take first part.
        const [day, month, year] = datePart.trim().split('/');
        const formattedDate = `${year}-${month}-${day}`;

        // Check if row exists
        const checkCrowd = await db.query(
            "SELECT * FROM crowd_data WHERE destination = $1 AND date = $2 AND time_slot = $3",
            [destination, formattedDate, timeSlot]
        );

        if (checkCrowd.rows.length > 0) {
            await db.query(
                "UPDATE crowd_data SET visitor_count = visitor_count + $1 WHERE id = $2",
                [travellers_count, checkCrowd.rows[0].id]
            );
        } else {
            await db.query(
                "INSERT INTO crowd_data (destination, place_name, time_slot, visitor_count, date) VALUES ($1, $2, $3, $4, $5)",
                [destination, destination, timeSlot, travellers_count, formattedDate]
            );
        }

        res.status(201).json(newTrip.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTrips = async (req, res) => {
    const user_id = req.user.id;

    try {
        const trips = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        res.json(trips.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
