import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const DevControlPanelScreen = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [forgotPasswordEnabled, setForgotPasswordEnabled] = useState(false);
  const [aiChatEnabled, setAiChatEnabled] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [pushToggling, setPushToggling] = useState(false);
  const [forgotPasswordToggling, setForgotPasswordToggling] = useState(false);
  const [aiChatToggling, setAiChatToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/dev/maintenance/status'),
      api.get('/settings/push_notifications_enabled'),
      api.get('/settings/forgot_password_enabled'),
      api.get('/settings/ai_chat_enabled')
    ]).then(([mRes, sRes, fpRes, acRes]) => {
      setMaintenance(mRes.data.data.maintenanceMode);
      setPushEnabled(sRes.data?.data?.value === true);
      setForgotPasswordEnabled(fpRes.data?.data?.value === true);
      setAiChatEnabled(acRes.data?.data?.value === true);
    }).catch((e) => console.log('Error fetching settings:', e))
    .finally(() => setLoading(false));
  }, []);

  const handleMaintenanceToggle = async () => {
    Alert.alert(
      '⚠ MAINTENANCE MODE',
      maintenance ? 'RESTORE APP TO LIVE?' : 'TAKE APP OFFLINE FOR ALL USERS?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'CONFIRM', style: 'destructive', onPress: async () => {
            try {
              setToggling(true);
              const res = await api.post('/dev/maintenance/toggle');
              setMaintenance(res.data.data.maintenanceMode);
              Alert.alert('DONE', res.data.data.message);
            } catch (e) { Alert.alert('ERROR', 'TOGGLE FAILED'); }
            finally { setToggling(false); }
          }
        }
      ]
    );
  };

  const handlePushToggle = async (val) => {
    setPushEnabled(val);
    setPushToggling(true);
    try {
      await api.put('/settings', {
        key: 'push_notifications_enabled',
        value: val,
        description: 'Master switch to globally enable or disable Firebase Push Notifications'
      });
    } catch (e) {
      setPushEnabled(!val);
      Alert.alert('ERROR', 'FAILED TO TOGGLE PUSH');
    } finally {
      setPushToggling(false);
    }
  };

  const handleForgotPasswordToggle = async (val) => {
    setForgotPasswordEnabled(val);
    setForgotPasswordToggling(true);
    try {
      await api.put('/settings', {
        key: 'forgot_password_enabled',
        value: val,
        description: 'Master switch to enable/disable Forgot Password feature'
      });
    } catch (e) {
      setForgotPasswordEnabled(!val);
      Alert.alert('ERROR', 'FAILED TO TOGGLE FORGOT PASSWORD');
    } finally {
      setForgotPasswordToggling(false);
    }
  };

  const handleAiChatToggle = async (val) => {
    setAiChatEnabled(val);
    setAiChatToggling(true);
    try {
      await api.put('/settings', {
        key: 'ai_chat_enabled',
        value: val,
        description: 'Master switch to enable/disable AI Shopping Assistant'
      });
    } catch (e) {
      setAiChatEnabled(!val);
      Alert.alert('ERROR', 'FAILED TO TOGGLE AI CHAT');
    } finally {
      setAiChatToggling(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Maintenance Mode */}
      <View style={[s.controlCard, maintenance && s.dangerCard]}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>MAINTENANCE_MODE</Text>
          <Text style={s.controlSub}>{maintenance ? '🔴 APP IS OFFLINE' : '🟢 APP IS LIVE'}</Text>
          <Text style={s.controlDesc}>When ON, all users will see a maintenance message and cannot use the app.</Text>
        </View>
        {toggling
          ? <ActivityIndicator color="#fff" />
          : <Switch
              value={maintenance}
              onValueChange={handleMaintenanceToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FF3B30' }}
              thumbColor={maintenance ? '#fff' : '#fff'}
            />
        }
      </View>

      {/* Push Notifications Toggle */}
      <View style={[s.controlCard, !pushEnabled && s.dangerCard]}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>PUSH_NOTIFICATIONS</Text>
          <Text style={s.controlSub}>{pushEnabled ? '🟢 SYSTEM ENABLED' : '🔴 SYSTEM DISABLED'}</Text>
          <Text style={s.controlDesc}>Master switch to enable/disable Firebase push notifications globally.</Text>
        </View>
        {pushToggling
          ? <ActivityIndicator color="#fff" />
          : <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#10B981' }}
              thumbColor={pushEnabled ? '#fff' : '#fff'}
            />
        }
      </View>

      {/* Forgot Password Toggle */}
      <View style={[s.controlCard, !forgotPasswordEnabled && s.dangerCard]}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>FORGOT_PASSWORD_FEATURE</Text>
          <Text style={s.controlSub}>{forgotPasswordEnabled ? '🟢 SYSTEM ENABLED' : '🔴 SYSTEM DISABLED'}</Text>
          <Text style={s.controlDesc}>Master switch to show/hide the Forgot Password option on login screen.</Text>
        </View>
        {forgotPasswordToggling
          ? <ActivityIndicator color="#fff" />
          : <Switch
              value={forgotPasswordEnabled}
              onValueChange={handleForgotPasswordToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#10B981' }}
              thumbColor={forgotPasswordEnabled ? '#fff' : '#fff'}
            />
        }
      </View>

      {/* AI Chat Toggle */}
      <View style={[s.controlCard, !aiChatEnabled && s.dangerCard]}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>AI_SHOPPING_ASSISTANT</Text>
          <Text style={s.controlSub}>{aiChatEnabled ? '🟢 SYSTEM ENABLED' : '🔴 SYSTEM DISABLED'}</Text>
          <Text style={s.controlDesc}>Master switch to show/hide the AI Assistant feature in user profiles.</Text>
        </View>
        {aiChatToggling
          ? <ActivityIndicator color="#fff" />
          : <Switch
              value={aiChatEnabled}
              onValueChange={handleAiChatToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#10B981' }}
              thumbColor={aiChatEnabled ? '#fff' : '#fff'}
            />
        }
      </View>

      {/* Danger zone */}
      <Text style={s.dangerZone}>⚠ DANGER_ZONE</Text>
      <View style={[s.controlCard, s.dangerCard]}>
        <Icon name="warning-outline" size={24} color="#FF3B30" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.controlTitle, { color: '#FF3B30' }]}>MASS_DATA_ACTIONS</Text>
          <Text style={s.controlDesc}>Actions here affect all users. Use with extreme caution.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  controlCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  dangerCard: { borderColor: '#FF3B30' },
  controlTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  controlSub: { color: '#fff', fontSize: 12, marginBottom: 6, fontWeight: 'bold' },
  controlDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 16 },
  dangerZone: { color: '#FF3B30', fontSize: 10, letterSpacing: 2, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
});

export default DevControlPanelScreen;
