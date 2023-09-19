import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'; 

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);


  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== 'granted') {
        alert('You need to enable permissions in settings');
        return;
      }
      //const { expoProjectId } = Constants.extra.expo.expoProjectId;
      const expoProjectId = 'fb5cfb19-f9d4-47b2-b56d-026de4619aa2';
      if (!expoProjectId) {
        alert('Project ID is not defined in app configuration.');
        return;
      }
    
      const token = await Notifications.getExpoPushTokenAsync({ expoProjectId });
      setExpoPushToken(token.data);
    };

    registerForPushNotificationsAsync();

    const notificationSubscription = Notifications.addNotificationReceivedListener(setNotification);
  
    return () => {
      Notifications.removeNotificationSubscription(notificationSubscription);
    };
  }, []);

  return { expoPushToken, notification };
};
