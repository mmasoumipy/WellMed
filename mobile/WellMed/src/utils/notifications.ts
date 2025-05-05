import PushNotification from 'react-native-push-notification';

export const scheduleMonthlyMBIReminder = () => {
  PushNotification.localNotificationSchedule({
    channelId: 'mbi-reminder-channel',
    title: 'Monthly MBI Check-in',
    message: 'It’s time for your monthly Maslach Burnout Inventory assessment!',
    date: new Date(Date.now() + 60 * 1000), // TEST: triggers in 1 minute
    repeatType: 'minute', // Repeat every month
  });
};
