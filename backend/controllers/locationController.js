const db = require('../config/db');

// Mock Data for Top Tourist Places
// Expanded Mock Data for Tourist Places
const MOCK_PLACES = {
    'Kodaikanal': [
        { id: 'kodai_1', name: "Coaker's Walk", rating: 4.5, location: { lat: 10.2381, lng: 77.4892 }, photos: ['https://example.com/coaker.jpg'] },
        { id: 'kodai_2', name: "Bryant Park", rating: 4.2, location: { lat: 10.2381, lng: 77.4892 }, photos: ['https://example.com/bryant.jpg'] },
        { id: 'kodai_3', name: "Kodai Lake", rating: 4.6, location: { lat: 10.2381, lng: 77.4892 }, photos: ['https://example.com/lake.jpg'] },
        { id: 'kodai_4', name: "Pillar Rocks", rating: 4.4, location: { lat: 10.2381, lng: 77.4892 }, photos: ['https://example.com/pillar.jpg'] }
    ],
    'Ooty': [
        { id: 'ooty_1', name: "Botanical Gardens", rating: 4.5, location: { lat: 11.4102, lng: 76.6950 }, photos: [] },
        { id: 'ooty_2', name: "Ooty Lake", rating: 4.0, location: { lat: 11.4102, lng: 76.6950 }, photos: [] },
        { id: 'ooty_3', name: "Rose Garden", rating: 4.3, location: { lat: 11.4102, lng: 76.6950 }, photos: [] }
    ],
    'Munnar': [
        { id: 'munnar_1', name: "Tea Gardens", rating: 4.8, location: { lat: 10.0889, lng: 77.0595 }, photos: [] },
        { id: 'munnar_2', name: "Mattupetty Dam", rating: 4.2, location: { lat: 10.0889, lng: 77.0595 }, photos: [] },
        { id: 'munnar_3', name: "Eravikulam National Park", rating: 4.6, location: { lat: 10.0889, lng: 77.0595 }, photos: [] }
    ]
};

exports.getPlaces = async (req, res) => {
    const { destination } = req.query;

    // Extract city name from full string (e.g., "Kodaikanal, Tamil Nadu" -> "Kodaikanal")
    let city = destination ? destination.split(',')[0].trim() : '';

    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500)); 

    const places = MOCK_PLACES[city] || [
        { id: 'generic_1', name: "City Center", rating: 4.0, location: { lat: 0, lng: 0 }, photos: [] },
        { id: 'generic_2', name: "Local Market", rating: 3.8, location: { lat: 0, lng: 0 }, photos: [] },
        { id: 'generic_3', name: "Central Park", rating: 4.1, location: { lat: 0, lng: 0 }, photos: [] }
    ];

    res.json(places);
};

// Kept for backward compatibility if needed, but getPlaces is preferred
exports.getTopPlaces = exports.getPlaces;

exports.getCrowdData = async (req, res) => {
    const { place_id, date } = req.query;

    try {
        const result = await db.query(
            "SELECT time_slot, visitor_count FROM crowd_data WHERE place_id = $1 AND date = $2",
            [place_id, date]
        );

        // Transform to convenient object format
        const response = {
            morning: 0,
            afternoon: 0, // Standardized slot names
            evening: 0
        };

        result.rows.forEach(row => {
            const slot = row.time_slot.toLowerCase();
            if (response.hasOwnProperty(slot)) {
                response[slot] = parseInt(row.visitor_count);
            }
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.recordVisit = async (req, res) => {
    const { place_id, place_name, date, time_slot } = req.body;

    if (!place_id || !date || !time_slot) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Atomic Upsert using ON CONFLICT (requires unique constraint added in migration)
        const query = `
            INSERT INTO crowd_data (place_id, place_name, date, time_slot, visitor_count)
            VALUES ($1, $2, $3, $4, 1)
            ON CONFLICT (place_id, date, time_slot)
            DO UPDATE SET visitor_count = crowd_data.visitor_count + 1
            RETURNING *;
        `;

        const result = await db.query(query, [place_id, place_name || 'Unknown', date, time_slot]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error recording visit:", err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Deprecated Provider Stats (Keeping code but endpoints might be unused)
exports.getProviderCrowdStats = async (req, res) => {
    // ... logic remains same or can be removed if strictly following "Remove provider resource management"
    // For now, let's leave it but it won't be used by the new flow.
    res.json([]);
};

exports.getDestinationCrowd = async (req, res) => {
    const { destination, date } = req.query;

    if (!destination || !date) {
        return res.status(400).json({ error: "Missing destination or date" });
    }

    try {
        const result = await db.query(
            `SELECT SUM(visitor_count) AS total
             FROM crowd_data
             WHERE destination = $1 AND date = $2`,
            [destination, date]
        );

        res.json({
            total_visitors: parseInt(result.rows[0].total) || 0
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.recordPlaceVisit = async (req, res) => {
    const { destination, place_name, visit_date, time_slot, travellers } = req.body;

    if (!destination || !place_name || !visit_date || !time_slot || !travellers) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Check if record exists
        const existing = await db.query(
            `SELECT id FROM place_crowd_slots
             WHERE destination=$1 AND place_name=$2
             AND visit_date=$3 AND time_slot=$4`,
            [destination, place_name, visit_date, time_slot]
        );

        if (existing.rows.length > 0) {
            // Update existing
            await db.query(
                `UPDATE place_crowd_slots
                 SET visitor_count = visitor_count + $1
                 WHERE id = $2`,
                [travellers, existing.rows[0].id]
            );
        } else {
            // Insert new
            await db.query(
                `INSERT INTO place_crowd_slots
                 (destination, place_name, visit_date, time_slot, visitor_count)
                 VALUES ($1,$2,$3,$4,$5)`,
                [destination, place_name, visit_date, time_slot, travellers]
            );
        }

        res.json({ message: "Visit slot recorded" });
    } catch (err) {
        console.error("Error recording place visit:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getPlaceCrowdSlots = async (req, res) => {
    const { destination, place_name, date } = req.query;

    if (!destination || !place_name || !date) {
        return res.status(400).json({ error: "Missing required query params" });
    }

    try {
        const result = await db.query(
            `SELECT time_slot, visitor_count
             FROM place_crowd_slots
             WHERE destination=$1 AND place_name=$2 AND visit_date=$3`,
            [destination, place_name, date]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching crowd slots:", err);
        res.status(500).json({ error: "Server error" });
    }
};
