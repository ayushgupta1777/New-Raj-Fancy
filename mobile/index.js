// /**
//  * @format
//  */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  try {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      body: remoteMessage.notification?.body || '',
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
      },
    });
  } catch (error) {
    console.log('Background notification error:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
