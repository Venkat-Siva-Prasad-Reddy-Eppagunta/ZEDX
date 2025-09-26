import { theme } from '@/constants/theme';
import { Stack } from 'expo-router';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type SpendingCategory = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
};

type MonthlySpending = {
  month: string;
  amount: number;
};

const mockCategories: SpendingCategory[] = [
  { id: '1', name: 'Groceries', amount: 1250.50, percentage: 35, color: '#4CAF50', icon: '🛒' },
  { id: '2', name: 'Gas & Fuel', amount: 420.75, percentage: 12, color: '#FF9800', icon: '⛽' },
  { id: '3', name: 'Restaurants', amount: 680.25, percentage: 19, color: '#E91E63', icon: '🍽️' },
  { id: '4', name: 'Shopping', amount: 540.00, percentage: 15, color: '#9C27B0', icon: '🛍️' },
  { id: '5', name: 'Entertainment', amount: 320.80, percentage: 9, color: '#2196F3', icon: '🎬' },
  { id: '6', name: 'Others', amount: 360.70, percentage: 10, color: '#607D8B', icon: '📦' },
];

const mockMonthlyData: MonthlySpending[] = [
  { month: 'Jan', amount: 2800 },
  { month: 'Feb', amount: 3200 },
  { month: 'Mar', amount: 2950 },
  { month: 'Apr', amount: 3400 },
  { month: 'May', amount: 3100 },
  { month: 'Jun', amount: 3573 },
];

export default function SpendingAnalysisScreen() {
  //const insets = useSafeAreaInsets();
  //const { cards } = useCards();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const totalSpending = mockCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const currentMonth = mockMonthlyData[mockMonthlyData.length - 1];
  const previousMonth = mockMonthlyData[mockMonthlyData.length - 2];
  const monthlyChange = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100;

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderProgressBar = (category: SpendingCategory) => {
    return (
      <View key={category.id} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPercentage}>{category.percentage}% of total</Text>
            </View>
          </View>
          <Text style={styles.categoryAmount}>{formatAmount(category.amount)}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${category.percentage}%`, 
                backgroundColor: category.color 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Spending Analysis',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <DollarSign size={24} color={theme.colors.primary} />
              <Text style={styles.summaryLabel}>Total Spending</Text>
            </View>
            <Text style={styles.summaryValue}>{formatAmount(totalSpending)}</Text>
            <Text style={styles.summarySubtext}>This month</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              {monthlyChange >= 0 ? (
                <TrendingUp size={24} color={theme.colors.danger} />
              ) : (
                <TrendingDown size={24} color={theme.colors.success} />
              )}
              <Text style={styles.summaryLabel}>Monthly Change</Text>
            </View>
            <Text style={[
              styles.summaryValue,
              { color: monthlyChange >= 0 ? theme.colors.danger : theme.colors.success }
            ]}>
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </Text>
            <Text style={styles.summarySubtext}>vs last month</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => {
                  if (period && period.trim() && period.length <= 10) {
                    setSelectedPeriod(period);
                  }
                }}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spending by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <Text style={styles.sectionSubtitle}>Breakdown of your expenses</Text>
          
          <View style={styles.categoriesContainer}>
            {mockCategories.map(renderProgressBar)}
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trend</Text>
          <Text style={styles.sectionSubtitle}>Your spending over time</Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {mockMonthlyData.map((data, index) => {
                const maxAmount = Math.max(...mockMonthlyData.map(d => d.amount));
                const height = (data.amount / maxAmount) * 120;
                const isCurrentMonth = index === mockMonthlyData.length - 1;
                
                return (
                  <View key={data.month} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View 
                        style={[
                          styles.chartBarFill,
                          styles.chartBarDynamic,
                          { 
                            height,
                            backgroundColor: isCurrentMonth ? theme.colors.primary : theme.colors.surface
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.chartLabel}>{data.month}</Text>
                    <Text style={styles.chartValue}>${(data.amount / 1000).toFixed(1)}k</Text>
                  </View>
                );
              })}
            </View>
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
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
  },
  periodSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500' as const,
  },
  periodButtonTextActive: {
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
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
  categoriesContainer: {
    gap: theme.spacing.md,
  },
  categoryItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  categoryPercentage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  categoryAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  chartContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  chartBarFill: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  chartValue: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  chartBarDynamic: {
    // Dynamic styles for chart bars
  },
  bottomSpacing: {
    height: 100,
  },
});