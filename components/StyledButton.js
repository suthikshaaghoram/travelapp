import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, View, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StyledButton({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    isLoading,
    icon,
    iconRight,
    disabled
}) {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const shimmerValue = useRef(new Animated.Value(0)).current;

    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';
    const isDisabled = disabled || isLoading;

    useEffect(() => {
        if (isPrimary && !isDisabled) {
            const shimmerAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerValue, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                        delay: 1000,
                    }),
                    Animated.timing(shimmerValue, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            );
            shimmerAnimation.start();
            return () => shimmerAnimation.stop();
        }
    }, [isPrimary, isDisabled]);

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const shimmerTranslate = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const ButtonContent = () => (
        <View style={styles.contentContainer}>
            {isLoading ? (
                <ActivityIndicator color={isOutline ? theme.colors.primary : theme.colors.textWhite} />
            ) : (
                <>
                    {icon && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        isOutline && styles.textOutline,
                        isSecondary && styles.textSecondary,
                        textStyle
                    ]}>
                        {title}
                    </Text>
                    {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
                </>
            )}
        </View>
    );

    const Container = isPrimary ? LinearGradient : View;
    const containerProps = isPrimary ? {
        colors: isDisabled ? [theme.colors.textSecondary, theme.colors.textSecondary] : [theme.colors.gradientStart, theme.colors.gradientEnd],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        style: [styles.gradientContainer, styles.commonContainer]
    } : {
        style: [
            styles.commonContainer,
            isSecondary && styles.secondaryContainer,
            isOutline && styles.outlineContainer,
            isDisabled && styles.disabledContainer
        ]
    };

    // Shimmer Overlay for Primary Buttons
    const ShimmerOverlay = () => {
        if (!isPrimary || isDisabled) return null;
        return (
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX: shimmerTranslate }],
                        opacity: 0.3,
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        );
    };

    return (
        <Animated.View style={[
            { transform: [{ scale: scaleValue }] },
            style,
            isPrimary && theme.shadows.primary // Add glow for primary
        ]}>
            <Pressable
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isDisabled}
                style={({ pressed }) => [
                    styles.pressable,
                    isDisabled && { opacity: 0.8 }
                ]}
            >
                <Container {...containerProps}>
                    <ShimmerOverlay />
                    <ButtonContent />
                </Container>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    pressable: {
        borderRadius: 50, // Pill shape
        overflow: 'hidden',
    },
    commonContainer: {
        height: 56,
        borderRadius: 50, // Pill shape
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    gradientContainer: {
        // Gradient styles handled by LinearGradient props
    },
    secondaryContainer: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    disabledContainer: {
        backgroundColor: theme.colors.border,
        borderColor: theme.colors.border,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: theme.spacing.sm,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
    },
    text: {
        ...theme.typography.buttonText,
        color: theme.colors.textWhite,
    },
    textOutline: {
        color: theme.colors.primary,
    },
    textSecondary: {
        color: theme.colors.textSecondary,
    },
});
