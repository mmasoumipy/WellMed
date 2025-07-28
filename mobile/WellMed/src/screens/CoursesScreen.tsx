import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
  modules: number;
  completed?: boolean;
  progress?: number;
}

interface CourseCategory {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

const coreModules: Course[] = [
  {
    id: 'burnout-basics',
    title: 'What is Burnout?',
    description: 'Understanding the signs, symptoms, and science behind physician burnout',
    duration: '15 min',
    difficulty: 'Beginner',
    icon: 'information-circle-outline',
    color: colors.primary,
    modules: 4,
  },
  {
    id: 'values-based-prevention',
    title: 'Know Your Why: Values-Based Burnout Prevention',
    description: 'Reconnect with your core values and purpose in medicine',
    duration: '20 min',
    difficulty: 'Beginner',
    icon: 'heart-outline',
    color: colors.success,
    modules: 5,
  },
  {
    id: 'stress-signals',
    title: 'Stress Signals: Recognizing Your Personal Warning Signs',
    description: 'Learn to identify early warning signs before burnout takes hold',
    duration: '18 min',
    difficulty: 'Intermediate',
    icon: 'warning-outline',
    color: colors.warning,
    modules: 4,
  },
  {
    id: 'micro-resilience',
    title: 'Micro-Resilience: Two-Minute Stress Reducers',
    description: 'Quick, evidence-based techniques you can use anywhere',
    duration: '12 min',
    difficulty: 'Beginner',
    icon: 'flash-outline',
    color: colors.accent,
    modules: 6,
  },
  {
    id: 'sleep-hygiene',
    title: 'Sleep Hygiene for Shift Workers',
    description: 'Optimize your sleep despite irregular schedules',
    duration: '25 min',
    difficulty: 'Intermediate',
    icon: 'moon-outline',
    color: colors.secondary,
    modules: 5,
  },
  {
    id: 'boundaries',
    title: 'Boundaries: The Art of Compassionate Limits',
    description: 'Set healthy boundaries while maintaining excellent patient care',
    duration: '22 min',
    difficulty: 'Intermediate',
    icon: 'shield-outline',
    color: colors.error,
    modules: 4,
  },
  {
    id: 'positive-reframing',
    title: 'Positive Reframing: Cognitive Strategies for Stressful Situations',
    description: 'Transform negative thought patterns into resilient mindsets',
    duration: '30 min',
    difficulty: 'Advanced',
    icon: 'refresh-outline',
    color: colors.thirdary,
    modules: 6,
  },
  {
    id: 'delegation',
    title: 'Effective Delegation: Working Smarter, Not Harder',
    description: 'Master the art of delegation without compromising quality',
    duration: '20 min',
    difficulty: 'Intermediate',
    icon: 'people-outline',
    color: colors.primary,
    modules: 4,
  },
  {
    id: 'emotion-regulation',
    title: 'Emotion Regulation for High-Stress Environments',
    description: 'Manage intense emotions in critical care situations',
    duration: '28 min',
    difficulty: 'Advanced',
    icon: 'pulse-outline',
    color: colors.error,
    modules: 5,
  },
];

const quickWinsCourses: Course[] = [
  {
    id: 'quick-breathing',
    title: '5-Minute Energy Reset',
    description: 'Quick breathing exercises for instant stress relief',
    duration: '5 min',
    difficulty: 'Beginner',
    icon: 'leaf-outline',
    color: colors.success,
    modules: 1,
  },
  {
    id: 'quick-mindfulness',
    title: 'Mindful Transitions',
    description: 'Brief mindfulness practices between patients',
    duration: '3 min',
    difficulty: 'Beginner',
    icon: 'eye-outline',
    color: colors.secondary,
    modules: 1,
  },
  {
    id: 'quick-posture',
    title: 'Posture Power-Up',
    description: 'Combat fatigue with quick posture corrections',
    duration: '4 min',
    difficulty: 'Beginner',
    icon: 'body-outline',
    color: colors.warning,
    modules: 1,
  },
  {
    id: 'quick-gratitude',
    title: 'Gratitude Boost',
    description: 'Instant mood lifter for difficult days',
    duration: '2 min',
    difficulty: 'Beginner',
    icon: 'sunny-outline',
    color: colors.accent,
    modules: 1,
  },
];

const specialtyCourses: Course[] = [
  {
    id: 'icu-specific',
    title: 'ICU Resilience Strategies',
    description: 'Specialized approaches for intensive care professionals',
    duration: '35 min',
    difficulty: 'Advanced',
    icon: 'medical-outline',
    color: colors.error,
    modules: 7,
  },
  {
    id: 'emergency-medicine',
    title: 'Emergency Medicine Wellness',
    description: 'Managing the unique stressors of emergency medicine',
    duration: '32 min',
    difficulty: 'Advanced',
    icon: 'thunderstorm-outline',
    color: colors.warning,
    modules: 6,
  },
  {
    id: 'nursing-wellness',
    title: 'Nursing Self-Care Essentials',
    description: 'Tailored wellness strategies for nursing professionals',
    duration: '28 min',
    difficulty: 'Intermediate',
    icon: 'heart-circle-outline',
    color: colors.primary,
    modules: 5,
  },
  {
    id: 'surgery-wellness',
    title: 'Surgical Team Wellness',
    description: 'Stress management for high-pressure surgical environments',
    duration: '30 min',
    difficulty: 'Advanced',
    icon: 'cut-outline',
    color: colors.secondary,
    modules: 6,
  },
];

const courseCategories: CourseCategory[] = [
  {
    id: 'core',
    title: 'Core Burnout Prevention',
    description: 'Essential modules for every healthcare professional',
    courses: coreModules,
  },
  {
    id: 'quick-wins',
    title: 'Quick Wins Mini-Courses',
    description: 'Immediate strategies for breaks or between shifts',
    courses: quickWinsCourses,
  },
  {
    id: 'specialty',
    title: 'Specialty-Specific Courses',
    description: 'Tailored content for different healthcare roles',
    courses: specialtyCourses,
  },
];

export default function CoursesScreen({ navigation }: any) {
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const completed = await AsyncStorage.getItem('completedCourses');
      const progress = await AsyncStorage.getItem('courseProgress');
      
      if (completed) {
        setCompletedCourses(new Set(JSON.parse(completed)));
      }
      if (progress) {
        setCourseProgress(JSON.parse(progress));
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return colors.success;
      case 'Intermediate': return colors.warning;
      case 'Advanced': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const startCourse = (course: Course) => {
    Alert.alert(
      `Start ${course.title}?`,
      `This course takes approximately ${course.duration} and contains ${course.modules} module${course.modules > 1 ? 's' : ''}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Course',
          onPress: () => {
            navigation.navigate('CourseContent', { course });
          },
        },
      ]
    );
  };

  const renderCourseCard = (course: Course) => {
    const isCompleted = completedCourses.has(course.id);
    const progress = courseProgress[course.id] || 0;
    
    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => startCourse(course)}
        activeOpacity={0.8}
      >
        <View style={styles.courseHeader}>
          <View style={[styles.courseIcon, { backgroundColor: course.color + '20' }]}>
            <Ionicons name={course.icon as any} size={24} color={course.color} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={styles.courseDuration}>
              {course.duration} • {course.modules} module{course.modules > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.courseStatus}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
              <Text style={styles.difficultyText}>{course.difficulty}</Text>
            </View>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.completedIcon} />
            )}
          </View>
        </View>
        
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        
        {progress > 0 && !isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: course.color }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
          </View>
        )}
        
        <View style={styles.courseFooter}>
          <Text style={styles.startText}>
            {isCompleted ? 'Review Course' : progress > 0 ? 'Continue' : 'Start Course'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (category: CourseCategory) => (
    <View key={category.id} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <View style={styles.coursesGrid}>
        {category.courses.map(renderCourseCard)}
      </View>
    </View>
  );

  const renderProgressSummary = () => {
    const totalCourses = [...coreModules, ...quickWinsCourses, ...specialtyCourses].length;
    const completedCount = completedCourses.size;
    const overallProgress = totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;

    return (
      <View style={styles.progressSummary}>
        <View style={styles.summaryHeader}>
          <Ionicons name="school-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryTitle}>Your Learning Progress</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCourses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round(overallProgress)}%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>
        
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: `${overallProgress}%` }]} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Wellness Courses</Text>
          <Text style={styles.headerSubtitle}>Evidence-based training for burnout prevention</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => Alert.alert('Search', 'Course search functionality coming soon!')}
        >
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Summary */}
      {renderProgressSummary()}

      {/* Course Categories */}
      {courseCategories.map(renderCategorySection)}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressSummary: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  overallProgressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  coursesGrid: {
    paddingHorizontal: 20,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  courseStatus: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  completedIcon: {
    marginTop: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});