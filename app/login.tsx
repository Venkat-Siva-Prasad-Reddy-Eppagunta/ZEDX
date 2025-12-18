import { useAuth } from '@/hooks/useAuthStore';
import { useCards } from '@/hooks/useCardsStore';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const { saveUser } = useAuth();
  const { setUserCards, setPaymentSources } = useCards();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleLogin = async () => {
  if (!validateEmail(email)) {
    return Alert.alert('Invalid Email', 'Please enter a valid email address.');
  }

  if (!password.trim()) {
    return Alert.alert('Invalid Password', 'Please enter your password.');
  }

  setLoading(true);

  try {
    // 1 Login
    const res = await fetch('http://Venkatas-MacBook-Air.local:5001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    const { token } = data;
    if (!token) throw new Error('Missing auth token');

    // 2 Fetch /me
    const meRes = await fetch(
      'http://Venkatas-MacBook-Air.local:5001/api/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const meData = await meRes.json();
    if (!meRes.ok) throw new Error(meData.message || 'Failed to fetch user');

    const { user, cards, fundingSources } = meData;


    // 3 Save user
    await saveUser({ ...user, token });

    // 4 Populate cards
    if (cards?.length) {
      await setUserCards(cards, user.first_name);
    }

    // 5 Populate bank accounts
    if (fundingSources?.length) {
      await setPaymentSources(fundingSources);
    }

    // 6 Routing
    if (!user.is_verified) {
      router.replace('/kyc');
    } else if (!cards?.length) {
      router.replace('/add-card');
    } else {
      router.replace('/(tabs)');
    }
  } catch (err: any) {
    Alert.alert('Login Error', err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, (!email || !password) && styles.disabledButton]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footer}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.footerText}>
              Don{'\''}t have an account? <Text style={styles.link}>Sign Up</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 20 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  form: { marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(76,175,80,0.3)',
  },
  loginButtonText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  footer: { alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 14, color: '#999' },
  link: { color: '#4CAF50', textDecorationLine: 'underline' },
});