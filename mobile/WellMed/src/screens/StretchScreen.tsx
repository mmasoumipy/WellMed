import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const poses = [
  { name: 'Neck Stretch', duration: 15 },
  { name: 'Shoulder Rolls', duration: 15 },
  { name: 'Side Stretch', duration: 15 },
  { name: 'Forward Fold', duration: 15 },
];

export default function StretchScreen() {
  const [poseIndex, setPoseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(poses[0].duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 1) {
          const next = poseIndex + 1;
          if (next >= poses.length) return prev;
          setPoseIndex(next);
          return poses[next].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [poseIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stretching Session</Text>
      <Text style={styles.pose}>{poses[poseIndex].name}</Text>
      <Text style={styles.timer}>{secondsLeft}s</Text>
      <Text style={styles.instructions}>
        Follow along. Each stretch lasts 15 seconds.
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
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  pose: {
    fontSize: 22,
    color: colors.accent,
    marginBottom: 10,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
