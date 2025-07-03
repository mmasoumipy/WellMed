import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const moods = [
  { 
    label: 'Excellent', 
    value: 'Excellent', 
    emoji: '😄', 
    color: colors.excellent,
    gradient: ['#7ED321', '#9AE34B'],
    description: 'Feeling fantastic!'
  },
  { 
    label: 'Good', 
    value: 'Good', 
    emoji: '🙂', 
    color: colors.good,
    gradient: ['#9AE34B', '#F5A623'],
    description: 'Pretty good day'
  },
  { 
    label: 'Okay', 
    value: 'Okay', 
    emoji: '😐', 
    color: colors.okay,
    gradient: ['#F5A623', '#FF9500'],
    description: 'Doing alright'
  },
  { 
    label: 'Stressed', 
    value: 'Stressed', 
    emoji: '😫', 
    color: colors.stressed,
    gradient: ['#FF9500', '#FF6B35'],
    description: 'Feeling overwhelmed'
  },
  { 
    label: 'Tired', 
    value: 'Tired', 
    emoji: '😴', 
    color: colors.tired,
    gradient: ['#BD10E0', '#8B5CF6'],
    description: 'Need some rest'
  },
  { 
    label: 'Anxious', 
    value: 'Anxious', 
    emoji: '😰', 
    color: colors.anxious,
    gradient: ['#D0021B', '#FF4757'],
    description: 'Feeling worried'
  },
];

interface MoodSelectorProps {
  onSelect: (mood: any) => void;
  selectedMood?: string;
}

export default function MoodSelector({ onSelect, selectedMood }: MoodSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scaleValues] = useState(moods.map(() => new Animated.Value(1)));

  const handleMoodSelect = (mood: any, index: number) => {
    setSelectedIndex(index);
    
    // Animate the selected mood
    Animated.sequence([
      Animated.timing(scaleValues[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the onSelect callback with additional timestamp
    onSelect({
      ...mood,
      timestamp: new Date().toISOString(),
      selectedAt: new Date(),
    });
  };

  const renderMoodOption = (mood: any, index: number) => {
    const isSelected = selectedIndex === index || selectedMood === mood.value;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.moodContainer,
          { transform: [{ scale: scaleValues[index] }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.moodButton,
            { 
              backgroundColor: mood.color,
              borderWidth: isSelected ? 3 : 0,
              borderColor: isSelected ? colors.textPrimary : 'transparent',
            }
          ]}
          onPress={() => handleMoodSelect(mood, index)}
          activeOpacity={0.8}
        >
          <View style={styles.emojiContainer}>
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </View>
          
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.moodInfo}>
          <Text style={[
            styles.moodLabel,
            { color: isSelected ? mood.color : colors.textPrimary }
          ]}>
            {mood.label}
          </Text>
          <Text style={styles.moodDescription}>
            {mood.description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <Text style={styles.subtitle}>Tap the mood that best describes how you feel right now</Text>
      
      <View style={styles.moodGrid}>
        {moods.map((mood, index) => renderMoodOption(mood, index))}
      </View>
      
      {selectedIndex !== null && (
        <Animated.View style={styles.confirmationMessage}>
          <Text style={styles.confirmationText}>
            Great! Your mood has been recorded 🎉
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 10,
  },
  moodContainer: {
    alignItems: 'center',
    width: (width - 80) / 3, // 3 moods per row with spacing
    marginBottom: 20,
  },
  moodButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  moodInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  confirmationMessage: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.success + '15',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  confirmationText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
});