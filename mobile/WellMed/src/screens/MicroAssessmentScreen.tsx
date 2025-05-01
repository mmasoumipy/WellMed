import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Button } from 'react-native';
import { colors } from '../constants/colors';

export default function MicroAssessmentScreen(navigation: any) {
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    { key: 'fatigueLevel', label: 'Fatigue Level', options: ['Low', 'Moderate', 'High'] },
    { key: 'stressLevel', label: 'Stress Level', options: ['Low', 'Moderate', 'High'] },
    { key: 'workSatisfaction', label: 'Work Satisfaction', options: ['Low', 'Moderate', 'High'] },
    { key: 'sleepQuality', label: 'Sleep Quality', options: ['Poor', 'Average', 'Great'] },
    { key: 'supportFeeling', label: 'Feeling Supported', options: ['Not at all', 'Somewhat', 'Very'] },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (questionKey: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: option }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      Alert.alert('Submitted', 'Your micro-assessment has been saved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
            <ScrollView style={styles.card}>
                <Text style={styles.cardTitle}>Micro-Assessment</Text>
                {questions.map((q) => (
                    <View key={q.key} style={styles.questionBlock}>
                    <Text style={styles.questionLabel}>{q.label}</Text>
                    <View style={styles.optionsRow}>
                        {q.options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                            styles.optionButton,
                            answers[q.key] === option && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleSelect(q.key, option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                    <ActivityIndicator color="#fff" />
                    ) : (
                    <Text style={styles.submitButtonText}>Submit Assessment</Text>
                    )}
                </TouchableOpacity>
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
          marginTop: 80,
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
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    questionBlock: { marginBottom: 20 },
    questionLabel: {           
        fontSize: 14,
        color: colors.textSecondary,
    },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    optionButton: {
        padding: 10,
        margin: 5,
        backgroundColor: '#B8CDD9',
        borderRadius: 8,
    },
    optionButtonSelected: {
        backgroundColor: '#4A90E2',
    },
    optionText: { color: '#fff', fontWeight: '600' },
    submitButton: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    
});
