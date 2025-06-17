import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { colors } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const poses = [
  { 
    name: 'Neck Stretch', 
    duration: 15, 
    instruction: 'Gently tilt your head to the right, then left',
    icon: 'person-outline',
    benefit: 'Relieves neck tension'
  },
  { 
    name: 'Shoulder Rolls', 
    duration: 15, 
    instruction: 'Roll shoulders backward in slow, controlled circles',
    icon: 'fitness-outline',
    benefit: 'Reduces shoulder stiffness'
  },
  { 
    name: 'Side Stretch', 
    duration: 15, 
    instruction: 'Reach one arm overhead and lean to the opposite side',
    icon: 'body-outline',
    benefit: 'Stretches side muscles'
  },
  { 
    name: 'Forward Fold', 
    duration: 15, 
    instruction: 'Slowly bend forward, letting your arms hang',
    icon: 'arrow-down-outline',
    benefit: 'Relieves back tension'
  },
  { 
    name: 'Spinal Twist', 
    duration: 15, 
    instruction: 'Sit and gently twist your torso left, then right',
    icon: 'refresh-outline',
    benefit: 'Improves spinal mobility'
  },
];

export default function StretchScreen({ navigation }: any) {
  const [poseIndex, setPoseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(poses[0].duration);
  const [isActive, setIsActive] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [completedPoses, setCompletedPoses] = useState<string[]>([]);
  
  // Animations
  const progressAnimation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);
  const slideAnimation = new Animated.Value(0);
  const iconRotation = new Animated.Value(0);

  useEffect(() => {
    if (isActive) {
      startTimer();
      startProgressAnimation();
      startPulseAnimation();
      animateIcon();
    }
    setSessionStartTime(new Date());
  }, [poseIndex, isActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && secondsLeft > 0) {
      timer = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      handleNextPose();
    }

    return () => clearTimeout(timer);
  }, [secondsLeft, isActive]);

  const startTimer = () => {
    setSecondsLeft(poses[poseIndex].duration);
  };

  const startProgressAnimation = () => {
    progressAnimation.setValue(0);
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: poses[poseIndex].duration * 1000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  const animateIcon = () => {
    iconRotation.setValue(0);
    Animated.timing(iconRotation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
  };

  const handleNextPose = () => {
    // Add completed pose to list
    setCompletedPoses(prev => [...prev, poses[poseIndex].name]);
    
    // Vibration on pose completion
    Vibration.vibrate(150);
    
    if (poseIndex < poses.length - 1) {
      // Use requestAnimationFrame to avoid scheduling conflicts
      requestAnimationFrame(() => {
        // Slide to next pose
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start((finished) => {
          if (finished) {
            // Use requestAnimationFrame for state updates after animation
            requestAnimationFrame(() => {
              setPoseIndex(poseIndex + 1);
              slideAnimation.setValue(0);
            });
          }
        });
      });
    } else {
      // Session complete
      setIsActive(false);
      saveSessionToDatabase();
      
      // Use setTimeout to avoid scheduling conflicts with the alert
      setTimeout(() => {
        Alert.alert(
          'Session Complete! 🎉',
          `Great job! You completed a ${Math.floor(totalTime / 60)} minute stretching session with ${completedPoses.length + 1} poses.`,
          [
            { text: 'Another Round', onPress: () => resetSession() },
            { text: 'Finish', onPress: () => navigation.goBack() },
          ]
        );
      }, 100);
    }
  };

  const saveSessionToDatabase = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const sessionData = {
        poses_completed: completedPoses.length + 1, // +1 for current pose
        poses_list: [...completedPoses, poses[poseIndex].name],
        total_duration: totalTime,
        average_pose_time: totalTime / (completedPoses.length + 1),
      };

      await api.post('/wellness/', {
        user_id: userId,
        activity_type: 'stretching',
        duration_seconds: totalTime,
        poses_completed: completedPoses.length + 1,
        session_data: JSON.stringify(sessionData),
        completed_at: new Date().toISOString(),
      });

      console.log('Stretching session saved to database');
    } catch (error) {
      console.error('Error saving stretching session:', error);
    }
  };

  const resetSession = () => {
    // Use requestAnimationFrame to batch state updates
    requestAnimationFrame(() => {
      setPoseIndex(0);
      setIsActive(true);
      setTotalTime(0);
      setCompletedPoses([]);
      setSessionStartTime(new Date());
      
      // Reset animations
      progressAnimation.setValue(0);
      slideAnimation.setValue(0);
    });
  };

  const togglePause = () => {
    setIsActive(!isActive);
    if (!isActive) {
      startProgressAnimation();
    }
  };

  const skipPose = () => {
    handleNextPose();
  };

  const currentPose = poses[poseIndex];
  const progressPercentage = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Stretching Session</Text>
          <Text style={styles.sessionInfo}>
            {poseIndex + 1} of {poses.length} • {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.overallProgress}>
        <View style={styles.progressContainer}>
          {poses.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: index <= poseIndex 
                    ? (index === poseIndex ? colors.accent : colors.success)
                    : colors.divider,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            transform: [{
              translateX: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50],
              }),
            }],
            opacity: slideAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        {/* Pose Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnimation },
                {
                  rotate: iconRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons 
            name={currentPose.icon as any} 
            size={80} 
            color={colors.accent} 
          />
        </Animated.View>

        {/* Pose Info */}
        <View style={styles.poseInfo}>
          <Text style={styles.poseName}>{currentPose.name}</Text>
          <Text style={styles.benefit}>{currentPose.benefit}</Text>
          <Text style={styles.instruction}>{currentPose.instruction}</Text>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Animated.View
              style={[
                styles.progressRing,
                {
                  width: progressPercentage,
                },
              ]}
            />
            <Text style={styles.timer}>{secondsLeft}</Text>
            <Text style={styles.timerLabel}>seconds</Text>
          </View>
        </View>

        {/* Individual Progress */}
        <View style={styles.individualProgress}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressPercentage,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={skipPose}
        >
          <Ionicons name="play-skip-forward" size={24} color={colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={togglePause}
        >
          <Ionicons 
            name={isActive ? "pause" : "play"} 
            size={28} 
            color="white" 
          />
          <Text style={styles.primaryButtonText}>
            {isActive ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={resetSession}
        >
          <Ionicons name="refresh" size={24} color={colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Benefits Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Benefits of Stretching:</Text>
        <Text style={styles.footerText}>
          • Reduces muscle tension • Improves circulation • Prevents injury • Boosts energy
        </Text>
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sessionInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  overallProgress: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  poseInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  poseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefit: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 60,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  individualProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 12,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});