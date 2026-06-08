/**
 * Home screen: hero copy, search bar with suggestions, recent chips,
 * and a shortcut card to open search history in the drawer.
 */
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecentChips } from '../components/RecentChips';
import { ThemedSearchBar } from '../components/ThemedSearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { ACCENT } from '../constants/theme';
import { useDictionarySearchContext } from '../context/DictionarySearchContext';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { useTheme } from '../context/ThemeContext';
import { RootDrawerParamList, RootStackParamList } from '../navigation/types';

type HomeNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Home'>,
  DrawerNavigationProp<RootDrawerParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPad = width < 360 ? 16 : 24;

  const { loading, searchWord } = useDictionarySearchContext();
  const { history } = useSearchHistory();

  const inkColor = isDark ? '#FAFAFA' : '#0F0F0F';

  const handleSearch = useCallback(
    (word: string) => {
      Keyboard.dismiss();
      navigation.navigate('WordDetail');
      void searchWord(word);
    },
    [navigation, searchWord],
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow pb-12"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              className="flex-row items-start justify-between pb-2 pt-4"
              style={{ paddingHorizontal: horizontalPad }}
            >
              <View className="flex-1 pr-3">
                <Text className="font-serif text-[28px] text-ink">Lexis</Text>
                <Text className="mt-1 font-semibold text-[10px] tracking-[2px] text-ink-muted">
                  DICTIONARY
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <ThemeToggle />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Open search history"
                  activeOpacity={0.75}
                  className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-elevated"
                  onPress={() => navigation.openDrawer()}
                >
                  <Ionicons color={inkColor} name="menu" size={22} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingHorizontal: horizontalPad }}>
              <View className="mb-3 flex-row items-center gap-3">
                <View className="h-px w-8 bg-accent/50" />
                <Text className="font-semibold text-[10px] tracking-[2px] text-ink-muted">
                  ENGLISH DICTIONARY
                </Text>
              </View>

              <Text
                className="font-serif leading-tight text-ink"
                style={{ fontSize: width < 360 ? 30 : 34 }}
              >
                Every word.{' '}
                <Text className="text-accent">Defined.</Text>
              </Text>
              <Text className="mt-3 font-sans text-sm leading-6 text-ink-secondary">
                Meanings, phonetics & audio pronunciations.
              </Text>

              <View className="mt-8">
                <ThemedSearchBar
                  autoFocus={false}
                  loading={loading}
                  onSearch={handleSearch}
                  variant="stacked"
                />
              </View>
            </View>

            <View className="mt-8" style={{ paddingHorizontal: horizontalPad }}>
              <RecentChips words={history} onSelect={handleSearch} />
            </View>

            <View className="mt-10" style={{ paddingHorizontal: horizontalPad }}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                className="flex-row items-center rounded-3xl border border-accent/25 bg-accent/10 p-4 sm:p-5"
                onPress={() => navigation.openDrawer()}
              >
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 sm:mr-4 sm:h-12 sm:w-12">
                  <Ionicons color={ACCENT} name="time-outline" size={22} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-bold text-base text-ink">Search history</Text>
                  <Text className="mt-0.5 font-sans text-xs text-ink-secondary">
                    Tap &gt; on any word to view it again
                  </Text>
                </View>
                <Ionicons color={ACCENT} name="chevron-forward" size={20} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
