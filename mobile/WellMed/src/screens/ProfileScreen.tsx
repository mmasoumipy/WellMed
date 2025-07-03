import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { calculateBurnoutRisk } from '../utils/burnoutRisk';
import api from '../api/api';

interface HistoryData {
  date: string;
  mood?: boolean;
  microAssessment?: boolean;
  mbiAssessment?: boolean;
  activities?: {
    boxBreathing?: number;
    stretching?: number;
  };
}

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMoodEntries: number;
  totalMicroAssessments: number;
  totalMBIAssessments: number;
  lastActivityDate?: string;
}

const moodScale: Record<string, number> = {
  Excellent: 6,
  Good: 5,
  Okay: 4,
  Stressed: 3,
  Tired: 2,
  Anxious: 1,
};

export default function ProfileScreen({ navigation }: any) {
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<{ 
    combinedScore: string; 
    riskLevel: string;
    trend?: 'improving' | 'worsening' | 'stable';
  } | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMoodEntries: 0,
    totalMicroAssessments: 0,
    totalMBIAssessments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedName = await AsyncStorage.getItem('userName');
      setEmail(storedEmail);
      setUserName(storedName);

      await Promise.all([
        loadBurnoutRisk(),
        loadHistoryData(),
        loadUserStats(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBurnoutRisk = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Get latest MBI assessments to calculate trend
      const mbiResponse = await api.get(`/mbi/user/${userId}`);
      const mbiAssessments = mbiResponse.data;

      if (mbiAssessments.length === 0) {
        setBurnoutRisk({
          combinedScore: '0.0',
          riskLevel: 'No Data',
          trend: 'stable'
        });
        return;
      }

      const latest = mbiAssessments[0];
      const previous = mbiAssessments[1];

      // Get recent mood data for better accuracy
      let recentMoodAverage = 4; // Default
      try {
        const moodResponse = await api.get(`/moods/user/${userId}`);
        const recentMoods = moodResponse.data.slice(0, 7); // Last 7 entries
        if (recentMoods.length > 0) {
          const moodSum = recentMoods.reduce((sum: number, mood: any) => 
            sum + (moodScale[mood.mood] || 4), 0);
          recentMoodAverage = moodSum / recentMoods.length;
        }
      } catch (error) {
        console.log('Could not load mood data for burnout calculation');
      }

      // Get recent micro assessment data
      let recentMicroAssessment = { fatigue: 3, stress: 3, satisfaction: 3, sleep: 3 };
      try {
        const microResponse = await api.get(`/micro/user/${userId}`);
        if (microResponse.data.length > 0) {
          const latestMicro = microResponse.data[0];
          recentMicroAssessment = {
            fatigue: latestMicro.fatigue_level,
            stress: latestMicro.stress_level,
            satisfaction: latestMicro.work_satisfaction,
            sleep: latestMicro.sleep_quality,
          };
        }
      } catch (error) {
        console.log('Could not load micro assessment data for burnout calculation');
      }

      // Calculate current burnout risk
      const currentRisk = calculateBurnoutRisk({
        moodAverage: recentMoodAverage,
        microAssessment: recentMicroAssessment,
        mbiAssessment: {
          EE: latest.emotional_exhaustion,
          DP: latest.depersonalization,
          PA: latest.personal_accomplishment,
        },
      });

      // Calculate trend if we have previous data
      let trend: 'improving' | 'worsening' | 'stable' = 'stable';
      if (previous) {
        const previousRisk = calculateBurnoutRisk({
          moodAverage: recentMoodAverage,
          microAssessment: recentMicroAssessment,
          mbiAssessment: {
            EE: previous.emotional_exhaustion,
            DP: previous.depersonalization,
            PA: previous.personal_accomplishment,
          },
        });

        const currentScore = parseFloat(currentRisk.combinedScore);
        const previousScore = parseFloat(previousRisk.combinedScore);
        
        if (currentScore < previousScore - 0.5) {
          trend = 'improving';
        } else if (currentScore > previousScore + 0.5) {
          trend = 'worsening';
        }
      }

      setBurnoutRisk({ 
        combinedScore: currentRisk.combinedScore,
        riskLevel: currentRisk.riskLevel,
        trend 
      });
    } catch (error) {
      console.error('Error loading burnout risk:', error);
      setBurnoutRisk({
        combinedScore: '0.0',
        riskLevel: 'Error',
        trend: 'stable'
      });
    }
  };

  const loadHistoryData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Generate last 30 days
      const last30Days: HistoryData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        last30Days.push({
          date: dateString,
          mood: false,
          microAssessment: false,
          mbiAssessment: false,
          activities: { boxBreathing: 0, stretching: 0 },
        });
      }

      // Load actual data and populate
      try {
        const [moodResponse, wellnessResponse] = await Promise.all([
          api.get(`/moods/user/${userId}`).catch(() => ({ data: [] })),
          api.get(`/wellness/user/${userId}`).catch(() => ({ data: [] })),
        ]);

        // Mark days with activities
        last30Days.forEach(day => {
          const dayDate = day.date;
          
          // Check moods
          const moodExists = moodResponse.data.some((mood: any) => 
            new Date(mood.timestamp).toISOString().split('T')[0] === dayDate
          );
          day.mood = moodExists;

          // Check wellness activities
          const dayWellnessActivities = wellnessResponse.data.filter((activity: any) => 
            new Date(activity.completed_at).toISOString().split('T')[0] === dayDate
          );
          
          day.activities = {
            boxBreathing: dayWellnessActivities.filter((a: any) => a.activity_type === 'box_breathing').length,
            stretching: dayWellnessActivities.filter((a: any) => a.activity_type === 'stretching').length,
          };
        });
      } catch (error) {
        console.log('Could not load all activity data');
      }

      setHistoryData(last30Days);
    } catch (error) {
      console.error('Error loading history data:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Calculate streaks from history data
      const streak = calculateActivityStreak(historyData);
      const longestStreak = calculateLongestStreak(historyData);

      setUserStats({
        currentStreak: streak,
        longestStreak,
        totalMoodEntries: 12, // Mock data
        totalMicroAssessments: 5,
        totalMBIAssessments: 2,
        lastActivityDate: findLastActivityDate(historyData),
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const calculateActivityStreak = (history: HistoryData[]): number => {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const day = history[i];
      if (day.mood || day.microAssessment || day.mbiAssessment || 
          (day.activities?.boxBreathing ?? 0) > 0 || (day.activities?.stretching ?? 0) > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateLongestStreak = (history: HistoryData[]): number => {
    let maxStreak = 0;
    let currentStreak = 0;
    
    history.forEach(day => {
      if (day.mood || day.microAssessment || day.mbiAssessment || 
          (day.activities?.boxBreathing ?? 0) > 0 || (day.activities?.stretching ?? 0) > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  };

  const findLastActivityDate = (history: HistoryData[]): string | undefined => {
    for (let i = history.length - 1; i >= 0; i--) {
      const day = history[i];
      if (day.mood || day.microAssessment || day.mbiAssessment || 
          (day.activities?.boxBreathing ?? 0) > 0 || (day.activities?.stretching ?? 0) > 0) {
        return day.date;
      }
    }
    return undefined;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const getWeekdayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const renderUserHeader = () => (
    <View style={styles.userHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userName || 'Dr. Physician'}</Text>
        <Text style={styles.userEmail}>{email || 'Loading...'}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Settings')} 
        style={styles.settingsButton}
      >
        <Ionicons name="cog-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderBurnoutRisk = () => {
    if (!burnoutRisk) return null;

    const getRiskColor = (level: string) => {
      switch (level.toLowerCase()) {
        case 'low': return colors.success;
        case 'medium': return colors.warning;
        case 'high': return colors.error;
        case 'no data': return colors.textSecondary;
        case 'error': return colors.error;
        default: return colors.textSecondary;
      }
    };

    const getTrendIcon = () => {
      switch (burnoutRisk.trend) {
        case 'improving': return 'trending-down';
        case 'worsening': return 'trending-up';
        default: return 'remove';
      }
    };

    const getTrendColor = () => {
      switch (burnoutRisk.trend) {
        case 'improving': return colors.success;
        case 'worsening': return colors.error;
        default: return colors.textSecondary;
      }
    };

    return (
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <View style={styles.riskTitleContainer}>
            <Ionicons name="shield-checkmark" size={20} color={getRiskColor(burnoutRisk.riskLevel)} />
            <Text style={styles.riskTitle}>Burnout Risk</Text>
          </View>
          {burnoutRisk.trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon()} 
                size={16} 
                color={getTrendColor()} 
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {burnoutRisk.trend}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.riskContent}>
          <Text style={[styles.riskLevel, { color: getRiskColor(burnoutRisk.riskLevel) }]}>
            {burnoutRisk.riskLevel}
          </Text>
          {burnoutRisk.riskLevel !== 'No Data' && burnoutRisk.riskLevel !== 'Error' && (
            <Text style={styles.riskScore}>Score: {burnoutRisk.combinedScore}/10</Text>
          )}
          {burnoutRisk.riskLevel === 'No Data' && (
            <Text style={styles.riskScore}>Complete an MBI assessment to see your risk</Text>
          )}
          {burnoutRisk.riskLevel === 'Error' && (
            <Text style={styles.riskScore}>Unable to load data</Text>
          )}
        </View>
      </View>
    );
  };

  const renderStreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <Ionicons name="flame" size={20} color={colors.accent} />
        <Text style={styles.streakTitle}>Activity Streak</Text>
      </View>
      
      <View style={styles.streakContent}>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakNumber}>{userStats.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakStat}>
            <Text style={styles.streakNumber}>{userStats.longestStreak}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
        </View>
        
        {userStats.lastActivityDate && (
          <Text style={styles.lastActivity}>
            Last activity: {formatDate(userStats.lastActivityDate)}/{new Date(userStats.lastActivityDate).getMonth() + 1}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStatsOverview = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.totalMoodEntries}</Text>
          <Text style={styles.statLabel}>Mood Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.totalMicroAssessments}</Text>
          <Text style={styles.statLabel}>Micro Tests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.totalMBIAssessments}</Text>
          <Text style={styles.statLabel}>MBI Tests</Text>
        </View>
      </View>
    </View>
  );

  const renderActivityHistory = () => {
    // Group data by week for better display
    const weeks: HistoryData[][] = [];
    const currentWeek: HistoryData[] = [];
    
    historyData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === historyData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek.length = 0;
      }
    });

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Activity Overview</Text>
          <Text style={styles.historySubtitle}>Last 30 days</Text>
        </View>
        
        <View style={styles.calendarContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                const hasActivity = day.mood || day.microAssessment || day.mbiAssessment || 
                                  (day.activities?.boxBreathing ?? 0) > 0 || (day.activities?.stretching ?? 0) > 0;
                
                const activityCount = (day.mood ? 1 : 0) + 
                                    (day.microAssessment ? 1 : 0) + 
                                    (day.mbiAssessment ? 1 : 0) + 
                                    (day.activities?.boxBreathing ?? 0) + 
                                    (day.activities?.stretching ?? 0);
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      hasActivity && styles.dayWithActivity,
                      activityCount > 2 && styles.dayWithMultipleActivities,
                    ]}
                    onPress={() => {
                      const activities = [];
                      if (day.mood) activities.push('Mood tracked');
                      if (day.microAssessment) activities.push('Micro assessment');
                      if (day.mbiAssessment) activities.push('MBI assessment');
                      if ((day.activities?.boxBreathing ?? 0) > 0) {
                        activities.push(`${day.activities?.boxBreathing} breathing session${(day.activities?.boxBreathing ?? 0) > 1 ? 's' : ''}`);
                      }
                      if ((day.activities?.stretching ?? 0) > 0) {
                        activities.push(`${day.activities?.stretching} stretching session${(day.activities?.stretching ?? 0) > 1 ? 's' : ''}`);
                      }
                      
                      const message = activities.length > 0 
                        ? activities.join('\n') 
                        : 'No activities recorded';
                      
                      Alert.alert(
                        `${getWeekdayName(day.date)}, ${formatDate(day.date)}`,
                        message
                      );
                    }}
                  >
                    <Text style={[
                      styles.dayText,
                      hasActivity && styles.dayTextActive,
                    ]}>
                      {formatDate(day.date)}
                    </Text>
                    {hasActivity && (
                      <View style={styles.activityDot}>
                        {activityCount > 1 && (
                          <Text style={styles.activityCount}>{activityCount}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Single activity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Multiple activities</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.actionsCard}>
      <Text style={styles.actionsTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProfileMood')}
        >
          <Ionicons name="happy-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Track Mood</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MicroAssessment')}
        >
          <Ionicons name="clipboard-outline" size={24} color={colors.secondary} />
          <Text style={styles.actionText}>Quick Assessment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MBIAssessment')}
        >
          <Ionicons name="document-text-outline" size={24} color={colors.accent} />
          <Text style={styles.actionText}>MBI Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('BoxBreathing')}
        >
          <Ionicons name="leaf-outline" size={24} color={colors.success} />
          <Text style={styles.actionText}>Breathing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo_half.png')} style={styles.logo} />
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')} 
          style={styles.headerSettingsButton}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Header */}
      {renderUserHeader()}

      {/* Burnout Risk */}
      {renderBurnoutRisk()}

      {/* Streak and Stats Row */}
      <View style={styles.statsRow}>
        {renderStreakCard()}
        {renderStatsOverview()}
      </View>

      {/* Activity History */}
      {renderActivityHistory()}

      {/* Quick Actions */}
      {renderQuickActions()}

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
    width: '100%',
    height: Dimensions.get('window').width / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsButton: {
    padding: 8,
  },
  headerSettingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  riskContent: {
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskScore: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  streakCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  streakLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
  lastActivity: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayWithActivity: {
    backgroundColor: colors.primary + '30',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayWithMultipleActivities: {
    backgroundColor: colors.success + '30',
    borderColor: colors.success,
  },
  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  activityDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCount: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});