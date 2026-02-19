const db = require('../config/db');
const axios = require('axios');
require('dotenv').config();

exports.getPlaces = async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        // 1. Check Cache
        const cachedPlaces = await db.query(
            'SELECT * FROM destination_places WHERE city ILIKE $1 ORDER BY created_at DESC',
            [city]
        );

        if (cachedPlaces.rows.length > 0) {
            console.log(`Serving cached places for ${city}`);
            return res.json(cachedPlaces.rows);
        }

        // 2. Fetch from Geoapify
        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            console.error('Geoapify API Key missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log(`Geocoding city ${city}...`);
        // Step 1: Geocode the city to get coordinates
        const geocodeResponse = await axios.get(`https://api.geoapify.com/v1/geocode/search`, {
            params: {
                text: city,
                apiKey: apiKey,
                limit: 1
            }
        });

        if (!geocodeResponse.data.features || geocodeResponse.data.features.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }

        const cityLocation = geocodeResponse.data.features[0].properties;
        const cityLat = cityLocation.lat;
        const cityLon = cityLocation.lon;

        console.log(`Fetching places for ${city} at ${cityLat}, ${cityLon}...`);

        // Step 2: Search for places near these coordinates (Radius 10km)
        const response = await axios.get(`https://api.geoapify.com/v2/places`, {
            params: {
                categories: 'tourism.attraction',
                filter: `circle:${cityLon},${cityLat},10000`, // 10km radius
                limit: 20,
                apiKey: apiKey
            }
        });

        const places = response.data.features;
        const formattedPlaces = [];

        // 3. Store in Cache
        for (const place of places) {
            const props = place.properties;
            const name = props.name || props.street || 'Unknown Place'; // Fallback
            const lat = props.lat;
            const lon = props.lon;
            const category = 'Tourist Attraction'; // Simplified for now
            const address = props.formatted;

            // Simple deduplication logic could go here, but for now we just insert
            const newPlace = await db.query(
                'INSERT INTO destination_places (city, place_name, latitude, longitude, category, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [city, name, lat, lon, category, address]
            );
            formattedPlaces.push(newPlace.rows[0]);
        }

        res.json(formattedPlaces);

    } catch (err) {
        console.error('Error in getPlaces:', err.message);
        if (err.response) {
            console.error('API Response Error:', err.response.data);
            console.error('API Response Status:', err.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch places', details: err.message });
    }
};
