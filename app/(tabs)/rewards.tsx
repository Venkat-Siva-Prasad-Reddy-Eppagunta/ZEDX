import { theme } from '@/constants/theme';
import { useCards } from '@/hooks/useCardsStore';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Clock, Trophy } from 'lucide-react-native';
import React from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function RewardsScreen() {
  const { rewards, totalCashback, claimReward } = useCards();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleClaimReward = (rewardId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    claimReward(rewardId);
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString('en-US');
  };

  const unclaimedRewards = rewards.filter(r => !r.claimed);
  const claimedRewards = rewards.filter(r => r.claimed);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Trophy size={32} color={theme.colors.warning} />
            <Text style={styles.summaryTitle}>Total Points</Text>
          </View>
          <Text style={styles.summaryValue}>{formatPoints(totalCashback)}</Text>
          <Text style={styles.summarySubtext}>Available to redeem</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{rewards.length}</Text>
            <Text style={styles.statLabel}>Total Rewards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unclaimedRewards.length}</Text>
            <Text style={styles.statLabel}>Unclaimed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1%</Text>
            <Text style={styles.statLabel}>Cashback Rate</Text>
          </View>
        </View>

        {/* Unclaimed Rewards */}
        {unclaimedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {unclaimedRewards.map((reward) => (
              <Animated.View
                key={reward.id}
                style={[
                  styles.rewardCard,
                  reward.claimed && { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  </View>
                </View>
                <View style={styles.rewardFooter}>
                  <View style={styles.rewardPoints}>
                    <Text style={styles.pointsValue}>+{formatPoints(reward.points)}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => handleClaimReward(reward.id)}
                  >
                    <Text style={styles.claimButtonText}>Claim</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.expiryContainer}>
                  <Clock size={12} color={theme.colors.textMuted} />
                  <Text style={styles.expiryText}>
                    Expires {new Date(reward.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Claimed Rewards */}
        {claimedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claimed Rewards</Text>
            {claimedRewards.map((reward) => (
              <View key={reward.id} style={[styles.rewardCard, styles.claimedCard]}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <View style={styles.rewardInfo}>
                    <Text style={[styles.rewardTitle, styles.claimedText]}>{reward.title}</Text>
                    <Text style={[styles.rewardDescription, styles.claimedText]}>{reward.description}</Text>
                  </View>
                </View>
                <View style={styles.rewardFooter}>
                  <View style={styles.rewardPoints}>
                    <Text style={[styles.pointsValue, styles.claimedText]}>+{formatPoints(reward.points)}</Text>
                    <Text style={[styles.pointsLabel, styles.claimedText]}>points</Text>
                  </View>
                  <View style={styles.claimedBadge}>
                    <CheckCircle size={16} color={theme.colors.success} />
                    <Text style={styles.claimedBadgeText}>Claimed</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {rewards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyTitle}>No Rewards Yet</Text>
            <Text style={styles.emptySubtext}>
              Start paying bills to earn cashback and rewards
            </Text>
          </View>
        )}

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
  summaryCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  summarySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  rewardCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  claimedCard: {
    opacity: 0.7,
  },
  rewardHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  rewardIcon: {
    fontSize: 32,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  rewardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  pointsValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.success,
  },
  pointsLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  claimButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  claimButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.background,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  claimedBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '600',
  },
  claimedText: {
    color: theme.colors.textMuted,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  expiryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  bottomSpacer: {
    height: 100,
  },
});