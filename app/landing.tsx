import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hfqf9pzk7ns8eloiyklfp' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>ZEDX</Text>
            </View>
            <Text style={styles.tagline}>Smart Credit Management</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.iconWrapper}>
                <CreditCard size={32} color="#4CAF50" />
              </View>
              <Text style={styles.featureTitle}>PAY BILLS</Text>
              <Text style={styles.featureDescription}>
                Manage all your credit cards in one place
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.iconWrapper}>
                <TrendingUp size={32} color="#FF9800" />
              </View>
              <Text style={styles.featureTitle}>EARN REWARDS</Text>
              <Text style={styles.featureDescription}>
                Get cashback and rewards on every payment
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.iconWrapper}>
                <DollarSign size={32} color="#2196F3" />
              </View>
              <Text style={styles.featureTitle}>SAVE MONEY</Text>
              <Text style={styles.featureDescription}>
                Smart insights to optimize your spending
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/signup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Join millions of Americans managing their credit smarter
            </Text>
          </View>
        </View>
      </SafeAreaView>
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
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 40 : 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 15,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    letterSpacing: 1,
  },
  featuresContainer: {
    marginTop: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    maxWidth: 250,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  withText: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 30,
    letterSpacing: 2,
  },
  continueButton: {
    width: width - 40,
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    letterSpacing: 1,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
});