import { theme } from '@/constants/theme';
import { Stack } from 'expo-router';
import { ExternalLink, Gift, Percent, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type CardBenefit = {
  id: string;
  cardName: string;
  cardLast4: string;
  category: 'cashback' | 'points' | 'miles' | 'perks';
  title: string;
  description: string;
  value: string;
  icon: string;
  isActive: boolean;
  expiryDate?: string;
};

const mockBenefits: CardBenefit[] = [
  {
    id: '1',
    cardName: 'Chase Sapphire',
    cardLast4: '4532',
    category: 'points',
    title: '3x Points on Dining',
    description: 'Earn 3 points per $1 spent on dining and restaurants',
    value: '3x',
    icon: '🍽️',
    isActive: true,
  },
  {
    id: '2',
    cardName: 'Chase Sapphire',
    cardLast4: '4532',
    category: 'points',
    title: '2x Points on Travel',
    description: 'Earn 2 points per $1 spent on travel purchases',
    value: '2x',
    icon: '✈️',
    isActive: true,
  },
  {
    id: '3',
    cardName: 'Capital One Venture',
    cardLast4: '8901',
    category: 'miles',
    title: '2x Miles on Everything',
    description: 'Earn 2 miles per $1 spent on all purchases',
    value: '2x',
    icon: '🌍',
    isActive: true,
  },
  {
    id: '4',
    cardName: 'American Express Gold',
    cardLast4: '2345',
    category: 'cashback',
    title: '4% Cash Back on Groceries',
    description: 'Earn 4% cash back on grocery store purchases',
    value: '4%',
    icon: '🛒',
    isActive: true,
    expiryDate: '2024-12-31',
  },
  {
    id: '5',
    cardName: 'American Express Gold',
    cardLast4: '2345',
    category: 'perks',
    title: 'Airport Lounge Access',
    description: 'Complimentary access to 1,300+ airport lounges worldwide',
    value: 'Free',
    icon: '🛫',
    isActive: true,
  },
  {
    id: '6',
    cardName: 'Chase Sapphire',
    cardLast4: '4532',
    category: 'perks',
    title: 'Travel Insurance',
    description: 'Trip cancellation and interruption protection up to $10,000',
    value: '$10K',
    icon: '🛡️',
    isActive: true,
  },
];

export default function CardBenefitsScreen() {
  //const { cards } = useCards();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Benefits', icon: '🎯' },
    { id: 'cashback', name: 'Cash Back', icon: '💰' },
    { id: 'points', name: 'Points', icon: '⭐' },
    { id: 'miles', name: 'Miles', icon: '✈️' },
    { id: 'perks', name: 'Perks', icon: '🎁' },
  ];

  const filteredBenefits = selectedCategory === 'all' 
    ? mockBenefits 
    : mockBenefits.filter(benefit => benefit.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cashback': return theme.colors.success;
      case 'points': return theme.colors.primary;
      case 'miles': return theme.colors.secondary;
      case 'perks': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const renderBenefitCard = (benefit: CardBenefit) => {
    const categoryColor = getCategoryColor(benefit.category);
    
    return (
      <TouchableOpacity key={benefit.id} style={styles.benefitCard}>
        <View style={styles.benefitHeader}>
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitIcon}>{benefit.icon}</Text>
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.cardInfo}>
                {benefit.cardName} •••• {benefit.cardLast4}
              </Text>
            </View>
          </View>
          <View style={[styles.benefitValue, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.benefitValueText, { color: categoryColor }]}>
              {benefit.value}
            </Text>
          </View>
        </View>

        <Text style={styles.benefitDescription}>{benefit.description}</Text>

        <View style={styles.benefitFooter}>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {benefit.category.charAt(0).toUpperCase() + benefit.category.slice(1)}
            </Text>
          </View>
          
          {benefit.expiryDate && (
            <Text style={styles.expiryText}>
              Expires {new Date(benefit.expiryDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          )}
          
          <ExternalLink size={16} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Card Benefits',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Gift size={24} color={theme.colors.primary} />
            <Text style={styles.summaryValue}>{mockBenefits.length}</Text>
            <Text style={styles.summaryLabel}>Total Benefits</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Star size={24} color={theme.colors.success} />
            <Text style={styles.summaryValue}>
              {mockBenefits.filter(b => b.isActive).length}
            </Text>
            <Text style={styles.summaryLabel}>Active Benefits</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Percent size={24} color={theme.colors.warning} />
            <Text style={styles.summaryValue}>
              {mockBenefits.filter(b => b.category === 'cashback').length}
            </Text>
            <Text style={styles.summaryLabel}>Cash Back Offers</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Benefits List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Benefits' : 
             categories.find(c => c.id === selectedCategory)?.name || 'Benefits'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Maximize your card rewards and perks
          </Text>
          
          <View style={styles.benefitsContainer}>
            {filteredBenefits.length === 0 ? (
              <View style={styles.emptyState}>
                <Gift size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Benefits Found</Text>
                <Text style={styles.emptySubtext}>
                  No benefits available in this category
                </Text>
              </View>
            ) : (
              filteredBenefits.map(renderBenefitCard)
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
    gap: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  filterSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  categoryScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500' as const,
  },
  categoryButtonTextActive: {
    color: theme.colors.card,
    fontWeight: '600' as const,
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
  benefitsContainer: {
    gap: theme.spacing.md,
  },
  benefitCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  benefitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  benefitIcon: {
    fontSize: 24,
  },
  benefitDetails: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  cardInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  benefitValue: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  benefitValueText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700' as const,
  },
  benefitDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  benefitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
  },
  expiryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
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