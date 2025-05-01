import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';
import MoodHistory from '../components/MoodHistory';
import { colors } from '../constants/colors';

export default function ProfileMoodTab() {
  return (
    <View style={styles.container}>
            <ScrollView style={styles.card}>
                <MoodSelector
                onSelect={async (mood) => {
                try {
                    const old = await AsyncStorage.getItem('moodEntries');
                    const moods = old ? JSON.parse(old) : [];
                    const updated = [mood, ...moods].slice(0, 10); // keep last 10
                    await AsyncStorage.setItem('moodEntries', JSON.stringify(updated));
                    Alert.alert(`Mood "${mood.value}" recorded!`);
                } catch (e) {
                    Alert.alert('Failed to save mood.');
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
