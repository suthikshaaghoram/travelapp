import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Linking,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    Platform
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
// import AlertBanner from '../components/AlertBanner';
import StyledButton from '../components/StyledButton';
import EmptyState from '../components/EmptyState';
import { theme } from '../constants/theme';

export default function DestinationInfoScreen({ route, navigation }) {
    const { destination } = route.params;
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [crowdCount, setCrowdCount] = useState(0);
    const [crowdLevel, setCrowdLevel] = useState("");

    const categories = ['All', 'Tourist Attraction'];

    useEffect(() => {
        if (destination) {
            fetchResources();
            fetchCrowdInfo();
        }
    }, [destination]);

    const getCrowdLevel = (count) => {
        if (count < 50) return "Low";
        if (count < 150) return "Medium";
        return "High";
    };

    const fetchCrowdInfo = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const response = await api.get(`/location/destination-crowd?destination=${destination}&date=${today}`);
            const count = response.data.total_visitors || 0;

            setCrowdCount(count);
            setCrowdLevel(getCrowdLevel(count));
        } catch (error) {
            console.log("Crowd fetch error", error);
        }
    };

    const fetchResources = async () => {
        try {
            setLoading(true);
            console.log(`Fetching places for: ${destination}`);

            // Fetch Tourist Attractions directly
            const placesResponse = await api.get(`/places?city=${destination}`);

            // Robust data extraction: Check for array or wrapped object
            const placesData = Array.isArray(placesResponse.data)
                ? placesResponse.data
                : (placesResponse.data.places || []);

            console.log('Places Found:', placesData.length);

            const touristAttractions = placesData.map(p => ({
                id: `place-${p.id}`,
                name: p.place_name,
                category: 'Tourist Attraction',
                address: p.address,
                description: 'Famous tourist spot nearby.',
                contact_info: '',
                location: p.city
            }));

            setResources(touristAttractions);

            if (touristAttractions.length === 0) {
                // Fallback to location permissions if absolutely no data found
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    const nearbyResponse = await api.get(`/resources/nearby?lat=${location.coords.latitude}&lng=${location.coords.longitude}`);
                    if (nearbyResponse.data.length > 0) {
                        // Optional: could filter these too if strictly maintaining "Tourist Attraction" view
                        // but for fallback, showing something nearby is better than nothing.
                        setResources(nearbyResponse.data);
                        Alert.alert("Notice", `No specific attractions found for ${destination}. Showing nearby resources.`);
                    }
                }
            }
        } catch (error) {
            console.error('Fetch resources error', error);
            Alert.alert("Error", "Could not fetch attractions. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleMap = (address) => {
        const query = encodeURIComponent(address);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    };

    const filteredResources = activeFilter === 'All'
        ? resources
        : resources.filter(r => r.category === activeFilter);

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Hotel': return 'bed';
            case 'Hospital': return 'medkit';
            case 'Restaurant': return 'restaurant';
            case 'Tourist Attraction': return 'camera';
            default: return 'location';
        }
    };

    const renderHeader = () => (
        <View>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={theme.typography.h2}>{destination}</Text>
                    <Text style={theme.typography.caption}>Explore local resources</Text>
                </View>
            </View>

            {/* Admin Alerts */}
            {/* {destination && <AlertBanner destination={destination} />} */}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.filterChip,
                            activeFilter === cat && styles.filterChipActive
                        ]}
                        onPress={() => setActiveFilter(cat)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === cat && styles.filterTextActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.crowdBox}>
                <Text style={styles.crowdTitle}>Expected Visitors</Text>
                <Text style={styles.crowdNumber}>
                    👥 {crowdCount} people
                </Text>
                <Text style={[
                    styles.crowdLevel,
                    crowdLevel === "Low" && { color: "green" },
                    crowdLevel === "Medium" && { color: "orange" },
                    crowdLevel === "High" && { color: "red" }
                ]}>
                    Crowd Level: {crowdLevel}
                </Text>
                {crowdLevel === "High" && (
                    <Text style={styles.tip}>
                        ⚠ Try visiting early morning or late evening
                    </Text>
                )}
            </View>
        </View >
    );

    const renderResource = ({ item }) => {
        const isEmergency = item.category === 'Hospital' || item.category === 'Police';
        const accent = isEmergency ? theme.colors.error : theme.colors.primary;

        // State for this specific item (in a real app, extract this to a sub-component)
        // For simplicity in this file, we'll use a local component or just render logic
        // But since we are in a renderItem, we can't use hooks directly here easily without breaking rules
        // UNLESS we make a separate component. Let's make a separate component `PlaceCard`.

        return (
            <PlaceCard
                item={item}
                accent={accent}
                handleCall={handleCall}
                handleMap={handleMap}
                destination={destination}
            />
        );
    };

    return (
        <ScreenWrapper>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredResources}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderResource}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            message={`No ${activeFilter !== 'All' ? activeFilter : ''} resources found.`}
                            icon="search-outline"
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}



// Separated Component to handle individual state for time slots
function PlaceCard({ item, accent, handleCall, handleMap, destination }) {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotCrowd, setSlotCrowd] = useState([]);

    // Fetch crowd slots on mount
    useEffect(() => {
        fetchCrowdSlots();
    }, []);

    const fetchCrowdSlots = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const res = await api.get(
                `/location/places/crowd-slots?destination=${destination}&place_name=${item.name}&date=${today}`
            );
            setSlotCrowd(res.data);
        } catch (err) {
            console.log("Error fetching slots", err);
        }
    };

    const submitVisitSlot = async (slot) => {
        if (!slot) return;
        setSelectedSlot(slot);

        try {
            const today = new Date().toISOString().split("T")[0];
            await api.post('/location/places/visit', {
                destination,
                place_name: item.name,
                visit_date: today,
                time_slot: slot,
                travellers: 1 // Default to 1 for now, or add counter
            });

            Alert.alert("Success", `Visit planned for ${slot}!`);
            fetchCrowdSlots(); // refresh counts
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not save visit.");
        }
    };

    const getSlotCount = (slotName) => {
        const slot = slotCrowd.find(s => s.time_slot === slotName);
        return slot ? slot.visitor_count : 0;
    };

    return (
        <Card style={styles.card} accentColor={accent}>
            <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                    <Text style={styles.resourceName}>{item.name}</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: `${accent}20` }]}>
                    <Text style={[styles.categoryText, { color: accent }]}>{item.category}</Text>
                </View>
            </View>

            <Text style={styles.address}>📍 {item.address}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Time Slot Selection */}
            {item.category === 'Tourist Attraction' && (
                <View style={styles.slotSection}>
                    <Text style={styles.slotTitle}>Plan your visit:</Text>
                    <View style={styles.slotContainer}>
                        {["morning", "noon", "evening"].map(slot => (
                            <TouchableOpacity
                                key={slot}
                                style={[
                                    styles.slotBtn,
                                    selectedSlot === slot && styles.selectedSlot
                                ]}
                                onPress={() => submitVisitSlot(slot)}
                            >
                                <Text style={[
                                    styles.slotText,
                                    selectedSlot === slot && styles.selectedSlotText
                                ]}>
                                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                </Text>
                                <Text style={[
                                    styles.slotCount,
                                    selectedSlot === slot && styles.selectedSlotText
                                ]}>
                                    👥 {getSlotCount(slot)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.actions}>
                <StyledButton
                    title="Call"
                    onPress={() => handleCall(item.contact_info)}
                    variant="outline"
                    style={[styles.actionBtn, { borderColor: theme.colors.success }]}
                    textStyle={{ color: theme.colors.success }}
                    icon={<Ionicons name="call" size={16} color={theme.colors.success} />}
                />
                <StyledButton
                    title="Directions"
                    onPress={() => handleMap(item.address)}
                    variant="outline"
                    style={styles.actionBtn}
                    icon={<Ionicons name="navigate" size={16} color={theme.colors.primary} />}
                />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    backBtn: {
        padding: 8,
        marginRight: theme.spacing.sm,
    },
    filterContainer: {
        paddingBottom: theme.spacing.md,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    filterTextActive: {
        color: theme.colors.textWhite,
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        marginBottom: theme.spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    resourceName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        flex: 1,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    address: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionBtn: {
        flex: 1,
        height: 40,
        marginBottom: 0,
    },
    crowdBox: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        marginHorizontal: theme.spacing.md, // Add margin to align with content
        marginTop: theme.spacing.sm,
    },
    crowdTitle: {
        fontSize: 14,
        color: "#666"
    },
    crowdNumber: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 5
    },
    crowdLevel: {
        marginTop: 5,
        fontWeight: "600"
    },
    tip: {
        marginTop: 5,
        color: "#888",
        fontSize: 12
    },
    // Slot Styles
    slotSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    slotTitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    slotContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    slotBtn: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
        backgroundColor: theme.colors.surface,
    },
    selectedSlot: {
        backgroundColor: theme.colors.primary,
    },
    slotText: {
        color: theme.colors.primary,
        fontWeight: "600",
        fontSize: 12,
    },
    selectedSlotText: {
        color: "#fff",
    },
    slotCount: {
        fontSize: 10,
        marginTop: 2,
        color: theme.colors.textSecondary,
    }
});
