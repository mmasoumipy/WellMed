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
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import courseService, { Course, CourseCategory, CourseStats } from '../api/courses';

const { width } = Dimensions.get('window');

export default function CoursesScreen({ navigation }: any) {
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoursesData();
  }, []);

  // Add navigation listener to refresh data when returning from CourseContent
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only refresh if we're coming back from another screen (not initial load)
      if (!loading) {
        console.log('CoursesScreen focused - refreshing progress data');
        loadCoursesData(true, false); // Refresh data silently
      }
    });

    return unsubscribe;
  }, [navigation, loading]);

  const loadCoursesData = async (isRefresh = false, showLoading = true) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Clear any cached data to ensure fresh progress
      if (isRefresh) {
        await courseService.clearCache();
      }

      // Load courses by category and stats in parallel
      const [categoriesData, statsData] = await Promise.all([
        courseService.getCoursesByCategory(),
        courseService.getUserCourseStats().catch(err => {
          console.warn('Failed to load course stats:', err);
          return null;
        })
      ]);

      setCourseCategories(categoriesData);
      setStats(statsData);

      console.log('CoursesScreen data refreshed:', {
        categories: categoriesData.length,
        totalCourses: statsData?.total_courses,
        completed: statsData?.completed_courses
      });

    } catch (error: any) {
      console.error('Error loading courses data:', error);
      setError(error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadCoursesData(true);
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
      const isCompleted = course.is_completed;
      const progress = course.progress_percentage || 0;

      if (isCompleted) {
        Alert.alert(
          'Course Completed! ✅',
          `You've already completed "${course.title}". Would you like to review it?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Review Course',
              onPress: () => {
                navigation.navigate('CourseContent', { 
                  course,
                  // Pass callback to refresh this screen when returning
                  onProgressUpdate: () => {
                    console.log('Progress update callback triggered');
                    loadCoursesData(true, false);
                  }
                });
              },
            },
          ]
        );
      } else if (progress > 0) {
        Alert.alert(
          'Continue Course',
          `You're ${Math.round(progress)}% through "${course.title}". Continue where you left off?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('CourseContent', { 
                  course,
                  onProgressUpdate: () => {
                    console.log('Progress update callback triggered');
                    loadCoursesData(true, false);
                  }
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          `Start ${course.title}?`,
          `This course takes approximately ${course.duration} and contains ${course.modules_count} module${course.modules_count > 1 ? 's' : ''}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Course',
              onPress: async () => {
                try {
                  await courseService.startCourse(course.id);
                  navigation.navigate('CourseContent', { 
                    course,
                    onProgressUpdate: () => {
                      console.log('Progress update callback triggered');
                      loadCoursesData(true, false);
                    }
                  });
                } catch (error: any) {
                  Alert.alert('Error', 'Failed to start course. Please try again.');
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error starting course:', error);
      Alert.alert('Error', 'Failed to access course. Please try again.');
    }
  };

  const renderCourseCard = (course: Course) => {
    const isCompleted = course.is_completed || false;
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

  const renderProgressSummary = () => {
    if (!stats) return null;

    return (
      <View style={styles.progressSummary}>
        <View style={styles.summaryHeader}>
          <Ionicons name="school-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryTitle}>Your Learning Progress</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed_courses}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_courses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round(stats.overall_progress_percentage)}%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>
        
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: `${stats.overall_progress_percentage}%` }]} />
        </View>

        {stats.favorite_category && (
          <Text style={styles.favoriteCategory}>
            Favorite category: {stats.favorite_category}
          </Text>
        )}
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="wifi-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.errorTitle}>Failed to Load Courses</Text>
      <Text style={styles.errorText}>
        Please check your internet connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadCoursesData()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
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

  if (error && courseCategories.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Wellness Courses</Text>
            <Text style={styles.headerSubtitle}>Evidence-based training for burnout prevention</Text>
          </View>
        </View>
        {renderError()}
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
      {courseCategories.map(renderCategorySection)}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Styles remain the same...
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  favoriteCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
