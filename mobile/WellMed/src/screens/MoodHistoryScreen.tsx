import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import api from '../api/api';

const { width } = Dimensions.get('window');

interface MoodEntry {
  id: string;
  mood: string;
  reason?: string;
  timestamp: string;
}

const moodScale: Record<string, number> = {
  Excellent: 6,
  Good: 5,
  Okay: 4,
  Stressed: 3,
  Tired: 2,  
  Anxious: 1,
};

const moodColors: Record<string, string> = {
  Excellent: colors.excellent,
  Good: colors.good,
  Okay: colors.okay,
  Stressed: colors.stressed,
  Tired: colors.tired,
  Anxious: colors.anxious,
};

export default function MoodHistoryScreen({ navigation }: any) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const response = await api.get(`/moods/user/${userId}`);
      const moodData = response.data;
      
      // Sort by date (most recent first)
      const sortedMoods = moodData.sort((a: MoodEntry, b: MoodEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setMoods(sortedMoods);
      prepareChartData(sortedMoods);
    } catch (error: any) {
      console.error('Error loading mood history:', error);
      Alert.alert('Error', 'Could not load mood history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const prepareChartData = (moodData: MoodEntry[]) => {
    if (moodData.length === 0) {
      setChartData([]);
      setChartLabels([]);
      return;
    }

    // Group moods by day, keeping only the last entry per day
    const moodMap: Record<string, MoodEntry> = {};
    
    moodData.forEach((mood) => {
      const dateKey = new Date(mood.timestamp).toISOString().split('T')[0];
      const existing = moodMap[dateKey];
      
      if (!existing || new Date(mood.timestamp) > new Date(existing.timestamp)) {
        moodMap[dateKey] = mood;
      }
    });

    // Sort by date (ascending) and take last 14 days for chart
    const sortedEntries = Object.entries(moodMap)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .slice(-14);

    const values: number[] = [];
    const labels: string[] = [];

    sortedEntries.forEach(([dateKey, mood]) => {
      const moodValue = moodScale[mood.mood];
      if (typeof moodValue === 'number') {
        values.push(moodValue);
        const date = new Date(dateKey);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      }
    });

    setChartData(values);
    setChartLabels(labels);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMoodHistory();
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

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodStats = () => {
    if (moods.length === 0) return null;

    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const averageScore = moods.reduce((sum, mood) => 
      sum + moodScale[mood.mood], 0) / moods.length;

    const last7Days = moods.filter(mood => {
      const date = new Date(mood.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });

    return {
      totalEntries: moods.length,
      mostCommonMood: mostCommon?.[0],
      mostCommonCount: mostCommon?.[1] || 0,
      averageScore: averageScore.toFixed(1),
      entriesThisWeek: last7Days.length,
    };
  };

  const renderStatsCard = () => {
    const stats = getMoodStats();
    if (!stats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Mood Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.entriesThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: moodColors[stats.mostCommonMood] || colors.primary }]}>
              {stats.mostCommonMood}
            </Text>
            <Text style={styles.statLabel}>Most Common</Text>
          </View>
          
          {/* <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View> */}
        </View>
      </View>
    );
  };

  const renderChart = () => {
    if (chartData.length === 0) return null;

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Mood Trend (Last 14 Days)</Text>
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartData }],
          }}
          width={width - 80}
          height={220}
          yAxisInterval={1}
          fromZero
          formatYLabel={(value) => {
            const moodNames: { [key: number]: string } = {
              6: 'Excellent',
              5: 'Good', 
              4: 'Okay',
              3: 'Stressed',
              2: 'Tired',
              1: 'Anxious',
            };
            return moodNames[parseInt(value)] || '';
          }}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            labelColor: () => colors.textPrimary,
            propsForDots: { 
              r: '4', 
              strokeWidth: '2', 
              stroke: colors.primary 
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.divider,
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderMoodList = () => (
    <View style={styles.listCard}>
      <Text style={styles.listTitle}>Recent Mood Entries</Text>
      
      {moods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="happy-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No mood entries yet</Text>
          <Text style={styles.emptyStateText}>
            Start tracking your mood to see patterns and insights over time.
          </Text>
          <TouchableOpacity
            style={styles.addMoodButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.addMoodButtonText}>Track Your Mood</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.moodList} showsVerticalScrollIndicator={false}>
          {moods.map((mood, index) => (
            <View key={mood.id || index} style={styles.moodItem}>
              <View style={styles.moodLeft}>
                <View style={[
                  styles.moodIndicator, 
                  { backgroundColor: moodColors[mood.mood] || colors.primary }
                ]}>
                  <Text style={styles.moodEmoji}>
                    {mood.mood === 'Excellent' ? '😊' :
                     mood.mood === 'Good' ? '🙂' :
                     mood.mood === 'Okay' ? '😐' :
                     mood.mood === 'Stressed' ? '😰' :
                     mood.mood === 'Tired' ? '😴' :
                     mood.mood === 'Anxious' ? '😟' : '🙂'}
                  </Text>
                </View>
                
                <View style={styles.moodInfo}>
                  <Text style={styles.moodName}>{mood.mood}</Text>
                  {mood.reason && (
                    <Text style={styles.moodReason} numberOfLines={2}>
                      {mood.reason}
                    </Text>
                  )}
                  <Text style={styles.moodDate}>
                    {formatDate(mood.timestamp)} at {formatTime(mood.timestamp)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.moodScore}>
                <Text style={[
                  styles.scoreNumber,
                  { color: moodColors[mood.mood] || colors.primary }
                ]}>
                  {moodScale[mood.mood]}
                </Text>
                <Text style={styles.scoreLabel}>score</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading mood history...</Text>
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
        <Text style={styles.headerTitle}>Mood History</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {renderStatsCard()}

      {/* Chart */}
      {renderChart()}

      {/* Mood List */}
      {renderMoodList()}
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
  addButton: {
    padding: 8,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
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
  chartCard: {
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
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  listCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 20,
    paddingBottom: 16,
  },
  moodList: {
    maxHeight: 400,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  moodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodInfo: {
    flex: 1,
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  moodReason: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  moodDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moodScore: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  addMoodButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addMoodButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});