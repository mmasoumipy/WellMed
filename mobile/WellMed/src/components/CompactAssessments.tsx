import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

interface Assessment {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface CompactAssessmentsProps {
  assessments: Assessment[];
}

export default function CompactAssessments({ assessments }: CompactAssessmentsProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="clipboard-outline" size={20} color={colors.accent} />
        <Text style={styles.title}>Quick Assessments</Text>
      </View>

      {/* Assessments Row */}
      <View style={styles.assessmentsRow}>
        {assessments.map((assessment) => (
          <TouchableOpacity
            key={assessment.id}
            style={styles.assessmentButton}
            onPress={assessment.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: assessment.color + '20' }]}>
              <Ionicons 
                name={assessment.icon as any} 
                size={20} 
                color={assessment.color} 
              />
            </View>
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              <Text style={styles.assessmentSubtitle}>{assessment.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Monitor your wellbeing regularly
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  assessmentsRow: {
    gap: 12,
    marginBottom: 12,
  },
  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  assessmentSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});