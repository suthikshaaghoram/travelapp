import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import StyledButton from './StyledButton';

export default function ErrorState({ message, onRetry }) {
    return (
        <View style={styles.container}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
            <Text style={styles.message}>{message || "Something went wrong."}</Text>
            {onRetry && (
                <StyledButton
                    title="Try Again"
                    onPress={onRetry}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    message: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    button: {
        minWidth: 150,
    }
});
