// ============================================
// mobile/src/utils/notifications.js
// ============================================
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PermissionsAndroid, Platform } from 'react-native';
import api from '../services/api';

// Request Notification Permission
export const requestUserPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      await getFCMToken();
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      await getFCMToken();
    }
  }
};

// Get FCM token and store it
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    await AsyncStorage.setItem('fcmToken', token);
    
    // Send token to backend if user is already authenticated
    const authToken = await AsyncStorage.getItem('token');
    if (authToken) {
      try {
        await api.put('/users/fcm-token', { fcmToken: token });
        console.log('FCM Token successfully synced to backend');
      } catch (err) {
        console.error('Failed to sync FCM token to backend:', err);
      }
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Create Android notification channel
export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
};

// Foreground & background listener setup
export const notificationListener = () => {
  // Foreground messages
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground message:', remoteMessage);

    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
      },
    });
  });

  // Handle token refresh
  messaging().onTokenRefresh(async (token) => {
    console.log('FCM Token Refreshed:', token);
    await AsyncStorage.setItem('fcmToken', token);
    
    const authToken = await AsyncStorage.getItem('token');
    if (authToken) {
      try {
        await api.put('/users/fcm-token', { fcmToken: token });
        console.log('Refreshed FCM Token successfully synced to backend');
      } catch (err) {
        console.error('Failed to sync refreshed FCM token to backend:', err);
      }
    }
  });

  // Background messages are handled in index.js
  // messaging().setBackgroundMessageHandler(...) goes in index.js
};
