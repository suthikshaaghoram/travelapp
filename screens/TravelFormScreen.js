import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    TextInput,
    Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/Card";
import StyledButton from "../components/StyledButton";
import { theme } from "../constants/theme";
import { MOCK_PLACES_DATA } from '../constants/mockPlaces';

// Quick-select cities (from mock data) - works on web and native
const QUICK_CITIES = MOCK_PLACES_DATA.map((p) => p.description);

export default function TravelFormScreen({ navigation }) {
    const [destination, setDestination] = useState("");
    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    // Trip details
    const [origin, setOrigin] = useState("");
    const [tripDate, setTripDate] = useState(""); // expected format DD/MM/YYYY
    const [tripTime, setTripTime] = useState(""); // e.g. 10:00 am
    const [transportMode, setTransportMode] = useState("Car");
    const [travellersCount, setTravellersCount] = useState("1");

    // Selection State
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Visit Details (for crowd system, uses today's date)
    const [visitDate] = useState(new Date().toISOString().split('T')[0]); // Default today YYYY-MM-DD
    const [crowdData, setCrowdData] = useState(null);
    const [loadingCrowd, setLoadingCrowd] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Places when destination is set
    const fetchPlaces = async (city) => {
        setLoadingPlaces(true);
        try {
            // Extract city name from full string (e.g., "Kodaikanal, Tamil Nadu, India" -> "Kodaikanal")
            const cityName = city.split(',')[0].trim();
            const response = await api.get(`/places?city=${encodeURIComponent(cityName)}`);
            setPlaces(response.data);
            setDestination(cityName);
        } catch (error) {
            console.log("Error fetching places:", error);
            Alert.alert("Error", "Could not load places. Please try again.");
            setPlaces([]);
        } finally {
            setLoadingPlaces(false);
        }
    };

    // Open Place Handling
    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
        setModalVisible(true);
        fetchCrowdForPlace(place, visitDate);
        setSelectedSlot(null);
    };

    // Fetch Crowd Data
    const fetchCrowdForPlace = async (place, date) => {
        setLoadingCrowd(true);
        try {
            const placeName = place.place_name || place.name;
            const destinationName = destination || place.city || 'Unknown';
            const response = await api.get(`/location/places/crowd-slots?destination=${encodeURIComponent(destinationName)}&place_name=${encodeURIComponent(placeName)}&date=${date}`);
            // Transform response to match expected format
            const crowdSlots = response.data || [];
            const crowdData = {
                morning: 0,
                afternoon: 0,
                evening: 0
            };
            crowdSlots.forEach(slot => {
                if (slot.time_slot === 'morning') crowdData.morning = slot.visitor_count || 0;
                if (slot.time_slot === 'noon') crowdData.afternoon = slot.visitor_count || 0;
                if (slot.time_slot === 'evening') crowdData.evening = slot.visitor_count || 0;
            });
            setCrowdData(crowdData);
        } catch (error) {
            console.log("Error fetching crowd:", error);
            // Set default empty data if error
            setCrowdData({ morning: 0, afternoon: 0, evening: 0 });
        } finally {
            setLoadingCrowd(false);
        }
    };

    // Book Visit
    const handleConfirmVisit = async () => {
        if (!selectedSlot) {
            Alert.alert("Select Time", "Please choose a time slot.");
            return;
        }

        setSubmitting(true);
        try {
            const placeName = selectedPlace.place_name || selectedPlace.name;
            const destinationName = destination || selectedPlace.city;
            const travellers = parseInt(travellersCount || "1", 10) || 1;

            // 1) Create / update crowd visit for the selected place and time slot
            await api.post('/location/places/visit', {
                destination: destinationName,
                place_name: placeName,
                visit_date: visitDate,
                time_slot: selectedSlot.toLowerCase(),
                travellers: travellers
            });

            // 2) Create a Trip record with full trip details
            // travel_date expected format in backend: "DD/MM/YYYY, 10:00 am"
            let travel_date: string;
            if (tripDate && tripTime) {
                travel_date = `${tripDate}, ${tripTime}`;
            } else if (tripDate) {
                travel_date = tripDate;
            } else {
                // Fallback to today's date in DD/MM/YYYY
                travel_date = new Date().toLocaleDateString('en-GB');
            }

            await api.post('/trips', {
                origin: origin || 'Unknown',
                destination: destinationName,
                travel_date,
                return_date: null,
                transport_mode: transportMode,
                travellers_count: travellers,
            });

            Alert.alert("Success", "Your visit is scheduled! Crowd data updated.");
            setModalVisible(false);
            // Refresh crowd data to show increase immediately
            fetchCrowdForPlace(selectedPlace, visitDate);
        } catch (error) {
            console.error("Visit booking error:", error);
            Alert.alert("Error", error.response?.data?.error || "Failed to book visit.");
        } finally {
            setSubmitting(false);
        }
    };

    // Render Crowd Level Logic
    const getCrowdLevel = (count) => {
        if (count < 20) return { label: 'Low', color: '#4CAF50' };
        if (count < 50) return { label: 'Moderate', color: '#FF9800' };
        return { label: 'Busy', color: '#F44336' };
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => {
                        // Try to go back, if that fails, navigate to Home tab
                        try {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('Home');
                            }
                        } catch (err) {
                            console.log("Navigation error:", err);
                            navigation.navigate('Home');
                        }
                    }} 
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={theme.typography.h2}>Plan Your Trip</Text>
            </View>

            {/* Trip details form */}
            <Card style={styles.tripDetailsCard}>
                <Text style={styles.sectionTitle}>Trip details</Text>

                <Text style={styles.smallLabel}>From (city)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter origin city"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={origin}
                    onChangeText={setOrigin}
                />

                <View style={styles.tripRow}>
                    <View style={styles.tripColumn}>
                        <Text style={styles.smallLabel}>Date (DD/MM/YYYY)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 20/02/2026"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={tripDate}
                            onChangeText={setTripDate}
                        />
                    </View>
                    <View style={styles.tripColumn}>
                        <Text style={styles.smallLabel}>Time (e.g. 10:00 am)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 10:00 am"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={tripTime}
                            onChangeText={setTripTime}
                        />
                    </View>
                </View>

                <View style={styles.tripRow}>
                    <View style={styles.tripColumn}>
                        <Text style={styles.smallLabel}>Mode of transport</Text>
                        <View style={styles.modeRow}>
                            {['Car', 'Bus', 'Train', 'Flight', 'Bike'].map((mode) => (
                                <TouchableOpacity
                                    key={mode}
                                    style={[
                                        styles.modeChip,
                                        transportMode === mode && styles.modeChipActive,
                                    ]}
                                    onPress={() => setTransportMode(mode)}
                                >
                                    <Text
                                        style={[
                                            styles.modeChipText,
                                            transportMode === mode && styles.modeChipTextActive,
                                        ]}
                                    >
                                        {mode}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.tripColumn}>
                        <Text style={styles.smallLabel}>No. of people</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="1"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                            value={travellersCount}
                            onChangeText={setTravellersCount}
                        />
                    </View>
                </View>
            </Card>

            {/* Destination Search - web-safe (no GooglePlacesAutocomplete) */}
            <View style={styles.searchSection}>
                <Text style={styles.label}>Where are you going?</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type city (e.g. Kodaikanal) or pick below"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={destination}
                    onChangeText={(text) => setDestination(text)}
                    onSubmitEditing={() => {
                        const city = destination.trim();
                        if (city) fetchPlaces(city);
                    }}
                    returnKeyType="search"
                />
                <Text style={styles.quickLabel}>Quick select:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
                    {QUICK_CITIES.map((cityDesc) => {
                        const cityName = cityDesc.split(',')[0].trim();
                        return (
                            <TouchableOpacity
                                key={cityDesc}
                                style={[styles.quickChip, destination === cityName && styles.quickChipActive]}
                                onPress={() => fetchPlaces(cityDesc)}
                            >
                                <Text style={[styles.quickChipText, destination === cityName && styles.quickChipTextActive]}>
                                    {cityName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Places List */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {loadingPlaces ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : (
                    places.map((place, index) => (
                        <TouchableOpacity key={place.id || index} onPress={() => handlePlaceSelect(place)}>
                            <Card style={styles.placeCard}>
                                <View style={styles.placeHeader}>
                                    <Text style={styles.placeName}>{place.place_name || place.name}</Text>
                                    {place.category && (
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{place.category}</Text>
                                        </View>
                                    )}
                                </View>
                                {place.address && (
                                    <Text style={styles.addressText} numberOfLines={1}>{place.address}</Text>
                                )}
                                <Text style={styles.tapText}>Tap to check crowds</Text>
                            </Card>
                        </TouchableOpacity>
                    ))
                )}
                {!loadingPlaces && places.length === 0 && destination !== "" && (
                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No places found for this location.</Text>
                )}
            </ScrollView>

            {/* Crowd & Booking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedPlace?.place_name || selectedPlace?.name}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Crowd Forecast for Today</Text>

                        {loadingCrowd ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : crowdData ? (
                            <View style={styles.crowdGrid}>
                                {['morning', 'afternoon', 'evening'].map((slot) => {
                                    const count = crowdData[slot] || 0;
                                    const level = getCrowdLevel(count);
                                    const isSelected = selectedSlot === (slot.charAt(0).toUpperCase() + slot.slice(1));

                                    return (
                                        <TouchableOpacity
                                            key={slot}
                                            style={[
                                                styles.crowdSlot,
                                                isSelected && styles.selectedSlot,
                                                { borderColor: level.color }
                                            ]}
                                            onPress={() => setSelectedSlot(slot.charAt(0).toUpperCase() + slot.slice(1))}
                                        >
                                            <Text style={styles.slotName}>{slot.toUpperCase()}</Text>
                                            <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
                                            <Text style={styles.countText}>{count} visitors</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text>No data available</Text>
                        )}

                        <StyledButton
                            title="Confirm Visit Time"
                            onPress={handleConfirmVisit}
                            isLoading={submitting}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>

        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        marginRight: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    searchSection: {
        marginBottom: 20,
    },
    textInput: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        marginBottom: 12,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
    },
    quickLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    quickScroll: {
        marginBottom: 8,
        maxHeight: 44,
    },
    quickChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    quickChipActive: {
        backgroundColor: theme.colors.primary + '15',
        borderColor: theme.colors.primary,
    },
    quickChipText: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    quickChipTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    tripDetailsCard: {
        marginBottom: 20,
        padding: 16,
    },
    smallLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    tripRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    tripColumn: {
        flex: 1,
    },
    modeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    modeChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        marginRight: 8,
        marginBottom: 8,
    },
    modeChipActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '15',
    },
    modeChipText: {
        fontSize: 12,
        color: theme.colors.text,
    },
    modeChipTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    placeCard: {
        marginBottom: 12,
        padding: 16,
    },
    placeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F57C00',
        marginLeft: 4
    },
    tapText: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 4
    },
    addressText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4
    },
    categoryBadge: {
        backgroundColor: theme.colors.primary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    categoryText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '600'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '50%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 12
    },
    crowdGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    crowdSlot: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: '#FAFAFA'
    },
    selectedSlot: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: theme.colors.primary
    },
    slotName: {
        fontSize: 10,
        fontWeight: '700',
        color: '#666',
        marginBottom: 4
    },
    levelText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2
    },
    countText: {
        fontSize: 10,
        color: '#999'
    }
});
