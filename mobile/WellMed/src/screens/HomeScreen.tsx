import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Button, Alert } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';

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
                    const old = await AsyncStorage.getItem('moodEntries');
                    const moods = old ? JSON.parse(old) : [];
                    const updated = [mood, ...moods].slice(0, 10); // keep last 10
                    await AsyncStorage.setItem('moodEntries', JSON.stringify(updated));
                    Alert.alert(`Mood "${mood.value}" recorded!`);
                    } catch (e) {
                    Alert.alert('Failed to save mood.');
                    }
                }}
            />
      </View>
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
  
});
