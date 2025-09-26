import { useAuth } from '@/hooks/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CreditCard, Star, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//const { width } = Dimensions.get('window');

export default function CreditScoreScreen() {
  const router = useRouter();
  const { tempUserData, saveUser } = useAuth();
  const [displayScore, setDisplayScore] = useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  const creditScore = tempUserData.creditScore || 750;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: creditScore,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [creditScore, animatedValue, scaleAnim]);

  const getCreditRating = (score: number) => {
    if (score >= 800) return { rating: 'Excellent', color: '#4CAF50' };
    if (score >= 740) return { rating: 'Very Good', color: '#8BC34A' };
    if (score >= 670) return { rating: 'Good', color: '#FFC107' };
    if (score >= 580) return { rating: 'Fair', color: '#FF9800' };
    return { rating: 'Poor', color: '#F44336' };
  };

  const { rating, color } = getCreditRating(creditScore);

  const handleContinue = async () => {
    const fullUserData = {
      firstName: tempUserData.firstName || '',
      lastName: tempUserData.lastName || '',
      email: tempUserData.email || '',
      ssn: tempUserData.ssn || '',
      creditScore: creditScore,
      isVerified: true,
      agreedToTerms: true,
    };

    // Save user to the main user storage
    await saveUser(fullUserData);
    
    // Also save to allUsers list for login functionality
    try {
      const allUsers = await AsyncStorage.getItem('allUsers');
      const users = allUsers ? JSON.parse(allUsers) : [];
      const existingUserIndex = users.findIndex((u: any) => u.email === fullUserData.email);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = fullUserData;
      } else {
        users.push(fullUserData);
      }
      
      await AsyncStorage.setItem('allUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving to allUsers:', error);
    }
    
    router.push('/add-card');
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {tempUserData.firstName}!</Text>
            <Text style={styles.title}>Your Credit Score</Text>
          </View>

          <Animated.View 
            style={[
              styles.scoreContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={[color, color + '80']}
              style={styles.scoreCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scoreNumber}>{displayScore}</Text>
              <Text style={styles.scoreMax}>out of 850</Text>
              <View style={[styles.ratingBadge, { backgroundColor: color }]}>
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Your Benefits</Text>
            
            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <CreditCard size={24} color="#4CAF50" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Premium Cards</Text>
                <Text style={styles.benefitDescription}>
                  Access to exclusive credit cards with better rewards
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <TrendingUp size={24} color="#FF9800" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Better Rates</Text>
                <Text style={styles.benefitDescription}>
                  Lower APR and higher credit limits
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Star size={24} color="#2196F3" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Exclusive Rewards</Text>
                <Text style={styles.benefitDescription}>
                  Earn up to 5% cashback on select categories
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>Add Your First Card</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -5,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});