const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const runMigration = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '004_create_place_crowd_slots.sql'), 'utf8');
        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
