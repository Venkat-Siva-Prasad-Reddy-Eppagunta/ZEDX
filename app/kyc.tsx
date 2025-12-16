import { useAuth } from '@/hooks/useAuthStore';
import { useCards } from '@/hooks/useCardsStore';
//import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Step = 1 | 2 | 3 | 4;

type KYCForm = {
  legal_first_name: string;
  legal_last_name: string;
  dob: string;
  ssn_last4: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  email: string;
};

export default function KYCScreen() {
  const router = useRouter();
  const { user, setUserVerified } = useAuth();
  const { setUserCards } = useCards();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  //const [showDOBPicker, setShowDOBPicker] = useState(false);

  const progress = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState<KYCForm>({
    legal_first_name: '',
    legal_last_name: '',
    dob: '',
    ssn_last4: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    email: user?.email || '',
  });

  const update = (key: keyof KYCForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  /* -------------------- Progress Animation -------------------- */

  useEffect(() => {
    Animated.timing(progress, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step, progress]);

  /* -------------------- Validation -------------------- */

  const validateStep = () => {
    if (step === 1 && (!form.legal_first_name || !form.legal_last_name || !form.dob)) {
      Alert.alert('Missing details', 'Please complete all fields.');
      return false;
    }
    if (step === 2 && form.ssn_last4.length !== 4) {
      Alert.alert('Invalid SSN', 'Enter the last 4 digits of your SSN.');
      return false;
    }
    if (
      step === 3 &&
      (!form.address_line1 || !form.city || !form.state || !form.postal_code)
    ) {
      Alert.alert('Incomplete address', 'Please complete your address.');
      return false;
    }
    return true;
  };

  /* -------------------- Submit -------------------- */

  const submitKYC = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);

      const res = await fetch(
        'http://Venkatas-MacBook-Air.local:5001/api/dwolla/customers',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      await setUserVerified(true);
      Alert.alert('Verification submitted', 'Identity verification completed.');
      if (user.is_verified && user.cards && user.cards.length > 0) {
        setUserCards(user.cards, user.first_name);
        router.replace('/(tabs)');
      } else if (!user.is_verified) {
        router.replace('/kyc');
      }
      else {
        router.replace('/add-card');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'KYC submission failed.');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Step Renderer -------------------- */

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Legal Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Legal First Name"
              placeholderTextColor="#777"
              value={form.legal_first_name}
              onChangeText={v => update('legal_first_name', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="Legal Last Name"
              placeholderTextColor="#777"
              value={form.legal_last_name}
              onChangeText={v => update('legal_last_name', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#777"
              value={form.dob}
              onChangeText={v => update('dob', v)}
            />
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.title}>SSN Verification</Text>
            <Text style={styles.subtitle}>Only last 4 digits are required</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
              placeholder="SSN Last 4"
              placeholderTextColor="#777"
              value={form.ssn_last4}
              onChangeText={v => update('ssn_last4', v.replace(/\D/g, ''))}
            />
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.title}>Residential Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              placeholderTextColor="#777"
              value={form.address_line1}
              onChangeText={v => update('address_line1', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor="#777"
              value={form.address_line2}
              onChangeText={v => update('address_line2', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#777"
              value={form.city}
              onChangeText={v => update('city', v)}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="State"
                placeholderTextColor="#777"
                value={form.state}
                maxLength={2}
                onChangeText={v => update('state', v.toUpperCase())}
              />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="ZIP"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={form.postal_code}
                onChangeText={v => update('postal_code', v.replace(/\D/g, ''))}
              />
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.title}>Review & Confirm</Text>

            <Text style={styles.review}>
              {form.legal_first_name} {form.legal_last_name}
            </Text>
            <Text style={styles.review}>{form.dob}</Text>
            <Text style={styles.review}>
              {form.address_line1}, {form.city}, {form.state} {form.postal_code}
            </Text>

            <Text style={styles.securityNote}>
              Your information is collected in accordance with PCI-DSS and
              banking regulations. We use it solely to create and verify your
              account with Dwolla, our regulated payment processor. ZEDX never
              stores full SSN details.
            </Text>
          </>
        );
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={{ marginTop: 40 }} />

          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [1, 4],
                    outputRange: ['25%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {renderStep()}

          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep(prev => (prev - 1) as Step)}
              >
                <Text style={styles.primaryText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {                
                if (!validateStep()) return;
                  if (step === 4) {
                    submitKYC();
                  } else {
                    setStep(prev => (prev + 1) as Step);
                  }
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>
                  {step === 4 ? 'Submit' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, padding: 20 },

  progressContainer: {
    height: 6,
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },

  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 12 },
  subtitle: { color: '#aaa', marginBottom: 20 },

  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222',
  },

  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 12,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
  },

  secondaryButton: {
    padding: 16,
    borderRadius: 28,
    backgroundColor: '#222',
    justifyContent: 'center',
  },

  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  review: { color: '#ddd', marginBottom: 8 },

  securityNote: {
    color: '#777',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 20,
  },
});