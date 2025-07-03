import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-ionicons';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CarelyJournalScreen from './src/screens/CarelyJournalScreen';
import MicroAssessmentScreen from './src/screens/MicroAssessmentScreen';
import MBIAssessmentScreen from './src/screens/MBIAssessmentScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BoxBreathingScreen from './src/screens/BoxBreathingScreen';
import StretchScreen from './src/screens/StretchScreen';
import WellnessHistoryScreen from './src/screens/WellnessHistoryScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  
  useEffect(() => {
    // Create notification channel 
    // PushNotification.createChannel(
    //   {
    //     channelId: 'mbi-reminder-channel',
    //     channelName: 'MBI Reminders',
    //     channelDescription: 'Monthly reminders for MBI assessments',
    //     importance: 4,
    //     vibrate: true,
    //   },
    //   (created) => console.log(`createChannel returned '${created}'`)
    // );

    // // Optional: Configure notifications (required for iOS)
    // PushNotification.configure({
    //   onNotification: function (notification) {
    //     console.log('NOTIFICATION:', notification);
    //   },
    //   requestPermissions: Platform.OS === 'ios',
    // });

    PushNotification.configure({
      onNotification: function (notification) {
        console.log('Notification:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      requestPermissions: true,
    });


    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setInitialRoute('Home');
      }
    };
    checkToken();
  }, []);

  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = 'home-outline';
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'CarelyJournal') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Profile' || 
                      route.name === 'ProfileMood' || 
                      route.name === 'ProfileAssessment' || 
                      route.name === 'ProfileMicroAssessment') {
              iconName = focused ? 'person' : 'person-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { 
            backgroundColor: colors.backgroundPrimary,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            paddingTop: 5,
            paddingBottom: Platform.OS === 'ios' ? 20 : 5,
            height: Platform.OS === 'ios' ? 85 : 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 5,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'ios' ? 0 : 5,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            headerShown: false,
            tabBarLabel: 'Home',
          }} 
        />
        <Tab.Screen 
          name="CarelyJournal" 
          component={CarelyJournalScreen} 
          options={{ 
            headerShown: false,
            tabBarLabel: 'Carely',
          }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStackScreen} 
          options={{ 
            headerShown: false,
            tabBarLabel: 'Profile',
          }} 
        />
      </Tab.Navigator>
    );
  }

    const HomeStack = createNativeStackNavigator();

      function ProfileStackScreen() {
        return (
          <HomeStack.Navigator>
            <HomeStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="MicroAssessment" component={MicroAssessmentScreen} options={{ headerShown: false}} />
            <HomeStack.Screen name="MBIAssessment" component={MBIAssessmentScreen} options={{ headerShown: false}} />
            <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          </HomeStack.Navigator>
        );
      }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="BoxBreathing" component={BoxBreathingScreen} options={{ title: 'Box Breathing'}} />
        <Stack.Screen name="Stretch" component={StretchScreen} options={{ title: 'Stretching' }} />
        <Stack.Screen name="WellnessHistory" component={WellnessHistoryScreen} options={{ title: 'Wellness History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}