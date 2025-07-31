import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { courseAPI, Course, CourseCategory, CourseStats } from '../api/courses';

export default function CoursesScreen({ navigation }: any) {
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCoursesData();
  }, []);

  const loadCoursesData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Load courses by category and stats in parallel
      const [categoriesData, statsData] = await Promise.all([
        courseAPI.getCoursesByCategory(userId),
        courseAPI.getUserCourseStats(userId)
      ]);

      setCourseCategories(categoriesData);
      setCourseStats(statsData);
    } catch (error: any) {
      console.error('Error loading courses data:', error);
      Alert.alert(
        'Error', 
        'Could not load courses. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCoursesData();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return colors.success;
      case 'Intermediate': return colors.warning;
      case 'Advanced': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const startCourse = async (course: Course) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Start the course if not already started
      if (!course.progress_percentage || course.progress_percentage === 0) {
        await courseAPI.startCourse(userId, course.id);
      }

      // Navigate to course content
      navigation.navigate('CourseContent', { course });
    } catch (error) {
      console.error('Error starting course:', error);
      // Still navigate even if API call fails
      navigation.navigate('CourseContent', { course });
    }
  };

  const renderProgressSummary = () => {
    if (!courseStats) return null;

    return (
      <View style={styles.progressSummary}>
        <View style={styles.summaryHeader}>
          <Ionicons name="school-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryTitle}>Your Learning Progress</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courseStats.completed_courses}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courseStats.total_courses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round(courseStats.overall_progress_percentage)}%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>
        
        <View style={styles.overallProgressBar}>
          <View style={[
            styles.overallProgressFill, 
            { width: `${courseStats.overall_progress_percentage}%` }
          ]} />
        </View>
      </View>
    );
  };

  const renderCourseCard = (course: Course) => {
    const isCompleted = course.is_completed;
    const progress = course.progress_percentage || 0;
    
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
              {course.duration} • {course.modules_count} module{course.modules_count > 1 ? 's' : ''}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
      {courseCategories.length > 0 ? (
        courseCategories.map(renderCategorySection)
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No courses available</Text>
          <Text style={styles.emptyStateText}>
            Check your connection and try refreshing the page.
          </Text>
        </View>
      )}

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

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});