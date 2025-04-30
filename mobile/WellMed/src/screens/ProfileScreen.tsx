import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions, Alert } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoodSelector from '../components/MoodSelector';


export default function ProfileScreen({ navigation }: any) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      setEmail(storedEmail);
    };
    fetchEmail();
  }, []);

  return (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo_half.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Profile</Text>
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


        {email ? (
            <>
            <Text style={styles.info}>Email: {email}</Text>
            <Text style={styles.subtitle}>This is your burnout prevention app 🌿</Text>
            </>
        ) : (
            <Text style={styles.info}>Loading profile...</Text>
        )}
        <View style={styles.buttonContainer}>
            <Button title="Back to Home" onPress={() => navigation.navigate('Home')} color={colors.primary} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
      },
    logoContainer: {
        width: '100%',
        height: Dimensions.get('window').width / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5, 
        
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },
  info: { fontSize: 18, color: colors.textSecondary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textTertiary, textAlign: 'center', marginTop: 10 },
  buttonContainer: { marginTop: 20, width: '100%' },
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
