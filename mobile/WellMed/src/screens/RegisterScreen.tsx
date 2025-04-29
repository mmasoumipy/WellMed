import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { colors } from '../constants/colors';
import { register } from '../api/auth';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

  
    const handleRegister = async () => {
        setLoading(true);
        try {
          const res = await register(email, password);
          Alert.alert('Success', res.message);
        } catch (err: any) {
          Alert.alert('Error', err.response?.data?.detail || 'Registration failed');
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
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
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
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Button title="Register" onPress={handleRegister} color={colors.secondary} />
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Go to Login"
              onPress={() => navigation.navigate('Login')}
              color={colors.primary}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  </KeyboardAvoidingView>
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
