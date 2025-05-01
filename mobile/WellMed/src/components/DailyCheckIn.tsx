import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const options = [
  { label: 'Not at all', value: 1 },
  { label: 'A little', value: 2 },
  { label: 'Quite a bit', value: 3 },
  { label: 'Extremely', value: 4 },
];

export default function DailyCheckIn() {
  const handleSelect = async (option: any) => {
    try {
      const old = await AsyncStorage.getItem('dailyCheckins');
      const checkins = old ? JSON.parse(old) : [];
      const updated = [
        { value: option.value, label: option.label, timestamp: new Date().toISOString() },
        ...checkins,
      ].slice(0, 10);
      await AsyncStorage.setItem('dailyCheckins', JSON.stringify(updated));
      Alert.alert('Thank you!', `You selected "${option.label}".`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save your response.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How overwhelmed do you feel today?</Text>
      <View style={styles.optionsContainer}>
        {options.map((opt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleSelect(opt)}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, width: '100%', paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 10 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  optionButton: {
    backgroundColor: colors.accent,
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  optionText: { color: 'white', fontWeight: '600' },
});
