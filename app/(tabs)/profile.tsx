import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuthStore';
import { useCards } from '@/hooks/useCardsStore';
import { useRouter } from 'expo-router';
import {
  Award,
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  TrendingUp,
  User
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { payments, cards, totalCashback } = useCards();
  const { user, logout } = useAuth();
  const router = useRouter();

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  payments.reduce((sum, p) => sum + p.amount, 0);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/landing');
          }
        },
      ]
    );
  };

  const menuItems = [
    { icon: Bell, title: 'Notifications', subtitle: 'Payment reminders & offers', onPress: () => {} },
    { icon: Shield, title: 'Security', subtitle: 'Privacy and app security', onPress: () => {} },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'FAQs and customer support', onPress: () => {} },
    { icon: LogOut, title: 'Logout', subtitle: 'Sign out from your account', danger: true, onPress: handleLogout },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color={theme.colors.text} />
          </View>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.creditScoreBadge}>
            <Text style={styles.creditScoreLabel}>Credit Score</Text>
            <Text style={styles.creditScoreValue}>{user?.credit_score || 720}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <CreditCard size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>{payments.length}</Text>
            <Text style={styles.statLabel}>Payments</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={24} color={theme.colors.warning} />
            <Text style={styles.statValue}>{formatAmount(totalCashback)}</Text>
            <Text style={styles.statLabel}>Rewards</Text>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          {payments.slice(0, 5).map((payment) => {
            const card = cards.find(c => c.id === payment.cardId);
            return (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentBank}>{card?.bankName || 'Unknown'}</Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.paymentValue}>{formatAmount(payment.amount)}</Text>
                  <Text style={styles.cashbackText}>+{formatAmount(payment.cashback)}</Text>
                </View>
              </View>
            );
          })}
          {payments.length === 0 && (
            <Text style={styles.emptyText}>No payment history</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, item.danger && styles.dangerIcon]}>
                  <item.icon size={20} color={item.danger ? theme.colors.danger : theme.colors.text} />
                </View>
                <View>
                  <Text style={[styles.menuTitle, item.danger && styles.dangerText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
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
  profileHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  creditScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  creditScoreLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  creditScoreValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.success,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentBank: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  paymentDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '700' as const,
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
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: theme.colors.danger + '10',
  },
  menuTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  bottomSpacer: {
    height: 100,
  },
});