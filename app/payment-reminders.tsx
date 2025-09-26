import { theme } from '@/constants/theme';
import { Stack } from 'expo-router';
import { Bell, Calendar, Clock, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type PaymentReminder = {
  id: string;
  cardName: string;
  cardLast4: string;
  dueDate: string;
  amount: number;
  isEnabled: boolean;
  daysBefore: number;
};

const mockReminders: PaymentReminder[] = [
  {
    id: '1',
    cardName: 'Chase Sapphire',
    cardLast4: '4532',
    dueDate: '2024-01-15',
    amount: 1250.50,
    isEnabled: true,
    daysBefore: 3,
  },
  {
    id: '2',
    cardName: 'Capital One Venture',
    cardLast4: '8901',
    dueDate: '2024-01-20',
    amount: 890.25,
    isEnabled: true,
    daysBefore: 5,
  },
  {
    id: '3',
    cardName: 'American Express Gold',
    cardLast4: '2345',
    dueDate: '2024-01-25',
    amount: 2150.75,
    isEnabled: false,
    daysBefore: 7,
  },
];

export default function PaymentRemindersScreen() {
  //const { cards } = useCards();
  const [reminders, setReminders] = useState<PaymentReminder[]>(mockReminders);

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, isEnabled: !reminder.isEnabled }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const renderReminderCard = (reminder: PaymentReminder) => {
    const daysUntil = getDaysUntilDue(reminder.dueDate);
    const isOverdue = daysUntil < 0;
    const isDueSoon = daysUntil <= reminder.daysBefore && daysUntil >= 0;

    return (
      <View key={reminder.id} style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{reminder.cardName}</Text>
            <Text style={styles.cardNumber}>•••• {reminder.cardLast4}</Text>
          </View>
          <Switch
            value={reminder.isEnabled}
            onValueChange={() => toggleReminder(reminder.id)}
            trackColor={{ false: theme.colors.surface, true: theme.colors.primary + '40' }}
            thumbColor={reminder.isEnabled ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>

        <View style={styles.reminderDetails}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>{formatAmount(reminder.amount)}</Text>
          </View>

          <View style={styles.dateSection}>
            <View style={styles.dateInfo}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={styles.dateLabel}>Due Date</Text>
            </View>
            <Text style={[
              styles.dateValue,
              isOverdue && styles.overdueText,
              isDueSoon && styles.dueSoonText
            ]}>
              {formatDate(reminder.dueDate)}
            </Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <View style={styles.statusInfo}>
            <Clock size={16} color={
              isOverdue ? theme.colors.danger : 
              isDueSoon ? theme.colors.warning : 
              theme.colors.success
            } />
            <Text style={[
              styles.statusText,
              isOverdue && styles.overdueText,
              isDueSoon && styles.dueSoonText
            ]}>
              {isOverdue 
                ? `${Math.abs(daysUntil)} days overdue`
                : daysUntil === 0 
                ? 'Due today'
                : `${daysUntil} days remaining`
              }
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteReminder(reminder.id)}
          >
            <Trash2 size={16} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {reminder.isEnabled && (
          <View style={styles.notificationInfo}>
            <Bell size={14} color={theme.colors.primary} />
            <Text style={styles.notificationText}>
              Reminder set for {reminder.daysBefore} days before due date
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Payment Reminders',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Active Reminders</Text>
            <Text style={styles.summaryValue}>
              {reminders.filter(r => r.isEnabled).length}
            </Text>
            <Text style={styles.summarySubtext}>
              out of {reminders.length} total
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Due This Week</Text>
            <Text style={styles.summaryValue}>
              {reminders.filter(r => {
                const days = getDaysUntilDue(r.dueDate);
                return days >= 0 && days <= 7;
              }).length}
            </Text>
            <Text style={styles.summarySubtext}>
              payments coming up
            </Text>
          </View>
        </View>

        {/* Add New Reminder */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add New Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Reminders</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your payment notifications
          </Text>
          
          <View style={styles.remindersContainer}>
            {reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Reminders Set</Text>
                <Text style={styles.emptySubtext}>
                  Add payment reminders to never miss a due date
                </Text>
              </View>
            ) : (
              reminders.map(renderReminderCard)
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
  summarySection: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  summarySubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    gap: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  remindersContainer: {
    gap: theme.spacing.md,
  },
  reminderCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  cardNumber: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  dateSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  dateValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  overdueText: {
    color: theme.colors.danger,
  },
  dueSoonText: {
    color: theme.colors.warning,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  notificationText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});