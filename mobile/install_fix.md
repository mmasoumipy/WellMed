```shell
npm uninstall -g react-native-cli @react-native-community/cli
npm cache clean --force
```

# React Native uses TypeScript by default, so by using "--template react-native-template-typescript" we may cause conflicts with the default template.
```shell
npx @react-native-community/cli init WellMed
```


# It should show below message
```
  Run instructions for Android:
    • Have an Android emulator running (quickest way to get started), or a device connected.
    • cd "/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed" && npx react-native run-android
  
  Run instructions for iOS:
    • cd "/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed"
    
    • npx react-native run-ios
    - or -
    • Open WellMed/ios/WellMed.xcodeproj in Xcode or run "xed -b ios"
    • Hit the Run button
    
  Run instructions for macOS:
    • See https://aka.ms/ReactNativeGuideMacOS for the latest up-to-date instructions.
    
```

```shel
cd WellMed
npm install
npx pod-install ios
```




# Run the app
npx react-native run-ios


# If it works properly
npm install @react-navigation/native @react-navigation/native-stack
npx pod-install ios

# App.tsx update here


# Install react-native-gesture-handler
npm install react-native-safe-area-context
npm install react-native-svg react-native-svg-transformer

# Update metro.config.js (or create it if it doesn't exist)
``` javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'mp4', 'ttf', 'otf', 'woff', 'woff2', 'mp3', 'wav', 'obj', 'mtl', 'glb', 'gltf'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```


npx pod-install ios



# If you see "Unimplemented component: <RNSScreenStack>"
 # First install react-native-screens
npm install react-native-screens
npx pod-install ios


# Add this to the top of your App.tsx file
```javascript
import { enableScreens } from 'react-native-screens';
enableScreens();
```
# Then rebuild the app
npx react-native-clean-project
npx react-native run-ios


# Add api folder and auth.ts file
mkdir -p src/api
touch src/api/auth.ts

npm install axios --save


# Add the LoginScreen, RegisterScreen, and HomeScreen
touch src/screens/LoginScreen.tsx
touch src/screens/RegisterScreen.tsx
touch src/screens/HomeScreen.tsx

# Then, to keep the login token in the app, we need to install AsyncStorage
npm install @react-native-async-storage/async-storage
npx pod-install ios


# Add Profile Screen
mkdir -p src/screens
touch src/screens/ProfileScreen.tsx


# For tab navigator
npm install @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
npx pod-install ios


# Install icons
npm install react-native-vector-icons
npx pod-install ios
npm i --save-dev @types/react-native-vector-icons


# For mood entry and mood history, they are two components in src/components named MoodEntry.tsx and MoodHistory.tsx


# For showing the mood history, we need to install react-native-chart-kit
npm install react-native-chart-kit react-native-svg
npx pod-install ios


# For make different tabs in ProfileScreen
npm install @react-navigation/material-top-tabs react-native-tab-view react-native-pager-view
npx pod-install ios
# Then, we will add in that page
```javascript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
```

# For monthly notification for MBI, we need
```shell
npm install react-native-push-notification
npx pod-install ios
```
# Then, find file "info.plist" under ios/WeellMed(projectname) and add below line to it.
<key>NSUserNotificationUsageDescription</key>
<string>We need to send you notifications to keep you updated.</string>

# I saw some errors, so I used below code
```shell
npm install @react-native-community/push-notification-ios react-native-push-notification
npx pod-install ios
```


# After developing backend, make mobile/WellMedsrc/api.ts
# Then, install SecureStore to save the token securely
```shell
npm install @react-native-async-storage/async-storage
npx pod-install ios
```

# For .env, use:
```shell
npm install react-native-dotenv
```



# If you see that everythin break:
1. git reset --hard 19e1680 (last stable commit)
2. git clean -fd
3. rm -rf node_modules ios/Pods ios/Podfile.lock
4. git diff HEAD HEAD~1
5. git checkout HEAD~1
6. cd ios && pod install && cd ..


# Connect and Sync with Apple Watch
```shell
npm install react-native-health
npx pod-install ios
```
## After installing the "react-native-health" module, it will break. So, based om the below fix, you will need to make your index.js file in: node_modules > react0native-health > index.js 
[More explaination](https://github.com/agencyenterprise/react-native-health/issues/399#issuecomment-2585484469)

Based on above help, the 'export' line should be as below:
```javascript
export const HealthKit = {
   initHealthKit: AppleHealthKit.initHealthKit,
   isAvailable: AppleHealthKit.isAvailable,
   getBiologicalSex: AppleHealthKit.getBiologicalSex,
   getBloodType: AppleHealthKit.getBloodType,
   getDateOfBirth: AppleHealthKit.getDateOfBirth,
   getLatestWeight: AppleHealthKit.getLatestWeight,
   getWeightSamples: AppleHealthKit.getWeightSamples,
   saveWeight: AppleHealthKit.saveWeight,
   getLatestHeight: AppleHealthKit.getLatestHeight,
   getHeightSamples: AppleHealthKit.getHeightSamples,
   saveHeight: AppleHealthKit.saveHeight,
   getLatestWaistCircumference: AppleHealthKit.getLatestWaistCircumference,
   getWaistCircumferenceSamples: AppleHealthKit.getWaistCircumferenceSamples,
   saveWaistCircumference: AppleHealthKit.saveWaistCircumference,
   getLatestPeakFlow: AppleHealthKit.getLatestPeakFlow,
   getPeakFlowSamples: AppleHealthKit.getPeakFlowSamples,
   savePeakFlow: AppleHealthKit.savePeakFlow,
   saveLeanBodyMass: AppleHealthKit.saveLeanBodyMass,
   getLatestBmi: AppleHealthKit.getLatestBmi,
   getBmiSamples: AppleHealthKit.getBmiSamples,
   saveBmi: AppleHealthKit.saveBmi,
   getLatestBodyFatPercentage: AppleHealthKit.getLatestBodyFatPercentage,
   getBodyFatPercentageSamples: AppleHealthKit.getBodyFatPercentageSamples,
   getLatestLeanBodyMass: AppleHealthKit.getLatestLeanBodyMass,
   getLeanBodyMassSamples: AppleHealthKit.getLeanBodyMassSamples,
   getStepCount: AppleHealthKit.getStepCount,
   getSamples: AppleHealthKit.getSamples,
   getAnchoredWorkouts: AppleHealthKit.getAnchoredWorkouts,
   getDailyStepCountSamples: AppleHealthKit.getDailyStepCountSamples,
   saveSteps: AppleHealthKit.saveSteps,
   saveWalkingRunningDistance: AppleHealthKit.saveWalkingRunningDistance,
   getDistanceWalkingRunning: AppleHealthKit.getDistanceWalkingRunning,
   getDailyDistanceWalkingRunningSamples: AppleHealthKit.getDailyDistanceWalkingRunningSamples,
   getDistanceCycling: AppleHealthKit.getDistanceCycling,
   getDailyDistanceCyclingSamples: AppleHealthKit.getDailyDistanceCyclingSamples,
   getFlightsClimbed: AppleHealthKit.getFlightsClimbed,
   getDailyFlightsClimbedSamples: AppleHealthKit.getDailyFlightsClimbedSamples,
   getEnergyConsumedSamples: AppleHealthKit.getEnergyConsumedSamples,
   getProteinSamples: AppleHealthKit.getProteinSamples,
   getFiberSamples: AppleHealthKit.getFiberSamples,
   getTotalFatSamples: AppleHealthKit.getTotalFatSamples,
   saveFood: AppleHealthKit.saveFood,
   saveWater: AppleHealthKit.saveWater,
   getWater: AppleHealthKit.getWater,
   saveHeartRateSample: AppleHealthKit.saveHeartRateSample,
   getWaterSamples: AppleHealthKit.getWaterSamples,
   getHeartRateSamples: AppleHealthKit.getHeartRateSamples,
   getRestingHeartRate: AppleHealthKit.getRestingHeartRate,
   getWalkingHeartRateAverage: AppleHealthKit.getWalkingHeartRateAverage,
   getActiveEnergyBurned: AppleHealthKit.getActiveEnergyBurned,
   getBasalEnergyBurned: AppleHealthKit.getBasalEnergyBurned,
   getAppleExerciseTime: AppleHealthKit.getAppleExerciseTime,
   getAppleStandTime: AppleHealthKit.getAppleStandTime,
   getVo2MaxSamples: AppleHealthKit.getVo2MaxSamples,
   getBodyTemperatureSamples: AppleHealthKit.getBodyTemperatureSamples,
   getBloodPressureSamples: AppleHealthKit.getBloodPressureSamples,
   getRespiratoryRateSamples: AppleHealthKit.getRespiratoryRateSamples,
   getHeartRateVariabilitySamples: AppleHealthKit.getHeartRateVariabilitySamples,
   getHeartbeatSeriesSamples: AppleHealthKit.getHeartbeatSeriesSamples,
   getRestingHeartRateSamples: AppleHealthKit.getRestingHeartRateSamples,
   getBloodGlucoseSamples: AppleHealthKit.getBloodGlucoseSamples,
   getCarbohydratesSamples: AppleHealthKit.getCarbohydratesSamples,
   saveBloodGlucoseSample: AppleHealthKit.saveBloodGlucoseSample,
   saveCarbohydratesSample: AppleHealthKit.saveCarbohydratesSample,
   deleteBloodGlucoseSample: AppleHealthKit.deleteBloodGlucoseSample,
   deleteCarbohydratesSample: AppleHealthKit.deleteCarbohydratesSample,
   getSleepSamples: AppleHealthKit.getSleepSamples,
   getInfo: AppleHealthKit.getInfo,
   getMindfulSession: AppleHealthKit.getMindfulSession,
   saveMindfulSession: AppleHealthKit.saveMindfulSession,
   getWorkoutRouteSamples: AppleHealthKit.getWorkoutRouteSamples,
   saveWorkout: AppleHealthKit.saveWorkout,
   getAuthStatus: AppleHealthKit.getAuthStatus,
   getLatestBloodAlcoholContent: AppleHealthKit.getLatestBloodAlcoholContent,
   getBloodAlcoholContentSamples: AppleHealthKit.getBloodAlcoholContentSamples,
   saveBloodAlcoholContent: AppleHealthKit.saveBloodAlcoholContent,
   getDistanceSwimming: AppleHealthKit.getDistanceSwimming,
   getDailyDistanceSwimmingSamples: AppleHealthKit.getDailyDistanceSwimmingSamples,
   getOxygenSaturationSamples: AppleHealthKit.getOxygenSaturationSamples,
   getElectrocardiogramSamples: AppleHealthKit.getElectrocardiogramSamples,
   saveBodyFatPercentage: AppleHealthKit.saveBodyFatPercentage,
   saveBodyTemperature: AppleHealthKit.saveBodyTemperature,
   getEnvironmentalAudioExposure: AppleHealthKit.getEnvironmentalAudioExposure,
   getHeadphoneAudioExposure: AppleHealthKit.getHeadphoneAudioExposure,
   getClinicalRecords: AppleHealthKit.getClinicalRecords,
   getActivitySummary: AppleHealthKit.getActivitySummary,
   getInsulinDeliverySamples: AppleHealthKit.getInsulinDeliverySamples,
   saveInsulinDeliverySample: AppleHealthKit.saveInsulinDeliverySample,
   deleteInsulinDeliverySample: AppleHealthKit.deleteInsulinDeliverySample,

   Constants: {
     Activities,
     Observers,
     Permissions,
     Units,
   },
 }```
