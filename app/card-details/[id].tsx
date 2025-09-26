import { CreditCardView } from '@/components/CreditCardView';
import { theme } from '@/constants/theme';
import { useCardById, usePaymentsByCard } from '@/hooks/useCardsStore';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, Calendar, TrendingUp } from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const card = useCardById(id as string);
  const payments = usePaymentsByCard(id as string);

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    );
  }

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const utilizationPercentage = ((card.creditLimit - card.availableCredit) / card.creditLimit) * 100;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <CreditCardView card={card} />
        </View>

        {/* Credit Utilization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credit Utilization</Text>
          <View style={styles.utilizationCard}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationPercentage}>{utilizationPercentage.toFixed(1)}%</Text>
              <Text style={styles.utilizationLabel}>Used</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${utilizationPercentage}%`,
                    backgroundColor: utilizationPercentage > 70 ? theme.colors.danger : theme.colors.primary
                  }
                ]} 
              />
            </View>
            <View style={styles.utilizationDetails}>
              <View>
                <Text style={styles.detailLabel}>Used</Text>
                <Text style={styles.detailValue}>{formatAmount(card.creditLimit - card.availableCredit)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.detailLabel}>Available</Text>
                <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                  {formatAmount(card.availableCredit)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>
                {new Date(card.dueDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={styles.infoLabel}>Min Due</Text>
              <Text style={styles.infoValue}>{formatAmount(card.minimumDue)}</Text>
            </View>
            <View style={styles.infoCard}>
              <TrendingUp size={20} color={theme.colors.success} />
              <Text style={styles.infoLabel}>Credit Limit</Text>
              <Text style={styles.infoValue}>{formatAmount(card.creditLimit)}</Text>
            </View>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {payments.length === 0 ? (
            <Text style={styles.emptyText}>No payments yet</Text>
          ) : (
            payments.map((payment: {
              id: string;
              date: string | number | Date;
              status: string;
              amount: number;
              cashback: number;
            }) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.paymentStatus}>
                    {payment.status === 'completed' ? '✓ Completed' : 'Pending'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                  <Text style={styles.cashbackText}>+{formatAmount(payment.cashback)} cashback</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
  cardContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  utilizationCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  utilizationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  utilizationPercentage: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  utilizationLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  utilizationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  paymentDate: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  paymentStatus: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
  },
  paymentAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cashbackText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginTop: 2,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});