import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StyledInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    style,
    icon,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false, // transform/fontSize logic might require false in some cases, keeping safe
        }).start();
    }, [focusAnim, isFocused, value]);

    // Floating Label Animation Interpolations
    const labelTranslateY = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -28],
    });

    const labelTranslateX = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    });

    const labelScale = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.85],
    });

    const borderColor = isFocused ? theme.colors.primary : error ? theme.colors.error : theme.colors.border;
    const labelColor = error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary;

    return (
        <View style={[styles.container, style]}>
            <View style={[
                styles.inputWrapper,
                { borderColor },
                isFocused && styles.inputWrapperFocused,
                error && styles.inputWrapperError
            ]}>
                {icon && (
                    <View style={styles.iconContainer}>
                        {React.cloneElement(icon, {
                            color: isFocused ? theme.colors.primary : theme.colors.textSecondary
                        })}
                    </View>
                )}

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {label && (
                        <Animated.Text style={[
                            styles.label,
                            {
                                color: labelColor,
                                transform: [
                                    { translateY: labelTranslateY },
                                    { translateX: labelTranslateX },
                                    { scale: labelScale }
                                ]
                            }
                        ]}>
                            {label}
                        </Animated.Text>
                    )}
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={isFocused ? placeholder : ''} // Hide placeholder when not focused to avoid clash with label
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={secureTextEntry}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        selectionColor={theme.colors.primary}
                        {...props}
                    />
                </View>

                {error && (
                    <Ionicons name="alert-circle" size={20} color={theme.colors.error} style={{ marginLeft: 8 }} />
                )}
            </View>
            {error && (
                <Animated.View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBg,
        borderWidth: 1.5,
        borderRadius: theme.layout.inputRadius,
        paddingHorizontal: theme.spacing.md,
        height: 60, // Slightly taller for floating label
        ...theme.shadows.sm,
    },
    inputWrapperFocused: {
        backgroundColor: '#FFFFFF',
        ...theme.shadows.md,
    },
    inputWrapperError: {
        borderColor: theme.colors.error,
    },
    iconContainer: {
        marginRight: theme.spacing.sm,
        marginTop: 4, // Align slightly lower to match input text baseline
    },
    label: {
        position: 'absolute',
        left: 0,
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        height: '100%',
        paddingTop: 8, // Push text down slightly
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: 4,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: '500',
    },
});
