/**
 * Full-screen error UI on Word Detail for API failures: not found, network,
 * validation, and server errors. Optional Try Again and Go Back actions.
 */
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { DictionaryFetchError } from '../api/dictionaryService';
import { useTheme } from '../context/ThemeContext';

interface ErrorMessageProps {
  error: DictionaryFetchError;
  onRetry?: () => void;
  onGoBack?: () => void;
}

function getHeading(error: DictionaryFetchError): string {
  switch (error.type) {
    case 'not_found':
      return 'Word Not Found';
    case 'network':
      return 'Connection Error';
    case 'server':
      return 'Service Unavailable';
    case 'validation':
      return 'Invalid Search';
    default:
      return 'Something Went Wrong';
  }
}

function getIconName(
  error: DictionaryFetchError,
): keyof typeof Ionicons.glyphMap {
  if (error.type === 'not_found') {
    return 'book-outline';
  }
  if (error.type === 'validation') {
    return 'alert-circle-outline';
  }
  return 'cloud-offline-outline';
}

export function ErrorMessage({ error, onRetry, onGoBack }: ErrorMessageProps) {
  const { isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const accentColor = isDark ? '#7C6FFF' : '#5B4FE8';

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <Ionicons name={getIconName(error)} size={40} color={accentColor} />
      </View>
      <Text className="text-center font-bold text-2xl tracking-tight text-ink">
        {getHeading(error)}
      </Text>
      <Text className="mt-2 text-center font-sans text-[15px] leading-6 text-ink-secondary">
        {error.message}
      </Text>

      {onRetry ? (
        <Animated.View className="w-full" style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Try again"
            activeOpacity={0.75}
            className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4"
            onPress={onRetry}
            onPressIn={pressIn}
            onPressOut={pressOut}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text className="font-bold text-[15px] text-white">Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      {onGoBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.75}
          className="mt-4 p-2"
          onPress={onGoBack}
        >
          <Text className="font-medium text-sm text-ink-secondary">Go Back</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
