import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Button, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { PUBLIC_API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';
import api from '../api/api';
console.log(PUBLIC_API_BASE_URL);


export default function HomeScreen({ navigation }: any) {
  return (
    
    <View style={styles.container}>
      {/* <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View> */}
      <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Tracker</Text>
          <Text style={styles.cardSubtitle}>Track your mood daily 🌞</Text>

          <MoodSelector
            onSelect={async (mood) => {
              try {
                const token = await AsyncStorage.getItem('authToken');
                const userId = await AsyncStorage.getItem('userId');

                const response = await api.post('/moods/', {
                  user_id: userId,
                  mood: mood.value,
                  reason: mood.note || '',
                  timestamp: new Date().toISOString(),
                });

                const savedMood = response.data;
                Alert.alert(`Mood "${savedMood.mood}" recorded!`);
              } catch (e) {
                console.error('Error saving mood:', e);
                Alert.alert('Error', 'Failed to save mood.');
              }
            }}

            />
      </View>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Activities</Text>
            <Text style={styles.cardSubtitle}>Boost your mood with these quick activities!</Text>
            <View  style={styles.activityRow}>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => navigation.navigate('BoxBreathing')}>
                  <Text style={styles.activityText}>Start Box Breathing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => navigation.navigate('Stretch')}>
                  <Text style={styles.activityText}>Start Stretching</Text>
                </TouchableOpacity>
            </View>
          </View>
{/* 
      <View style={{ marginTop: 10 }}>
        <Text style={styles.cardTitle}>Quick Activities</Text>
        <View style={{ marginVertical: 10 }}>

          <Button
            title="🧘 Start Box Breathing"
            onPress={() => navigation.navigate('BoxBreathing')}
            color={colors.accent}
          />
          <View style={{ height: 10 }} />
          <Button
            title="🤸 Stretch Session"
            onPress={() => navigation.navigate('Stretch')}
            color={colors.accent}
          />
        </View>
      </View> */}

      <Text style={styles.title}>Hi, welcome to WellMed!</Text>
      <Text style={styles.subtitle}>Your burnout prevention journey starts here 🌱</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} color={colors.secondary} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    alignItems: 'center',
    // justifyContent: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 30,
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').width * 0.5,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
  moodRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  activityButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    width: '45%',
    height: 50,
  },
  activityText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});
