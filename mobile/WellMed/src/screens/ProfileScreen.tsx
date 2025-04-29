import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <Text style={styles.title}>Profile</Text>
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
  container: { flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },
  info: { fontSize: 18, color: colors.textSecondary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textTertiary, textAlign: 'center', marginTop: 10 },
  buttonContainer: { marginTop: 20, width: '100%' },
});
