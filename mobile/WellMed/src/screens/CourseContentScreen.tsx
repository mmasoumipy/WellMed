import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import courseService, { Course, CourseModule } from '../api/courses';
import MarkdownText from '../components/MarkdownText';

const { width } = Dimensions.get('window');

export default function CourseContentScreen({ route, navigation }: any) {
  const { course }: { course: Course } = route.params;
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moduleStartTime, setModuleStartTime] = useState<Date>(new Date());

  const currentModule = modules[currentModuleIndex];

  useEffect(() => {
    loadCourseContent();
  }, []);

  useEffect(() => {
    if (modules.length > 0) {
      setModuleStartTime(new Date());
    }
  }, [currentModuleIndex]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      
      // Get course with modules
      const courseData = await courseService.getCourse(course.id);
      if (courseData.modules) {
        const sortedModules = courseData.modules.sort((a, b) => a.sort_order - b.sort_order);
        setModules(sortedModules);
      }

      // Get user progress for this course
      try {
        const progressData = await courseService.getCourseProgress(course.id);
        setCourseProgress(progressData.progress_percentage);
        
        // Set completed modules from backend
        if (progressData.module_progresses) {
          const completed = new Set(
            progressData.module_progresses
              .filter(mp => mp.is_completed)
              .map(mp => mp.module_id)
          );
          setCompletedModules(completed);
        }
      } catch (progressError) {
        console.log('No existing progress found, starting fresh');
        // Start the course if no progress exists
        await courseService.startCourse(course.id);
      }

    } catch (error: any) {
      console.error('Error loading course content:', error);
      Alert.alert(
        'Error Loading Course',
        'Failed to load course content. Please try again.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: () => loadCourseContent() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const completeModule = async () => {
    if (!currentModule) return;

    try {
      // Calculate time spent on this module
      const timeSpent = Math.floor((new Date().getTime() - moduleStartTime.getTime()) / 1000);
      
      // Update time spent in backend
      if (timeSpent > 0) {
        await courseService.updateModuleTime(course.id, currentModule.id, timeSpent);
      }

      // Mark module as completed in backend
      const result = await courseService.completeModule(course.id, currentModule.id);
      
      // Update local state
      const newCompleted = new Set(completedModules);
      newCompleted.add(currentModule.id);
      setCompletedModules(newCompleted);
      
      // Update progress
      const newProgress = (newCompleted.size / modules.length) * 100;
      setCourseProgress(newProgress);

      if (currentModuleIndex < modules.length - 1) {
        Alert.alert(
          'Module Complete! 🎉',
          'Great job! Ready for the next module?',
          [
            { text: 'Take a Break', style: 'cancel' },
            { text: 'Continue', onPress: () => setCurrentModuleIndex(currentModuleIndex + 1) },
          ]
        );
      } else {
        // Course completed
        Alert.alert(
          'Course Complete! 🎓',
          `Congratulations! You've completed "${course.title}". The strategies you've learned can make a real difference in preventing burnout.`,
          [
            { text: 'Back to Courses', onPress: () => navigation.goBack() },
            { text: 'Review Course', style: 'cancel' },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error completing module:', error);
      Alert.alert('Error', 'Failed to save your progress. Please try again.');
    }
  };

  const navigateToModule = (index: number) => {
    // Update time spent on current module before switching
    if (currentModule) {
      const timeSpent = Math.floor((new Date().getTime() - moduleStartTime.getTime()) / 1000);
      if (timeSpent > 5) { // Only update if spent more than 5 seconds
        courseService.updateModuleTime(course.id, currentModule.id, timeSpent)
          .catch(error => console.error('Error updating module time:', error));
      }
    }
    
    setCurrentModuleIndex(index);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'interactive': return 'extension-puzzle-outline';
      case 'exercise': return 'fitness-outline';
      default: return 'document-text-outline';
    }
  };

  const renderModuleNavigation = () => (
    <View style={styles.moduleNavigation}>
      <Text style={styles.navigationTitle}>Course Modules</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modulesList}>
        {modules.map((module, index) => {
          const isCompleted = completedModules.has(module.id);
          const isCurrent = index === currentModuleIndex;
          
          return (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleNavItem,
                isCurrent && styles.currentModuleNavItem,
                isCompleted && styles.completedModuleNavItem,
              ]}
              onPress={() => navigateToModule(index)}
            >
              <View style={styles.moduleNavIcon}>
                {isCompleted ? (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                ) : (
                  <Text style={styles.moduleNavNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.moduleNavTitle,
                isCurrent && styles.currentModuleNavTitle,
              ]} numberOfLines={2}>
                {module.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderKeyTakeaways = () => {
    if (!currentModule?.key_takeaways) return null;

    return (
      <View style={styles.takeawaysSection}>
        <Text style={styles.takeawaysTitle}>Key Takeaways</Text>
        {currentModule.key_takeaways.map((takeaway, index) => (
          <View key={index} style={styles.takeawayItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.takeawayText}>{takeaway}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActionItems = () => {
    if (!currentModule?.action_items) return null;

    return (
      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Action Items</Text>
        {currentModule.action_items.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionItem}>
            <Ionicons name="square-outline" size={16} color={colors.primary} />
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading course content...</Text>
      </View>
    );
  }

  if (!currentModule) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.errorTitle}>Course Content Not Available</Text>
        <Text style={styles.errorText}>
          This course content is currently being developed by our team.
        </Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.progressText}>
            Module {currentModuleIndex + 1} of {modules.length} • {Math.round(courseProgress)}% complete
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${courseProgress}%`, backgroundColor: course.color }]} />
        </View>
      </View>

      {/* Module Navigation */}
      {renderModuleNavigation()}

      {/* Module Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleTypeContainer}>
            <Ionicons name={getModuleIcon(currentModule.module_type)} size={20} color={course.color} />
            <Text style={[styles.moduleType, { color: course.color }]}>
              {currentModule.module_type.charAt(0).toUpperCase() + currentModule.module_type.slice(1)}
            </Text>
          </View>
          <Text style={styles.moduleDuration}>{currentModule.duration}</Text>
        </View>


        <Text style={styles.moduleTitle}>{currentModule.title}</Text>

        <View style={styles.moduleContent}>
          <MarkdownText style={styles.contentText}>
            {currentModule.content}
          </MarkdownText>
        </View>

        {renderKeyTakeaways()}
        {renderActionItems()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.previousButton]}
          onPress={() => setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1))}
          disabled={currentModuleIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentModuleIndex === 0 ? colors.textSecondary : colors.primary} 
          />
          <Text style={[
            styles.controlButtonText,
            currentModuleIndex === 0 && styles.disabledButtonText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton, { backgroundColor: course.color }]}
          onPress={completeModule}
        >
          <Text style={styles.completeButtonText}>
            {completedModules.has(currentModule.id) 
              ? 'Completed' 
              : currentModuleIndex === modules.length - 1 
                ? 'Complete Course' 
                : 'Complete Module'
            }
          </Text>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.nextButton]}
          onPress={() => setCurrentModuleIndex(Math.min(modules.length - 1, currentModuleIndex + 1))}
          disabled={currentModuleIndex === modules.length - 1}
        >
          <Text style={[
            styles.controlButtonText,
            currentModuleIndex === modules.length - 1 && styles.disabledButtonText
          ]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentModuleIndex === modules.length - 1 ? colors.textSecondary : colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.backgroundPrimary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleNavigation: {
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  navigationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modulesList: {
    paddingLeft: 20,
  },
  moduleNavItem: {
    width: 120,
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentModuleNavItem: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedModuleNavItem: {
    backgroundColor: colors.success + '20',
  },
  moduleNavIcon: {
    marginBottom: 8,
  },
  moduleNavNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  moduleNavTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  currentModuleNavTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  moduleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  moduleDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 30,
  },
  moduleContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  takeawaysSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  takeawaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  takeawayText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  previousButton: {
    backgroundColor: colors.cardBackground,
  },
  nextButton: {
    backgroundColor: colors.cardBackground,
  },
  completeButton: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});