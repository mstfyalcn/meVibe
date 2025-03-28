import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, scheduleMotivationNotification } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await scheduleMotivationNotification();
      }
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  return <AppNavigator />;
}
