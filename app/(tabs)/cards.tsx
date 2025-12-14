import { CreditCardView } from '@/components/CreditCardView';
import { theme } from '@/constants/theme';
import { useCards } from '@/hooks/useCardsStore';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CardsScreen() {
  const { cards, removeCard } = useCards();


  const handleAddCard = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/add-card');
  };

  const handleCardDetails = (cardId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/card-details/${cardId}`);
  };

  const handleDeleteCard = (cardId: string, cardName: string) => {
    Alert.alert(
      'Remove Card',
      `Are you sure you want to remove ${cardName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            removeCard(cardId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No Cards Added</Text>
            <Text style={styles.emptySubtitle}>
              Add your credit cards to start managing bills
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.cardsContainer}>
              {cards.map((card) => (
                <View key={card.id} style={styles.cardWrapper}>
                  <CreditCardView card={card} />

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCardDetails(card.id)}
                    >
                      <Text style={styles.actionButtonText}>View Details</Text>
                      <ChevronRight size={16} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteCard(card.id, card.bankName)}
                    >
                      <Trash2 size={16} color={theme.colors.danger} />
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.deleteButtonText,
                        ]}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card Benefits</Text>
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>🛡️</Text>
                  <Text style={styles.benefitTitle}>Secure Payments</Text>
                  <Text style={styles.benefitText}>Bank-level encryption</Text>
                </View>
                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>⚡</Text>
                  <Text style={styles.benefitTitle}>Instant Processing</Text>
                  <Text style={styles.benefitText}>Real-time updates</Text>
                </View>
                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>🎁</Text>
                  <Text style={styles.benefitTitle}>Rewards</Text>
                  <Text style={styles.benefitText}>Earn on every payment</Text>
                </View>
                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>📊</Text>
                  <Text style={styles.benefitTitle}>Analytics</Text>
                  <Text style={styles.benefitText}>Track spending patterns</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
        <Plus size={24} color={theme.colors.background} />
      </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  cardsContainer: {
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger + '10',
    borderColor: theme.colors.danger + '30',
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  deleteButtonText: {
    color: theme.colors.danger,
  },
  section: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  benefitCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  benefitEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  benefitTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  benefitText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});