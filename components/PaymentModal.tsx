import { SlotMachine } from '@/components/SlotMachine';
import { theme } from '@/constants/theme';
import { useCards } from '@/hooks/useCardsStore';
import { CreditCard } from '@/types/card';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { CheckCircle, X } from 'lucide-react-native';
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

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  card: CreditCard;
}

const { height } = Dimensions.get('window');

export function PaymentModal({ visible, onClose, card }: PaymentModalProps) {
  const { makePayment } = useCards();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [earnedCashback, setEarnedCashback] = useState(0);
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
    }
  }, [visible, slideAnim]);

  const handleQuickAmount = (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAmount(value.toString());
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (paymentAmount > card.outstandingAmount) {
      Alert.alert('Amount Exceeds Due', 'Payment amount cannot exceed outstanding amount');
      return;
    }

    setIsProcessing(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Simulate payment processing
    setTimeout(() => {
      makePayment({
        cardId: card.id,
        amount: paymentAmount,
      });

      setIsProcessing(false);

      // Check if payment is on time
      const dueDate = new Date(card.dueDate);
      const today = new Date();
      const isOnTime = today <= dueDate;

      if (isOnTime) {
        // Calculate cashback based on amount
        const cashback = paymentAmount * 0.02; // 2% for on-time payments
        setEarnedCashback(cashback);
        setShowSlotMachine(true);
      } else {
        // Show regular success message for late payments
        setShowSuccess(true);
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }).start();

        setTimeout(() => {
          onClose();
          setShowSuccess(false);
          setAmount('');
          successScale.setValue(0);
        }, 2000);
      }
    }, 1500);
  };

  const formatAmount = (value: number) => {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSlotMachineComplete = () => {
    setShowSlotMachine(false);
    setShowSuccess(true);
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();

    setTimeout(() => {
      onClose();
      setShowSuccess(false);
      setShowSlotMachine(false);
      setAmount('');
      setEarnedCashback(0);
      successScale.setValue(0);
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {showSlotMachine ? (
        <SlotMachine
          cashbackAmount={earnedCashback}
          onComplete={handleSlotMachineComplete}
        />
      ) : (
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
                    <Text style={styles.title}>Pay Bill</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <X size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.bankName}>{card.bankName}</Text>
                    <Text style={styles.cardNumber}>•••• {card.cardNumber}</Text>
                  </View>

                  <View style={styles.amountInfo}>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Total Due</Text>
                      <Text style={styles.amountValue}>${formatAmount(card.outstandingAmount)}</Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Minimum Due</Text>
                      <Text style={styles.amountValue}>${formatAmount(card.minimumDue)}</Text>
                    </View>
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Enter Amount</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.textMuted}
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={styles.quickAmounts}>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => handleQuickAmount(card.minimumDue)}
                    >
                      <Text style={styles.quickButtonText}>Min Due</Text>
                      <Text style={styles.quickButtonAmount}>${formatAmount(card.minimumDue)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => handleQuickAmount(card.outstandingAmount)}
                    >
                      <Text style={styles.quickButtonText}>Full Amount</Text>
                      <Text style={styles.quickButtonAmount}>${formatAmount(card.outstandingAmount)}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={isProcessing}
                  >
                    <Text style={styles.payButtonText}>
                      {isProcessing ? 'Processing...' : `Pay ${amount ? '$' + formatAmount(parseFloat(amount)) : ''}`}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Animated.View style={{ transform: [{ scale: successScale }] }}>
                    <CheckCircle size={80} color={theme.colors.success} />
                  </Animated.View>
                  <Text style={styles.successText}>Payment Successful!</Text>
                  <Text style={styles.successAmount}>${formatAmount(parseFloat(amount))}</Text>
                  <Text style={styles.cashbackText}>+${formatAmount(earnedCashback || parseFloat(amount) * 0.01)} Cashback Earned</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </BlurView>
      </KeyboardAvoidingView>
      )}
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
    maxHeight: height * 0.85,
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  cardInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  bankName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardNumber: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  amountInfo: {
    marginBottom: theme.spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  amountValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  dollarSign: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  quickButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  quickButtonAmount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.background,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  successText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  successAmount: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700',
    color: theme.colors.success,
    marginTop: theme.spacing.sm,
  },
  cashbackText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});