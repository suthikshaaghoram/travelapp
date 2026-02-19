import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TravelerDashboard from './screens/TravelerDashboard';
import TravelFormScreen from './screens/TravelFormScreen';
import DestinationInfoScreen from './screens/DestinationInfoScreen';
import ProviderDashboard from './screens/ProviderDashboard';
import AdminDashboard from './screens/AdminDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Bar Options
// Tab Bar Options
const screenOptions = ({ route }) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;

    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Plan Trip') {
      iconName = focused ? 'map' : 'map-outline';
    } else if (route.name === 'Resources') {
      iconName = focused ? 'list' : 'list-outline';
    } else if (route.name === 'My Resources') {
      iconName = focused ? 'briefcase' : 'briefcase-outline';
    } else if (route.name === 'Admin Panel') {
      iconName = focused ? 'settings' : 'settings-outline';
    }

    // Add a subtle scale effect or background circle if focused? 
    // Keeping it simple but using theme colors effectively.
    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textSecondary,
  tabBarStyle: {
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    borderTopWidth: 0,
    elevation: 20, // Higher elevation for floating effect
    shadowColor: theme.colors.primary, // Colored shadow
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20, // Rounded corners for top of tab bar
    borderTopRightRadius: 20,
    position: 'absolute', // Make it float? standard is fine too.
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
});

// Traveler Tabs
function TravelerTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={TravelerDashboard} />
      <Tab.Screen name="Plan Trip" component={TravelFormScreen} />
      <Tab.Screen name="Resources" component={DestinationInfoScreen} />
    </Tab.Navigator>
  );
}

// Provider Tabs
function ProviderTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="My Resources" component={ProviderDashboard} />
    </Tab.Navigator>
  );
}

// Admin Tabs
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Admin Panel" component={AdminDashboard} />
    </Tab.Navigator>
  );
}


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelection" screenOptions={{ headerShown: false }}>

          {/* Auth Flow */}
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Main Flows */}
          <Stack.Screen name="TravelerDashboard" component={TravelerTabs} />
          <Stack.Screen name="ProviderDashboard" component={ProviderTabs} />
          <Stack.Screen name="AdminDashboard" component={AdminTabs} />

          {/* Direct Access Screens (if needed outside tabs, e.g., detail views) */}
          <Stack.Screen name="DestinationInfo" component={DestinationInfoScreen} />

        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}