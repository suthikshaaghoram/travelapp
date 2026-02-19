#!/bin/bash

# Configuration
BASE_URL="http://localhost:5001/api"
EMAIL="test_user_$RANDOM@example.com"
PASSWORD="password123"
NAME="Test User"

echo "---------------------------------------------------"
echo "Starting Comprehensive API Test"
echo "Target: $BASE_URL"
echo "Test User: $EMAIL"
echo "---------------------------------------------------"

# 1. Register
echo ""
echo "[1] Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$NAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"role\": \"traveler\"}")
echo $REGISTER_RESPONSE

# 2. Login
echo ""
echo "[2] Logging In..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login Failed. Exiting."
  exit 1
fi
echo "Token Received: ${TOKEN:0:15}..."

# 3. Create Trip (Kodaikanal)
echo ""
echo "[3] Creating Trip to Kodaikanal..."
TRIP_RESPONSE=$(curl -s -X POST "$BASE_URL/trips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Chennai",
    "destination": "Kodaikanal",
    "travel_date": "25/12/2026, 10:00 am",
    "return_date": "28/12/2026",
    "transport_mode": "Car",
    "travellers_count": 4,
    "time_slot": "Morning"
  }')
echo $TRIP_RESPONSE

# 4. Get Trips
echo ""
echo "[4] Fetching User Trips..."
curl -s -X GET "$BASE_URL/trips" \
  -H "Authorization: Bearer $TOKEN" | grep "Kodaikanal" && echo "Trip Verification Passed" || echo "Trip Verification Failed"

# 5. Get Geoapify Places (Tourist Attractions)
echo ""
echo "[5] Fetching Tourist Attractions for Kodaikanal (Geoapify Integration)..."
# Using the token just in case (though it might be public)
PLACES_RESPONSE=$(curl -s -X GET "$BASE_URL/places?city=Kodaikanal" \
  -H "Authorization: Bearer $TOKEN")
  
COUNT=$(echo $PLACES_RESPONSE | grep -o "place_name" | wc -l)
if [ $COUNT -gt 0 ]; then
  echo "Success: Fetched $COUNT attractions."
  echo "Sample: $(echo $PLACES_RESPONSE | cut -c 1-100)..."
else
  echo "Failed: No attractions found."
  echo $PLACES_RESPONSE
fi


# 6. Check Crowd Data (Simulated for this trip)
echo ""
echo "[6] Checking Crowd Data..."
# Need a place_id? Use a known one or check city level.
# Based on seed script, city level uses destination name.
# Endpoint /api/location/crowd takes place_id and date.
# Checking locationController.js, getCrowdData uses query params.
curl -s -X GET "$BASE_URL/location/crowd?place_id=Kodaikanal&date=2026-12-25" \
  -H "Authorization: Bearer $TOKEN"
  
echo ""
echo "---------------------------------------------------"
echo "Test Complete"
echo "---------------------------------------------------"
