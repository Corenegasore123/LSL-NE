/**
 * Sun/moon button that toggles light and dark mode via ThemeContext.
 */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { getAccentColor } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 22 }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const rotation = useRef(new Animated.Value(isDark ? 0 : 180)).current;
  const iconColor = getAccentColor(isDark);

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isDark ? 0 : 180,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isDark, rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      activeOpacity={0.75}
      className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-elevated"
      onPress={toggleTheme}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={size}
          color={iconColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
