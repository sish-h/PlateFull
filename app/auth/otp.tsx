import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Button from '../../components/common/Button';
import StatusBar from '../../components/common/StatusBar';
import { colors } from '../../constants/colors';
import authService from '../../utils/authService';
import { shadowPresets } from '../../utils/shadowUtils';

const { width } = Dimensions.get('window');

const OTPScreen = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
    
    // Start resend cooldown
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  const triggerShake = () => {
    shakeAnimation.value = withTiming(-10, { duration: 50 }, () => {
      shakeAnimation.value = withTiming(10, { duration: 50 }, () => {
        shakeAnimation.value = withTiming(-5, { duration: 50 }, () => {
          shakeAnimation.value = withTiming(5, { duration: 50 }, () => {
            shakeAnimation.value = withSpring(0);
          });
        });
      });
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.verifyOTP(email as string, otpCode);
      
      if (result.success) {
        router.replace('/auth/verification-success');
      } else {
        triggerShake();
        setError(result.message || 'Invalid OTP. Please try again.');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      triggerShake();
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
             const result = await authService.resendOTP(email as string);
      if (result.success) {
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Verify Email</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <View style={[styles.iconContainer, shadowPresets.small]}>
            <Ionicons name="mail" size={32} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <Animated.View style={[styles.otpContainer, shakeAnimatedStyle]}>
          <Text style={styles.otpLabel}>Enter verification code</Text>
          
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </Animated.View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn&apos;t receive the code?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendCooldown > 0}
          >
            <Text style={[
              styles.resendButton,
              resendCooldown > 0 && styles.resendButtonDisabled
            ]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Verify"
            onPress={() => handleVerifyOtp(otp.join(''))}
            disabled={otp.some(digit => !digit) || loading}
            loading={loading}
            style={styles.verifyButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: colors.primary,
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: (width - 80) / 6,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: colors.backgroundSecondary,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  resendButtonDisabled: {
    color: colors.text.muted,
  },
  buttonContainer: {
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: colors.primary,
  },
});

export default OTPScreen; 