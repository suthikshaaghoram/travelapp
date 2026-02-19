import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import EmptyState from '../components/EmptyState';
import { theme } from '../constants/theme';

export default function AdminDashboard({ navigation }) {
    const [stats, setStats] = useState({ totalUsers: 0, trips: 0, resources: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            // setLoading(true); // Don't show full loader on revisit, just refresh logic
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats').catch(() => ({ data: { totalUsers: 0, trips: 0, resources: 0 } })),
                api.get('/admin/users').catch(() => ({ data: [] }))
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const handleDeleteUser = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this user? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/admin/users/${id}`);
                        fetchData();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete user');
                    }
                }
            }
        ]);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return theme.colors.error;
            case 'provider': return theme.colors.primary;
            default: return theme.colors.secondary;
        }
    };

    const renderUser = ({ item, index }) => {
        const roleColor = getRoleColor(item.role);
        return (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <Card style={styles.userCard} accentColor={roleColor}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.userAvatar, { backgroundColor: `${roleColor}15` }]}>
                            <Text style={[styles.avatarText, { color: roleColor }]}>
                                {item.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.userName}>{item.name}</Text>
                            <Text style={styles.userEmail}>{item.email}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20` }]}>
                                <Text style={[styles.userRole, { color: roleColor }]}>{item.role.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteUser(item.id)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const StatCard = ({ title, value, icon, colorStart, colorEnd }) => (
        <View style={styles.statCardWrapper}>
            <LinearGradient
                colors={[colorStart, colorEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
            >
                <View style={styles.statIconCircle}>
                    <Ionicons name={icon} size={20} color={colorStart} />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </LinearGradient>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <View>
                    <Text style={theme.typography.h2}>Admin Panel</Text>
                    <Text style={theme.typography.caption}>System Overview</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <StatCard
                        title="Users"
                        value={stats.totalUsers}
                        icon="people"
                        colorStart="#6366F1"
                        colorEnd="#818CF8"
                    />
                    <StatCard
                        title="Trips"
                        value={stats.trips}
                        icon="airplane"
                        colorStart="#10B981"
                        colorEnd="#34D399"
                    />
                    <StatCard
                        title="Resources"
                        value={stats.resources}
                        icon="business"
                        colorStart="#F59E0B"
                        colorEnd="#FCD34D"
                    />
                </View>

                {/* Users Section */}
                <Text style={styles.sectionTitle}>Manage Users</Text>
                <StyledInput
                    placeholder="Search users, emails, roles..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<Ionicons name="search" size={20} color={theme.colors.textSecondary} />}
                    style={styles.searchBar}
                />

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <View>
                        {filteredUsers.length === 0 ? (
                            <EmptyState
                                message={searchQuery ? "No users found matching your search." : "No users to display."}
                                icon="person-remove-outline"
                            />
                        ) : (
                            filteredUsers.map((item, index) => (
                                <View key={item.id}>
                                    {renderUser({ item, index })}
                                </View>
                            ))
                        )}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    scrollContent: {
        paddingBottom: 40,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl
    },
    statCardWrapper: {
        width: '31%',
        aspectRatio: 1, // square cards
        borderRadius: 16,
        ...theme.shadows.md,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    statIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    statTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.sm,
    },
    searchBar: {
        marginBottom: theme.spacing.md,
    },
    loader: {
        marginTop: 40,
    },
    userCard: {
        marginBottom: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    userRole: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    deleteBtn: {
        padding: 8,
    },
});
