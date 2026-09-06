import React, { useState, useEffect } from 'react';
import {
  View, Text, Switch, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../services/api';

const DeveloperSettingsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // /api/settings is the generic settings endpoint in the backend
      const res = await api.get('/settings/push_notifications_enabled');
      setPushEnabled(res.data?.data?.value === true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load developer settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePushNotifications = async (value) => {
    setPushEnabled(value);
    setIsSaving(true);
    try {
      await api.put('/settings', {
        key: 'push_notifications_enabled',
        value: value,
        description: 'Master switch to globally enable or disable Firebase Push Notifications'
      });
      // Optionally notify user
      // Alert.alert('Success', `Push notifications ${value ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      console.error(error);
      setPushEnabled(!value); // Revert switch on error
      Alert.alert('Error', 'Failed to update setting.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Developer Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.warningText}>
            ⚠️ These settings directly control backend system behavior. Only modify them if you know what you are doing.
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Push Notifications</Text>
              <Text style={styles.settingDesc}>
                Master switch. If disabled, the server will completely skip sending push notifications (Firebase) to all users, even on order completion.
              </Text>
            </View>
            <View style={styles.switchContainer}>
              {isSaving ? <ActivityIndicator size="small" color="#4F46E5" style={{ marginRight: 8 }} /> : null}
              <Switch
                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                thumbColor={pushEnabled ? '#4F46E5' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={togglePushNotifications}
                value={pushEnabled}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  warningText: { fontSize: 13, color: '#DC2626', marginBottom: 24, lineHeight: 20, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8 },
  settingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  settingInfo: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  settingDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  switchContainer: { flexDirection: 'row', alignItems: 'center' }
});

export default DeveloperSettingsScreen;
