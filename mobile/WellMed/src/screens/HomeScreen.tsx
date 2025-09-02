import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform,
  Vibration,
  RefreshControl
} from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WellnessStreakCard from '../components/WellnessStreakCard';
import CompactMoodTracker from '../components/MoodSelector';
import CompactWellnessActivities from '../components/WellnessActivities';
import CompactAssessments from '../components/CompactAssessments';
import CompactCourses from '../components/CompactCourses';
import courseService from '../api/courses';
import api from '../api/api';

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | undefined>(undefined);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
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

  const handleMoodSelect = async (mood: any) => {
    try {
      Vibration.vibrate(50); // Light haptic feedback
      
      const userId = await AsyncStorage.getItem('userId');
      const response = await api.post('/moods/', {
        user_id: userId,
        mood: mood.value,
        reason: '',
        timestamp: new Date().toISOString(),
      });

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
      Alert.alert('Error', 'Failed to save mood. Please try again.');
    }
  };

  const handleStartCourse = async (courseId: string) => {
    try {
      // Get the course details from backend
      const course = await courseService.getCourse(courseId);
      
      if (course) {
        // Start the course and navigate
        await courseService.startCourse(courseId);
        navigation.navigate('CourseContent', { course });
      } else {
        Alert.alert('Course Not Found', 'This course is currently unavailable.');
      }
    } catch (error: any) {
      console.error('Error starting course:', error);
      
      // Fallback to show error or navigate anyway if course exists in hardcoded data
      const fallbackCourseMap: Record<string, any> = {
        'burnout-basics': {
          id: 'burnout-basics',
          title: 'What is Burnout?',
          description: 'Understanding the signs, symptoms, and science behind physician burnout',
          duration: '15 min',
          difficulty: 'Beginner',
          icon: 'information-circle-outline',
          color: colors.primary,
          modules_count: 4,
        },
        'micro-resilience': {
          id: 'micro-resilience',
          title: 'Micro-Resilience: Two-Minute Stress Reducers',
          description: 'Quick, evidence-based techniques you can use anywhere',
          duration: '12 min',
          difficulty: 'Beginner',
          icon: 'flash-outline',
          color: colors.accent,
          modules_count: 6,
        },
        'values-based-prevention': {
          id: 'values-based-prevention',
          title: 'Know Your Why: Values-Based Burnout Prevention',
          description: 'Reconnect with your core values and purpose in medicine',
          duration: '20 min',
          difficulty: 'Beginner',
          icon: 'heart-outline',
          color: colors.success,
          modules_count: 5,
        },
        'quick-breathing': {
          id: 'quick-breathing',
          title: '5-Minute Energy Reset',
          description: 'Quick breathing exercises for instant stress relief',
          duration: '5 min',
          difficulty: 'Beginner',
          icon: 'leaf-outline',
          color: colors.success,
          modules_count: 1,
        },
      };

      const fallbackCourse = fallbackCourseMap[courseId];
      if (fallbackCourse) {
        navigation.navigate('CourseContent', { course: fallbackCourse });
      } else {
        Alert.alert('Error', 'Failed to start course. Please try again later.');
      }
    }
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.greetingContainer}>
        <Text style={styles.timeGreeting}>{timeOfDay}</Text>
        <Text style={styles.userName}>
          {userName ? `Dr. ${userName.split(' ')[0]}` : 'Doctor'} 👋
        </Text>
        <Text style={styles.subtitle}>How's your wellbeing today?</Text>
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
            <Text style={styles.streakText}>
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak! 🔥
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Define wellness activities
  const wellnessActivities = [
    {
      id: 'breathing',
      title: 'Box Breathing',
      subtitle: '4-4-4-4 technique',
      icon: 'leaf',
      color: colors.primary,
      onPress: () => navigation.navigate('BoxBreathing'),
    },
    {
      id: 'stretching',
      title: 'Stretching',
      subtitle: '5-minute routine',
      icon: 'body',
      color: colors.secondary,
      onPress: () => navigation.navigate('Stretch'),
    },
  ];

  // Define assessments
  const assessments = [
    {
      id: 'micro',
      title: 'Quick Check',
      subtitle: '2 min assessment',
      icon: 'speedometer-outline',
      color: colors.secondary,
      onPress: () => navigation.navigate('Profile', { screen: 'MicroAssessment' }),
    },
    {
      id: 'mbi',
      title: 'MBI Test',
      subtitle: 'Monthly checkup',
      icon: 'document-text-outline',
      color: colors.warning,
      onPress: () => navigation.navigate('Profile', { screen: 'MBIAssessment' }),
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      {renderWelcomeSection()}

      {/* Motivational Section */}
      {renderMotivationalSection()}

      {/* Compact Mood Tracker */}
      <CompactMoodTracker
        onMoodSelect={handleMoodSelect}
        onViewHistory={() => navigation.navigate('MoodHistory')}
      />

      {/* Wellness Streak Card */}
      <WellnessStreakCard
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        lastActivityDate={lastActivityDate}
        onStreakPress={() => navigation.navigate('Profile')}
      />

      {/* Compact Courses - Now connected to backend */}
      <CompactCourses
        onViewAllCourses={() => navigation.navigate('Courses')}
        onStartCourse={handleStartCourse}
      />

      {/* Compact Wellness Activities */}
      <CompactWellnessActivities
        activities={wellnessActivities}
        onViewHistory={() => navigation.navigate('WellnessHistory')}
      />

      {/* Compact Assessments */}
      <CompactAssessments assessments={assessments} />

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
    padding: 16,
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
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});