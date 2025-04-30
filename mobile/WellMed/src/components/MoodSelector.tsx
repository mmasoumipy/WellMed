import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const moods = [
  { label: '😄 Excellent', value: 'Excellent', color: colors.excellent },
  { label: '🙂 Good', value: 'Good', color: colors.good },
  { label: '😐 Okay', value: 'Okay', color: colors.okay },
  { label: '😫 Stressed', value: 'Stressed', color: colors.stressed },
  { label: '😴 Tired', value: 'Tired', color: colors.tired },
  { label: '😰 Anxious', value: 'Anxious', color: colors.anxious },
];

export default function MoodSelector({ onSelect }: { onSelect: (mood: any) => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you feel now?</Text>
      <View style={styles.moodRow}>
        {moods.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.moodButton, { backgroundColor: mood.color }]}
            onPress={() => onSelect({ ...mood, timestamp: new Date().toISOString() })}
          >
            <Text style={styles.moodText}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.textPrimary },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  moodButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  moodText: { color: 'white', fontWeight: '600' },
});
