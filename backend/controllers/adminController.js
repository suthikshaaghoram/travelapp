const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const travelerCount = await db.query("SELECT COUNT(*) FROM users WHERE role = 'traveler'");
        const providerCount = await db.query("SELECT COUNT(*) FROM users WHERE role = 'provider'");
        const productsCount = await db.query('SELECT COUNT(*) FROM resources');
        const tripsCount = await db.query('SELECT COUNT(*) FROM trips');

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            travelers: parseInt(travelerCount.rows[0].count),
            providers: parseInt(providerCount.rows[0].count),
            resources: parseInt(productsCount.rows[0].count),
            trips: parseInt(tripsCount.rows[0].count),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createAlert = async (req, res) => {
    const { destination, message, severity } = req.body;
    try {
        const newAlert = await db.query(
            "INSERT INTO alerts (destination, message, severity) VALUES ($1, $2, $3) RETURNING *",
            [destination, message, severity]
        );
        res.status(201).json(newAlert.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAlerts = async (req, res) => {
    const { destination } = req.query;
    try {
        let query = "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5";
        let params = [];

        if (destination) {
            query = "SELECT * FROM alerts WHERE destination ILIKE $1 ORDER BY created_at DESC";
            params = [`%${destination}%`];
        }

        const alerts = await db.query(query, params);
        res.json(alerts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
