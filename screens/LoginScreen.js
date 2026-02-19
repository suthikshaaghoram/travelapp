import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import StyledInput from '../components/StyledInput';
import StyledButton from '../components/StyledButton';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ route, navigation }) {
    const { role } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        console.log('Login button clicked');
        console.log('Attempting login with:', email, password);
        setIsLoading(true);
        try {
            console.log('Sending request to /auth/login...');
            const response = await api.post('/auth/login', { email, password });
            console.log('Response received:', response.status);
            const { token, user } = response.data;

            // Verify role matches
            if (user.role !== role) {
                Alert.alert('Error', 'Invalid role for this user.');
                setIsLoading(false);
                return;
            }

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            console.log('Login successful. Check role:', role);

            try {
                if (role === 'traveler') {
                    console.log('Navigating to TravelerDashboard...');
                    navigation.replace('TravelerDashboard');
                }
                else if (role === 'provider') {
                    navigation.replace('ProviderDashboard');
                }
                else if (role === 'admin') {
                    navigation.replace('AdminDashboard');
                }
            } catch (navError) {
                console.error('Navigation error:', navError);
                window.alert('Navigation failed: ' + navError.message);
            }

        } catch (error) {
            const msg = error.response?.data?.error || 'Something went wrong';
            if (Platform.OS === 'web') {
                window.alert(msg);
            } else {
                Alert.alert('Login Failed', msg);
            }
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundImage={require('../assets/background.jpg')}>
            <View style={styles.centerContent}>
                <Card style={styles.cardContainer}>
                    <Text style={theme.typography.h1}>{role.charAt(0).toUpperCase() + role.slice(1)} Login</Text>

                    <StyledInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />}
                    />
                    <StyledInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
                    />

                    <StyledButton
                        title="Login"
                        onPress={handleLogin}
                        isLoading={isLoading}
                    />

                    <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
                        <Text style={styles.linkText}>Don't have an account? Register</Text>
                    </TouchableOpacity>
                </Card>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardContainer: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: theme.spacing.xl,
    },
    linkText: {
        color: theme.colors.primary,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontWeight: '600',
    },
});
