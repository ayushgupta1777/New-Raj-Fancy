import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../services/api';

const AdminPushNotificationsScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both title and message.');
      return;
    }

    Alert.alert(
      'Confirm Broadcast',
      'Are you sure you want to send this push notification to all users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const res = await api.post('/admin/notifications/broadcast', {
                title,
                message
              });
              
              Alert.alert('Success', res.data?.message || 'Notification broadcast sent successfully!');
              setTitle('');
              setMessage('');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to send notification. Please check if push notifications are enabled.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Notification</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.infoText}>
            Send a promotional or custom push notification to all users who have the app installed.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notification Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Flash Sale is LIVE! ⚡"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notification Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Get flat 50% off on all Jewellery collections today."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, (!title.trim() || !message.trim()) && styles.disabledBtn]}
            onPress={handleSendNotification}
            disabled={isLoading || !title.trim() || !message.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="paper-plane-outline" size={20} color="#fff" />
                <Text style={styles.sendBtnText}>Broadcast to All Users</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: { padding: 20 },
  infoText: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 8, padding: 12, fontSize: 16, color: '#1F2937'
  },
  textArea: { height: 120 },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, marginTop: 10, gap: 8
  },
  disabledBtn: { backgroundColor: '#9CA3AF' },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default AdminPushNotificationsScreen;
