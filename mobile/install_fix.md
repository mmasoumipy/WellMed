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




(base) minamasoumi@umroots-Mac-mini ios % rm -rf Pods Podfile.lock build
(base) minamasoumi@umroots-Mac-mini ios % pod install
Found 8 modules for target WellMed
link_native_modules! {:ios_packages=>[{:configurations=>[], :name=>"@react-native-async-storage/async-storage", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/@react-native-async-storage/async-storage", :path=>"../node_modules/@react-native-async-storage/async-storage", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/@react-native-async-storage/async-storage/RNCAsyncStorage.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"@react-native-community/push-notification-ios", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/@react-native-community/push-notification-ios", :path=>"../node_modules/@react-native-community/push-notification-ios", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/@react-native-community/push-notification-ios/RNCPushNotificationIOS.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-ionicons", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-ionicons", :path=>"../node_modules/react-native-ionicons", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-ionicons/react-native-ionicons.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-pager-view", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-pager-view", :path=>"../node_modules/react-native-pager-view", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-pager-view/react-native-pager-view.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-safe-area-context", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-safe-area-context", :path=>"../node_modules/react-native-safe-area-context", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-safe-area-context/react-native-safe-area-context.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-screens", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-screens", :path=>"../node_modules/react-native-screens", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-screens/RNScreens.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-svg", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-svg", :path=>"../node_modules/react-native-svg", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-svg/RNSVG.podspec", :script_phases=>[]}, {:configurations=>[], :name=>"react-native-vector-icons", :root=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-vector-icons", :path=>"../node_modules/react-native-vector-icons", :podspec_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native-vector-icons/RNVectorIcons.podspec", :script_phases=>[]}], :ios_project_root_path=>"/Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios", :react_native_path=>"../node_modules/react-native"}
Auto-linking React Native modules for target WellMed: RNCAsyncStorage, RNCPushNotificationIOS, RNSVG, RNScreens, RNVectorIcons, react-native-ionicons, react-native-pager-view, and react-native-safe-area-context
Framework build type is static library
Configuring the target with the New Architecture
[Codegen] Analyzing /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/package.json
[Codegen] Searching for codegen-enabled libraries in the app.
[Codegen] The "codegenConfig" field is not defined in package.json. Assuming there is nothing to generate at the app level.
[Codegen] Searching for codegen-enabled libraries in the project dependencies.
[Codegen] Found @react-native-async-storage/async-storage
[Codegen] Found react-native
[Codegen] Found react-native-pager-view
[Codegen] Found react-native-safe-area-context
[Codegen] Found react-native-screens
[Codegen] Found react-native-svg
[Codegen] Found react-native-vector-icons
[Codegen] Searching for codegen-enabled libraries in react-native.config.js
[Codegen] Processing rnasyncstorage
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnasyncstorage
[Codegen] Processing FBReactNativeSpec
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Processing rncore
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Processing pagerview
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, visionos for pagerview
[Codegen] Processing safeareacontext
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for safeareacontext
[Codegen] Processing rnscreens
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, tvos, visionos for rnscreens
[Codegen] Processing rnsvg
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, macos, tvos, visionos for rnsvg
[Codegen] Processing RNVectorIconsSpec
[Codegen] Searching for podspec in the project dependencies.
[Codegen] Supported Apple platforms: ios, tvos, visionos for RNVectorIconsSpec
[Codegen] Generating Native Code for rnasyncstorage - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] [Codegen - FBReactNativeSpec] Skipping iOS code generation for FBReactNativeSpec as it has been generated already.
[Codegen] [Codegen - rncore] Skipping iOS code generation for rncore as it has been generated already.
[Codegen] Generating Native Code for pagerview - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] Generating Native Code for safeareacontext - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] Generating Native Code for rnscreens - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] Generating Native Code for rnsvg - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] Generating Native Code for RNVectorIconsSpec - ios
[Codegen] Generated artifacts: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios
[Codegen] Generating RCTThirdPartyComponentsProvider.h
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTThirdPartyComponentsProvider.h
[Codegen] Generating RCTThirdPartyComponentsProvider.mm
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTThirdPartyComponentsProvider.mm
[Codegen] Generating RCTModulesProvider.h
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTModuleProviders.h
[Codegen] Generating RCTModuleProviders.mm
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTModuleProviders.mm
[Codegen] Generating RCTAppDependencyProvider
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTAppDependencyProvider.h
[Codegen] Generated artifact: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/RCTAppDependencyProvider.mm
[Codegen] Generated podspec: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/ReactAppDependencyProvider.podspec
[Codegen] Generated podspec: /Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/ios/build/generated/ios/ReactCodegen.podspec
[Codegen] Done.
Analyzing dependencies
Fetching podspec for DoubleConversion from ../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec
Fetching podspec for RCT-Folly from ../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec
Fetching podspec for boost from ../node_modules/react-native/third-party-podspecs/boost.podspec
Fetching podspec for fast_float from ../node_modules/react-native/third-party-podspecs/fast_float.podspec
Fetching podspec for fmt from ../node_modules/react-native/third-party-podspecs/fmt.podspec
Fetching podspec for glog from ../node_modules/react-native/third-party-podspecs/glog.podspec
Fetching podspec for hermes-engine from ../node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec
[Hermes] Using release tarball from URL: https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/0.79.1/react-native-artifacts-0.79.1-hermes-ios-debug.tar.gz
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 29.0M  100 29.0M    0     0  6362k      0  0:00:04  0:00:04 --:--:-- 6455k
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 20.1M  100 20.1M    0     0  6479k      0  0:00:03  0:00:03 --:--:-- 6481k
Downloading dependencies
Installing DoubleConversion (1.1.6)
Installing FBLazyVector (0.79.1)
Installing RCT-Folly (2024.11.18.00)
Installing RCTDeprecation (0.79.1)
Installing RCTRequired (0.79.1)
Installing RCTTypeSafety (0.79.1)
Installing RNCAsyncStorage (2.1.2)
Installing RNCPushNotificationIOS (1.11.0)
Installing RNSVG (15.11.2)
Installing RNScreens (4.10.0)
Installing RNVectorIcons (10.2.0)
Installing React (0.79.1)
Installing React-Core (0.79.1)
Installing React-CoreModules (0.79.1)
Installing React-Fabric (0.79.1)
Installing React-FabricComponents (0.79.1)
Installing React-FabricImage (0.79.1)
Installing React-ImageManager (0.79.1)
Installing React-Mapbuffer (0.79.1)
Installing React-NativeModulesApple (0.79.1)
Installing React-RCTActionSheet (0.79.1)
Installing React-RCTAnimation (0.79.1)
Installing React-RCTAppDelegate (0.79.1)
Installing React-RCTBlob (0.79.1)
Installing React-RCTFBReactNativeSpec (0.79.1)
Installing React-RCTFabric (0.79.1)
Installing React-RCTImage (0.79.1)
Installing React-RCTLinking (0.79.1)
Installing React-RCTNetwork (0.79.1)
Installing React-RCTRuntime (0.79.1)
Installing React-RCTSettings (0.79.1)
Installing React-RCTText (0.79.1)
Installing React-RCTVibration (0.79.1)
Installing React-RuntimeApple (0.79.1)
Installing React-RuntimeCore (0.79.1)
Installing React-RuntimeHermes (0.79.1)
Installing React-callinvoker (0.79.1)
Installing React-cxxreact (0.79.1)
Installing React-debug (0.79.1)
Installing React-defaultsnativemodule (0.79.1)
Installing React-domnativemodule (0.79.1)
Installing React-featureflags (0.79.1)
Installing React-featureflagsnativemodule (0.79.1)
Installing React-graphics (0.79.1)
Installing React-hermes (0.79.1)
Installing React-idlecallbacksnativemodule (0.79.1)
Installing React-jserrorhandler (0.79.1)
Installing React-jsi (0.79.1)
Installing React-jsiexecutor (0.79.1)
Installing React-jsinspector (0.79.1)
Installing React-jsinspectortracing (0.79.1)
Installing React-jsitooling (0.79.1)
Installing React-jsitracing (0.79.1)
Installing React-logger (0.79.1)
Installing React-microtasksnativemodule (0.79.1)
Installing React-oscompat (0.79.1)
Installing React-perflogger (0.79.1)
Installing React-performancetimeline (0.79.1)
Installing React-rendererconsistency (0.79.1)
Installing React-renderercss (0.79.1)
Installing React-rendererdebug (0.79.1)
Installing React-rncore (0.79.1)
Installing React-runtimeexecutor (0.79.1)
Installing React-runtimescheduler (0.79.1)
Installing React-timing (0.79.1)
Installing React-utils (0.79.1)
Installing ReactAppDependencyProvider (0.79.1)
Installing ReactCodegen (0.79.1)
Installing ReactCommon (0.79.1)
Installing SocketRocket (0.7.1)
Installing Yoga (0.0.0)
Installing boost (1.84.0)
Installing fast_float (6.1.4)
Installing fmt (11.0.2)
Installing glog (0.3.5)
[!] /bin/bash -c 
set -e
#!/bin/bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -e

PLATFORM_NAME="${PLATFORM_NAME:-iphoneos}"
CURRENT_ARCH="${CURRENT_ARCH}"

if [ -z "$CURRENT_ARCH" ] || [ "$CURRENT_ARCH" == "undefined_arch" ]; then
    # Xcode 10 beta sets CURRENT_ARCH to "undefined_arch", this leads to incorrect linker arg.
    # it's better to rely on platform name as fallback because architecture differs between simulator and device

    if [[ "$PLATFORM_NAME" == *"simulator"* ]]; then
        CURRENT_ARCH="x86_64"
    else
        CURRENT_ARCH="arm64"
    fi
fi

# @lint-ignore-every TXT2 Tab Literal
if [ "$CURRENT_ARCH" == "arm64" ]; then
    cat <<\EOF >>fix_glog_0.3.5_apple_silicon.patch
diff --git a/config.sub b/config.sub
index 1761d8b..43fa2e8 100755
--- a/config.sub
+++ b/config.sub
@@ -1096,6 +1096,9 @@ case $basic_machine in
 		basic_machine=z8k-unknown
 		os=-sim
 		;;
+	arm64-*)
+		basic_machine=$(echo $basic_machine | sed 's/arm64/aarch64/')
+		;;
 	none)
 		basic_machine=none-none
 		os=-none
EOF

    patch -p1 config.sub fix_glog_0.3.5_apple_silicon.patch
fi

XCRUN="$(which xcrun || true)"
if [ -n "$XCRUN" ]; then
  export CC="$(xcrun -find -sdk $PLATFORM_NAME cc) -arch $CURRENT_ARCH -isysroot $(xcrun -sdk $PLATFORM_NAME --show-sdk-path)"
  export CXX="$CC"
else
  export CC="$CC:-$(which gcc)"
  export CXX="$CXX:-$(which g++ || true)"
fi
export CXX="$CXX:-$CC"

# Remove automake symlink if it exists
if [ -h "test-driver" ]; then
    rm test-driver
fi

# Manually disable gflags include to fix issue https://github.com/facebook/react-native/issues/28446
sed -i.bak -e 's/\@ac_cv_have_libgflags\@/0/' src/glog/logging.h.in && rm src/glog/logging.h.in.bak
sed -i.bak -e 's/HAVE_LIB_GFLAGS/HAVE_LIB_GFLAGS_DISABLED/' src/config.h.in && rm src/config.h.in.bak

./configure --host arm-apple-darwin || true

cat << EOF >> src/config.h
/* Add in so we have Apple Target Conditionals */
#ifdef __APPLE__
#include <TargetConditionals.h>
#include <Availability.h>
#endif

/* Special configuration for AppleTVOS */
#if TARGET_OS_TV
#undef HAVE_SYSCALL_H
#undef HAVE_SYS_SYSCALL_H
#undef OS_MACOSX
/* NO_THREADS needed right now for Xcode 16 */
#define NO_THREADS
#endif

/* Special configuration for ucontext */
#undef HAVE_UCONTEXT_H
#undef PC_FROM_UCONTEXT
#if defined(__x86_64__)
#define PC_FROM_UCONTEXT uc_mcontext->__ss.__rip
#elif defined(__i386__)
#define PC_FROM_UCONTEXT uc_mcontext->__ss.__eip
#endif
EOF

# Prepare exported header include
EXPORTED_INCLUDE_DIR="exported/glog"
mkdir -p exported/glog
cp -f src/glog/log_severity.h "$EXPORTED_INCLUDE_DIR/"
cp -f src/glog/logging.h "$EXPORTED_INCLUDE_DIR/"
cp -f src/glog/raw_logging.h "$EXPORTED_INCLUDE_DIR/"
cp -f src/glog/stl_logging.h "$EXPORTED_INCLUDE_DIR/"
cp -f src/glog/vlog_is_on.h "$EXPORTED_INCLUDE_DIR/"

/bin/bash: line 44: 27362 Killed: 9               patch -p1 config.sub fix_glog_0.3.5_apple_silicon.patch

(base) minamasoumi@umroots-Mac-mini ios % cd ../node_modules/react-native/third-party-podspecs/
open glog.podspec

No application knows how to open URL file:///Users/minamasoumi/Projects/wellmed-app/mobile/WellMed/node_modules/react-native/third-party-podspecs/glog.podspec (Error Domain=NSOSStatusErrorDomain Code=-10814 "kLSApplicationNotFoundErr: E.g. no application claims the file" UserInfo={_LSLine=1796, _LSFunction=runEvaluator}).
(base) minamasoumi@umroots-Mac-mini third-party-podspecs % 

ChatGPT said:
It looks like your pod install process is mostly successful until it hits an issue while patching glog (Google Logging) for Apple Silicon (M1/M2/M3 Macs). Specifically, this line:

arduino
Copy code
/bin/bash: line 44: 27362 Killed: 9               patch -p1 config.sub fix_glog_0.3.5_apple_silicon.patch
This means the patching process was killed—often due to memory constraints, sandbox restrictions, or issues with permissions.

What's Going On?
React Native tries to patch glog to make it build properly on Apple Silicon. The script creates a patch and then attempts to apply it to config.sub, but something kills the process mid-way.

✅ Fix Steps
Try the following to manually resolve this:

1. Clean glog and Pods
bash
Copy code
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ~/Library/Caches/CocoaPods
rm -rf ios/build
cd ios
pod deintegrate
2. Install Patch Command (if missing or outdated)
Make sure patch is installed and not broken:

bash
Copy code
brew install patch
3. Install Pods with Environment Flags
Try installing pods while explicitly disabling post-installation patching to avoid it breaking midway:

bash
Copy code
export REACT_NATIVE_DISABLE_GLOG_PATCH=1
pod install