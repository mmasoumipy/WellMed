/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import PushNotification from 'react-native-push-notification';

// export const scheduleMonthlyMBIReminder = () => {
//     PushNotification.localNotificationSchedule({
//       channelId: 'mbi-reminder-channel',
//       title: 'Monthly MBI Check-in',
//       message: 'It’s time for your monthly Maslach Burnout Inventory assessment!',
//       date: new Date(Date.now() + 60 * 1000), // schedule for 1 minute from now

//       repeatType: 'month', // repeat every month
//     });
//   };

AppRegistry.registerComponent(appName, () => App);
