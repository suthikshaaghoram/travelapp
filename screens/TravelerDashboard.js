import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import StyledButton from '../components/StyledButton';
import EmptyState from '../components/EmptyState';
import { theme } from '../constants/theme';

export default function TravelerDashboard({ navigation }) {
    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    // Animations
    const scrollY = useRef(new Animated.Value(0)).current;
    const fabScale = useRef(new Animated.Value(0)).current;

    console.log('TravelerDashboard: Rendering...');

    useEffect(() => {
        console.log('TravelerDashboard: Mounted');
        getUser();
        Animated.spring(fabScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
            delay: 500,
        }).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchTrips();
            }
        }, [user])
    );

    const getUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const fetchTrips = async () => {
        try {
            if (!refreshing) setLoading(true);
            const response = await api.get('/trips');
            setTrips(response.data);
        } catch (error) {
            console.error('Fetch trips error', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTrips();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
    };

    const renderTrip = ({ item, index }) => (
        <Card
            title={item.destination}
            accentColor={theme.colors.primary}
            style={styles.tripCard}
            onPress={() => navigation.navigate('DestinationInfo', { destination: item.destination })}
        >
            <View style={styles.tripContent}>
                <View style={styles.tripRow}>
                    <View style={styles.iconBox}>
                        <Ionicons name={item.transport_mode === 'Flight' ? 'airplane' : 'car'} size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.tripDate}>
                        {new Date(item.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>

                <View style={styles.tripFooter}>
                    <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>{item.transport_mode}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => navigation.navigate('DestinationInfo', { destination: item.destination })}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    const renderHeader = () => (
        <Animated.View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Traveler'} 👋</Text>
                    <Text style={styles.subGreeting}>Ready for your next adventure?</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{trips.length}</Text>
                    <Text style={styles.statLabel}>Trips Planned</Text>
                </View>
                {/* Placeholder for future stats */}
            </View>

            <Text style={styles.sectionTitle}>Your Trips</Text>
        </Animated.View>
    );

    return (
        <ScreenWrapper>
            <FlatList
                data={trips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrip}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && (
                        <EmptyState
                            message="You haven't planned any trips yet."
                            icon="map-outline"
                        />
                    )
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            />

            {loading && !refreshing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}

            <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Plan Trip')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        style={styles.fabGradient}
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: theme.spacing.md,
        paddingTop: theme.spacing.sm,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.lg,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 50,
        ...theme.shadows.sm,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xl,
    },
    statItem: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginRight: theme.spacing.md,
        ...theme.shadows.primary,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.textWhite,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
    tripCard: {
        marginBottom: theme.spacing.lg,
    },
    tripContent: {
        gap: theme.spacing.md,
    },
    tripRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    tripDate: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    tripFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.8,
    },
    detailsBtnText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        ...theme.shadows.primary,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
