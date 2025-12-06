import { theme } from '@/constants/theme';
import { PaymentSourceType } from '@/types/card';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Building2, CheckCircle, CreditCard as CreditCardIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddPaymentSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (source: {
    type: PaymentSourceType;
    name: string;
    last4: string;
    bankName: string;
    accountType?: string;
  }) => void;
  sourceType: PaymentSourceType;
}

const { height } = Dimensions.get('window');

export function AddPaymentSourceModal({ visible, onClose, onAdd, sourceType }: AddPaymentSourceModalProps) {
  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const successScale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setName('');
      setLast4('');
      setBankName('');
      setAccountType('');
    }
  }, [visible, slideAnim]);

  const handleAdd = () => {
    if (!name.trim() || !last4.trim() || !bankName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (last4.length !== 4 || !/^\d+$/.test(last4)) {
      Alert.alert('Error', 'Last 4 digits must be 4 numeric characters');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onAdd({
      type: sourceType,
      name,
      last4,
      bankName,
      accountType: sourceType === 'bank_account' ? accountType : undefined,
    });

    setShowSuccess(true);
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();

    setTimeout(() => {
      setShowSuccess(false);
      successScale.setValue(0);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <BlurView intensity={20} style={styles.container}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {!showSuccess ? (
                <>
                  <View style={styles.header}>
                    <View style={styles.titleContainer}>
                      {sourceType === 'debit_card' ? (
                        <CreditCardIcon size={24} color={theme.colors.primary} />
                      ) : (
                        <Building2 size={24} color={theme.colors.primary} />
                      )}
                      <Text style={styles.title}>
                        Add {sourceType === 'debit_card' ? 'Debit Card' : 'Bank Account'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <X size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder={sourceType === 'debit_card' ? 'e.g., Personal Debit' : 'e.g., Main Checking'}
                      placeholderTextColor={theme.colors.textMuted}
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput
                      style={styles.input}
                      value={bankName}
                      onChangeText={setBankName}
                      placeholder="e.g., Bank of America"
                      placeholderTextColor={theme.colors.textMuted}
                      returnKeyType="next"
                    />
                  </View>

                  {sourceType === 'bank_account' && (
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Account Type</Text>
                      <TextInput
                        style={styles.input}
                        value={accountType}
                        onChangeText={setAccountType}
                        placeholder="e.g., Checking or Savings"
                        placeholderTextColor={theme.colors.textMuted}
                        returnKeyType="next"
                      />
                    </View>
                  )}

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Last 4 Digits</Text>
                    <TextInput
                      style={styles.input}
                      value={last4}
                      onChangeText={(text) => {
                        if (text.length <= 4) {
                          setLast4(text);
                        }
                      }}
                      placeholder="1234"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      maxLength={4}
                      returnKeyType="done"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAdd}
                  >
                    <Text style={styles.addButtonText}>Add Payment Source</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Animated.View style={{ transform: [{ scale: successScale }] }}>
                    <CheckCircle size={80} color={theme.colors.success} />
                  </Animated.View>
                  <Text style={styles.successTitle}>Successfully Added!</Text>
                  <Text style={styles.successMessage}>
                    You can now pay your bills using this {sourceType === 'debit_card' ? 'debit card' : 'bank account'}.
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: height * 0.95,
    minHeight: height * 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '500' as const,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  addButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.background,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  successTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  successMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 22,
  },
});
