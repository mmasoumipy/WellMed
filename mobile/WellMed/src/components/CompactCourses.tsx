import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface FeaturedCourse {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  duration: string;
  progress?: number;
  isCompleted?: boolean;
}

interface CompactCoursesProps {
  onViewAllCourses: () => void;
  onStartCourse: (courseId: string) => void;
}

const featuredCourses: FeaturedCourse[] = [
  {
    id: 'burnout-basics',
    title: 'What is Burnout?',
    subtitle: 'Understanding the basics',
    icon: 'information-circle-outline',
    color: colors.primary,
    duration: '15 min',
  },
  {
    id: 'micro-resilience',
    title: 'Micro-Resilience',
    subtitle: '2-minute stress reducers',
    icon: 'flash-outline',
    color: colors.accent,
    duration: '12 min',
  },
  {
    id: 'values-based-prevention',
    title: 'Know Your Why',
    subtitle: 'Values-based prevention',
    icon: 'heart-outline',
    color: colors.success,
    duration: '20 min',
  },
  {
    id: 'quick-breathing',
    title: '5-Minute Energy Reset',
    subtitle: 'Quick wins mini-course',
    icon: 'leaf-outline',
    color: colors.secondary,
    duration: '5 min',
  },
];

export default function CompactCourses({ onViewAllCourses, onStartCourse }: CompactCoursesProps) {
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    loadCourseProgress();
  }, []);

  const loadCourseProgress = async () => {
    try {
      const [progressData, completedData] = await Promise.all([
        AsyncStorage.getItem('courseProgress'),
        AsyncStorage.getItem('completedCourses'),
      ]);

      if (progressData) {
        setCourseProgress(JSON.parse(progressData));
      }

      if (completedData) {
        const completedArray: string[] = JSON.parse(completedData);
        const completed = new Set(completedArray);
        setCompletedCourses(completed);
        setTotalCompleted(completed.size);
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    }
  };

  const handleCoursePress = (course: FeaturedCourse) => {
    const isCompleted = completedCourses.has(course.id);
    const progress = courseProgress[course.id] || 0;

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
      onStartCourse(course.id);
    }
  };

  const renderCourseCard = (course: FeaturedCourse) => {
    const isCompleted = completedCourses.has(course.id);
    const progress = courseProgress[course.id] || 0;

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
            {course.subtitle}
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
      >
        {featuredCourses.map(renderCourseCard)}
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
            <Text style={styles.statNumber}>20+</Text>
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