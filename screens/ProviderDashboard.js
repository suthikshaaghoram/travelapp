import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    Modal,
    ScrollView,
    Switch,
    TouchableOpacity,
    RefreshControl,
    Animated,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import EmptyState from '../components/EmptyState';
import { theme } from '../constants/theme';

export default function ProviderDashboard({ navigation }) {
    const [resources, setResources] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);

    // Form State
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [description, setDescription] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getUser();
        fetchMyResources();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMyResources();
        }, [])
    );

    const getUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const fetchMyResources = async () => {
        try {
            // In a real app, this would filter by provider ID. 
            // For now fetching all or mocking provider logic if backend supports it.
            // Assuming the endpoint returns resources relevant to the logged-in provider.
            const response = await api.get('/resources');
            setResources(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchMyResources();
        setRefreshing(false);
    }, []);

    const handleAddResource = async () => {
        if (!businessName || !category || !location || !contact) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/resources', {
                business_name: businessName,
                category,
                location,
                contact,
                description,
                emergency_service: isEmergency
            });
            setModalVisible(false);
            resetForm();
            fetchMyResources();
            Alert.alert('Success', 'Resource added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add resource');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this resource?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/resources/${id}`);
                        fetchMyResources();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete');
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

    const resetForm = () => {
        setBusinessName('');
        setCategory('');
        setLocation('');
        setContact('');
        setDescription('');
        setIsEmergency(false);
    };

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Hotel': return 'bed';
            case 'Hospital': return 'medkit';
            case 'Restaurant': return 'restaurant';
            default: return 'business';
        }
    };

    const renderItem = ({ item }) => {
        const iconName = getCategoryIcon(item.category);
        return (
            <Card style={styles.resourceCard} accentColor={theme.colors.primary}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <Ionicons name={iconName} size={20} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>{item.business_name}</Text>
                            <Text style={styles.cardSubtitle}>{item.category} • {item.location}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                    <View style={[styles.statusBadge, { backgroundColor: item.availability ? '#D1FAE5' : '#F3F4F6' }]}>
                        <Text style={[styles.statusText, { color: item.availability ? '#065F46' : '#374151' }]}>
                            {item.availability ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                    {item.emergency_service && (
                        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', marginLeft: 8 }]}>
                            <Text style={[styles.statusText, { color: '#991B1B' }]}>Emergency</Text>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    const [demandStats, setDemandStats] = useState([]);

    const fetchDemandStats = async () => {
        try {
            // In real app, user location should be dynamic or from their profile
            const myLocation = user?.location || 'Kodaikanal';
            const response = await api.get(`/location/crowd/provider?location=${myLocation}`);
            setDemandStats(response.data);
        } catch (error) {
            console.log("Error fetching demand stats:", error);
        }
    };

    useEffect(() => {
        if (user) fetchDemandStats();
    }, [user]);

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <View>
                    <Text style={theme.typography.h2}>Provider Dashboard</Text>
                    <Text style={theme.typography.caption}>Manage your services</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Demand Prediction Widget */}
            <Card style={{ marginBottom: 20 }} accentColor={theme.colors.secondary}>
                <Text style={theme.typography.h3}>📉 Demand Prediction</Text>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 10, fontSize: 12 }}>
                    Expected visitors next 7 days in {user?.location || 'your area'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {demandStats.map((stat, index) => (
                        <View key={index} style={styles.demandBox}>
                            <Text style={styles.demandDate}>{new Date(stat.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</Text>
                            <Text style={styles.demandCount}>{stat.total_visitors}</Text>
                            <Text style={styles.demandLabel}>Visitors</Text>
                        </View>
                    ))}
                    {demandStats.length === 0 && <Text>No data available yet.</Text>}
                </ScrollView>
            </Card>

            <StyledButton
                title="Add New Service"
                onPress={() => setModalVisible(true)}
                style={styles.addBtn}
                icon={<Ionicons name="add" size={20} color="#fff" />}
            />

            <FlatList
                data={resources}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyState
                        message="You haven't added any services yet."
                        icon="briefcase-outline"
                    />
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Add Resource Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalBg}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={theme.typography.h3}>Add Service</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <StyledInput label="Business Name" value={businessName} onChangeText={setBusinessName} placeholder="e.g. Ocean View Hotel" />
                            <StyledInput label="Category" placeholder="e.g. Hotel, Hospital" value={category} onChangeText={setCategory} />
                            <StyledInput label="Location" placeholder="City" value={location} onChangeText={setLocation} />
                            <StyledInput label="Contact Info" value={contact} onChangeText={setContact} placeholder="Phone or Email" />
                            <StyledInput label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ height: 80 }} placeholder="Short description..." />

                            <View style={styles.switchRow}>
                                <Text style={theme.typography.body}>Emergency Service?</Text>
                                <Switch value={isEmergency} onValueChange={setIsEmergency} trackColor={{ false: '#767577', true: theme.colors.error }} />
                            </View>

                            <View style={styles.modalBtns}>
                                <StyledButton title="Save Service" onPress={handleAddResource} isLoading={isLoading} style={{ flex: 1 }} />
                            </View>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    addBtn: {
        marginBottom: theme.spacing.lg
    },
    resourceCard: {
        marginBottom: theme.spacing.md
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    headerLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text
    },
    cardSubtitle: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 2
    },
    deleteBtn: {
        padding: 8,
    },
    cardBody: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    listContent: {
        paddingBottom: 100
    },
    modalBg: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.lg,
        maxHeight: '85%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: theme.spacing.md
    },
    modalBtns: {
        marginTop: theme.spacing.sm
    },
    demandBox: {
        backgroundColor: theme.colors.background,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        minWidth: 70,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    demandDate: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
        marginBottom: 2
    },
    demandCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    demandLabel: {
        fontSize: 8,
        color: theme.colors.textSecondary
    }
});
