import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SlotMachineProps {
  cashbackAmount: number;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');
const REEL_HEIGHT = 200;
const ITEM_HEIGHT = 50;

const symbols = ['💰', '💵', '💎', '🎁', '⭐', '🔥', '🎉', '✨'];

export function SlotMachine({ cashbackAmount, onComplete }: SlotMachineProps) {
  const [showResult, setShowResult] = useState(false);
  const reel1 = useRef(new Animated.Value(0)).current;
  const reel2 = useRef(new Animated.Value(0)).current;
  const reel3 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startSpinning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSpinning = () => {
    const spins = [
      { reel: reel1, delay: 0 },
      { reel: reel2, delay: 300 },
      { reel: reel3, delay: 600 },
    ];

    spins.forEach(({ reel, delay }) => {
      setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        Animated.sequence([
          Animated.timing(reel, {
            toValue: -ITEM_HEIGHT * symbols.length * 5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.spring(reel, {
            toValue: -ITEM_HEIGHT * 2,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (delay === 600) {
            setTimeout(() => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              setShowResult(true);
              
              Animated.parallel([
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  tension: 50,
                  friction: 5,
                  useNativeDriver: true,
                }),
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(glowAnim, {
                      toValue: 1,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                      toValue: 0,
                      duration: 1000,
                      useNativeDriver: true,
                    }),
                  ])
                ),
              ]).start();

              setTimeout(() => {
                onComplete();
              }, 3000);
            }, 500);
          }
        });
      }, delay);
    });
  };

  const renderReel = (animatedValue: Animated.Value) => {
    const items = [...symbols, ...symbols, ...symbols];
    
    return (
      <View style={styles.reelContainer}>
        <Animated.View
          style={[
            styles.reel,
            {
              transform: [{ translateY: animatedValue }],
            },
          ]}
        >
          {items.map((symbol, index) => (
            <View key={index} style={styles.reelItem}>
              <Text style={styles.symbol}>{symbol}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.3)'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.machine}>
        <Text style={styles.title}>SPINNING FOR CASHBACK!</Text>
        
        <View style={styles.reelsWrapper}>
          <View style={styles.reels}>
            {renderReel(reel1)}
            {renderReel(reel2)}
            {renderReel(reel3)}
          </View>
          <View style={styles.reelBorder} />
        </View>

        {showResult && (
          <Animated.View
            style={[
              styles.resultContainer,
              {
                transform: [{ scale: scaleAnim }],
                backgroundColor: glowColor,
              },
            ]}
          >
            <Text style={styles.winText}>YOU WON!</Text>
            <Text style={styles.cashbackAmount}>
              ${cashbackAmount.toFixed(2)}
            </Text>
            <Text style={styles.cashbackLabel}>Cashback Earned</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  machine: {
    width: width * 0.85,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    letterSpacing: 2,
  },
  reelsWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.xl,
  },
  reels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: REEL_HEIGHT,
    overflow: 'hidden',
  },
  reelBorder: {
    position: 'absolute',
    top: REEL_HEIGHT / 2 - ITEM_HEIGHT / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  reelContainer: {
    width: 80,
    height: REEL_HEIGHT,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  reel: {
    paddingTop: REEL_HEIGHT / 2 - ITEM_HEIGHT / 2,
  },
  reelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 32,
  },
  resultContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  winText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    letterSpacing: 3,
  },
  cashbackAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  cashbackLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
