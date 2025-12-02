import { useAuth } from '@/hooks/useAuthStore';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { updateTempUserData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContinue = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    updateTempUserData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      agreedToTerms: true,
    });

    router.push('/verify-otp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join ZEDX to manage all your credit cards
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                testID="first-name-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                testID="last-name-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />
            </View>

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {agreedToTerms ? (
                  <Check size={16} color="#4CAF50" />
                ) : (
                  <Square size={20} color="#666" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text style={styles.link}>Terms and Conditions</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!firstName || !lastName || !email || !agreedToTerms) && styles.disabledButton
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!firstName || !lastName || !email || !agreedToTerms}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.footer}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  link: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
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
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});