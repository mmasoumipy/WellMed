import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

export default function SettingsScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    const loadInfo = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedAge = await AsyncStorage.getItem('userAge');
      const storedEmail = await AsyncStorage.getItem('userEmail');

      if (storedEmail) setName(storedEmail);
      if (storedName) setName(storedName);
      if (storedAge) setAge(storedAge);
    };
    loadInfo();
  }, []);

  const saveInfo = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userAge', age);
      Alert.alert('Saved', 'Your information has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save your information.');
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Your Info</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={name}
                editable={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
            />
            <Button title="Save" onPress={saveInfo} color={colors.primary} />
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
    card: {
        width: '90%',
        padding: 20,
        marginTop: 80,
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
        marginBottom: 20,
        color: colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    color: colors.textPrimary,
  },
});
