import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';

// Try multiple import strategies for react-native-health
let AppleHealthKit: any = null;
let importStrategy = 'none';

if (Platform.OS === 'ios') {
  try {
    // Strategy 1: Default import
    const healthImport = require('react-native-health');
    console.log('HealthKit import result:', healthImport);
    
    if (healthImport.default) {
      AppleHealthKit = healthImport.default;
      importStrategy = 'default';
    } else if (healthImport.HealthKit) {
      AppleHealthKit = healthImport.HealthKit;
      importStrategy = 'HealthKit';
    } else if (healthImport) {
      AppleHealthKit = healthImport;
      importStrategy = 'direct';
    }
    
    console.log('Using import strategy:', importStrategy);
    console.log('AppleHealthKit methods after import:', Object.keys(AppleHealthKit || {}));
  } catch (error) {
    console.log('Failed to import react-native-health:', error);
  }
}

export default function HealthDataDisplay() {
  const [loading, setLoading] = useState(true);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [healthKitAvailable, setHealthKitAvailable] = useState<boolean | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);

  const addDebugInfo = (info: string) => {
    console.log('HealthKit Debug:', info);
    setDebugInfo(prev => [...prev.slice(-6), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    initializeHealthKit();
  }, []);

  const initializeHealthKit = () => {
    addDebugInfo('Starting HealthKit initialization...');
    addDebugInfo(`Import strategy used: ${importStrategy}`);
    
    if (Platform.OS !== 'ios') {
      addDebugInfo('Not on iOS platform');
      setHealthKitAvailable(false);
      setLoading(false);
      return;
    }

    if (!AppleHealthKit) {
      const errorMsg = 'HealthKit failed to import. Check installation.';
      addDebugInfo(errorMsg);
      setSetupError(errorMsg);
      setLoading(false);
      return;
    }

    // Debug what's actually available
    addDebugInfo(`AppleHealthKit type: ${typeof AppleHealthKit}`);
    const allKeys = Object.keys(AppleHealthKit || {});
    addDebugInfo(`All available keys: ${allKeys.join(', ')}`);
    
    const methods = allKeys.filter(key => typeof AppleHealthKit[key] === 'function');
    addDebugInfo(`Available methods: ${methods.join(', ')}`);

    // Check Constants
    if (AppleHealthKit.Constants) {
      addDebugInfo('Constants available');
      if (AppleHealthKit.Constants.Permissions) {
        const permissionKeys = Object.keys(AppleHealthKit.Constants.Permissions);
        addDebugInfo(`${permissionKeys.length} permissions available`);
      }
    } else {
      addDebugInfo('Constants not available');
    }

    // Try different initialization approaches
    if (typeof AppleHealthKit.isAvailable === 'function') {
      addDebugInfo('Found isAvailable method - testing...');
      try {
        AppleHealthKit.isAvailable((error: any, available: boolean) => {
          if (error) {
            addDebugInfo(`isAvailable error: ${JSON.stringify(error)}`);
          } else {
            addDebugInfo(`HealthKit available: ${available}`);
            setHealthKitAvailable(available);
          }
          setLoading(false);
        });
      } catch (err) {
        addDebugInfo(`isAvailable call failed: ${err}`);
        setLoading(false);
      }
    } else if (typeof AppleHealthKit.initHealthKit === 'function') {
      addDebugInfo('Found initHealthKit method - trying direct init...');
      tryDirectInit();
    } else {
      addDebugInfo('No HealthKit methods found - this is a linking issue');
      setSetupError('HealthKit methods not found. Library linking issue.');
      setLoading(false);
    }
  };

  const tryDirectInit = () => {
    if (!AppleHealthKit.Constants || !AppleHealthKit.Constants.Permissions) {
      addDebugInfo('Cannot initialize - missing Constants.Permissions');
      setSetupError('HealthKit Constants not available');
      setLoading(false);
      return;
    }

    const permissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.StepCount],
        write: [],
      },
    };

    try {
      AppleHealthKit.initHealthKit(permissions, (error: any) => {
        if (error) {
          addDebugInfo(`initHealthKit error: ${JSON.stringify(error)}`);
          setSetupError(`Init failed: ${JSON.stringify(error)}`);
        } else {
          addDebugInfo('HealthKit initialized successfully');
          setHealthKitAvailable(true);
          testStepCount();
        }
        setLoading(false);
      });
    } catch (err) {
      addDebugInfo(`initHealthKit call failed: ${err}`);
      setLoading(false);
    }
  };

  const testStepCount = () => {
    if (typeof AppleHealthKit.getStepCount === 'function') {
      addDebugInfo('Testing step count...');
      AppleHealthKit.getStepCount(
        { date: new Date().toISOString() },
        (err: any, results: any) => {
          if (err) {
            addDebugInfo(`Step count error: ${JSON.stringify(err)}`);
          } else {
            const steps = results?.value || 0;
            setStepCount(steps);
            addDebugInfo(`Step count success: ${steps}`);
          }
        }
      );
    } else {
      addDebugInfo('getStepCount method not available');
    }
  };

  const checkNodeModulesFile = () => {
    Alert.alert(
      'Manual Fix Required',
      'The react-native-health library needs a manual fix. Please check:\n\n' +
      '1. Go to node_modules/react-native-health/index.js\n' +
      '2. Look for the export statement at the bottom\n' +
      '3. Make sure it exports the HealthKit object properly\n\n' +
      'Would you like to see the expected export format?',
      [
        { text: 'Show Export Format', onPress: showExportFormat },
        { text: 'Cancel' }
      ]
    );
  };

  const showExportFormat = () => {
    Alert.alert(
      'Expected Export Format',
      'At the bottom of node_modules/react-native-health/index.js, you should have:\n\n' +
      'export const HealthKit = {\n' +
      '  initHealthKit: AppleHealthKit.initHealthKit,\n' +
      '  isAvailable: AppleHealthKit.isAvailable,\n' +
      '  getStepCount: AppleHealthKit.getStepCount,\n' +
      '  // ... other methods\n' +
      '  Constants: { Activities, Observers, Permissions, Units }\n' +
      '};\n\n' +
      'export default HealthKit;'
    );
  };

  const retryWithDifferentStrategy = () => {
    // Try to reload the module with a different strategy
    setLoading(true);
    setDebugInfo([]);
    setSetupError(null);
    
    try {
      // Force reload the module
      delete require.cache[require.resolve('react-native-health')];
      const healthImport = require('react-native-health');
      
      // Try different export patterns
      if (healthImport.HealthKit && typeof healthImport.HealthKit.isAvailable === 'function') {
        AppleHealthKit = healthImport.HealthKit;
        importStrategy = 'HealthKit-retry';
        addDebugInfo('Retry with HealthKit export successful');
      } else if (healthImport.default && typeof healthImport.default.isAvailable === 'function') {
        AppleHealthKit = healthImport.default;
        importStrategy = 'default-retry';
        addDebugInfo('Retry with default export successful');
      } else {
        addDebugInfo('Retry failed - same issue persists');
      }
      
      initializeHealthKit();
    } catch (error) {
      addDebugInfo(`Retry failed: ${error}`);
      setLoading(false);
    }
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>HealthKit is only available on iOS devices</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Data Debug</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.metric}>
          📱 Import Strategy: {importStrategy}
        </Text>
        <Text style={styles.metric}>
          📱 HealthKit Available: {healthKitAvailable !== null ? (healthKitAvailable ? 'Yes' : 'No') : 'Unknown'}
        </Text>
        <Text style={styles.metric}>
          🚶 Steps Today: {stepCount !== null ? stepCount.toLocaleString() : 'No data'}
        </Text>
        {setupError && (
          <Text style={styles.errorText}>Error: {setupError}</Text>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Testing HealthKit...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={initializeHealthKit}>
          <Text style={styles.buttonText}>Retry Init</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={retryWithDifferentStrategy}>
          <Text style={styles.buttonText}>Retry Import</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={checkNodeModulesFile}>
          <Text style={styles.buttonText}>Manual Fix</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Log:</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>{info}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 10,
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusContainer: {
    marginBottom: 15,
  },
  metric: {
    fontSize: 14,
    marginVertical: 2,
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    color: '#ff3333',
    marginVertical: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 5,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    marginVertical: 1,
  },
});