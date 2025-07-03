import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface WellnessStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  onStreakPress?: () => void;
}

export default function WellnessStreakCard({ 
  currentStreak, 
  longestStreak, 
  lastActivityDate,
  onStreakPress 
}: WellnessStreakCardProps) {
  
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your wellness journey today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return `${streak} days strong! You're building a habit!`;
    if (streak < 30) return `Amazing! ${streak} days of consistent self-care!`;
    return `Incredible! ${streak} days of dedication to your wellbeing!`;
  };

  const getWellnessGoal = (currentStreak: number, longestStreak: number) => {
    let target: number;
    let message: string;

    if (currentStreak === 0) {
      target = 1;
      message = "Start with just one day of self-care!";
    } else if (currentStreak < 7) {
      target = 7;
      message = "Aim for a full week of wellness activities!";
    } else if (currentStreak < 30) {
      target = 30;
      message = "Challenge yourself to a 30-day streak!";
    } else {
      target = Math.max(longestStreak + 7, currentStreak + 7);
      message = "Keep pushing your personal best!";
    }

    return { target, message };
  };

  const streakMessage = getStreakMessage(currentStreak);
  const wellnessGoal = getWellnessGoal(currentStreak, longestStreak);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getStreakIcon = () => {
    if (currentStreak === 0) return 'play-circle-outline';
    if (currentStreak < 7) return 'flame-outline';
    if (currentStreak < 30) return 'flame';
    return 'trophy';
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return colors.textSecondary;
    if (currentStreak < 7) return colors.accent;
    if (currentStreak < 30) return colors.warning;
    return colors.success;
  };

  const showStreakDetails = () => {
    let message = `Current streak: ${currentStreak} days\n`;
    message += `Best streak: ${longestStreak} days\n\n`;
    message += streakMessage;
    
    if (currentStreak > 0 && lastActivityDate) {
      message += `\n\nLast activity: ${formatDate(lastActivityDate)}`;
    }

    Alert.alert('Streak Details', message);
  };

  const progress = Math.min(currentStreak / wellnessGoal.target, 1);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onStreakPress || showStreakDetails}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={getStreakIcon()} 
            size={24} 
            color={getStreakColor()} 
          />
          <Text style={styles.title}>Wellness Streak</Text>
        </View>
        <TouchableOpacity onPress={showStreakDetails}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakNumber, { color: getStreakColor() }]}>
              {currentStreak}
            </Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.streakStat}>
            <Text style={styles.streakNumber}>{longestStreak}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
        </View>

        <Text style={styles.message}>{streakMessage}</Text>

        {/* Progress towards goal */}
        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalText}>Goal: {wellnessGoal.target} days</Text>
            <Text style={styles.goalProgress}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: getStreakColor(),
                }
              ]} 
            />
          </View>
          
          <Text style={styles.goalMessage}>{wellnessGoal.message}</Text>
        </View>

        {lastActivityDate && (
          <View style={styles.lastActivity}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.lastActivityText}>
              Last activity: {formatDate(lastActivityDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Streak badges */}
      <View style={styles.badgeContainer}>
        {[7, 30, 100].map(milestone => (
          <View 
            key={milestone}
            style={[
              styles.badge,
              currentStreak >= milestone && styles.badgeAchieved,
            ]}
          >
            <Text style={[
              styles.badgeText,
              currentStreak >= milestone && styles.badgeTextAchieved,
            ]}>
              {milestone}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  content: {
    marginBottom: 16,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
    marginHorizontal: 20,
  },
  message: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  goalContainer: {
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalMessage: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  lastActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  lastActivityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAchieved: {
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgeTextAchieved: {
    color: 'white',
  },
});