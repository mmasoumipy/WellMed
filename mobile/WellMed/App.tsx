import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MicroAssessmentScreen from './src/screens/MicroAssessmentScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-ionicons';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setInitialRoute('Main');
      }
    };
    checkToken();
  }, []);

  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = 'home-outline';
            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Profile' || 
                      route.name === 'ProfileMood' || 
                      route.name === 'ProfileAssessment' || 
                      route.name === 'ProfileMicroAssessment') {
              iconName = 'person-outline';
            }
            else if (route.name === 'MicroAssessment') {
              iconName = 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { backgroundColor: colors.backgroundPrimary },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    );
  }

    const HomeStack = createNativeStackNavigator();

      function ProfileStackScreen() {
        return (
          <HomeStack.Navigator>
            <HomeStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="MicroAssessment" component={MicroAssessmentScreen} options={{ headerShown: false }} />
          </HomeStack.Navigator>
        );
      }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="MicroAssessment" component={MicroAssessmentScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}