import { theme } from '@/constants/theme';
import { CreditCard } from '@/types/card';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

interface CreditCardViewProps {
  card: CreditCard;
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 0.63;
const COMPACT_HEIGHT = 120;

export function CreditCardView({ card, compact = false }: CreditCardViewProps) {
  
  const gradientColors = theme.colors.gradients[card.color as keyof typeof theme.colors.gradients] || theme.colors.gradients.chase;
  
  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleDateString('en', { month: 'short' })}`;
  };

  if (compact) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.compactCard]}
      >
        <View style={styles.compactHeader}>
          <Text style={styles.compactBankName}>{card.bankName}</Text>
          <Text style={styles.compactCardNumber}>•••• {card.cardNumber}</Text>
        </View>
        <View style={styles.compactFooter}>
          <View>
            <Text style={styles.compactLabel}>DUE</Text>
            <Text style={styles.compactAmount}>{formatAmount(card.outstandingAmount)}</Text>
          </View>
          <View style={styles.compactDueDate}>
            <Text style={styles.compactLabel}>PAY BY</Text>
            <Text style={styles.compactDate}>{formatDate(card.dueDate)}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.bankName}>{card.bankName}</Text>
        <Image
          source={{ uri: `https://logo.clearbit.com/${card.cardType}.com` }}
          style={styles.cardTypeLogo}
        />
      </View>
      <Text style={styles.cardNumber}>•••• •••• •••• {card.cardNumber}</Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.cardHolder}>{card.cardHolder}</Text>
        </View>
        <View>
          <Text style={styles.label}>DUE DATE</Text>
          <Text style={styles.dueDate}>{formatDate(card.dueDate)}</Text>
        </View>
      </View>
      <View style={styles.amountSection}>
        <View>
          <Text style={styles.label}>TOTAL DUE</Text>
          <Text style={styles.amount}>{formatAmount(card.outstandingAmount)}</Text>
        </View>
        <View>
          <Text style={styles.label}>MIN DUE</Text>
          <Text style={styles.minAmount}>{formatAmount(card.minimumDue)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  compactCard: {
    height: COMPACT_HEIGHT,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardNumber: {
    fontSize: theme.fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardHolder: {
    fontSize: theme.fontSize.md,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  dueDate: {
    fontSize: theme.fontSize.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  amount: {
    fontSize: theme.fontSize.xxl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  minAmount: {
    fontSize: theme.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactBankName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compactCardNumber: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  compactLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  compactAmount: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compactDueDate: {
    alignItems: 'flex-end',
  },
  compactDate: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardTypeLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});