# 📊 Mock Data Reference - Tamil Nadu Focus

This document provides a reference for the mock data that has been seeded into the database, with a focus on Tamil Nadu districts.

## 🎯 Overview

- **Total Travelers Created**: 100
- **Total Trips Created**: 253+
- **Total Place Visits**: 460+
- **Focus**: Tamil Nadu districts (80% of trips)

## 🏙️ Tamil Nadu Districts Included

1. **Chennai** - Capital city
2. **Coimbatore** - Textile hub
3. **Madurai** - Temple city
4. **Tiruchirappalli** - Rock Fort city
5. **Salem** - Steel city
6. **Tirunelveli** - Southern gateway
7. **Erode** - Turmeric city
8. **Vellore** - Fort city
9. **Thanjavur** - Cultural capital
10. **Dindigul** - Lock city
11. **Kodaikanal** ⭐ - Hill station (Most popular)
12. **Ooty** ⭐ - Queen of Hills
13. **Kanyakumari** ⭐ - Southern tip
14. **Rameswaram** - Temple town
15. **Mahabalipuram** - UNESCO heritage site
16. **Pondicherry** - French colony
17. **Kanchipuram** - Silk city
18. **Tirupur** - Knitwear hub
19. **Namakkal** - Transport hub
20. **Karur** - Textile center

## 📍 Top Destinations by Trip Count

1. **Kodaikanal**: 73 trips, 203 travelers
2. **Kanyakumari**: 24 trips, 63 travelers
3. **Coimbatore**: 16 trips, 51 travelers
4. **Tirunelveli**: 14 trips, 29 travelers
5. **Ooty**: 14 trips, 43 travelers
6. **Erode**: 13 trips, 38 travelers
7. **Chennai**: 13 trips, 35 travelers
8. **Thanjavur**: 13 trips, 43 travelers
9. **Salem**: 12 trips, 39 travelers
10. **Tirupur**: 12 trips, 32 travelers

## 🗺️ Popular Tourist Places by District

### Kodaikanal (Most Popular)
- Coaker's Walk
- Bryant Park
- Kodai Lake
- Pillar Rocks
- Silver Cascade Falls
- Guna Caves
- Dolphin's Nose
- Bear Shola Falls

### Chennai
- Marina Beach
- Kapaleeshwarar Temple
- Fort St. George
- Guindy National Park
- Valluvar Kottam
- Birla Planetarium
- Government Museum
- San Thome Basilica

### Ooty
- Botanical Gardens
- Ooty Lake
- Rose Garden
- Doddabetta Peak
- Tea Museum
- Pykara Falls
- Mudumalai National Park
- Emerald Lake

### Madurai
- Meenakshi Amman Temple
- Thirumalai Nayakkar Palace
- Gandhi Memorial Museum
- Alagar Kovil
- Vaigai Dam
- Koodal Azhagar Temple
- Thiruparankundram

### Coimbatore
- Marudhamalai Temple
- Isha Yoga Center
- Kovai Kondattam
- Siruvani Waterfalls
- Anamalai Tiger Reserve
- Velliangiri Hills
- Perur Pateeswarar Temple

### Kanyakumari
- Vivekananda Rock Memorial
- Thiruvalluvar Statue
- Kanyakumari Beach
- Padmanabhapuram Palace
- Suchindram Temple
- Sunrise Point
- Gandhi Memorial

### Mahabalipuram
- Shore Temple
- Pancha Rathas
- Arjuna's Penance
- Krishna's Butter Ball
- Descent of the Ganges
- Varaha Cave Temple
- Tiger Cave

### Rameswaram
- Ramanathaswamy Temple
- Dhanushkodi Beach
- Agnitheertham
- Pamban Bridge
- Gandhamadhana Parvatham
- Jada Tirtham
- Villondi Tirtham

### Tiruchirappalli
- Srirangam Temple
- Rock Fort Temple
- Jambukeswarar Temple
- Samayapuram Mariamman Temple
- Mukkombu Dam
- Vekkaliamman Temple
- Thiruvanaikaval

### Thanjavur
- Brihadeeswarar Temple
- Thanjavur Palace
- Saraswathi Mahal Library
- Schwartz Church
- Sivaganga Park
- Vijayanagara Fort

## 👥 Sample Traveler Accounts

All travelers use password: `password123`

Sample emails (randomly generated):
- `arjun.kumar1234@example.com`
- `priya.iyer5678@example.com`
- `karthik.reddy9012@example.com`
- `lakshmi.nair3456@example.com`

## 📅 Date Range

Trips are scheduled for dates in the next 60 days from when the script was run.

## 🚗 Transport Modes

- Car
- Bus
- Train
- Flight
- Bike

## ⏰ Time Slots

- morning
- noon
- evening

## 🔍 How to Query the Data

### Get all trips for a user:
```bash
curl -X GET "http://localhost:5001/api/trips" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get crowd data for a place:
```bash
curl "http://localhost:5001/api/location/places/crowd-slots?destination=Kodaikanal&place_name=Kodai%20Lake&date=2026-03-15"
```

### Get places for a city:
```bash
curl "http://localhost:5001/api/places?city=Kodaikanal"
```

### Login as a traveler:
```bash
curl -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@example.com","password":"password"}'
```

## 📈 Statistics Available

The seed script provides:
- Trip counts per destination
- Total travelers per destination
- Unique places visited per destination
- Total visitors per destination
- Crowd data by time slot (morning/noon/evening)

## 🎯 Presentation Tips

1. **Show Kodaikanal** - It has the most trips and place visits
2. **Demonstrate Crowd Data** - Show time slot-based crowd levels
3. **Show Multiple Districts** - Demonstrate the Tamil Nadu focus
4. **Use Real Place Names** - All places are real tourist attractions
5. **Show Trip Planning** - Demonstrate travelers planning trips to Tamil Nadu

## 🔄 Re-running the Seed Script

To regenerate the data:
```bash
cd backend
node scripts/seed_tamilnadu_travelers.js
```

Note: This will create NEW travelers (won't delete existing ones), so you may want to clear the database first if you want a fresh start.
