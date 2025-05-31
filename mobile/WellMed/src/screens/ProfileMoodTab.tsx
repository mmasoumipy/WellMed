import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';
import MoodHistory from '../components/MoodHistory';
import { colors } from '../constants/colors';
import api from '../api/api';

export default function ProfileMoodTab() {
  return (
    <View style={styles.container}>
            <ScrollView style={styles.card}>
                <MoodSelector
                    onSelect={async (mood) => {
                        try {
                        const token = await AsyncStorage.getItem('authToken');
                        const userId = await AsyncStorage.getItem('userId');
                        console.log("Submitting mood with token:", token);
                        console.log("User ID:", userId, "Mood:", mood.value);
                    
                        const response = await api.post('/moods/', {
                            user_id: userId,
                            mood: mood.value,
                            reason: mood.note || '',
                            timestamp: new Date().toISOString(),
                        });
                    
                        Alert.alert(`Mood "${response.data.mood}" recorded!`);
                        } catch (e: any) {
                        console.error('Error saving mood:', e);
                        Alert.alert('Error', `Failed to save mood: ${e?.response?.data?.detail || e.message}`);
                        }
                    }}
  
                />
            <MoodHistory />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {   
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
      },
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
});
