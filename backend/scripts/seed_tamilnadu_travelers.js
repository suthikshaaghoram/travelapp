const db = require('../config/db');
const bcrypt = require('bcrypt');

// Tamil Nadu Districts (Prioritized)
const TAMIL_NADU_DISTRICTS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
    'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul',
    'Kodaikanal', 'Ooty', 'Kanyakumari', 'Rameswaram', 'Mahabalipuram',
    'Pondicherry', 'Kanchipuram', 'Tirupur', 'Namakkal', 'Karur'
];

// Tamil Names (More authentic)
const TAMIL_FIRST_NAMES = [
    'Arjun', 'Karthik', 'Surya', 'Vikram', 'Aditya', 'Rahul', 'Sai', 'Aravind',
    'Priya', 'Lakshmi', 'Meera', 'Ananya', 'Divya', 'Sneha', 'Swathi', 'Deepika',
    'Rajesh', 'Suresh', 'Mohan', 'Ramesh', 'Ganesh', 'Venkatesh', 'Senthil',
    'Kamala', 'Malathi', 'Geetha', 'Padma', 'Saranya', 'Kavitha', 'Revathi'
];

const TAMIL_LAST_NAMES = [
    'Kumar', 'Reddy', 'Iyer', 'Iyengar', 'Nair', 'Pillai', 'Menon', 'Rao',
    'Sundar', 'Rajan', 'Krishnan', 'Balaji', 'Murugan', 'Ganesan', 'Raman',
    'Subramanian', 'Venkatesan', 'Srinivasan', 'Natarajan', 'Chandrasekaran'
];

// Popular Tourist Places in Tamil Nadu Districts
const TAMIL_NADU_PLACES = {
    'Chennai': [
        'Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Guindy National Park',
        'Valluvar Kottam', 'Birla Planetarium', 'Government Museum', 'San Thome Basilica'
    ],
    'Kodaikanal': [
        "Coaker's Walk", 'Bryant Park', 'Kodai Lake', 'Pillar Rocks',
        'Silver Cascade Falls', 'Guna Caves', 'Dolphin\'s Nose', 'Bear Shola Falls'
    ],
    'Ooty': [
        'Botanical Gardens', 'Ooty Lake', 'Rose Garden', 'Doddabetta Peak',
        'Tea Museum', 'Pykara Falls', 'Mudumalai National Park', 'Emerald Lake'
    ],
    'Madurai': [
        'Meenakshi Amman Temple', 'Thirumalai Nayakkar Palace', 'Gandhi Memorial Museum',
        'Alagar Kovil', 'Vaigai Dam', 'Koodal Azhagar Temple', 'Thiruparankundram'
    ],
    'Coimbatore': [
        'Marudhamalai Temple', 'Isha Yoga Center', 'Kovai Kondattam', 'Siruvani Waterfalls',
        'Anamalai Tiger Reserve', 'Velliangiri Hills', 'Perur Pateeswarar Temple'
    ],
    'Kanyakumari': [
        'Vivekananda Rock Memorial', 'Thiruvalluvar Statue', 'Kanyakumari Beach',
        'Padmanabhapuram Palace', 'Suchindram Temple', 'Sunrise Point', 'Gandhi Memorial'
    ],
    'Mahabalipuram': [
        'Shore Temple', 'Pancha Rathas', 'Arjuna\'s Penance', 'Krishna\'s Butter Ball',
        'Descent of the Ganges', 'Varaha Cave Temple', 'Tiger Cave'
    ],
    'Rameswaram': [
        'Ramanathaswamy Temple', 'Dhanushkodi Beach', 'Agnitheertham', 'Pamban Bridge',
        'Gandhamadhana Parvatham', 'Jada Tirtham', 'Villondi Tirtham'
    ],
    'Tiruchirappalli': [
        'Srirangam Temple', 'Rock Fort Temple', 'Jambukeswarar Temple', 'Samayapuram Mariamman Temple',
        'Mukkombu Dam', 'Vekkaliamman Temple', 'Thiruvanaikaval'
    ],
    'Thanjavur': [
        'Brihadeeswarar Temple', 'Thanjavur Palace', 'Saraswathi Mahal Library',
        'Schwartz Church', 'Sivaganga Park', 'Vijayanagara Fort'
    ],
    'Salem': [
        'Yercaud Hill Station', 'Kolli Hills', 'Mettur Dam', 'Jarugumalai Temple',
        '1008 Lingam Temple', 'Kurumbapatti Zoological Park'
    ],
    'Dindigul': [
        'Dindigul Fort', 'Sirumalai Hills', 'Kodaikanal', 'Thadikombu Perumal Temple',
        'Begambur Big Mosque', 'Kamakshi Amman Temple'
    ],
    'Vellore': [
        'Vellore Fort', 'Jalakandeswarar Temple', 'Golden Temple (Sripuram)',
        'Amirthi Zoological Park', 'Yelagiri Hills', 'Ratnagiri Murugan Temple'
    ],
    'Erode': [
        'Bhavani Sangameswarar Temple', 'Kodiveri Dam', 'Chennimalai Murugan Temple',
        'Vellode Bird Sanctuary', 'Bannari Amman Temple'
    ],
    'Tirunelveli': [
        'Nellaiappar Temple', 'Courtallam Falls', 'Manimuthar Falls', 'Koonthankulam Bird Sanctuary',
        'Papanasam Dam', 'Kalakad Mundanthurai Tiger Reserve'
    ]
};

// Transport modes
const TRANSPORT_MODES = ['Car', 'Bus', 'Train', 'Flight', 'Bike'];

// Time slots
const TIME_SLOTS = ['morning', 'noon', 'evening'];

// Helper functions
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate random date in next 60 days
const randomDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 60));
    
    const day = String(futureDate.getDate()).padStart(2, '0');
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = futureDate.getFullYear();
    return `${day}/${month}/${year}`;
};

// Format date for DB (YYYY-MM-DD)
const formatDbDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

// Generate return date (1-7 days after travel date)
const generateReturnDate = (travelDate) => {
    const [day, month, year] = travelDate.split('/');
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const retDay = String(date.getDate()).padStart(2, '0');
    const retMonth = String(date.getMonth() + 1).padStart(2, '0');
    const retYear = date.getFullYear();
    return `${retDay}/${retMonth}/${retYear}`;
};

const seedTamilNaduTravelers = async () => {
    console.log('🌴 Starting Tamil Nadu Travelers Mock Data Generation 🌴');
    console.log('==================================================');
    
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // 1. Create 100 Travelers with Tamil names
        console.log('\n📝 Creating 100 Travelers with Tamil names...');
        const userIds = [];
        
        for (let i = 0; i < 100; i++) {
            const firstName = random(TAMIL_FIRST_NAMES);
            const lastName = random(TAMIL_LAST_NAMES);
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 9999)}@example.com`;
            
            // Check if email exists
            const check = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (check.rows.length > 0) continue;
            
            const res = await db.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [name, email, hashedPassword, 'traveler']
            );
            userIds.push(res.rows[0].id);
        }
        console.log(`✅ Created ${userIds.length} new travelers`);
        
        // 2. Create Trips (Prioritize Tamil Nadu destinations - 80% chance)
        console.log('\n✈️  Creating trips to Tamil Nadu destinations...');
        let tripCount = 0;
        let crowdDataCount = 0;
        let placeVisitCount = 0;
        
        for (const userId of userIds) {
            // Each traveler makes 1-4 trips
            const numTrips = Math.floor(Math.random() * 4) + 1;
            
            for (let j = 0; j < numTrips; j++) {
                // 80% chance of Tamil Nadu destination
                const destination = Math.random() < 0.8 
                    ? random(TAMIL_NADU_DISTRICTS) 
                    : random(['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Goa']);
                
                const origin = Math.random() < 0.7 
                    ? random(TAMIL_NADU_DISTRICTS) 
                    : random(['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi']);
                
                const travelDate = randomDate();
                const returnDate = generateReturnDate(travelDate);
                const travelers = Math.floor(Math.random() * 5) + 1; // 1-5 people
                const transportMode = random(TRANSPORT_MODES);
                const timeSlot = random(TIME_SLOTS);
                
                // Insert Trip
                await db.query(
                    'INSERT INTO trips (user_id, origin, destination, travel_date, return_date, transport_mode, travellers_count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [userId, origin, destination, travelDate, returnDate, transportMode, travelers]
                );
                tripCount++;
                
                // Update City-Level Crowd Data
                const formattedDate = formatDbDate(travelDate);
                
                // Check if crowd_data table exists and has the right structure
                // Using the place_crowd_slots table for better granularity
                // But also update city-level if crowd_data exists
                try {
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
                    crowdDataCount++;
                } catch (err) {
                    // crowd_data table might not exist, skip
                    console.log(`Note: Skipping crowd_data update (table may not exist)`);
                }
                
                // 3. If destination is in Tamil Nadu, simulate visits to tourist places
                if (TAMIL_NADU_PLACES[destination]) {
                    const places = TAMIL_NADU_PLACES[destination];
                    // Visit 2-4 places
                    const numVisits = Math.floor(Math.random() * 3) + 2;
                    const selectedPlaces = Array.from(places)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, numVisits);
                    
                    for (const placeName of selectedPlaces) {
                        try {
                            // Check if record exists in place_crowd_slots
                            const existing = await db.query(
                                `SELECT id FROM place_crowd_slots
                                 WHERE destination=$1 AND place_name=$2
                                 AND visit_date=$3 AND time_slot=$4`,
                                [destination, placeName, formattedDate, timeSlot]
                            );
                            
                            if (existing.rows.length > 0) {
                                // Update existing
                                await db.query(
                                    `UPDATE place_crowd_slots
                                     SET visitor_count = visitor_count + $1
                                     WHERE id = $2`,
                                    [travelers, existing.rows[0].id]
                                );
                            } else {
                                // Insert new
                                await db.query(
                                    `INSERT INTO place_crowd_slots
                                     (destination, place_name, visit_date, time_slot, visitor_count)
                                     VALUES ($1, $2, $3, $4, $5)`,
                                    [destination, placeName, formattedDate, timeSlot, travelers]
                                );
                            }
                            placeVisitCount++;
                        } catch (err) {
                            console.log(`Error inserting place visit for ${placeName}:`, err.message);
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Created ${tripCount} trips`);
        console.log(`✅ Updated ${crowdDataCount} city-level crowd records`);
        console.log(`✅ Created ${placeVisitCount} place visit records`);
        
        // 4. Summary Statistics
        console.log('\n📊 Summary Statistics:');
        const districtList = TAMIL_NADU_DISTRICTS.map((_, i) => `$${i + 1}`).join(', ');
        const stats = await db.query(`
            SELECT 
                destination,
                COUNT(*) as trip_count,
                SUM(travellers_count) as total_travelers
            FROM trips
            WHERE destination = ANY($1)
            GROUP BY destination
            ORDER BY trip_count DESC
            LIMIT 10
        `, [TAMIL_NADU_DISTRICTS]);
        
        console.log('\nTop 10 Tamil Nadu Destinations by Trip Count:');
        stats.rows.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.destination}: ${row.trip_count} trips, ${row.total_travelers} travelers`);
        });
        
        // Place visit statistics
        const placeStats = await db.query(`
            SELECT 
                destination,
                COUNT(DISTINCT place_name) as unique_places,
                SUM(visitor_count) as total_visitors
            FROM place_crowd_slots
            WHERE destination = ANY($1)
            GROUP BY destination
            ORDER BY total_visitors DESC
            LIMIT 10
        `, [TAMIL_NADU_DISTRICTS]);
        
        console.log('\nTop 10 Tamil Nadu Destinations by Place Visits:');
        placeStats.rows.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.destination}: ${row.unique_places} places, ${row.total_visitors} total visitors`);
        });
        
        console.log('\n🎉 Tamil Nadu Mock Data Generation Completed Successfully! 🎉');
        console.log('==================================================');
        
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        console.error(err.stack);
    } finally {
        process.exit();
    }
};

seedTamilNaduTravelers();
