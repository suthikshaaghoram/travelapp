import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function ScreenWrapper({ children, style, backgroundImage, isLoading }) {
    const Wrapper = backgroundImage ? ImageBackground : View;
    const wrapperProps = backgroundImage ? { source: backgroundImage, style: styles.backgroundImage } : { style: styles.container };

    return (
        <Wrapper {...wrapperProps}>
            <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.content}>
                        {children}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
            <StatusBar style="auto" />

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                </View>
            )}
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.layout.containerPadding,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        ...theme.shadows.md,
    },
});
