import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Vibration, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');
const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'] as const;
const phaseColors: Record<string, string> = {
  'Inhale': colors.primary,
  'Hold': colors.accent,
  'Exhale': colors.secondary,
};

export default function BoxBreathingScreen({ navigation }: any) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(true);
  const [hasUnsavedSession, setHasUnsavedSession] = useState(false);
  
  // Animations
  const circleScale = new Animated.Value(0.8);
  const pulseOpacity = new Animated.Value(0.3);
  const backgroundAnimation = new Animated.Value(0);
  const instructionOpacity = new Animated.Value(1);

  useEffect(() => {
    // Background gradient animation
    Animated.loop(
      Animated.timing(backgroundAnimation, {
        toValue: 1,
        duration: 16000, // 4 seconds per phase * 4 phases
        useNativeDriver: false,
        easing: Easing.linear,
      })
    ).start();

    // Start breathing animation
    startBreathingAnimation();
    setSessionStartTime(new Date());

    // Save session when component unmounts (user leaves screen)
    return () => {
      if (hasUnsavedSession && cycleCount > 0) {
        console.log('Component unmounting, saving session...');
        saveSessionToDatabase(false);
      }
    };
  }, [hasUnsavedSession, cycleCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isActive) {
        setSeconds((prev) => {
          if (prev === 1) {
            const nextPhase = (phaseIndex + 1) % phases.length;
            setPhaseIndex(nextPhase);
            
            // Vibration on phase change
            Vibration.vibrate(100);
            
            // Count completed cycles
            if (nextPhase === 0) {
              setCycleCount(count => {
                const newCount = count + 1;
                console.log('Cycle completed, total cycles:', newCount);
                setHasUnsavedSession(true); // Mark that we have unsaved progress
                
                // Auto-save every 5 cycles for testing
                if (newCount % 5 === 0) {
                  console.log('Auto-saving at cycle', newCount);
                  saveSessionToDatabase(false);
                  setHasUnsavedSession(false);
                }
                
                return newCount;
              });
            }
            
            startBreathingAnimation();
            return 4;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseIndex, isActive]);

  const startBreathingAnimation = () => {
    const currentPhase = phases[phaseIndex];
    
    if (currentPhase === 'Inhale') {
      // Expand circle for inhale
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1.4, // Bigger expansion
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.9,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase === 'Exhale') {
      // Contract circle for exhale
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 0.6, // Smaller contraction
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.2,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hold - gentle pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();
    }

    // Instruction fade effect
    Animated.sequence([
      Animated.timing(instructionOpacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(instructionOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const saveSessionToDatabase = async (shouldNavigateBack = false) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found in AsyncStorage');
        return false;
      }

      const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      
      // Don't save very short sessions (less than 10 seconds)
      if (sessionDuration < 10) {
        console.log('Session too short to save:', sessionDuration, 'seconds');
        return false;
      }

      const sessionData = {
        cycles_completed: cycleCount,
        total_duration: sessionDuration,
        average_cycle_time: cycleCount > 0 ? sessionDuration / cycleCount : 0,
      };

      const payload = {
        user_id: userId,
        activity_type: 'box_breathing',
        duration_seconds: sessionDuration,
        cycles_completed: cycleCount,
        session_data: JSON.stringify(sessionData),
        completed_at: new Date().toISOString(),
      };

      console.log('Saving box breathing session:', payload);

      const response = await api.post('/wellness/', payload);
      
      console.log('Box breathing session saved successfully:', response.data);
      setHasUnsavedSession(false);
      
      // Show success message and navigate back if requested
      if (shouldNavigateBack) {
        Alert.alert(
          'Session Saved! 🎉', 
          'Your breathing session has been recorded successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Session Saved', 'Your breathing session has been recorded!');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error saving box breathing session:', error);
      console.error('Error details:', error?.response?.data);
      
      // Show user-friendly error
      Alert.alert(
        'Save Error', 
        'Session completed but could not save to history. Please check your connection.'
      );
      return false;
    }
  };

  const handleSessionEnd = () => {
    setIsActive(false);
    
    const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(sessionDuration / 60);
    const remainingSeconds = sessionDuration % 60;
    
    console.log('Session ending - cycles:', cycleCount, 'duration:', sessionDuration);
    
    // Save to database BEFORE showing alert
    saveSessionToDatabase();
    
    // Use setTimeout to avoid scheduling conflicts
    setTimeout(() => {
      Alert.alert(
        'Session Complete! 🧘‍♀️',
        `Great work! You completed ${cycleCount} breathing cycles in ${minutes}:${remainingSeconds.toString().padStart(2, '0')}.`,
        [
          { text: 'Continue', onPress: () => {
            requestAnimationFrame(() => {
              setIsActive(true);
              setSessionStartTime(new Date());
            });
          }},
          { text: 'Finish', onPress: () => navigation.goBack() },
        ]
      );
    }, 100);
  };

  const handleBackPress = () => {
    if (hasUnsavedSession && cycleCount > 0) {
      Alert.alert(
        'Save Session?',
        `You've completed ${cycleCount} breathing cycles. Would you like to save this session?`,
        [
          {
            text: "Don't Save",
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
          {
            text: 'Save & Exit',
            onPress: async () => {
              const saved = await saveSessionToDatabase();
              if (saved) {
                setTimeout(() => navigation.goBack(), 1000); // Give time for alert to show
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const currentPhase = phases[phaseIndex];
  const phaseColor = phaseColors[currentPhase] || colors.primary;

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Box Breathing</Text>
        <View style={styles.headerSpacer} />
      </View>
      {/* Background gradient overlay */}
      <Animated.View 
        style={[
          styles.backgroundOverlay,
          {
            backgroundColor: backgroundAnimation.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [
                'rgba(74, 144, 226, 0.1)',
                'rgba(245, 166, 35, 0.1)',
                'rgba(80, 227, 194, 0.1)',
                'rgba(245, 166, 35, 0.1)',
                'rgba(74, 144, 226, 0.1)',
              ],
            }),
          },
        ]}
      />

      {/* Header Content */}
      <View style={styles.logoContainer}>
        <Text style={styles.title}>4-4-4-4 Technique</Text>
        <View style={styles.cycleCounter}>
          <Text style={styles.cycleText}>Cycles: {cycleCount}</Text>
        </View>
        {hasUnsavedSession && (
          <Text style={styles.unsavedIndicator}>● Unsaved session</Text>
        )}
      </View>

      {/* Main breathing circle */}
      <View style={styles.circleContainer}>
        {/* Outer pulse rings */}
        <Animated.View
          style={[
            styles.pulseRing,
            styles.pulseRing1,
            {
              opacity: pulseOpacity,
              transform: [{ scale: circleScale }],
              borderColor: phaseColor,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.pulseRing,
            styles.pulseRing2,
            {
              opacity: pulseOpacity.interpolate({
                inputRange: [0.3, 0.8],
                outputRange: [0.1, 0.4],
              }),
              transform: [{ 
                scale: circleScale.interpolate({
                  inputRange: [0.8, 1.2],
                  outputRange: [1.0, 1.4],
                })
              }],
              borderColor: phaseColor,
            },
          ]}
        />

        {/* Main circle */}
        <Animated.View
          style={[
            styles.mainCircle,
            {
              transform: [{ scale: circleScale }],
              backgroundColor: phaseColor,
              shadowColor: phaseColor,
            },
          ]}
        >
          {/* Timer in center */}
          <Text style={styles.timer}>{seconds}</Text>
        </Animated.View>
      </View>

      {/* Phase instruction */}
      <Animated.View 
        style={[
          styles.instructionContainer,
          { opacity: instructionOpacity }
        ]}
      >
        <Text style={[styles.phase, { color: phaseColor }]}>
          {currentPhase}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${((4 - seconds + 1) / 4) * 100}%`,
                  backgroundColor: phaseColor,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Bottom instructions */}
      <View style={styles.bottomContainer}>
        <View style={styles.phaseIndicators}>
          {phases.map((phase, index) => (
            <View
              key={index}
              style={[
                styles.phaseIndicator,
                {
                  backgroundColor: index === phaseIndex ? phaseColor : colors.divider,
                  transform: [{ scale: index === phaseIndex ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>
        
        {/* Add manual save and finish button */}
        <TouchableOpacity
          style={[styles.saveButton, styles.finishButton]}
          onPress={() => saveSessionToDatabase(true)}
        >
          <Text style={styles.saveButtonText}>Save & Finish Session</Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveSessionToDatabase(false)}
        >
          <Text style={styles.saveButtonText}>Save Session</Text>
        </TouchableOpacity> */}
        
        <Text style={styles.instructions}>
          Follow the circle's rhythm and breathe deeply
        </Text>
        <Text style={styles.benefitsText}>
          • Reduces stress and anxiety{'\n'}
          • Improves focus and clarity{'\n'}
          • Calms the nervous system
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60, // Balance the back button
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  cycleCounter: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cycleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 150,
    width: 300,
    height: 300,
  },
  pulseRing1: {
    // Base ring
  },
  pulseRing2: {
    borderWidth: 2,
    width: 360,
    height: 360,
  },
  mainCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phase: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  phaseIndicators: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  phaseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  benefitsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unsavedIndicator: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});