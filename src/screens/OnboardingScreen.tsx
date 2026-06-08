/**
 * Splash / onboarding screen shown on first launch. Animated branding and
 * progress bar; auto-navigates to Home after SPLASH_DURATION_MS.
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, StatusBar, Text, View } from 'react-native';
import { ACCENT } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/types';

const SPLASH_DURATION_MS = 2400;

type SplashNavigation = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const navigation = useNavigation<SplashNavigation>();
  const { isDark } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: SPLASH_DURATION_MS - 200,
        useNativeDriver: false,
      }),
    ]).start();

    const taglineTimer = setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 350);

    const exitTimer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          navigation.replace('Home');
        }
      });
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
    };
  }, [fade, navigation, progress, scale, taglineOpacity]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View
        className="items-center px-8"
        style={{ opacity: fade, transform: [{ scale }] }}
      >
        <View className="h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-accent shadow-card">
          <Text className="font-bold text-[40px] text-white">L</Text>
        </View>

        <Text className="mt-8 font-serif text-[42px] text-ink">Lexis</Text>
        <Text className="mt-2 font-semibold text-[11px] tracking-[4px] text-ink-muted">
          DICTIONARY
        </Text>

        <Animated.Text
          className="mt-6 text-center font-sans text-sm text-ink-secondary"
          style={{ opacity: taglineOpacity }}
        >
          Loading your word explorer…
        </Animated.Text>
      </Animated.View>

      <View className="absolute bottom-28 h-1 w-44 overflow-hidden rounded-full bg-border">
        <Animated.View
          className="h-full rounded-full"
          style={{ width: barWidth, backgroundColor: ACCENT }}
        />
      </View>
    </View>
  );
}
