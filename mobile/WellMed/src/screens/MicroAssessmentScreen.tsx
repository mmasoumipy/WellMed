import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/api';
import { colors } from '../constants/colors';

type FormField = 'fatigue_level' | 'stress_level' | 'work_satisfaction' | 'sleep_quality' | 'support_feeling';

type FormState = {
  [key in FormField]: number | null;
};

interface Question {
  field: FormField;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lowLabel: string;
  highLabel: string;
}

const questions: Question[] = [
  { 
    field: 'fatigue_level', 
    title: 'Energy Level',
    subtitle: 'How energetic do you feel today?',
    icon: 'battery-charging-outline',
    color: colors.warning,
    lowLabel: 'Exhausted',
    highLabel: 'Energized'
  },
  { 
    field: 'stress_level', 
    title: 'Stress Level',
    subtitle: 'How stressed are you feeling?',
    icon: 'pulse-outline',
    color: colors.error,
    lowLabel: 'Very Calm',
    highLabel: 'Very Stressed'
  },
  { 
    field: 'work_satisfaction', 
    title: 'Work Satisfaction',
    subtitle: 'How satisfied are you with your work today?',
    icon: 'briefcase-outline',
    color: colors.primary,
    lowLabel: 'Unsatisfied',
    highLabel: 'Very Satisfied'
  },
  { 
    field: 'sleep_quality', 
    title: 'Sleep Quality',
    subtitle: 'How well did you sleep last night?',
    icon: 'moon-outline',
    color: colors.secondary,
    lowLabel: 'Poor Sleep',
    highLabel: 'Great Sleep'
  },
  { 
    field: 'support_feeling', 
    title: 'Support Network',
    subtitle: 'How supported do you feel by colleagues?',
    icon: 'people-outline',
    color: colors.success,
    lowLabel: 'Unsupported',
    highLabel: 'Well Supported'
  },
];

export default function MicroAssessmentScreen({ navigation }: any) {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState<FormState>({
    fatigue_level: null,
    stress_level: null,
    work_satisfaction: null,
    sleep_quality: null,
    support_feeling: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scaleAnimations] = useState(() => 
    questions.reduce((acc, question) => {
      acc[question.field] = new Animated.Value(1);
      return acc;
    }, {} as Record<FormField, Animated.Value>)
  );

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

  const selectValue = (field: FormField, value: number) => {
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnimations[field], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[field], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isComplete = Object.values(form).every((v) => v !== null);
  const completedCount = Object.values(form).filter(v => v !== null).length;

  const handleSubmit = async () => {
    if (!isComplete) {
      Alert.alert('Incomplete Assessment', 'Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/micro/', {
        user_id: userId,
        ...form,
        comments: '',
        submitted_at: new Date().toISOString(),
      });

      Alert.alert(
        'Assessment Complete! 🎉', 
        'Your micro-assessment has been saved successfully. Thank you for taking time to check in with yourself.',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          }
        ]
      );

      // Reset form
      setForm({
        fatigue_level: null,
        stress_level: null,
        work_satisfaction: null,
        sleep_quality: null,
        support_feeling: null,
      });

    } catch (err: any) {
      console.error('Submit error:', err);
      Alert.alert(
        'Submission Error', 
        'Unable to save your assessment right now. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingScale = (question: Question) => {
    const currentValue = form[question.field];
    
    return (
      <Animated.View 
        style={[
          styles.questionCard,
          { transform: [{ scale: scaleAnimations[question.field] }] }
        ]}
      >
        {/* Question Header */}
        <View style={styles.questionHeader}>
          <View style={[styles.questionIcon, { backgroundColor: question.color + '20' }]}>
            <Ionicons name={question.icon} size={24} color={question.color} />
          </View>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>
          {currentValue !== null && (
            <View style={[styles.completedBadge, { backgroundColor: question.color }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>

        {/* Rating Labels */}
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabel}>{question.lowLabel}</Text>
          <Text style={styles.ratingLabel}>{question.highLabel}</Text>
        </View>
        
        {/* Rating Scale */}
        <View style={styles.scaleContainer}>
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.scaleButton,
                currentValue === value && [
                  styles.selectedScaleButton, 
                  { 
                    backgroundColor: question.color,
                    shadowColor: question.color,
                  }
                ],
              ]}
              onPress={() => selectValue(question.field, value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.scaleButtonText,
                  currentValue === value && styles.selectedScaleButtonText,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selection Feedback */}
        {currentValue !== null && (
          <View style={[styles.selectionFeedback, { backgroundColor: question.color + '10' }]}>
            <Text style={[styles.selectionText, { color: question.color }]}>
              Selected: {currentValue} ({
                currentValue <= 1 ? question.lowLabel.toLowerCase() : 
                currentValue >= 4 ? question.highLabel.toLowerCase() : 
                'moderate'
              })
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Wellness Check-In</Text>
          <Text style={styles.headerSubtitle}>
            {completedCount === 0 ? "Let's check in on your wellbeing" : 
             completedCount === questions.length ? "Ready to submit!" :
             `${completedCount} of ${questions.length} completed`}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>



      {/* Questions */}
      <ScrollView 
        style={styles.questionsContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.questionsContent}
      >
        {questions.map((question) => renderRatingScale(question))}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isComplete ? styles.submitButtonActive : styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isComplete || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={isComplete ? "white" : colors.textSecondary} 
              />
              <Text style={[
                styles.submitButtonText,
                isComplete ? styles.submitButtonTextActive : styles.submitButtonTextDisabled,
              ]}>
                {isComplete ? 'Submit Assessment' : `Complete All Questions (${completedCount}/${questions.length})`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Quick Stats */}
        {completedCount > 0 && (
          <View style={styles.quickStats}>
            <Text style={styles.quickStatsText}>
              Assessment helps track patterns in your wellbeing over time
            </Text>
          </View>
        )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  questionsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  questionsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  questionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  ratingLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  selectedScaleButton: {
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  scaleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  selectedScaleButtonText: {
    color: 'white',
  },
  selectionFeedback: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  submitButtonActive: {
    backgroundColor: colors.primary,
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
  quickStats: {
    alignItems: 'center',
  },
  quickStatsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});