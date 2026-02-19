import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import StyledInput from '../components/StyledInput';
import StyledButton from '../components/StyledButton';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ route, navigation }) {
    const { role } = route.params;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name, email, password, role });
            Alert.alert('Success', 'Registration successful! Please login.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.error || 'Something went wrong');
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundImage={require('../assets/background.jpg')}>
            <View style={styles.centerContent}>
                <Card style={styles.cardContainer}>
                    <Text style={theme.typography.h1}>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</Text>

                    <StyledInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        icon={<Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />}
                    />
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
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />}
                    />

                    <StyledButton
                        title="Register"
                        onPress={handleRegister}
                        isLoading={isLoading}
                    />

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Already have an account? Login</Text>
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
