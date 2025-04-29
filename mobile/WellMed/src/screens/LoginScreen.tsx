import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { login } from '../api/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login(email, password);
      await AsyncStorage.setItem('authToken', res.token);
      Alert.alert('Success', res.message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo_half.png')} style={styles.logo} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <View style={styles.buttonContainer}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
            <Button title="Login" onPress={handleLogin} color={colors.primary} />
        )}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Register"
            onPress={() => navigation.navigate('Register')}
            color={colors.secondary}
          />
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  logoContainer: {
    width: '100%',
    height: Dimensions.get('window').width / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    borderRadius: 8,
    color: colors.textPrimary,
  },
  buttonContainer: {
    marginVertical: 5,
    width: '100%',
  },
});
