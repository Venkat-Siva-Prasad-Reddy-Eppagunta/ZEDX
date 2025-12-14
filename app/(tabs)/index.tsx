import { CreditCardView } from '@/components/CreditCardView';
import { PaymentModal } from '@/components/PaymentModal';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuthStore';
import { useCards } from '@/hooks/useCardsStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertCircle, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const { cards, totalOutstanding, totalCashback, setUserCards } = useCards();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

useEffect(() => {
  if (authLoading) return;

  if (!user) {
    router.replace('/landing');
    return;
  }

  // if (!user.cards || cards.length === 0) {
  //   //clearCards();
  //   router.replace('/credit-score');
  //   return;
  // }

  // // initialize ONCE per user
  // //clearCards();
  // setUserCards(user.cards);

}, [user, user?.id, authLoading, cards, setUserCards, router]); // ✅ key change

  const handleCardPress = (cardId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedCard(cardId);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const selectedCardData = cards.find(c => c.id === selectedCard);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <View style={styles.creditScoreBadge}>
            <Text style={styles.creditScoreLabel}>Credit Score</Text>
            <Text style={styles.creditScoreValue}>{user?.credit_score || 0}</Text>
          </View>
        </View>

        {/* Header Stats */}
        <View style={styles.header}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={styles.statLabel}>Total Outstanding</Text>
            </View>
            <Text style={styles.statValue}>{formatAmount(totalOutstanding)}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color={theme.colors.success} />
              <Text style={styles.statLabel}>Cashback Earned</Text>
            </View>
            <Text style={[styles.statValue, styles.cashbackValue]}>{formatAmount(totalCashback)}</Text>
          </View>
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <Text style={styles.sectionSubtitle}>Tap to pay bills instantly</Text>
        </View>

        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No cards added yet</Text>
            <Text style={styles.emptySubtext}>Add your first credit card to get started</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => handleCardPress(card.id)}
                activeOpacity={0.9}
              >
                <CreditCardView card={card} compact />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/spending-analysis')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.actionEmoji}>📊</Text>
            </View>
            <Text style={styles.actionText}>Spending</Text>
            <Text style={styles.actionSubtext}>Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/payment-reminders')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={styles.actionEmoji}>🎯</Text>
            </View>
            <Text style={styles.actionText}>Payment</Text>
            <Text style={styles.actionSubtext}>Reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/card-benefits')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Text style={styles.actionEmoji}>💳</Text>
            </View>
            <Text style={styles.actionText}>Card</Text>
            <Text style={styles.actionSubtext}>Benefits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/credit-score-details')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Text style={styles.actionEmoji}>🏆</Text>
            </View>
            <Text style={styles.actionText}>Credit</Text>
            <Text style={styles.actionSubtext}>Score</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedCardData && (
        <PaymentModal
          visible={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          card={selectedCardData}
        />
      )}
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
  header: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statCardSecondary: {
    backgroundColor: theme.colors.surface,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  cashbackValue: {
    color: theme.colors.success,
  },
  welcomeSection: {
    padding: theme.spacing.md,
    paddingBottom: 0,
  },
  welcomeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  creditScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
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
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  actionSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});