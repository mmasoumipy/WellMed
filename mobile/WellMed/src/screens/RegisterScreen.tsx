import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { registerAndLogin } from '../api/auth';
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '../utils/passwordValidation';
import { scheduleMonthlyMBIReminder } from '../utils/notifications';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordValidation = validatePassword(password);
  const passwordStrength = getPasswordStrength(password);
  const strengthColor = getPasswordStrengthColor(passwordStrength);

  const handleRegister = async () => {
    // Basic validation
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Missing Information', 'Please fill in email, password, and name fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Password validation
    if (!passwordValidation.isValid) {
      Alert.alert(
        'Invalid Password', 
        'Password must meet all requirements:\n\n' + passwordValidation.errors.join('\n')
      );
      return;
    }

    setLoading(true);
    try {
      const userData = {
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
        specialty: specialty.trim() || undefined,
        birthday: undefined,
      };

      console.log('Attempting registration and auto-login...');
      const loginResponse = await registerAndLogin(userData);
      
      // Save authentication data
      await AsyncStorage.setItem('authToken', loginResponse.access_token);
      await AsyncStorage.setItem('userEmail', loginResponse.user.email);
      await AsyncStorage.setItem('userId', loginResponse.user.id);
      await AsyncStorage.setItem('userName', loginResponse.user.name);
      
      if (loginResponse.user.specialty) {
        await AsyncStorage.setItem('userSpecialty', loginResponse.user.specialty);
      }

      console.log('Registration and login successful');

      // Schedule notifications
      scheduleMonthlyMBIReminder();

      // Navigate to home screen
      Alert.alert(
        'Welcome to WellMed! 🎉', 
        `Registration successful! Welcome aboard, ${loginResponse.user.name}.`,
        [
          {
            text: 'Get Started',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      Alert.alert('Registration Failed', err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirements = () => {
    if (!passwordFocused && password.length === 0) return null;

    return (
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        {Object.entries({
          minLength: 'At least 8 characters',
          hasUppercase: 'One uppercase letter (A-Z)',
          hasLowercase: 'One lowercase letter (a-z)',
          hasNumber: 'One number (0-9)',
          hasSpecialChar: 'One special character (!@#$%^&*)',
        }).map(([key, text]) => (
          <View key={key} style={styles.requirementItem}>
            <Ionicons
              name={passwordValidation.requirements[key as keyof typeof passwordValidation.requirements] ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={passwordValidation.requirements[key as keyof typeof passwordValidation.requirements] ? colors.success : colors.error}
            />
            <Text style={[
              styles.requirementText,
              { color: passwordValidation.requirements[key as keyof typeof passwordValidation.requirements] ? colors.success : colors.textSecondary }
            ]}>
              {text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPasswordStrength = () => {
    if (password.length === 0) return null;

    return (
      <View style={styles.passwordStrength}>
        <View style={styles.strengthBar}>
          <View style={[
            styles.strengthFill,
            { 
              width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
              backgroundColor: strengthColor 
            }
          ]} />
        </View>
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} Password
        </Text>
      </View>
    );
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
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join WellMed to start your wellness journey</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name *"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  onChangeText={setName}
                  value={name}
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address *"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="medical-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Medical Specialty (Optional)"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  onChangeText={setSpecialty}
                  value={specialty}
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password *"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  value={password}
                  autoCapitalize="none"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {renderPasswordStrength()}

              {/* Password Requirements */}
              {renderPasswordRequirements()}
              
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (!passwordValidation.isValid || loading) && styles.registerButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={!passwordValidation.isValid || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Already have an account?</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  passwordStrength: {
    width: '100%',
    marginBottom: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordRequirements: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  registerButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  loginButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});