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
