import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { colors } from '../constants/colors';
import { safeGetItem } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasNavigated = useRef(false);
  const mounted = useRef(true);
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Cleanup function
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Prevent hardware back button on Android (not needed on web)
    const backHandler = Platform.OS !== 'web' 
      ? BackHandler.addEventListener('hardwareBackPress', () => true)
      : null;
    
    const initializeSplash = async () => {
      try {
        if (!mounted.current || hasNavigated.current) {
          return;
        }

        console.log('Splash: Starting initialization for platform:', Platform.OS);
        
        // Animate logo entrance
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
            delay: Platform.OS === 'web' ? 200 : 300
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: Platform.OS === 'web' ? 600 : 800,
            useNativeDriver: true,
            delay: Platform.OS === 'web' ? 200 : 300
          })
        ]).start();
        
        // Animate text entrance
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: Platform.OS === 'web' ? 400 : 600,
          useNativeDriver: true,
          delay: Platform.OS === 'web' ? 600 : 800
        }).start();
        
        // Wait for animations to complete - shorter on web
        await new Promise(resolve => setTimeout(resolve, Platform.OS === 'web' ? 3200 : 4800));
        
        if (!mounted.current || hasNavigated.current) {
          return;
        }
        
        // Check if we should skip to main app (for direct splash navigation)
        const userToken = await safeGetItem('userToken');
        
        if (!mounted.current || hasNavigated.current) {
          return;
        }

        console.log('Splash: Auth check - userToken:', !!userToken);
        
        // Mark as navigated before navigation
        hasNavigated.current = true;
        
        // Navigate based on state - splash should only handle onboarding flow
        if (userToken) {
          console.log('Splash: User authenticated, redirecting to main app');
          router.replace('/(tabs)');
        } else {
          console.log('Splash: Starting onboarding flow');
          router.replace('/auth/onboarding');
        }
        
      } catch (error: any) {
        console.error('Splash: Initialization error:', error);
        
        if (mounted.current) {
          setError(error?.message || 'Splash initialization failed');
        }
        
        if (!hasNavigated.current && mounted.current) {
          hasNavigated.current = true;
          // Fallback to onboarding
          setTimeout(() => {
            if (mounted.current) {
              console.log('Splash: Error fallback - navigating to onboarding');
              router.replace('/auth/onboarding');
            }
          }, 1000);
        }
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    // Add timeout to prevent infinite loading - shorter on web
    const timeoutDuration = Platform.OS === 'web' ? 4000 : 6000;
    const timeoutId = setTimeout(() => {
      if (!hasNavigated.current && mounted.current) {
        console.log('Splash: Timeout reached, forcing navigation to onboarding');
        hasNavigated.current = true;
        setError('Loading timeout - redirecting...');
        router.replace('/auth/onboarding');
      }
    }, timeoutDuration);
    
    initializeSplash();
    
    return () => {
      if (backHandler) {
        backHandler.remove();
      }
      clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity
            }
          ]}
        >
          <Image 
            source={require('../assets/images/logo/platefull-mascot.png')}
            style={styles.logo}
            onError={(error) => console.log('Splash: Logo load error:', error)}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textOpacity }
          ]}
        >
          <Text style={styles.appName}>Platefull</Text>
          {/* <Text style={styles.tagline}>Nourishing Little Ones</Text> */}
        </Animated.View>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {error ? 'Redirecting...' : `Loading${Platform.OS === 'web' ? ' Web App' : ''}...`}
            </Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0, // Change this number to control spacing between logo and text
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SplashScreen; 