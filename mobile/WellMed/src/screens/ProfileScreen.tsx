import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileMoodTab from './ProfileMoodTab';
import ProfileAssessmentTab from './ProfileAssessmentTab';
import { calculateBurnoutRisk } from '../utils/burnoutRisk';

const moodScale: Record<string, number> = {
    Excellent: 6,
    Good: 5,
    Okay: 4,
    Stressed: 3,
    Tired: 2,
    Anxious: 1,
};

const Tab = createMaterialTopTabNavigator();

export default function ProfileScreen({ navigation }: any) {
    const [email, setEmail] = useState<string | null>(null);
    const [burnoutRisk, setBurnoutRisk] = useState<{ combinedScore: string; riskLevel: string } | null>(null);

    useEffect(() => {
        const fetchEmail = async () => {
            const storedEmail = await AsyncStorage.getItem('userEmail');
            setEmail(storedEmail);
        };

        const fetchRisk = async () => {
            const rawMoods = await AsyncStorage.getItem('moodEntries');
            const moods = rawMoods ? JSON.parse(rawMoods) : [];
            const moodAvg = moods.reduce((acc: number, m: any) => acc + (moodScale[m.value] || 1), 0) / (moods.length || 1);

            const rawMicro = await AsyncStorage.getItem('latestMicroAssessment');
            const micro = rawMicro ? JSON.parse(rawMicro) : { fatigue: 3, stress: 3, satisfaction: 3, sleep: 3 };

            const rawMBI = await AsyncStorage.getItem('mbiResults');
            const mbiList = rawMBI ? JSON.parse(rawMBI) : [];
            const mbi = mbiList[0] || { EE: 5, DP: 5, PA: 5 };

            const result = calculateBurnoutRisk({
                moodAverage: moodAvg,
                microAssessment: micro,
                mbiAssessment: mbi,
            });

            setBurnoutRisk(result);
        };

        fetchEmail();
        fetchRisk();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo_half.png')} style={styles.logo} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconCircle}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* <Text style={styles.title}>Profile</Text> */}

            {/* Show email if available */}
            {email ? (
                <Text style={styles.subtitle}>Email: {email}</Text>
            ) : (
                <Text style={styles.subtitle}>Loading user data...</Text>
            )}

            {/* Show burnout risk if available */}
            {burnoutRisk && (
                <View style={styles.riskCard}>
                    <Text style={styles.riskTitle}>Burnout Risk Level</Text>
                    <Text style={styles.riskLevel}>{burnoutRisk.riskLevel}</Text>
                    <Text style={styles.riskScore}>Score: {burnoutRisk.combinedScore}</Text>
                </View>
            )}

            {/* Top tab navigator */}
            <View style={styles.tabContainer}>
                <Tab.Navigator>
                    <Tab.Screen name="Mood" component={ProfileMoodTab} />
                    <Tab.Screen name="Assessment" component={ProfileAssessmentTab} />
                </Tab.Navigator>
            </View>
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
    header: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 10,
    },
    riskCard: {
        width: '90%',
        padding: 15,
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    riskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    riskLevel: {
        fontSize: 16,
        color: colors.accent,
        marginVertical: 4,
    },
    riskScore: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    tabContainer: {
        flex: 1,
        width: '100%',
    },
});