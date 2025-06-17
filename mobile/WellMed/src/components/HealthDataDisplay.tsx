import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
    write: [],
  },
};

export default function HealthDataDisplay() {
  const [loading, setLoading] = useState(true);
  console.log('HealthDataDisplay component mounted');
    // console.log('HealthKit permissions:', permissions);
    // console.log('HealthKit permissions:', permissions.permissions.read);
    // console.log('HealthKit permissions:', permissions.permissions.write);
    // console.log('HealthKit permissions:', permissions.permissions.read.includes(AppleHealthKit.Constants.Permissions.HeartRate));
    // console.log('HealthKit permissions:', permissions.permissions.read.includes(AppleHealthKit.Constants.Permissions.StepCount));
    // console.log('HealthKit permissions:', permissions.permissions.read.includes(AppleHealthKit.Constants.Permissions.SleepAnalysis));  
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [sleepAnalysis, setSleepAnalysis] = useState<string | null>(null);
    console.log('HealthDataDisplay component rendered');
    console.log('Initial state:', { stepCount, heartRate, sleepAnalysis });

  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        console.error('HealthKit init error:', error);
        Alert.alert('Error', 'HealthKit not available');
        return;
      }

      // Get step count
      AppleHealthKit.getStepCount(
        { date: new Date().toISOString() },
        (err: string, results: HealthValue) => {
          if (!err && results && results.value) {
            setStepCount(results.value);
          }
        }
      );

      // Get latest heart rate
      AppleHealthKit.getHeartRateSamples(
        {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          limit: 1,
        },
        (err: string, results: HealthValue[]) => {
          if (!err && results.length > 0) {
            setHeartRate(results[0].value);
          }
          setLoading(false);
        }
      );
    });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
        {/* <Text style={styles.title}>Health Data</Text> */}
        <Text style={styles.metric}>Steps today: {stepCount ?? 'N/A'}</Text>
        <Text style={styles.metric}>Recent Heart Rate: {heartRate ?? 'N/A'} BPM</Text>
        <Text style={styles.metric}>Sleep: {sleepAnalysis ?? 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 10,
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metric: {
    fontSize: 16,
    marginVertical: 4,
  },
});
