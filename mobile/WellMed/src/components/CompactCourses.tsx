import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import courseService, { Course } from '../api/courses';

interface CompactCoursesProps {
  onViewAllCourses: () => void;
  onStartCourse: (courseId: string) => void;
}

export default function CompactCourses({ onViewAllCourses, onStartCourse }: CompactCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Try to get from cache first if not refreshing
      if (!isRefresh) {
        const cachedCourses = await courseService.getCachedCoursesData();
        if (cachedCourses && cachedCourses.length > 0) {
          const featuredCourses = cachedCourses
            .filter(course => ['core', 'quick-wins'].includes(course.category || ''))
            .slice(0, 4);
          setCourses(featuredCourses);
          setTotalCompleted(cachedCourses.filter(c => c.is_completed).length);
          setLoading(false);
        }
      }

      // Fetch fresh data from API
      const coursesWithProgress = await courseService.getCoursesWithProgress();
      
      // Cache the data
      await courseService.cacheCoursesData(coursesWithProgress);
      
      // Filter for featured courses (core and quick-wins categories, limit to 4)
      const featuredCourses = coursesWithProgress
        .filter(course => ['core', 'quick-wins'].includes(course.category || ''))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .slice(0, 4);

      setCourses(featuredCourses);
      setTotalCompleted(coursesWithProgress.filter(c => c.is_completed).length);

    } catch (error: any) {
      console.error('Error loading featured courses:', error);
      setError(error.message || 'Failed to load courses');
      
      // Try to load from cache as fallback
      if (!isRefresh) {
        const cachedCourses = await courseService.getCachedCoursesData();
        if (cachedCourses) {
          const featuredCourses = cachedCourses
            .filter(course => ['core', 'quick-wins'].includes(course.category || ''))
            .slice(0, 4);
          setCourses(featuredCourses);
          setTotalCompleted(cachedCourses.filter(c => c.is_completed).length);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadFeaturedCourses(true);
  };

  const handleCoursePress = async (course: Course) => {
    try {
      const isCompleted = course.is_completed;
      const progress = course.progress_percentage || 0;

      if (isCompleted) {
        Alert.alert(
          'Course Completed! ✅',
          `You've already completed "${course.title}". Would you like to review it?`,
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Review Course', onPress: () => onStartCourse(course.id) },
          ]
        );
      } else if (progress > 0) {
        Alert.alert(
          'Continue Course',
          `You're ${Math.round(progress)}% through "${course.title}". Continue where you left off?`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Continue', onPress: () => onStartCourse(course.id) },
          ]
        );
      } else {
        // Start the course
        await courseService.startCourse(course.id);
        onStartCourse(course.id);
      }
    } catch (error: any) {
      console.error('Error handling course press:', error);
      Alert.alert('Error', 'Failed to start course. Please try again.');
    }
  };

  const renderCourseCard = (course: Course) => {
    const isCompleted = course.is_completed || false;
    const progress = course.progress_percentage || 0;

    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.7}
      >
        <View style={[styles.courseIcon, { backgroundColor: course.color + '20' }]}>
          <Ionicons name={course.icon as any} size={20} color={course.color} />
        </View>
        
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.courseSubtitle} numberOfLines={1}>
            {course.description}
          </Text>
          <Text style={styles.courseDuration}>
            {course.duration}
          </Text>
        </View>

        <View style={styles.courseStatus}>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
          ) : progress > 0 ? (
            <View style={styles.progressIndicator}>
              <View style={styles.progressRing}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: course.color,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          ) : (
            <View style={styles.startBadge}>
              <Ionicons name="play-outline" size={14} color={colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getMotivationalMessage = () => {
    if (totalCompleted === 0) {
      return "Start your learning journey with evidence-based courses 📚";
    } else if (totalCompleted < 3) {
      return `Great start! ${totalCompleted} course${totalCompleted > 1 ? 's' : ''} completed 🎓`;
    } else if (totalCompleted < 6) {
      return `You're making excellent progress! ${totalCompleted} courses done 🌟`;
    } else {
      return `Amazing dedication! ${totalCompleted} courses completed 🏆`;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="school-outline" size={20} color={colors.thirdary} />
            <Text style={styles.title}>Wellness Courses</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="school-outline" size={20} color={colors.thirdary} />
            <Text style={styles.title}>Wellness Courses</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={onViewAllCourses}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.thirdary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.errorText}>Failed to load courses</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFeaturedCourses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="school-outline" size={20} color={colors.thirdary} />
          <Text style={styles.title}>Wellness Courses</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAllCourses}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.thirdary} />
        </TouchableOpacity>
      </View>

      {/* Motivational Message */}
      <Text style={styles.motivationalMessage}>
        {getMotivationalMessage()}
      </Text>

      {/* Featured Courses */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.coursesScroll}
        contentContainerStyle={styles.coursesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {courses.map(renderCourseCard)}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courses.length}+</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
        <Text style={styles.footerText}>
          Evidence-based training for burnout prevention
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.thirdary + '10',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.thirdary,
    fontWeight: '500',
    marginRight: 4,
  },
  motivationalMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  coursesScroll: {
    marginBottom: 16,
  },
  coursesContainer: {
    paddingHorizontal: 20,
  },
  courseCard: {
    width: 140,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  courseInfo: {
    flex: 1,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 16,
  },
  courseSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 14,
  },
  courseDuration: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  courseStatus: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 4,
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressRing: {
    width: 20,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  startBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.thirdary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.divider,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});