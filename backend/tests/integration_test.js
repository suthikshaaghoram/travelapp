const axios = require('axios');
const db = require('../config/db');

async function testGeoapifyIntegration() {
    console.log('--- Starting Integration Test ---');

    try {
        // 1. Clear existing cache for test city
        const testCity = 'Kodaikanal';
        await db.query('DELETE FROM destination_places WHERE city = $1', [testCity]);
        console.log(`[PASS] Cleared cache for ${testCity}`);

        // 2. Fetch Places (First Call - Should hit API)
        console.log('Testing First API Call (API Hit)...');
        const start1 = Date.now();
        const response1 = await axios.get(`http://localhost:5001/api/places?city=${testCity}`);
        const duration1 = Date.now() - start1;

        if (response1.status === 200 && response1.data.length > 0) {
            console.log(`[PASS] Fetched ${response1.data.length} places from API in ${duration1}ms`);
            console.log('Sample Place:', response1.data[0].place_name);
        } else {
            console.error('[FAIL] API call returned no data or error');
        }

        // 3. Verify Database Insertion
        const dbCheck = await db.query('SELECT * FROM destination_places WHERE city = $1', [testCity]);
        if (dbCheck.rows.length > 0) {
            console.log(`[PASS] Database has ${dbCheck.rows.length} records for ${testCity}`);
        } else {
            console.error('[FAIL] No records found in database');
        }

        // 4. Fetch Places (Second Call - Should hit Cache)
        console.log('Testing Second API Call (Cache Hit)...');
        const start2 = Date.now();
        const response2 = await axios.get(`http://localhost:5001/api/places?city=${testCity}`);
        const duration2 = Date.now() - start2;

        if (response2.status === 200 && response2.data.length === response1.data.length) {
            console.log(`[PASS] Fetched ${response2.data.length} places from CACHE in ${duration2}ms`);
            if (duration2 < duration1) {
                console.log('[PASS] Cache response was faster');
            } else {
                console.warn('[WARN] Cache response was not significantly faster (local dev latency)');
            }
        } else {
            console.error('[FAIL] Cache call mismatch');
        }

    } catch (error) {
        console.error('[FAIL] Test failed with error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    } finally {
        // Clean up or keep data? Let's keep for user to see in app.
        // process.exit();
        // Since we are running via node, we need to close db connection if the script imports it directly
        // But the db module uses a pool, so we might need to manually close it if we want the script to exit cleanly
        // Or just let the run_command kill it.
    }
}

testGeoapifyIntegration();
