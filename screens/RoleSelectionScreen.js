import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

const RoleCard = ({ role, onPress, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 200,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 6,
                tension: 40,
                delay: index * 200,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const getGradient = () => {
        switch (role.value) {
            case 'traveler': return ['#3B82F6', '#2563EB'];
            case 'provider': return ['#10B981', '#059669'];
            case 'admin': return ['#6366F1', '#4F46E5'];
            default: return ['#9CA3AF', '#6B7280'];
        }
    };

    const getIcon = () => {
        switch (role.value) {
            case 'traveler': return 'airplane';
            case 'provider': return 'business';
            case 'admin': return 'shield-checkmark';
            default: return 'person';
        }
    };

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }], width: '100%' }}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardWrapper}>
                <LinearGradient
                    colors={getGradient()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name={getIcon()} size={32} color={theme.colors.textWhite} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.roleTitle}>{role.label}</Text>
                        <Text style={styles.roleSubtitle}>Tap to login as {role.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function RoleSelectionScreen({ navigation }) {
    const roles = [
        { label: 'Traveler', value: 'traveler' },
        { label: 'Resource Provider', value: 'provider' },
        { label: 'Admin', value: 'admin' },
    ];

    return (
        <ScreenWrapper backgroundImage={require('../assets/background.jpg')}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Who are you logging in as?</Text>
                </View>

                <View style={styles.cardsContainer}>
                    {roles.map((role, index) => (
                        <RoleCard
                            key={role.value}
                            role={role}
                            index={index}
                            onPress={() => navigation.navigate('Login', { role: role.value })}
                        />
                    ))}
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    header: {
        marginBottom: theme.spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.primary, // Or white if background is dark, assuming light screen wrapper overlay
        marginBottom: theme.spacing.sm,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    cardsContainer: {
        gap: theme.spacing.md,
    },
    cardWrapper: {
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
        borderRadius: theme.layout.borderRadius,
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderRadius: theme.layout.borderRadius,
        height: 100,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textWhite,
        marginBottom: 4,
    },
    roleSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
});
