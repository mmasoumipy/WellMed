import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Dimensions,
  Platform,
  Animated,
  Vibration
} from 'react-native';
import { colors } from '../constants/colors';
import { PUBLIC_API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';
import WellnessStreakCard from '../components/WellnessStreakCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | undefined>(undefined);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
  const [animatedValues] = useState(
    Array(6).fill(0).map(() => new Animated.Value(1))
  );

  useEffect(() => {
    loadUserData();
    setTimeOfDayGreeting();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      setUserName(storedName);
      
      // Load wellness stats for streak
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        try {
          const statsResponse = await api.get(`/wellness/user/${userId}/stats`);
          const stats = statsResponse.data;
          setCurrentStreak(stats.current_streak || 0);
          setLongestStreak(stats.longest_streak || 0);
          
          // Get last activity date from wellness activities
          const activitiesResponse = await api.get(`/wellness/user/${userId}`);
          if (activitiesResponse.data.length > 0) {
            setLastActivityDate(activitiesResponse.data[0].completed_at);
          }
        } catch (error) {
          console.log('Could not load wellness stats');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12 && hour >= 5) {
      setTimeOfDay('Good morning');
    } else if (hour < 17 && hour >= 12) {
      setTimeOfDay('Good afternoon');
    } else if (hour < 21 && hour >= 17) {
      setTimeOfDay('Good evening');
    } else {
      setTimeOfDay('Good night');
    }
  };

  const animateMoodButton = (index: number) => {
    Vibration.vibrate(50); // Light haptic feedback
    
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.greetingContainer}>
        <Text style={styles.timeGreeting}>{timeOfDay}</Text>
        <Text style={styles.userName}>
          {userName ? `Dr. ${userName.split(' ')[0]}` : 'Doctor'} 👋
        </Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>
    </View>
  );

  const renderQuickMoodTracker = () => {
    const moods = [
      { emoji: '😄', label: 'Excellent', value: 'Excellent', color: colors.excellent, description: 'Amazing day!' },
      { emoji: '🙂', label: 'Good', value: 'Good', color: colors.good, description: 'Pretty good' },
      { emoji: '😐', label: 'Okay', value: 'Okay', color: colors.okay, description: 'Just okay' },
      { emoji: '😫', label: 'Stressed', value: 'Stressed', color: colors.stressed, description: 'Overwhelmed' },
      { emoji: '😴', label: 'Tired', value: 'Tired', color: colors.tired, description: 'Need rest' },
      { emoji: '😰', label: 'Anxious', value: 'Anxious', color: colors.anxious, description: 'Worried' },
    ];

    return (
      <View style={styles.moodCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="happy-outline" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>How are you feeling?</Text>
        </View>
        <Text style={styles.cardSubtitle}>Tap an emoji to quickly log your mood</Text>
        
        <View style={styles.moodGrid}>
          {moods.map((mood, index) => (
            <Animated.View
              key={index}
              style={[
                styles.moodButtonContainer,
                { transform: [{ scale: animatedValues[index] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.moodButton, 
                  { 
                    backgroundColor: selectedMoodIndex === index ? mood.color : mood.color + '15',
                    borderWidth: selectedMoodIndex === index ? 2 : 1,
                    borderColor: selectedMoodIndex === index ? mood.color : 'transparent',
                  }
                ]}
                onPress={async () => {
                  setSelectedMoodIndex(index);
                  animateMoodButton(index);
                  
                  try {
                    const userId = await AsyncStorage.getItem('userId');
                    const response = await api.post('/moods/', {
                      user_id: userId,
                      mood: mood.value,
                      reason: '',
                      timestamp: new Date().toISOString(),
                    });

                    // Clear selection after a delay
                    setTimeout(() => setSelectedMoodIndex(null), 2000);

                    Alert.alert(
                      '✅ Mood Recorded!', 
                      `Your "${response.data.mood}" mood has been saved.`,
                      [{ 
                        text: 'Great!', 
                        style: 'default',
                        onPress: () => loadUserData() // Refresh data
                      }]
                    );
                  } catch (e) {
                    console.error('Error saving mood:', e);
                    setSelectedMoodIndex(null);
                    Alert.alert('Error', 'Failed to save mood. Please try again.');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.moodEmoji,
                  { fontSize: selectedMoodIndex === index ? 32 : 28 }
                ]}>
                  {mood.emoji}
                </Text>
                <Text style={[
                  styles.moodLabel, 
                  { 
                    color: selectedMoodIndex === index ? 'white' : mood.color,
                    fontWeight: selectedMoodIndex === index ? 'bold' : '600'
                  }
                ]}>
                  {mood.label}
                </Text>
                <Text style={[
                  styles.moodDescription,
                  {
                    color: selectedMoodIndex === index ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                    opacity: selectedMoodIndex === index ? 1 : 0.7,
                  }
                ]}>
                  {mood.description}
                </Text>
                
                {selectedMoodIndex === index && (
                  <View style={styles.selectionIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.detailedMoodButton}
          onPress={() => navigation.navigate('Profile', { screen: 'ProfileMood' })}
        >
          <Ionicons name="analytics-outline" size={16} color={colors.primary} />
          <Text style={styles.detailedMoodText}>View mood history & detailed tracking</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderWellnessActivities = () => (
    <View style={styles.wellnessCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="leaf-outline" size={24} color={colors.success} />
        <Text style={styles.cardTitle}>Wellness Activities</Text>
      </View>
      <Text style={styles.cardSubtitle}>Quick exercises to boost your wellbeing</Text>
      
      <View style={styles.activityGrid}>
        <TouchableOpacity
          style={[styles.activityButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('BoxBreathing')}
          activeOpacity={0.8}
        >
          <Ionicons name="leaf" size={32} color="white" />
          <Text style={styles.activityTitle}>Box Breathing</Text>
          <Text style={styles.activityDescription}>4-4-4-4 technique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.activityButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('Stretch')}
          activeOpacity={0.8}
        >
          <Ionicons name="body" size={32} color="white" />
          <Text style={styles.activityTitle}>Stretching</Text>
          <Text style={styles.activityDescription}>5-minute routine</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('WellnessHistory')}
      >
        <Ionicons name="analytics-outline" size={20} color={colors.primary} />
        <Text style={styles.historyButtonText}>View Wellness History</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderQuickAssessments = () => (
    <View style={styles.assessmentCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="clipboard-outline" size={24} color={colors.accent} />
        <Text style={styles.cardTitle}>Health Assessments</Text>
      </View>
      <Text style={styles.cardSubtitle}>Monitor your wellbeing regularly</Text>
      
      <View style={styles.assessmentGrid}>
        <TouchableOpacity
          style={styles.assessmentItem}
          onPress={() => navigation.navigate('Profile', { 
            screen: 'MicroAssessment' 
          })}
          activeOpacity={0.7}
        >
          <View style={[styles.assessmentIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="speedometer-outline" size={24} color={colors.secondary} />
          </View>
          <Text style={styles.assessmentText}>Quick Check</Text>
          <Text style={styles.assessmentSubtext}>2 min assessment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.assessmentItem}
          onPress={() => navigation.navigate('Profile', { 
            screen: 'MBIAssessment' 
          })}
          activeOpacity={0.7}
        >
          <View style={[styles.assessmentIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.warning} />
          </View>
          <Text style={styles.assessmentText}>MBI Test</Text>
          <Text style={styles.assessmentSubtext}>Monthly checkup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMotivationalSection = () => {
    const getMotivationalMessage = () => {
      if (currentStreak === 0) {
        return "Ready to start your wellness journey? 🌱";
      } else if (currentStreak < 3) {
        return "You're building great habits! Keep it up! 💪";
      } else if (currentStreak < 7) {
        return "Amazing consistency! You're on fire! 🔥";
      } else {
        return "Incredible dedication! You're a wellness champion! 🏆";
      }
    };

    return (
      <View style={styles.motivationCard}>
        <Text style={styles.motivationMessage}>
          {getMotivationalMessage()}
        </Text>
        {currentStreak > 0 && (
          <View style={styles.streakIndicator}>
            <Ionicons name="flame" size={20} color={colors.accent} />
            <Text style={styles.streakText}>
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      {renderWelcomeSection()}

      {/* Motivational Section */}
      {renderMotivationalSection()}

      {/* Quick Mood Tracker */}
      {renderQuickMoodTracker()}

      {/* Wellness Streak Card */}
      <WellnessStreakCard
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        lastActivityDate={lastActivityDate}
        onStreakPress={() => navigation.navigate('Profile')}
      />

      {/* Wellness Activities */}
      {renderWellnessActivities()}

      {/* Quick Assessments */}
      {renderQuickAssessments()}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  greetingContainer: {
    alignItems: 'flex-start',
  },
  timeGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  motivationMessage: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 6,
  },
  moodCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  moodButtonContainer: {
    width: (width - 80) / 3,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    marginBottom: 6,
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  moodDescription: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  detailedMoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  detailedMoodText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  wellnessCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  historyButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  assessmentGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  assessmentItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  assessmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  assessmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  assessmentSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});