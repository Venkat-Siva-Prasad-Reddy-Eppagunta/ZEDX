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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const { updateTempUserData } = useAuth();

  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {
    if (!first_name.trim()) return Alert.alert('Error', 'Enter first name');
    if (!last_name.trim()) return Alert.alert('Error', 'Enter last name');
    if (!validateEmail(email)) return Alert.alert('Error', 'Invalid email');
    if (!password.trim()) return Alert.alert('Error', 'Enter password');
    if (!agreedToTerms) return Alert.alert('Error', 'Accept terms');

    setIsLoading(true);

    try {
      updateTempUserData({
        first_name,
        last_name,
        email,
        password,
        agreedToTerms,
        isVerified: true,
      });

      const res = await fetch('http://Venkatas-MacBook-Air.local:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          isVerified: true,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) throw new Error(data.error || 'Signup failed');

      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join ZEDX to manage all your credit cards
          </Text>

          {/* Inputs */}
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#666"
            value={first_name}
            onChangeText={setFirst_name}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#666"
            value={last_name}
            onChangeText={setLast_name}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Terms */}
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.checkboxContainer}
          >
            <View style={styles.checkboxBox}>
              {agreedToTerms ? (
                <Check size={16} color="#4CAF50" />
              ) : (
                <Square size={20} color="#666" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I agree to Terms and Privacy Policy
            </Text>
          </TouchableOpacity>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            style={[styles.button, isLoading && { opacity: 0.6 }]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Login Redirect 
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>*/}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    padding: 20,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#FFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#666',
  },
  checkboxText: {
    color: '#999',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  loginText: {
    color: '#888',
    textAlign: 'center',
  },
  loginTextHighlight: {
    color: '#4CAF50',
  },
});