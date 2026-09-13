import React, { useState, useRef, useEffect } from 'react';
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
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles as premiumStyles } from '../../styling/screens/auth/LoginScreenPremiumStyles';
import api from '../../services/api';

const VerifyOtpScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Move to next input
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp: otpValue });
      if (response.data.success) {
        navigation.navigate('ResetPassword', { email, otp: otpValue });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        Alert.alert('Success', 'A new OTP has been sent to your email');
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputs.current[0].focus();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={premiumStyles['login-premium-container']}
    >
      <ScrollView contentContainerStyle={premiumStyles['login-premium-scroll']} showsVerticalScrollIndicator={false}>
        <View style={[premiumStyles['login-premium-header'], { paddingBottom: 20 }]}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 24, zIndex: 10 }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <View style={[premiumStyles['login-premium-logo-container'], { marginTop: 40 }]}>
            <View style={[premiumStyles['login-premium-logo-wrapper'], { width: 80, height: 80, borderRadius: 40 }]}>
              <Icon name="mail-unread" size={40} color="#D4AF37" />
            </View>
          </View>
          <Text style={premiumStyles['login-premium-title']}>Verify OTP</Text>
          <Text style={[premiumStyles['login-premium-subtitle'], { textAlign: 'center', paddingHorizontal: 20 }]}>
            We've sent a 6-digit code to{'\n'}<Text style={{ fontWeight: 'bold', color: '#1F2937' }}>{email}</Text>
          </Text>
        </View>

        <View style={premiumStyles['login-premium-form']}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpBox}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                ref={(input) => (inputs.current[index] = input)}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[premiumStyles['login-premium-button'], isLoading && premiumStyles['login-premium-button-disabled'], { marginTop: 30 }]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
              <Text style={premiumStyles['login-premium-button-text']}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color="#5E5CE6" />
              ) : (
                <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendLink: {
    color: '#5E5CE6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  }
});

export default VerifyOtpScreen;
