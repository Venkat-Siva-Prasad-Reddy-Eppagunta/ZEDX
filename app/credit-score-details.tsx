import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuthStore';
import { Stack } from 'expo-router';
import { Award, Info, RefreshCw, Target, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type CreditScoreHistory = {
  month: string;
  score: number;
  change: number;
};

type ScoreFactor = {
  id: string;
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  percentage: number;
};

const mockHistory: CreditScoreHistory[] = [
  { month: 'Jan', score: 720, change: 0 },
  { month: 'Feb', score: 725, change: 5 },
  { month: 'Mar', score: 730, change: 5 },
  { month: 'Apr', score: 735, change: 5 },
  { month: 'May', score: 742, change: 7 },
  { month: 'Jun', score: 748, change: 6 },
];

const mockFactors: ScoreFactor[] = [
  {
    id: '1',
    name: 'Payment History',
    impact: 'positive',
    description: 'You have made all payments on time',
    percentage: 35,
  },
  {
    id: '2',
    name: 'Credit Utilization',
    impact: 'positive',
    description: 'Your credit usage is below 30%',
    percentage: 30,
  },
  {
    id: '3',
    name: 'Length of Credit History',
    impact: 'neutral',
    description: 'Average account age is 4.2 years',
    percentage: 15,
  },
  {
    id: '4',
    name: 'Credit Mix',
    impact: 'positive',
    description: 'Good variety of credit accounts',
    percentage: 10,
  },
  {
    id: '5',
    name: 'New Credit',
    impact: 'negative',
    description: 'Recent credit inquiry may impact score',
    percentage: 10,
  },
];

export default function CreditScoreScreen() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m');
  
  const currentScore = user?.creditScore || 748;
  const previousScore = mockHistory[mockHistory.length - 2]?.score || 742;
  const scoreChange = currentScore - previousScore;
  
  const getScoreRating = (score: number) => {
    if (score >= 800) return { rating: 'Excellent', color: theme.colors.success };
    if (score >= 720) return { rating: 'Very Good', color: theme.colors.success };
    if (score >= 670) return { rating: 'Good', color: theme.colors.primary };
    if (score >= 580) return { rating: 'Fair', color: theme.colors.warning };
    return { rating: 'Poor', color: theme.colors.danger };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return theme.colors.success;
      case 'negative': return theme.colors.danger;
      default: return theme.colors.textSecondary;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp size={16} color={theme.colors.success} />;
      case 'negative': return <TrendingDown size={16} color={theme.colors.danger} />;
      default: return <Target size={16} color={theme.colors.textSecondary} />;
    }
  };

  const scoreRating = getScoreRating(currentScore);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Credit Score',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Credit Score Display */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Your Credit Score</Text>
              <TouchableOpacity style={styles.refreshButton}>
                <RefreshCw size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreValue}>{currentScore}</Text>
              <View style={styles.scoreRange}>
                <Text style={styles.rangeText}>out of 850</Text>
              </View>
            </View>
            
            <View style={styles.scoreRating}>
              <Text style={[styles.ratingText, { color: scoreRating.color }]}>
                {scoreRating.rating}
              </Text>
              {scoreChange !== 0 && (
                <View style={styles.scoreChange}>
                  {scoreChange > 0 ? (
                    <TrendingUp size={16} color={theme.colors.success} />
                  ) : (
                    <TrendingDown size={16} color={theme.colors.danger} />
                  )}
                  <Text style={[
                    styles.changeText,
                    { color: scoreChange > 0 ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange} this month
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Score Range Indicator */}
        <View style={styles.rangeSection}>
          <Text style={styles.sectionTitle}>Credit Score Ranges</Text>
          <View style={styles.rangeIndicator}>
            <View style={styles.rangeBar}>
              <View style={[styles.rangeSegment, { backgroundColor: theme.colors.danger, flex: 1 }]} />
              <View style={[styles.rangeSegment, { backgroundColor: theme.colors.warning, flex: 1 }]} />
              <View style={[styles.rangeSegment, { backgroundColor: theme.colors.primary, flex: 1 }]} />
              <View style={[styles.rangeSegment, { backgroundColor: theme.colors.success, flex: 1.5 }]} />
            </View>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabel}>Poor</Text>
              <Text style={styles.rangeLabel}>Fair</Text>
              <Text style={styles.rangeLabel}>Good</Text>
              <Text style={styles.rangeLabel}>Excellent</Text>
            </View>
            <View style={styles.currentScoreMarker}>
              <View 
                style={[
                  styles.scoreMarker,
                  { left: `${(currentScore / 850) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Score History</Text>
          <View style={styles.periodSelector}>
            {(['3m', '6m', '1y'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period === '3m' ? '3 Months' : period === '6m' ? '6 Months' : '1 Year'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Score History Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {mockHistory.map((data, index) => {
                const maxScore = Math.max(...mockHistory.map(d => d.score));
                const minScore = Math.min(...mockHistory.map(d => d.score));
                const range = maxScore - minScore || 50;
                const height = ((data.score - minScore) / range) * 100 + 20;
                
                return (
                  <View key={data.month} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View 
                        style={[
                          styles.chartBarFill,
                          { 
                            height: `${height}%`,
                            backgroundColor: theme.colors.primary
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.chartLabel}>{data.month}</Text>
                    <Text style={styles.chartValue}>{data.score}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Score Factors */}
        <View style={styles.factorsSection}>
          <Text style={styles.sectionTitle}>What Affects Your Score</Text>
          <Text style={styles.sectionSubtitle}>
            Key factors impacting your credit score
          </Text>
          
          <View style={styles.factorsContainer}>
            {mockFactors.map((factor) => (
              <View key={factor.id} style={styles.factorCard}>
                <View style={styles.factorHeader}>
                  <View style={styles.factorInfo}>
                    {getImpactIcon(factor.impact)}
                    <Text style={styles.factorName}>{factor.name}</Text>
                  </View>
                  <Text style={styles.factorPercentage}>{factor.percentage}%</Text>
                </View>
                <Text style={styles.factorDescription}>{factor.description}</Text>
                <View style={styles.factorBar}>
                  <View 
                    style={[
                      styles.factorProgress,
                      { 
                        width: `${factor.percentage * 2.86}%`,
                        backgroundColor: getImpactColor(factor.impact)
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Award size={24} color={theme.colors.primary} />
              <Text style={styles.tipTitle}>Improve Your Score</Text>
            </View>
            <Text style={styles.tipDescription}>
              Keep credit utilization below 30%, make payments on time, and avoid opening too many new accounts.
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Info size={24} color={theme.colors.secondary} />
              <Text style={styles.tipTitle}>Score Updates</Text>
            </View>
            <Text style={styles.tipDescription}>
              Your credit score is updated monthly. Changes may take 30-45 days to reflect.
            </Text>
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
  scoreSection: {
    padding: theme.spacing.md,
  },
  scoreCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  scoreLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  refreshButton: {
    padding: theme.spacing.xs,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 80,
  },
  scoreRange: {
    alignItems: 'center',
  },
  rangeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  scoreRating: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  changeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500' as const,
  },
  rangeSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  rangeIndicator: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  rangeBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  rangeSegment: {
    height: '100%',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  currentScoreMarker: {
    position: 'relative',
    height: 20,
    marginTop: theme.spacing.sm,
  },
  scoreMarker: {
    position: 'absolute',
    top: -10,
    width: 3,
    height: 20,
    backgroundColor: theme.colors.text,
    borderRadius: 2,
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
  chartSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  chartBarFill: {
    width: 20,
    borderRadius: 10,
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
  factorsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  factorsContainer: {
    gap: theme.spacing.md,
  },
  factorCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  factorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  factorName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  factorPercentage: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700' as const,
    color: theme.colors.textSecondary,
  },
  factorDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  factorBar: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  factorProgress: {
    height: '100%',
    borderRadius: 2,
  },
  tipsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  tipCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  tipDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});