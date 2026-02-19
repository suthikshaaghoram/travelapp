const db = require('../config/db');

const showSampleData = async () => {
    console.log('\n📊 SAMPLE DATA FOR PRESENTATION 📊');
    console.log('=====================================\n');
    
    try {
        // 1. Show sample travelers
        console.log('👥 Sample Travelers (Tamil Nadu Focus):');
        console.log('----------------------------------------');
        const travelers = await db.query(`
            SELECT name, email, created_at 
            FROM users 
            WHERE role = 'traveler' 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        travelers.rows.forEach((t, idx) => {
            console.log(`${idx + 1}. ${t.name} (${t.email})`);
        });
        
        // 2. Show trips to Tamil Nadu destinations
        console.log('\n✈️  Sample Trips to Tamil Nadu:');
        console.log('----------------------------------------');
        const trips = await db.query(`
            SELECT 
                u.name as traveler_name,
                t.origin,
                t.destination,
                t.travel_date,
                t.travellers_count,
                t.transport_mode
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE t.destination IN (
                'Kodaikanal', 'Ooty', 'Kanyakumari', 'Chennai', 
                'Madurai', 'Coimbatore', 'Mahabalipuram', 'Rameswaram'
            )
            ORDER BY t.created_at DESC
            LIMIT 15
        `);
        
        trips.rows.forEach((trip, idx) => {
            console.log(`${idx + 1}. ${trip.traveler_name}: ${trip.origin} → ${trip.destination}`);
            console.log(`   Date: ${trip.travel_date} | Travelers: ${trip.travellers_count} | Mode: ${trip.transport_mode}`);
        });
        
        // 3. Show top destinations
        console.log('\n🏆 Top Tamil Nadu Destinations:');
        console.log('----------------------------------------');
        const topDestinations = await db.query(`
            SELECT 
                destination,
                COUNT(*) as trip_count,
                SUM(travellers_count) as total_travelers
            FROM trips
            WHERE destination IN (
                'Kodaikanal', 'Ooty', 'Kanyakumari', 'Chennai', 
                'Madurai', 'Coimbatore', 'Mahabalipuram', 'Rameswaram',
                'Tiruchirappalli', 'Thanjavur', 'Salem', 'Tirunelveli',
                'Erode', 'Vellore', 'Dindigul'
            )
            GROUP BY destination
            ORDER BY trip_count DESC
            LIMIT 10
        `);
        
        topDestinations.rows.forEach((dest, idx) => {
            console.log(`${idx + 1}. ${dest.destination}: ${dest.trip_count} trips, ${dest.total_travelers} travelers`);
        });
        
        // 4. Show place visits with crowd data
        console.log('\n📍 Popular Places with Crowd Data:');
        console.log('----------------------------------------');
        const placeVisits = await db.query(`
            SELECT 
                destination,
                place_name,
                visit_date,
                time_slot,
                visitor_count
            FROM place_crowd_slots
            WHERE destination IN ('Kodaikanal', 'Ooty', 'Kanyakumari', 'Chennai')
            ORDER BY visitor_count DESC
            LIMIT 15
        `);
        
        placeVisits.rows.forEach((place, idx) => {
            console.log(`${idx + 1}. ${place.place_name} (${place.destination})`);
            console.log(`   Date: ${place.visit_date} | Time: ${place.time_slot} | Visitors: ${place.visitor_count}`);
        });
        
        // 5. Show crowd data by time slot for Kodaikanal
        console.log('\n⏰ Kodaikanal - Crowd Data by Time Slot (Sample Dates):');
        console.log('----------------------------------------');
        const kodaiCrowd = await db.query(`
            SELECT 
                place_name,
                visit_date,
                time_slot,
                visitor_count
            FROM place_crowd_slots
            WHERE destination = 'Kodaikanal'
            ORDER BY visit_date DESC, visitor_count DESC
            LIMIT 20
        `);
        
        const groupedByDate = {};
        kodaiCrowd.rows.forEach(row => {
            if (!groupedByDate[row.visit_date]) {
                groupedByDate[row.visit_date] = {};
            }
            if (!groupedByDate[row.visit_date][row.place_name]) {
                groupedByDate[row.visit_date][row.place_name] = {};
            }
            groupedByDate[row.visit_date][row.place_name][row.time_slot] = row.visitor_count;
        });
        
        Object.keys(groupedByDate).slice(0, 3).forEach(date => {
            console.log(`\n📅 ${date}:`);
            Object.keys(groupedByDate[date]).slice(0, 3).forEach(place => {
                const slots = groupedByDate[date][place];
                const morning = slots.morning || 0;
                const noon = slots.noon || 0;
                const evening = slots.evening || 0;
                console.log(`  ${place}:`);
                console.log(`    Morning: ${morning} | Noon: ${noon} | Evening: ${evening}`);
            });
        });
        
        // 6. Statistics summary
        console.log('\n📈 Overall Statistics:');
        console.log('----------------------------------------');
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'traveler') as total_travelers,
                (SELECT COUNT(*) FROM trips) as total_trips,
                (SELECT COUNT(*) FROM place_crowd_slots) as total_place_visits,
                (SELECT COUNT(DISTINCT destination) FROM trips WHERE destination IN (
                    'Kodaikanal', 'Ooty', 'Kanyakumari', 'Chennai', 
                    'Madurai', 'Coimbatore', 'Mahabalipuram', 'Rameswaram',
                    'Tiruchirappalli', 'Thanjavur', 'Salem', 'Tirunelveli',
                    'Erode', 'Vellore', 'Dindigul'
                )) as tamil_nadu_destinations
        `);
        
        const s = stats.rows[0];
        console.log(`Total Travelers: ${s.total_travelers}`);
        console.log(`Total Trips: ${s.total_trips}`);
        console.log(`Total Place Visits: ${s.total_place_visits}`);
        console.log(`Tamil Nadu Destinations Covered: ${s.tamil_nadu_destinations}`);
        
        console.log('\n✅ Sample data display completed!\n');
        
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
};

showSampleData();
