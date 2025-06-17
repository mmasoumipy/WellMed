import React, { useEffect, useState } from 'react';
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
import api from '../api/api';

interface WellnessActivity {
  id: string;
  activity_type: string;
  duration_seconds: number;
  cycles_completed?: number;
  poses_completed?: number;
  completed_at: string;
  session_data?: string;
}

interface WellnessStats {
  total_sessions: number;
  total_duration_minutes: number;
  box_breathing_sessions: number;
  stretching_sessions: number;
  avg_session_duration: number;
  longest_session_duration: number;
  current_streak: number;
  activities_this_week: number;
}

export default function WellnessHistoryScreen({ navigation }: any) {
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [stats, setStats] = useState<WellnessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Load activities and stats in parallel
      const [activitiesResponse, statsResponse] = await Promise.all([
        api.get(`/wellness/user/${userId}`),
        api.get(`/wellness/user/${userId}/stats`)
      ]);

      setActivities(activitiesResponse.data);
      setStats(statsResponse.data);
    } catch (error: any) {
      console.error('Error loading wellness data:', error);
      Alert.alert(
        'Error', 
        'Could not load wellness history. Please check your connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWellnessData();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityIcon = (activityType: string): string => {
    switch (activityType) {
      case 'box_breathing':
        return 'leaf-outline';
      case 'stretching':
        return 'body-outline';
      default:
        return 'fitness-outline';
    }
  };

  const getActivityColor = (activityType: string): string => {
    switch (activityType) {
      case 'box_breathing':
        return colors.primary;
      case 'stretching':
        return colors.secondary;
      default:
        return colors.accent;
    }
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_sessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_duration_minutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.current_streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activities_this_week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        <View style={styles.detailedStats}>
          <View style={styles.detailRow}>
            <Ionicons name="leaf-outline" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              Box Breathing: {stats.box_breathing_sessions} sessions
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="body-outline" size={20} color={colors.secondary} />
            <Text style={styles.detailText}>
              Stretching: {stats.stretching_sessions} sessions
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <Text style={styles.detailText}>
              Avg Session: {Math.round(stats.avg_session_duration / 60)}m {Math.round(stats.avg_session_duration % 60)}s
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActivityItem = (activity: WellnessActivity) => {
    const activityColor = getActivityColor(activity.activity_type);
    const activityIcon = getActivityIcon(activity.activity_type);
    
    let sessionDetails = '';
    if (activity.activity_type === 'box_breathing' && activity.cycles_completed) {
      sessionDetails = `${activity.cycles_completed} cycles`;
    } else if (activity.activity_type === 'stretching' && activity.poses_completed) {
      sessionDetails = `${activity.poses_completed} poses`;
    }

    return (
      <TouchableOpacity
        key={activity.id}
        style={styles.activityItem}
        onPress={() => {
          // Show detailed session info
          let details = `Duration: ${formatDuration(activity.duration_seconds)}\n`;
          details += `Date: ${new Date(activity.completed_at).toLocaleString()}\n`;
          
          if (activity.session_data) {
            try {
              const sessionData = JSON.parse(activity.session_data);
              if (activity.activity_type === 'box_breathing') {
                details += `Cycles: ${sessionData.cycles_completed}\n`;
                details += `Avg cycle time: ${Math.round(sessionData.average_cycle_time)}s`;
              } else if (activity.activity_type === 'stretching') {
                details += `Poses: ${sessionData.poses_list?.join(', ') || 'N/A'}`;
              }
            } catch (e) {
              console.error('Error parsing session data:', e);
            }
          }
          
          Alert.alert(
            activity.activity_type === 'box_breathing' ? 'Box Breathing Session' : 'Stretching Session',
            details
          );
        }}
      >
        <View style={styles.activityLeft}>
          <View style={[styles.activityIcon, { backgroundColor: activityColor }]}>
            <Ionicons name={activityIcon} size={24} color="white" />
          </View>
          
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>
              {activity.activity_type === 'box_breathing' ? 'Box Breathing' : 'Stretching'}
            </Text>
            <Text style={styles.activityDetails}>
              {formatDuration(activity.duration_seconds)}
              {sessionDetails && ` • ${sessionDetails}`}
            </Text>
            <Text style={styles.activityDate}>
              {formatDate(activity.completed_at)}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your wellness history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Section */}
      {renderStatsCard()}

      {/* Activities List */}
      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No activities yet</Text>
            <Text style={styles.emptyStateText}>
              Start your wellness journey with box breathing or stretching exercises!
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.startButtonText}>Start an Activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {activities.map(renderActivityItem)}
          </View>
        )}
      </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailedStats: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  activitiesContainer: {
    margin: 20,
    marginTop: 0,
  },
  activitiesList: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});