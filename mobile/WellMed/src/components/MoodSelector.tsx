import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
  color: string;
}

interface CompactMoodTrackerProps {
  onMoodSelect: (mood: MoodOption) => void;
  onViewHistory: () => void;
}

const moods: MoodOption[] = [
  { emoji: '😄', label: 'Excellent', value: 'Excellent', color: colors.excellent },
  { emoji: '🙂', label: 'Good', value: 'Good', color: colors.good },
  { emoji: '😐', label: 'Okay', value: 'Okay', color: colors.okay },
  { emoji: '😫', label: 'Stressed', value: 'Stressed', color: colors.stressed },
  { emoji: '😴', label: 'Tired', value: 'Tired', color: colors.tired },
  { emoji: '😰', label: 'Anxious', value: 'Anxious', color: colors.anxious },
];

export default function CompactMoodTracker({ onMoodSelect, onViewHistory }: CompactMoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [animatedValues] = useState(
    moods.map(() => new Animated.Value(1))
  );

  const handleMoodPress = (mood: MoodOption, index: number) => {
    setSelectedMood(mood.value);
    
    // Animate the pressed mood
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the parent handler
    onMoodSelect(mood);
    
    // Reset selection after animation
    setTimeout(() => setSelectedMood(null), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="happy-outline" size={20} color={colors.primary} />
          <Text style={styles.title}>Quick Mood Check</Text>
        </View>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={onViewHistory}
        >
          <Ionicons name="analytics-outline" size={16} color={colors.primary} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Compact Mood Grid */}
      <View style={styles.moodGrid}>
        {moods.map((mood, index) => (
          <Animated.View
            key={index}
            style={[
              styles.moodButtonWrapper,
              { transform: [{ scale: animatedValues[index] }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.moodButton,
                {
                  backgroundColor: selectedMood === mood.value 
                    ? mood.color 
                    : mood.color + '15',
                  borderColor: selectedMood === mood.value 
                    ? mood.color 
                    : 'transparent',
                  borderWidth: selectedMood === mood.value ? 2 : 0,
                }
              ]}
              onPress={() => handleMoodPress(mood, index)}
              activeOpacity={0.7}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                { 
                  color: selectedMood === mood.value ? 'white' : mood.color,
                  fontWeight: selectedMood === mood.value ? 'bold' : '500'
                }
              ]}>
                {mood.label}
              </Text>
              
              {selectedMood === mood.value && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Quick Stats or Recent Mood */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap an emoji to quickly log your current mood
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  historyText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moodButtonWrapper: {
    width: '30%',
    marginBottom: 8,
  },
  moodButton: {
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});