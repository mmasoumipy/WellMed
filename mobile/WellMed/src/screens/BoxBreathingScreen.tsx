import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];

export default function BoxBreathingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          setPhaseIndex((prevIndex) => (prevIndex + 1) % phases.length);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Box Breathing</Text>
      <Text style={styles.phase}>{phases[phaseIndex]}</Text>
      <Text style={styles.timer}>{seconds}</Text>
      <Text style={styles.instructions}>
        Breathe calmly: 4s Inhale → 4s Hold → 4s Exhale → 4s Hold. Repeat.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  phase: {
    fontSize: 24,
    color: colors.thirdary,
    marginBottom: 10,
  },
  timer: {
    fontSize: 64,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
