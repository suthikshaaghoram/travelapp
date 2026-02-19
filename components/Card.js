import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { theme } from '../constants/theme';

export default function Card({
    children,
    title,
    style,
    variant = 'elevated',
    accentColor,
    onPress
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const cardStyles = [
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        style
    ];

    return (
        <Animated.View style={[
            cardStyles,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
            }
        ]}>
            {title && (
                <View style={[styles.header, accentColor && { marginLeft: -theme.spacing.sm }]}>
                    <Text style={[styles.title, accentColor && { color: accentColor }]}>{title}</Text>
                </View>
            )}
            <View style={styles.content}>
                {children}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius,
        padding: theme.layout.cardPadding,
        marginBottom: theme.spacing.lg,
        overflow: 'hidden', // Ensure accent strip doesn't bleed
    },
    elevated: {
        ...theme.shadows.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 }, // Deeper shadow
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 0,
        backgroundColor: 'transparent',
    },
    header: {
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.2,
    },
    content: {
        // Container for card body
    }
});
