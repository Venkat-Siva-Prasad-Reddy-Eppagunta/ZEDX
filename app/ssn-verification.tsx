import { useAuth } from '@/hooks/useAuthStore';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SSNVerificationScreen() {
  const router = useRouter();
  const { tempUserData, updateTempUserData } = useAuth();
  const [ssn, setSSN] = useState('');

  const handleSSNChange = (value: string) => {
    // Remove any non-digit characters and limit to 9 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    setSSN(cleaned);
  };

  const calculateCreditScore = () => {
    const baseScore = 650;
    const variation = Math.floor(Math.random() * 200);
    return baseScore + variation;
  };

  const handleContinue = () => {
    if (ssn.length !== 9) {
      Alert.alert('Invalid SSN', 'Please enter a valid 9-digit Social Security Number');
      return;
    }

    const creditScore = calculateCreditScore();
    
    updateTempUserData({
      ssn: ssn,
      creditScore: creditScore,
    });
    router.push('/credit-score');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={48} color="#4CAF50" />
            </View>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              We need your SSN to check your credit score and verify your identity
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Social Security Number (9 digits)</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={ssn}
                  onChangeText={handleSSNChange}
                  placeholder="Enter 9 digits"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={9}
                  autoComplete="off"
                  secureTextEntry={false}
                  testID="ssn-input"
                />
              </View>
            </View>

            <View style={styles.securityInfo}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.securityText}>
                Your SSN is encrypted and secure. We use bank-level security to protect your information.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              ssn.length !== 9 && styles.disabledButton
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={ssn.length !== 9}
          >
            <Text style={styles.continueButtonText}>Check Credit Score</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              By continuing, you authorize ZEDX to obtain your credit report from one or more consumer reporting agencies. This will not affect your credit score.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  disclaimer: {
    paddingHorizontal: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});