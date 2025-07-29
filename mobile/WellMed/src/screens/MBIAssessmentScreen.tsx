import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PushNotification from 'react-native-push-notification';
import { scheduleMonthlyMBIReminder } from '../utils/notifications';
import { PUBLIC_API_BASE_URL } from '@env';
import { colors } from '../constants/colors';
import api from '../api/api';

const questions = [
  { id: 1, text: 'I feel emotionally drained from my work.' },
  { id: 2, text: 'I feel used up at the end of the workday.' },
  { id: 3, text: 'I feel fatigued when I get up in the morning and have to face another day on the job.' },
  { id: 4, text: 'I can easily understand how my patients feel.' },
  { id: 5, text: 'I feel I treat some patients as if they were impersonal objects.' },
  { id: 6, text: 'Working with people all day is really a strain for me.' },
  { id: 7, text: 'I deal very effectively with the problems of my patients.' },
  { id: 8, text: 'I feel burned out from my work.' },
  { id: 9, text: 'I feel I\'m positively influencing other people\'s lives through my work.' },
  { id: 10, text: 'I\'ve become more callous toward people since I took this job.' },
  { id: 11, text: 'I worry that this job is hardening me emotionally.' },
  { id: 12, text: 'I feel very energetic.' },
  { id: 13, text: 'I feel frustrated by my job.' },
  { id: 14, text: 'I feel I\'m working too hard on my job.' },
  { id: 15, text: 'I don\'t really care what happens to some patients.' },
  { id: 16, text: 'Working with people directly puts too much stress on me.' },
  { id: 17, text: 'I can easily create a relaxed atmosphere with my patients.' },
  { id: 18, text: 'I feel exhilarated after working closely with my patients.' },
  { id: 19, text: 'I have accomplished many worthwhile things in this job.' },
  { id: 20, text: 'I feel like I\'m at the end of my rope.' },
  { id: 21, text: 'In my work, I deal with emotional problems very calmly.' },
  { id: 22, text: 'I feel patients blame me for some of their problems.' },
];

const options = [
  { label: 'Never', value: 0 },
  { label: 'A few times a year or less', value: 1 },
  { label: 'Once a month or less', value: 2 },
  { label: 'A few times a month', value: 3 },
  { label: 'Once a week', value: 4 },
  { label: 'A few times a week', value: 5 },
  { label: 'Every day', value: 6 },
];

export default function MBIAssessmentScreen({ navigation }: any) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const now = new Date().toISOString();

  useEffect(() => {
    const loadAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        setToken(token);
        setUserId(userId);
      }
    };
    loadAuth();
  }, []);

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const getCompletionPercentage = () => {
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  };

  const handleBackPress = () => {
    const completedQuestions = Object.keys(answers).length;
    
    if (completedQuestions === 0) {
      // No progress, just go back
      navigation.goBack();
    } else {
      // Some progress made, confirm before leaving
      Alert.alert(
        'Leave Assessment?',
        `You've answered ${completedQuestions} of ${questions.length} questions. Your progress will be lost if you leave now.`,
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate answers
      if (Object.keys(answers).length !== 22) {
        Alert.alert('Incomplete Assessment', `Please answer all ${questions.length} questions to complete the MBI assessment.`);
        return;
      }

      setIsLoading(true);

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        question_id: parseInt(questionId),
        answer_value: value
      }));

      // Get user ID from your auth system
      const userId = await AsyncStorage.getItem('userId');

      // Prepare payload
      const payload = {
        user_id: userId,
        answers: formattedAnswers
      };

      // Send to API
      const response = await fetch(`${PUBLIC_API_BASE_URL}/mbi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const result = await response.json();

      // Schedule the monthly reminder
      scheduleMonthlyMBIReminder();

      // Interpret results
      const interpretResults = (ee: number, dp: number, pa: number) => {
        let interpretation = '';
        
        // Emotional Exhaustion interpretation
        if (ee >= 27) interpretation += 'High emotional exhaustion. ';
        else if (ee >= 17) interpretation += 'Moderate emotional exhaustion. ';
        else interpretation += 'Low emotional exhaustion. ';
        
        // Depersonalization interpretation  
        if (dp >= 10) interpretation += 'High depersonalization. ';
        else if (dp >= 6) interpretation += 'Moderate depersonalization. ';
        else interpretation += 'Low depersonalization. ';
        
        // Personal Accomplishment interpretation
        if (pa <= 31) interpretation += 'Low sense of personal accomplishment.';
        else if (pa <= 38) interpretation += 'Moderate sense of personal accomplishment.';
        else interpretation += 'High sense of personal accomplishment.';
        
        return interpretation;
      };

      const interpretation = interpretResults(
        result.emotional_exhaustion,
        result.depersonalization, 
        result.personal_accomplishment
      );

      Alert.alert(
        'MBI Assessment Complete! 📊',
        `Your Results:\n\n` +
        `• Emotional Exhaustion: ${result.emotional_exhaustion}\n` +
        `• Depersonalization: ${result.depersonalization}\n` +
        `• Personal Accomplishment: ${result.personal_accomplishment}\n\n` +
        `Interpretation: ${interpretation}\n\n` +
        `Your results have been saved and will help track your wellbeing over time.`,
        [
          { 
            text: 'View Profile', 
            onPress: () => navigation.navigate('Profile') 
          },
          { 
            text: 'Done', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit assessment. Please check your connection and try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>MBI Assessment</Text>
          <Text style={styles.headerSubtitle}>
            {Object.keys(answers).length} of {questions.length} questions
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getCompletionPercentage()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{getCompletionPercentage()}% Complete</Text>
      </View>

      {/* Questions */}
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.title}>Maslach Burnout Inventory</Text>
          <Text style={styles.description}>
            This assessment measures three aspects of burnout: emotional exhaustion, depersonalization, and personal accomplishment. Please answer honestly based on how you currently feel about your work.
          </Text>
        </View>

        {questions.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Question {q.id}</Text>
              {answers[q.id] !== undefined && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </View>
            <Text style={styles.questionText}>{q.text}</Text>
            
            <View style={styles.optionsContainer}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionButton,
                    answers[q.id] === opt.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelect(q.id, opt.value)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radioButton,
                      answers[q.id] === opt.value && styles.radioButtonSelected
                    ]}>
                      {answers[q.id] === opt.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      answers[q.id] === opt.value && styles.optionTextSelected
                    ]}>
                      {opt.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            Object.keys(answers).length === questions.length 
              ? styles.submitButtonActive 
              : styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || Object.keys(answers).length !== questions.length}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={Object.keys(answers).length === questions.length ? "white" : colors.textSecondary} 
              />
              <Text style={[
                styles.submitButtonText,
                Object.keys(answers).length === questions.length 
                  ? styles.submitButtonTextActive 
                  : styles.submitButtonTextDisabled
              ]}>
                {Object.keys(answers).length === questions.length 
                  ? 'Submit Assessment' 
                  : `Answer ${questions.length - Object.keys(answers).length} more questions`
                }
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for submit button
  },
  introSection: {
    padding: 16,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  questionBlock: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 4,
  },
  optionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.divider,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submitButtonTextActive: {
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: colors.textSecondary,
  },
});