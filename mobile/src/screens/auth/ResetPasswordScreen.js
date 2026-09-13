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

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword: password });
      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Your password has been reset successfully. Please log in with your new password.',
          [{ text: 'Log In', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
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
              <Icon name="key" size={40} color="#D4AF37" />
            </View>
          </View>
          <Text style={styles['login-premium-title']}>Set New Password</Text>
          <Text style={[styles['login-premium-subtitle'], { textAlign: 'center', paddingHorizontal: 20 }]}>
            Create a new, strong password for your account.
          </Text>
        </View>

        <View style={styles['login-premium-form']}>
          <View style={styles['login-premium-input-group']}>
            <Text style={styles['login-premium-input-label']}>New Password</Text>
            <View style={styles['login-premium-input-container']}>
              <Icon name="lock-closed-outline" size={20} color="#5E5CE6" style={styles['login-premium-input-icon']} />
              <TextInput
                style={styles['login-premium-input-field']}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles['login-premium-eye-button']}>
                <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles['login-premium-input-group']}>
            <Text style={styles['login-premium-input-label']}>Confirm Password</Text>
            <View style={styles['login-premium-input-container']}>
              <Icon name="checkmark-circle-outline" size={20} color="#5E5CE6" style={styles['login-premium-input-icon']} />
              <TextInput
                style={styles['login-premium-input-field']}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles['login-premium-eye-button']}>
                <Icon name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles['login-premium-button'], isLoading && styles['login-premium-button-disabled'], { marginTop: 10 }]}
            onPress={handleReset}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <Text style={styles['login-premium-button-text']}>Reset Password</Text>
                <Icon name="checkmark" size={20} color="#fff" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
