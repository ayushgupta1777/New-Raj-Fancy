import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import api from '../services/api';

const useDailyStreakTracker = () => {
  const appState = useRef(AppState.currentState);
  const sessionStartTime = useRef(null);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    // Only track if user is logged in
    if (!token) return;

    if (appState.current === 'active') {
      sessionStartTime.current = Date.now();
    }

    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        sessionStartTime.current = Date.now();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background
        if (sessionStartTime.current) {
          const durationSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);
          sessionStartTime.current = null;
          
          if (durationSeconds > 0) {
            await saveLocalSession(durationSeconds);
            syncSessions(); // Fire and forget sync
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial sync check
    syncSessions();

    return () => {
      subscription.remove();
      // On unmount (like hot reload), attempt to save if active
      if (appState.current === 'active' && sessionStartTime.current) {
        const durationSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        saveLocalSession(durationSeconds);
      }
    };
  }, [token]);

  const saveLocalSession = async (seconds) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const session = { dateString: today, addedSeconds: seconds, id: Date.now().toString() };
      
      const existingStr = await AsyncStorage.getItem('@streak_pending_sessions');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      existing.push(session);
      await AsyncStorage.setItem('@streak_pending_sessions', JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save local session', e);
    }
  };

  const syncSessions = async () => {
    try {
      const existingStr = await AsyncStorage.getItem('@streak_pending_sessions');
      if (!existingStr) return;
      
      const sessions = JSON.parse(existingStr);
      if (sessions.length === 0) return;

      // Group by dateString
      const grouped = sessions.reduce((acc, curr) => {
        if (!acc[curr.dateString]) acc[curr.dateString] = 0;
        acc[curr.dateString] += curr.addedSeconds;
        return acc;
      }, {});

      const payload = Object.keys(grouped).map(dateString => ({
        dateString,
        addedSeconds: grouped[dateString]
      }));

      const res = await api.post('/streak/sync', { sessions: payload });
      if (res.data.success) {
        // Only clear if successful
        await AsyncStorage.removeItem('@streak_pending_sessions');
      }
    } catch (e) {
      // Failed to sync (offline, etc) - leave it in AsyncStorage for next time
    }
  };
};

export default useDailyStreakTracker;
