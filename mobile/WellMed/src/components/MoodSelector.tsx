import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface MoodOption {
  image: any; // Image source
  label: string;
  value: string;
  color: string;
}

interface CompactMoodTrackerProps {
  onMoodSelect: (mood: MoodOption) => void;
  onViewHistory: () => void;
}

const moods: MoodOption[] = [
  { 
    image: require('../../assets/moods/content.png'), 
    label: 'Excellent', 
    value: 'Excellent', 
    color: colors.excellent 
  },
  { 
    image: require('../../assets/moods/happy.png'), 
    label: 'Good', 
    value: 'Good', 
    color: colors.good 
  },
  { 
    image: require('../../assets/moods/neutral.png'), 
    label: 'Okay', 
    value: 'Okay', 
    color: colors.okay 
  },
  { 
    image: require('../../assets/moods/angry.png'), 
    label: 'Stressed', 
    value: 'Stressed', 
    color: colors.stressed 
  },
  { 
    image: require('../../assets/moods/tired.png'), 
    label: 'Tired', 
    value: 'Tired', 
    color: colors.tired 
  },
  { 
    image: require('../../assets/moods/sad.png'), 
    label: 'Anxious', 
    value: 'Anxious', 
    color: colors.anxious 
  },
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
                    ? mood.color + '20'
                    : colors.background,
                  borderColor: selectedMood === mood.value 
                    ? mood.color 
                    : colors.divider,
                  borderWidth: selectedMood === mood.value ? 2 : 1,
                }
              ]}
              onPress={() => handleMoodPress(mood, index)}
              activeOpacity={0.7}
            >
              <Image 
                source={mood.image} 
                style={[
                  styles.moodImage,
                  selectedMood === mood.value && styles.selectedMoodImage
                ]}
                resizeMode="contain"
              />
              <Text style={[
                styles.moodLabel,
                { 
                  color: selectedMood === mood.value ? mood.color : colors.textPrimary,
                  fontWeight: selectedMood === mood.value ? 'bold' : '500'
                }
              ]}>
                {mood.label}
              </Text>
              
              {selectedMood === mood.value && (
                <View style={[styles.checkmark, { backgroundColor: mood.color }]}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Quick Stats or Recent Mood */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap a mood to quickly log how you're feeling
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
  moodImage: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  selectedMoodImage: {
    width: 36,
    height: 36,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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