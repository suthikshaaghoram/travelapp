const db = require('../config/db');

// Create a new resource (Provider only)
exports.createResource = async (req, res) => {
    const { business_name, category, location, contact, description, availability, emergency_service } = req.body;
    const provider_id = req.user.id;

    try {
        const newResource = await db.query(
            'INSERT INTO resources (provider_id, business_name, category, location, contact, description, availability, emergency_service) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [provider_id, business_name, category, location, contact, description, availability, emergency_service]
        );

        res.status(201).json(newResource.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get resources (Public/Traveler sees by location, Provider sees their own)
exports.getResources = async (req, res) => {
    const { location } = req.query;
    const { role, id } = req.user || {}; // user might be undefined if public route, but we protect it

    try {
        let query = 'SELECT * FROM resources WHERE availability = TRUE';
        let params = [];

        // If Provider, show ONLY their resources
        if (role === 'provider') {
            const resources = await db.query('SELECT * FROM resources WHERE provider_id = $1 ORDER BY created_at DESC', [id]);
            return res.json(resources.rows);
        }

        // If Traveler/Admin search by location
        if (location) {
            query += ' AND location ILIKE $1';
            params.push(`%${location}%`);
        }

        const resources = await db.query(query, params);
        res.json(resources.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update resource (Provider only)
exports.updateResource = async (req, res) => {
    const { id } = req.params;
    const { business_name, category, location, contact, description, availability, emergency_service } = req.body;
    const provider_id = req.user.id;

    try {
        const result = await db.query(
            'UPDATE resources SET business_name = $1, category = $2, location = $3, contact = $4, description = $5, availability = $6, emergency_service = $7 WHERE id = $8 AND provider_id = $9 RETURNING *',
            [business_name, category, location, contact, description, availability, emergency_service, id, provider_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete resource (Provider or Admin)
exports.deleteResource = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const role = req.user.role;

    try {
        let query = 'DELETE FROM resources WHERE id = $1';
        let params = [id];

        if (role === 'provider') {
            query += ' AND provider_id = $2';
            params.push(user_id);
        }

        const result = await db.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Resource not found or unauthorized' });
        }

        res.json({ message: 'Resource deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getNearbyResources = async (req, res) => {
    // Mockup: returns all resources. 
    // In production, use PostGIS and req.query.lat/req.query.lng
    try {
        const resources = await db.query('SELECT * FROM resources WHERE availability = TRUE LIMIT 20');
        res.json(resources.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
