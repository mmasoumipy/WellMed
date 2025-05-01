npm uninstall -g react-native-cli @react-native-community/cli
npm cache clean --force

# React Native uses TypeScript by default, so by using "--template react-native-template-typescript" we may cause conflicts with the default template.
npx @react-native-community/cli init WellMed


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


cd WellMed
npm install
npx pod-install ios





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
