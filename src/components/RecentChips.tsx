/**
 * Horizontal chips on Home showing recent searches from history.
 * Tapping a chip triggers the same search flow as typing in the search bar.
 */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ACCENT } from '../constants/theme';
import { useSearchHistory } from '../context/SearchHistoryContext';

interface RecentChipsProps {
  words: string[];
  onSelect: (word: string) => void;
}

function Chip({
  word,
  index,
  onSelect,
}: {
  word: string;
  index: number;
  onSelect: (word: string) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Search ${word} again`}
        activeOpacity={0.75}
        className="mb-2 mr-2 flex-row items-center rounded-full border border-border bg-surface-elevated px-4 py-2.5"
        onPress={() => onSelect(word)}
      >
        <Ionicons color={ACCENT} name="time-outline" size={13} />
        <Text className="ml-2 font-medium text-sm capitalize text-ink">{word}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function RecentChips({ words, onSelect }: RecentChipsProps) {
  const { clearHistory } = useSearchHistory();

  if (words.length === 0) {
    return null;
  }

  const recent = words.slice(0, 10);

  return (
    <View className="mt-8">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-semibold text-[11px] tracking-[1.5px] text-ink-muted">
          RECENT SEARCHES
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.75}
          onPress={() => void clearHistory()}
        >
          <Text className="font-semibold text-xs text-accent">Clear</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap">
        {recent.map((word, index) => (
          <Chip key={word} index={index} onSelect={onSelect} word={word} />
        ))}
      </View>
    </View>
  );
}
