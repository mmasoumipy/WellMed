import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { colors } from '../constants/colors';

type FormField = 'fatigue_level' | 'stress_level' | 'work_satisfaction' | 'sleep_quality' | 'support_feeling';

type FormState = {
  [key in FormField]: number | null;
};


const questions: { field: FormField; label: string }[] = [
  { field: 'fatigue_level', label: 'Fatigue Level' },
  { field: 'stress_level', label: 'Stress Level' },
  { field: 'work_satisfaction', label: 'Work Satisfaction' },
  { field: 'sleep_quality', label: 'Sleep Quality' },
  { field: 'support_feeling', label: 'Feeling Supported' },
];


export default function MicroAssessmentScreen() {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState<FormState>({
    fatigue_level: null,
    stress_level: null,
    work_satisfaction: null,
    sleep_quality: null,
    support_feeling: null,
  });
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

  const selectValue = (field: string, value: number) => {
    setForm({ ...form, [field]: value });
  };

  const isComplete = Object.values(form).every((v) => v !== null);

  const handleSubmit = async () => {
    if (!isComplete) {
      Alert.alert('Incomplete', 'Please answer all questions.');
      return;
    }
    console.log("Submitting mood with token:", token);
    console.log("User ID:", userId, "Form State:", form);

    try {
      const res = await api.post(
        `${process.env.PUBLIC_API_BASE_URL}/micro/`,
        {
          user_id: userId,
          ...form,
          comment: '',
          submitted_at: now,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Assessment submitted!');
      setForm({
        fatigue_level: null,
        stress_level: null,
        work_satisfaction: null,
        sleep_quality: null,
        support_feeling: null,
      });
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Error', 'Failed to submit assessment. Lets try again later.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Micro Assessment</Text>

      {questions.map((q) => (
        <View key={q.field} style={styles.questionBlock}>
          <Text style={styles.question}>{q.label}</Text>
          <View style={styles.optionsRow}>
            {[0, 1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.option,
                  form[q.field] === val && styles.selectedOption,
                ]}
                onPress={() => selectValue(q.field, val)}
              >
                <Text style={styles.optionText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Button title="Submit Assessment" onPress={handleSubmit} color={colors.primary} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.backgroundPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  questionBlock: {
    marginBottom: 25,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    width: 40,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: colors.accent,
  },
  optionText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
