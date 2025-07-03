import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface WellnessActivity {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface CompactWellnessActivitiesProps {
  activities: WellnessActivity[];
  onViewHistory: () => void;
}

export default function CompactWellnessActivities({ 
  activities, 
  onViewHistory 
}: CompactWellnessActivitiesProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="leaf-outline" size={20} color={colors.success} />
          <Text style={styles.title}>Wellness</Text>
        </View>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={onViewHistory}
        >
          <Ionicons name="time-outline" size={16} color={colors.success} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Activities Grid */}
      <View style={styles.activitiesGrid}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[styles.activityButton, { backgroundColor: activity.color }]}
            onPress={activity.onPress}
            activeOpacity={0.8}
          >
            <Ionicons name={activity.icon as any} size={24} color="white" />
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Quick exercises to boost your wellbeing
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
  },
  historyText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  activitiesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  activitySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});