import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MoodSelector from '../components/MoodSelector';
import MoodHistory from '../components/MoodHistory';
import DailyCheckIn from '../components/DailyCheckIn';
import ProfileMoodTab from './ProfileMoodTab';
import ProfileAssessmentTab from './ProfileAssessmentTab';




export default function ProfileScreen({ navigation }: any) {
    const [email, setEmail] = useState<string | null>(null);
    const Tab = createMaterialTopTabNavigator();
  
    useEffect(() => {
      const fetchEmail = async () => {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        setEmail(storedEmail);
      };
      fetchEmail();
    }, []);
  
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo_half.png')} style={styles.logo} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconCircle}>
                        <Ionicons name="setting" style={styles.icon} />
                    </TouchableOpacity>
            </View>
        </View>
  
        <Text style={styles.title}>Profile</Text>
  
        {/* Remove ScrollView here, just render tab directly */}
        <View style={styles.tabContainer}>
          <Tab.Navigator>
            <Tab.Screen name="Mood" component={ProfileMoodTab} />
            <Tab.Screen name="Assessment" component={ProfileAssessmentTab} />
          </Tab.Navigator>
        </View>
  
        {/* {email ? (
          <>
            <Text style={styles.info}>Email: {email}</Text>
            <Text style={styles.subtitle}>This is your burnout prevention app 🌿</Text>
          </>
        ) : (
          <Text style={styles.info}>Loading profile...</Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Back to Home" onPress={() => navigation.navigate('Home')} color={colors.primary} />
        </View> */}
      </View>
    );
  }
  

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
      },
    logoContainer: {
        width: '100%',
        height: Dimensions.get('window').width / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5, 
        
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },
    info: { fontSize: 18, color: colors.textSecondary, marginBottom: 10 },
    subtitle: { fontSize: 16, color: colors.textTertiary, textAlign: 'center', marginTop: 10 },
    buttonContainer: { marginTop: 20, width: '100%' },
    card: {
        width: '90%',
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    tabContainer: {
        flex: 1,
        width: '100%',
    },
    iconCircle: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 40,
        right: 20,
        position: 'absolute',
    },
  
});
