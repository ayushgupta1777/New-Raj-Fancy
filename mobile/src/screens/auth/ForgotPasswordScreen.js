import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/auth/LoginScreenPremiumStyles';
import api from '../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your registered email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        Alert.alert('Success', 'OTP sent to your email address');
        navigation.navigate('VerifyOtp', { email });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles['login-premium-container']}
    >
      <ScrollView contentContainerStyle={styles['login-premium-scroll']} showsVerticalScrollIndicator={false}>
        <View style={[styles['login-premium-header'], { paddingBottom: 20 }]}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 24, zIndex: 10 }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <View style={[styles['login-premium-logo-container'], { marginTop: 40 }]}>
            <View style={[styles['login-premium-logo-wrapper'], { width: 80, height: 80, borderRadius: 40 }]}>
              <Icon name="lock-closed" size={40} color="#D4AF37" />
            </View>
          </View>
          <Text style={styles['login-premium-title']}>Forgot Password</Text>
          <Text style={[styles['login-premium-subtitle'], { textAlign: 'center', paddingHorizontal: 20 }]}>
            Enter the email address associated with your account and we'll send you an OTP to reset your password.
          </Text>
        </View>

        <View style={styles['login-premium-form']}>
          <View style={styles['login-premium-input-group']}>
            <Text style={styles['login-premium-input-label']}>Email Address</Text>
            <View style={styles['login-premium-input-container']}>
              <Icon name="mail-outline" size={20} color="#5E5CE6" style={styles['login-premium-input-icon']} />
              <TextInput
                style={styles['login-premium-input-field']}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles['login-premium-button'], isLoading && styles['login-premium-button-disabled'], { marginTop: 10 }]}
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <Text style={styles['login-premium-button-text']}>Send OTP</Text>
                <Icon name="paper-plane-outline" size={20} color="#fff" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
