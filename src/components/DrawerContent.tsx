/**
 * Custom drawer panel: Lexis branding, searchable history list with view/delete
 * actions, clear-all button, and theme toggle in the footer.
 */
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT } from '../constants/theme';
import { useDictionarySearchContext } from '../context/DictionarySearchContext';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { ThemeToggle } from './ThemeToggle';

function HistoryItem({
  word,
  index,
  isActive,
  onView,
  onDelete,
  slideAnim,
  mutedColor,
}: {
  word: string;
  index: number;
  isActive: boolean;
  onView: (word: string) => void;
  onDelete: (word: string) => void;
  slideAnim: Animated.Value;
  mutedColor: string;
}) {
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
  });
  const opacity = slideAnim;

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <View
        className={`flex-row items-center gap-2 rounded-xl px-2 py-3 ${
          isActive ? 'bg-surface-elevated' : ''
        }`}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/10">
          <Ionicons color={ACCENT} name="book-outline" size={16} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="font-bold text-[15px] capitalize text-ink">{word}</Text>
          <Text className="mt-0.5 font-sans text-[11px] text-ink-muted">
            #{index + 1}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`View ${word} again`}
          activeOpacity={0.75}
          className="h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
          onPress={() => onView(word)}
        >
          <Ionicons color={ACCENT} name="chevron-forward" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Remove ${word} from history`}
          activeOpacity={0.75}
          className="h-9 w-9 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => onDelete(word)}
        >
          <Ionicons color={mutedColor} name="close" size={18} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const mutedColor = '#737373';

  const { history, clearHistory, removeFromHistory, isReady } = useSearchHistory();
  const { searchWord, query } = useDictionarySearchContext();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [history.length, slideAnim]);

  const handleView = (word: string) => {
    navigation.navigate('Main', { screen: 'WordDetail' });
    void searchWord(word);
    navigation.closeDrawer();
  };

  const handleDelete = (word: string) => {
    void removeFromHistory(word);
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-6 pb-6 pt-4">
        <View className="mb-4 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-accent">
          <Text className="font-bold text-2xl text-white">L</Text>
        </View>
        <Text className="font-bold text-[32px] tracking-wide text-ink">LEXIS</Text>
        <Text className="mt-1 font-sans text-sm text-ink-secondary">
          Your personal word explorer
        </Text>
        <View className="mt-2 h-[3px] w-12 rounded-sm bg-accent" />
      </View>

      <View className="flex-row items-center gap-2 px-6 pb-2">
        <Ionicons color={ACCENT} name="time-outline" size={18} />
        <Text className="flex-1 font-bold text-[15px] text-ink">Search History</Text>
        <View className="min-w-[28px] items-center justify-center rounded-full bg-accent/10 px-2 py-1">
          <Text className="font-semibold text-[11px] text-accent">
            {history.length}
          </Text>
        </View>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pb-4"
        data={isReady ? history : []}
        ItemSeparatorComponent={() => (
          <View className="ml-[52px] h-px bg-border" />
        )}
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <View className="items-center px-6 py-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Ionicons color={ACCENT} name="library-outline" size={32} />
            </View>
            <Text className="font-bold text-lg text-ink">No history yet</Text>
            <Text className="mt-1 text-center font-sans text-sm text-ink-muted">
              Words you search will appear here
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <HistoryItem
            index={index}
            isActive={query.toLowerCase() === item.toLowerCase()}
            mutedColor={mutedColor}
            onDelete={handleDelete}
            onView={handleView}
            slideAnim={slideAnim}
            word={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <View
        className="gap-4 border-t border-border px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {history.length > 0 ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            className="items-center rounded-2xl border-[1.5px] border-error py-4"
            onPress={() => void clearHistory()}
          >
            <Text className="font-semibold text-sm text-error">Clear All</Text>
          </TouchableOpacity>
        ) : null}

        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-sm text-ink-secondary">Appearance</Text>
          <ThemeToggle />
        </View>
      </View>
    </View>
  );
}
