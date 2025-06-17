import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

export default function SettingsScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const loadInfo = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedSpecialty = await AsyncStorage.getItem('userSpecialty');
      const storedNotifications = await AsyncStorage.getItem('notifications');
      
      if (storedEmail) setEmail(storedEmail);
      if (storedName) setName(storedName);
      if (storedSpecialty) setSpecialty(storedSpecialty);
      if (storedNotifications !== null) setNotifications(JSON.parse(storedNotifications));
    };
    loadInfo();
  }, []);

  const saveInfo = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userSpecialty', specialty);
      Alert.alert('Success', 'Your information has been updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications', JSON.stringify(value));
  };

  const viewAssessmentHistory = async () => {
    try {
      const mbiData = await AsyncStorage.getItem('mbiResults');
      const microData = await AsyncStorage.getItem('latestMicroAssessment');
      
      const mbiList = mbiData ? JSON.parse(mbiData) : [];
      const microAssessment = microData ? JSON.parse(microData) : null;
      
      let message = 'Assessment History:\n\n';
      
      if (mbiList.length > 0) {
        message += `MBI Assessments: ${mbiList.length}\n`;
        message += `Latest MBI: ${new Date(mbiList[0].date).toLocaleDateString()}\n`;
        message += `- Emotional Exhaustion: ${mbiList[0].EE}\n`;
        message += `- Depersonalization: ${mbiList[0].DP}\n`;
        message += `- Personal Achievement: ${mbiList[0].PA}\n\n`;
      } else {
        message += 'No MBI assessments completed yet.\n\n';
      }
      
      if (microAssessment) {
        message += `Latest Micro Assessment:\n`;
        message += `- Fatigue: ${microAssessment.fatigue}\n`;
        message += `- Stress: ${microAssessment.stress}\n`;
        message += `- Satisfaction: ${microAssessment.satisfaction}\n`;
        message += `- Sleep: ${microAssessment.sleep}\n`;
      } else {
        message += 'No micro assessments completed yet.';
      }
      
      Alert.alert('Assessment History', message);
    } catch (error) {
      Alert.alert('Error', 'Unable to load assessment history.');
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your mood entries, assessments, and personal data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'moodEntries',
                'mbiResults', 
                'latestMicroAssessment',
                'dailyCheckins',
                'userName',
                'userSpecialty'
              ]);
              Alert.alert('Success', 'All data has been cleared.');
              setName('');
              setSpecialty('');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'userEmail', 'userId']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo_half.png')} style={styles.logo} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.profileName}>{name || 'Dr. Physician'}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              editable={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Medical Specialty</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Internal Medicine, Surgery, Pediatrics"
              placeholderTextColor={colors.textSecondary}
              value={specialty}
              onChangeText={setSpecialty}
            />
          </View>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Receive assessment reminders</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.divider, true: colors.primary }}
              thumbColor={notifications ? colors.background : colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionItem} onPress={viewAssessmentHistory}>
            <Ionicons name="bar-chart-outline" size={20} color={colors.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>View Assessment History</Text>
              <Text style={styles.actionSubtitle}>See your MBI and micro-assessment results</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={clearData}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.error }]}>Clear All Data</Text>
              <Text style={styles.actionSubtitle}>Remove all stored assessment data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => Alert.alert('Support', 'For support, please contact: support@wellmed.app')}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.thirdary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Help & Support</Text>
              <Text style={styles.actionSubtitle}>Get help with using WellMed</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('About WellMed', 'WellMed v1.0.0\nBurnout prevention for healthcare professionals.')}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>About WellMed</Text>
              <Text style={styles.actionSubtitle}>Version 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.saveButton} onPress={saveInfo}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    width: '100%',
    height: Dimensions.get('window').width / 2,
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundPrimary,
  },
  disabledInput: {
    backgroundColor: colors.divider,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});