import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
    ActivityIndicator
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/Card";
import StyledButton from "../components/StyledButton";
import { theme } from "../constants/theme";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MOCK_PLACES_DATA } from '../constants/mockPlaces';

// Mock API Key (Not needed if using mock data, but library requires a string)
const GOOGLE_PLACES_API_KEY = "YOUR_API_KEY";

export default function TravelFormScreen({ navigation }) {
    const [destination, setDestination] = useState("");
    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    // Selection State
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Visit Details
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]); // Default today YYYY-MM-DD
    const [crowdData, setCrowdData] = useState(null);
    const [loadingCrowd, setLoadingCrowd] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Places when destination is set
    const fetchPlaces = async (city) => {
        setLoadingPlaces(true);
        try {
            const response = await api.get(`/location/places?destination=${city}`);
            setPlaces(response.data);
            setDestination(city);
        } catch (error) {
            console.log("Error fetching places:", error);
            Alert.alert("Error", "Could not load places.");
        } finally {
            setLoadingPlaces(false);
        }
    };

    // Open Place Handling
    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
        setModalVisible(true);
        fetchCrowdForPlace(place.id, visitDate);
        setSelectedSlot(null);
    };

    // Fetch Crowd Data
    const fetchCrowdForPlace = async (placeId, date) => {
        setLoadingCrowd(true);
        try {
            const response = await api.get(`/location/crowd?place_id=${placeId}&date=${date}`);
            setCrowdData(response.data);
        } catch (error) {
            console.log("Error fetching crowd:", error);
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
            await api.post('/location/visit', {
                place_id: selectedPlace.id,
                place_name: selectedPlace.name,
                date: visitDate,
                time_slot: selectedSlot
            });

            Alert.alert("Success", "Your visit is scheduled! Crowd data updated.");
            setModalVisible(false);
            // Optional: Refresh crowd data to show increase immediately next time
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to book visit.");
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={theme.typography.h2}>Explore & Avoid Crowds</Text>
            </View>

            {/* Destination Search */}
            <View style={{ marginBottom: 20, zIndex: 10 }}>
                <Text style={styles.label}>Where are you going?</Text>
                <View style={styles.autocompleteContainer}>
                    <GooglePlacesAutocomplete
                        placeholder='Search City (e.g. Kodaikanal)'
                        onPress={(data, details = null) => {
                            fetchPlaces(data.description);
                        }}
                        query={{
                            key: GOOGLE_PLACES_API_KEY,
                            language: 'en',
                        }}
                        styles={autocompleteStyles}
                        enablePoweredByContainer={false}
                        predefinedPlaces={MOCK_PLACES_DATA}
                        predefinedPlacesAlwaysVisible={true}
                    />
                </View>
            </View>

            {/* Places List */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {loadingPlaces ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : (
                    places.map((place, index) => (
                        <TouchableOpacity key={index} onPress={() => handlePlaceSelect(place)}>
                            <Card style={styles.placeCard}>
                                <View style={styles.placeHeader}>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#F57C00" />
                                        <Text style={styles.ratingText}>{place.rating}</Text>
                                    </View>
                                </View>
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
                            <Text style={styles.modalTitle}>{selectedPlace?.name}</Text>
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
    autocompleteContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        elevation: 2,
        zIndex: 5
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

const autocompleteStyles = {
    textInput: {
        height: 50,
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: 'transparent'
    },
    listView: {
        backgroundColor: 'white',
    }
};
