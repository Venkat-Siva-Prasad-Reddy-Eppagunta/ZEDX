import { AddPaymentSourceModal } from '@/components/AddPaymentSourceModal';
import { SlotMachine } from '@/components/SlotMachine';
import { theme } from '@/constants/theme';
import { useCards } from '@/hooks/useCardsStore';
import { CreditCard, DwollaFundingSource, PaymentSourceType } from '@/types/card';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Building2, CheckCircle, ChevronDown, CreditCard as CreditCardIcon, Plus, X } from 'lucide-react-native';
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

type PaymentMethod = 'debit_card' | 'bank_account' | 'credit';

interface PaymentMethodOption {
  type: PaymentMethod;
  name: string;
  description: string;
  fee: number;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    type: 'debit_card',
    name: 'Debit Card',
    description: 'No extra charges',
    fee: 0,
  },
  {
    type: 'bank_account',
    name: 'Bank Account',
    description: 'No extra charges',
    fee: 0,
  },
  {
    type: 'credit',
    name: 'Credit Card',
    description: '3% processing fee',
    fee: 0.03,
  },
];

const { height } = Dimensions.get('window');

export function PaymentModal({ visible, onClose, card }: PaymentModalProps) {
  const { makePayment, fundingSources, setPaymentSources, addPaymentSource, cards } = useCards();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSlotMachine, setShowSlotMachine] = useState(false);
  const [earnedCashback, setEarnedCashback] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DwollaFundingSource | null>(null);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [addSourceType, setAddSourceType] = useState<PaymentSourceType>('debit_card');
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

  React.useEffect(() => {
    if (visible && fundingSources.length === 0) {
      setShowAddSourceModal(true);
    }
  }, [visible, fundingSources]);

  const selectedMethod = selectedPaymentMethod ? paymentMethods.find(m => m.type === selectedPaymentMethod) : null;
  const processingFee = selectedMethod ? parseFloat(amount || '0') * selectedMethod.fee : 0;
  const totalAmount = parseFloat(amount || '0') + processingFee;

  const handleQuickAmount = (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAmount(value.toString());
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPaymentMethod(method);
    setShowPaymentMethodPicker(false);
    setSelectedSource(null);
    
    if (method === 'debit_card' || method === 'bank_account' || method === 'credit') {
      setShowSourceSelector(true);
    } else {
      setShowSourceSelector(false);
    }
  };

  const handleSourceSelect = (source: DwollaFundingSource) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if(source){
      setSelectedSource(source);
    }
    else {
      setShowAddSourceModal(true);
    }
  };


  const handleAddSource = (sourceData: {
    id: number;
    funding_source_id: string;
    name: string;
    type: string;
    status: string;
    last4: string;
  }) =>   {
  const newSource: DwollaFundingSource = {
  id: sourceData.id,
  funding_source_id: sourceData.funding_source_id,
  name: sourceData.name,
  type: sourceData.type,
  status: sourceData.status,
  last4: sourceData.last4,
};
    addPaymentSource(newSource);
    setSelectedSource(newSource);
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (totalAmount > card.outstandingAmount) {
      Alert.alert('Amount Exceeds Due', `Total amount (${formatAmount(totalAmount)}) cannot exceed outstanding amount`);
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    if (!selectedSource) {
      Alert.alert('Payment Source Required', 'Please select a payment source');
      return;
    }

    setIsProcessing(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => {
      makePayment({
        cardId: card.id,
        amount: paymentAmount,
      });

      setIsProcessing(false);

      const dueDate = new Date(card.dueDate);
      const today = new Date();
      const isOnTime = today <= dueDate;

      if (isOnTime) {
        const cashback = paymentAmount * 0.02;
        setEarnedCashback(cashback);
        setShowSlotMachine(true);
      } else {
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
                    <Text style={styles.inputLabel}>Payment Method</Text>
                    <TouchableOpacity
                      style={styles.paymentMethodSelector}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setShowPaymentMethodPicker(!showPaymentMethodPicker);
                      }}
                    >
                      {selectedMethod ? (
                        <View style={styles.paymentMethodLeft}>
                          {selectedPaymentMethod === 'debit_card' || selectedPaymentMethod === 'bank_account' ? (
                            selectedPaymentMethod === 'debit_card' ? (
                              <CreditCardIcon size={20} color={theme.colors.primary} />
                            ) : (
                              <Building2 size={20} color={theme.colors.primary} />
                            )
                          ) : (
                            <CreditCardIcon size={20} color={theme.colors.primary} />
                          )}
                          <View style={styles.paymentMethodText}>
                            <Text style={styles.paymentMethodName}>{selectedMethod.name}</Text>
                            <Text style={styles.paymentMethodDesc}>{selectedMethod.description}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.placeholderText}>Select payment method</Text>
                      )}
                      <ChevronDown size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    {showPaymentMethodPicker && (
                      <View style={styles.paymentMethodPicker}>
                        {paymentMethods.map((method) => (
                          <TouchableOpacity
                            key={method.type}
                            style={[
                              styles.paymentMethodOption,
                              selectedPaymentMethod === method.type && styles.paymentMethodOptionSelected
                            ]}
                            onPress={() => handlePaymentMethodSelect(method.type)}
                          >
                            <View style={styles.paymentMethodLeft}>
                              {method.type === 'debit_card' ? (
                                <CreditCardIcon size={20} color={theme.colors.primary} />
                              ) : method.type === 'bank_account' ? (
                                <Building2 size={20} color={theme.colors.primary} />
                              ) : (
                                <CreditCardIcon size={20} color={theme.colors.primary} />
                              )}
                              <View style={styles.paymentMethodText}>
                                <Text style={styles.paymentMethodName}>{method.name}</Text>
                                <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                              </View>
                            </View>
                            {selectedPaymentMethod === method.type && (
                              <CheckCircle size={20} color={theme.colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* {showSourceSelector && selectedPaymentMethod === 'debit_card' && (
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Select Debit Card</Text>
                      <View style={styles.sourcesList}>
                        {fundingSources
                          .filter(s => s.type === 'checking' || s.type === 'saving')
                          .map((source) => (
                            <TouchableOpacity
                              key={source.id}
                              style={[
                                styles.sourceItem,
                                selectedSource?.id === source.id && styles.sourceItemSelected
                              ]}
                              onPress={() => handleSourceSelect(source)}
                            >
                              <View style={styles.sourceLeft}>
                                <CreditCardIcon size={20} color={theme.colors.primary} />
                                <View style={styles.sourceText}>
                                  <Text style={styles.sourceName}>{source.name}</Text>
                                  <Text style={styles.sourceDetails}>
                                    {source.name} •••• {source.last4}
                                  </Text>
                                </View>
                              </View>
                              {selectedSource?.id === source.id && (
                                <CheckCircle size={20} color={theme.colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        <TouchableOpacity
                          style={styles.addSourceButton}
                          onPress={() => {
                            if (Platform.OS !== 'web') {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            setAddSourceType('debit_card');
                            setShowAddSourceModal(true);
                          }}
                        >
                          <Plus size={20} color={theme.colors.primary} />
                          <Text style={styles.addSourceText}>Add Debit Card</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )} */}

                  {showSourceSelector && selectedPaymentMethod === 'bank_account' && (
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Select Bank Account</Text>
                      <View style={styles.sourcesList}>
                        {fundingSources && fundingSources.map((source) => (
                          <TouchableOpacity
                            key={`${source.id}-${source.funding_source_id}`}
                            style={[
                              styles.sourceItem,
                              selectedSource?.id === source.id && styles.sourceItemSelected
                            ]}
                            onPress={() => handleSourceSelect(source)}
                          >
                            <View style={styles.sourceLeft}>
                              <Building2 size={20} color={theme.colors.primary} />
                              <View style={styles.sourceText}>
                                <Text style={styles.sourceName}>{source.name}</Text>
                                <Text style={styles.sourceDetails}>
                                  {source.name} •••• {source.last4}
                                </Text>
                              </View>
                            </View>
                            {selectedSource?.id === source.id && (
                              <CheckCircle size={20} color={theme.colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.addSourceButton}
                          onPress={() => {
                            if (Platform.OS !== 'web') {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            setAddSourceType('bank_account');
                            setShowAddSourceModal(true);
                          }}
                        >
                          <Plus size={20} color={theme.colors.primary} />
                          <Text style={styles.addSourceText}>Add Bank Account</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* {showSourceSelector && selectedPaymentMethod === 'credit' && (
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Select Credit Card</Text>
                      <View style={styles.sourcesList}>
                        {cards
                          .filter((c: CreditCard) => c.id !== card.id)
                          .map((creditCard: CreditCard) => (
                            <TouchableOpacity
                              key={creditCard.id}
                              style={[
                                styles.sourceItem,
                                selectedSource?.id === creditCard.id && styles.sourceItemSelected
                              ]}
                              onPress={() => handleSourceSelect({
                                id: creditCard.id,
                                type: 'credit_card',
                                name: creditCard.bankName,
                                last4: creditCard.cardNumber,
                                bankName: creditCard.bankName,
                              })}
                            >
                              <View style={styles.sourceLeft}>
                                <CreditCardIcon size={20} color={theme.colors.primary} />
                                <View style={styles.sourceText}>
                                  <Text style={styles.sourceName}>{creditCard.bankName}</Text>
                                  <Text style={styles.sourceDetails}>
                                    •••• {creditCard.cardNumber}
                                  </Text>
                                </View>
                              </View>
                              {selectedSource?.id === creditCard.id && (
                                <CheckCircle size={20} color={theme.colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        {cards.filter((c: CreditCard) => c.id !== card.id).length === 0 && (
                          <View style={styles.noCreditCardsContainer}>
                            <Text style={styles.noCreditCardsText}>No other credit cards added</Text>
                          </View>
                        )}
                        <View style={styles.creditCardNote}>
                          <Text style={styles.creditCardNoteText}>
                            Note: If you want to pay with another credit card that&apos;s not added to the app, please add it first from the Cards page.
                          </Text>
                        </View>
                      </View>
                    </View>
                  )} */}

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

                  {processingFee > 0 && amount && (
                    <View style={styles.feeInfo}>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Payment Amount</Text>
                        <Text style={styles.feeValue}>${formatAmount(parseFloat(amount))}</Text>
                      </View>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Processing Fee (3%)</Text>
                        <Text style={styles.feeValue}>${formatAmount(processingFee)}</Text>
                      </View>
                      <View style={[styles.feeRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>${formatAmount(totalAmount)}</Text>
                      </View>
                    </View>
                  )}

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
                      {isProcessing ? 'Processing...' : `Pay ${amount ? '$' + formatAmount(totalAmount) : ''}`}
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
      <AddPaymentSourceModal
        visible={showAddSourceModal}
        onClose={() => setShowAddSourceModal(false)}
        onAdd={handleAddSource}
        sourceType={addSourceType}
      />
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
    minHeight: height * 0.87,
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
  paymentMethodSelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  paymentMethodText: {
    marginLeft: theme.spacing.xs,
  },
  paymentMethodName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentMethodDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  paymentMethodPicker: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  paymentMethodOption: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentMethodOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  feeInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  feeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  feeValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sourcesList: {
    gap: theme.spacing.sm,
  },
  sourceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sourceItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  sourceText: {
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  sourceName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sourceDetails: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addSourceButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  addSourceText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  noCreditCardsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  noCreditCardsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  creditCardNote: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  creditCardNoteText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  placeholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
