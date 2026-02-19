#!/bin/bash

BASE_URL="http://localhost:5001/api/auth"

# Register Traveler
echo "Registering Traveler..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Traveler User",
    "email": "traveler@example.com",
    "password": "password123",
    "role": "traveler"
  }'
echo ""

# Register Provider
echo "Registering Provider..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Provider User",
    "email": "provider@example.com",
    "password": "password123",
    "role": "provider"
  }'
echo ""

# Register Admin
echo "Registering Admin..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
echo ""
