import React from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import DailyCheckIn from '../components/DailyCheckIn';
import { colors } from '../constants/colors';
// You can later add MBI Assessment component here

export default function ProfileAssessmentTab({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.card}>
        {/* <DailyCheckIn /> */}
        {/* TODO: Add MBI Assessment component here */}

        {/* MicroAssessment */}
        <Button
            title="Start Micro-Assessment"
            onPress={() => navigation.navigate('MicroAssessment')}
            color="#4A90E2"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {   
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
      },
    card: {
        width: '90%',
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});
