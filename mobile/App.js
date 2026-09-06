// ============================================
// mobile/App.js
// ============================================
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { requestUserPermission, notificationListener, createNotificationChannel } from './src/utils/notifications';



const linking = {
  prefixes: ['https://newrajfancystore.adsngrow.in', 'rajfancy://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              ProductDetails: 'product/:productId',
              // AIAssistant: 'ai-assistant',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
        }
      }
    },
  },
};

const App = () => {
  useEffect(() => {
    // Create Android notification channel
    createNotificationChannel();

    // Request notification permission
    requestUserPermission();

    // Listen for notifications
    notificationListener();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;