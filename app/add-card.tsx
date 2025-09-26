import { theme } from '@/constants/theme';
import { useCards } from '@/hooks/useCardsStore';
import { CreditCard } from '@/types/card';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
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

const BANKS = [
  { name: 'Chase Sapphire', color: 'chase', networks: ['Visa', 'Mastercard'] },
  { name: 'American Express', color: 'amex', networks: ['American Express'] },
  { name: 'Citi Double Cash', color: 'citi', networks: ['Visa', 'Mastercard'] },
  { name: 'Wells Fargo', color: 'wellsfargo', networks: ['Visa', 'Mastercard'] },
  { name: 'Bank of America', color: 'bankofamerica', networks: ['Visa', 'Mastercard'] },
  { name: 'Capital One', color: 'capitalone', networks: ['Visa', 'Mastercard'] },
  { name: 'Discover', color: 'discover', networks: ['Discover'] },
  { name: 'US Bank', color: 'usbank', networks: ['Visa', 'Mastercard'] },
];

export default function AddCardScreen() {
  const { addCard, cards } = useCards();
  //const { user } = useAuth();
  const [selectedBank, setSelectedBank] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cardType, setCardType] = useState('');

  const handleAddCard = () => {
    if (!selectedBank || !cardNumber || !cardHolder || !creditLimit || !cardType) {
      Alert.alert('Missing Information', 'Please fill all fields');
      return;
    }

    if (cardNumber.length !== 4) {
      Alert.alert('Invalid Card Number', 'Please enter last 4 digits of your card');
      return;
    }

    const bank = BANKS.find(b => b.name === selectedBank);
    const newCard: CreditCard = {
      id: Date.now().toString(),
      bankName: selectedBank,
      cardNumber: cardNumber,
      cardHolder: cardHolder.toUpperCase(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      outstandingAmount: 0,
      minimumDue: 0,
      creditLimit: parseFloat(creditLimit),
      availableCredit: parseFloat(creditLimit),
      color: bank?.color || 'chase',
      cardType: cardType,
    };

    addCard(newCard);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // If this is the first card being added, navigate to home tab
    // Otherwise, just go back
    if (cards.length !== 0) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const getAvailableCardTypes = () => {
    const bank = BANKS.find(b => b.name === selectedBank);
    return bank ? bank.networks : [];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Bank</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.banksScroll}
            >
              {BANKS.map((bank) => (
                <TouchableOpacity
                  key={bank.name}
                  style={[
                    styles.bankOption,
                    selectedBank === bank.name && styles.bankOptionSelected
                  ]}
                  onPress={() => setSelectedBank(bank.name)}
                >
                  <Text style={[
                    styles.bankOptionText,
                    selectedBank === bank.name && styles.bankOptionTextSelected
                  ]}>
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number (Last 4 digits)</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="XXXX"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="JOHN DOE"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Credit Limit</Text>
            <TextInput
              style={styles.input}
              value={creditLimit}
              onChangeText={setCreditLimit}
              placeholder="15000"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.banksScroll}
            >
              {getAvailableCardTypes().map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.bankOption,
                    cardType === type && styles.bankOptionSelected
                  ]}
                  onPress={() => setCardType(type)}
                >
                  <Text style={[
                    styles.bankOptionText,
                    cardType === type && styles.bankOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  banksScroll: {
    flexGrow: 0,
  },
  bankOption: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  bankOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bankOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  bankOptionTextSelected: {
    color: theme.colors.background,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.background,
  },
  cancelButton: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});