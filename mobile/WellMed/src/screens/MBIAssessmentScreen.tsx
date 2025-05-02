import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const questions = [
  { id: 1, text: 'I feel emotionally drained from my work.' },
  { id: 2, text: 'I feel used up at the end of the workday.' },
  { id: 3, text: 'I feel fatigued when I get up in the morning and have to face another day on the job.' },
  { id: 4, text: 'I can easily understand how my patients feel.' },
  { id: 5, text: 'I feel I treat some patients as if they were impersonal objects.' },
  { id: 6, text: 'Working with people all day is really a strain for me.' },
  { id: 7, text: 'I deal very effectively with the problems of my patients.' },
  { id: 8, text: 'I feel burned out from my work.' },
  { id: 9, text: 'I feel I’m positively influencing other people’s lives through my work.' },
  { id: 10, text: 'I’ve become more callous toward people since I took this job.' },
  { id: 11, text: 'I worry that this job is hardening me emotionally.' },
  { id: 12, text: 'I feel very energetic.' },
  { id: 13, text: 'I feel frustrated by my job.' },
  { id: 14, text: 'I feel I’m working too hard on my job.' },
  { id: 15, text: 'I don’t really care what happens to some patients.' },
  { id: 16, text: 'Working with people directly puts too much stress on me.' },
  { id: 17, text: 'I can easily create a relaxed atmosphere with my patients.' },
  { id: 18, text: 'I feel exhilarated after working closely with my patients.' },
  { id: 19, text: 'I have accomplished many worthwhile things in this job.' },
  { id: 20, text: 'I feel like I’m at the end of my rope.' },
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

  const handleSelect = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== 22) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    setIsLoading(true);

    // Calculate subscale scores
    const EE = [1,2,3,6,8,13,14,16,20].reduce((sum, id) => sum + answers[id], 0);
    const DP = [5,10,11,15,22].reduce((sum, id) => sum + answers[id], 0);
    const PA = [4,7,9,12,17,18,19,21].reduce((sum, id) => sum + answers[id], 0);

    setTimeout(async () => {
        const result = {
          date: new Date().toISOString(),
          EE,
          DP,
          PA,
        };
      
        try {
          const oldData = await AsyncStorage.getItem('mbiResults');
          const parsed = oldData ? JSON.parse(oldData) : [];
          const updated = [result, ...parsed].slice(0, 12); // Keep last 12
          await AsyncStorage.setItem('mbiResults', JSON.stringify(updated));
          Alert.alert(
            'MBI Results',
            `Emotional Exhaustion: ${EE}\nDepersonalization: ${DP}\nPersonal Accomplishment: ${PA}\n\nYour results have been saved!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } catch (e) {
          Alert.alert('Error', 'Failed to save MBI results.');
        }
      
        setIsLoading(false);
      }, 1000);
      
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Maslach Burnout Inventory</Text>
      {questions.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{q.id}. {q.text}</Text>
          <View style={styles.optionsRow}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionButton,
                  answers[q.id] === opt.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelect(q.id, opt.value)}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
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
          <ActivityIndicator color={colors.excellent} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Assessment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {     
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
      },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: colors.textPrimary, marginTop: 50 },  
    questionBlock: { 
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
    questionText: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    optionButton: {
        backgroundColor: colors.divider,
        padding: 8,
        margin: 4,
        borderRadius: 6,
    },
    optionButtonSelected: {
        backgroundColor: colors.secondary,
    },
    optionText: { color: colors.textPrimary, fontSize: 12 },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

});
