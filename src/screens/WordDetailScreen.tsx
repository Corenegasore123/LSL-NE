/**
 * Word detail screen: inline search, skeleton while loading, error states,
 * and WordMeanings when the API returns definitions for the current query.
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
import { ErrorMessage } from '../components/ErrorMessage';
import { WordDetailSkeleton } from '../components/LoadingSpinner';
import { ThemedSearchBar } from '../components/ThemedSearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { WordMeanings } from '../components/WordMeanings';
import { ACCENT } from '../constants/theme';
import { useDictionarySearchContext } from '../context/DictionarySearchContext';
import { useTheme } from '../context/ThemeContext';
import { RootDrawerParamList, RootStackParamList } from '../navigation/types';

type DetailNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'WordDetail'>,
  DrawerNavigationProp<RootDrawerParamList>
>;

export function WordDetailScreen() {
  const navigation = useNavigation<DetailNavigation>();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPad = width < 360 ? 16 : 20;
  const inkColor = isDark ? '#FAFAFA' : '#0F0F0F';

  const { data, loading, error, query, searchWord, reset } =
    useDictionarySearchContext();

  const handleRetry = useCallback(() => {
    if (query) {
      void searchWord(query);
    }
  }, [query, searchWord]);

  const handleGoBack = useCallback(() => {
    reset();
    navigation.goBack();
  }, [navigation, reset]);

  const handleSearch = useCallback(
    (word: string) => {
      Keyboard.dismiss();
      void searchWord(word);
    },
    [searchWord],
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="bg-background" edges={['top']}>
        <View className="pb-4 pt-2" style={{ paddingHorizontal: horizontalPad }}>
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.75}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-elevated"
              onPress={handleGoBack}
            >
              <Ionicons color={ACCENT} name="arrow-back" size={20} />
            </TouchableOpacity>

            <Text className="font-medium text-sm text-ink-secondary">Dictionary</Text>

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

          <ThemedSearchBar
            initialValue={query}
            loading={loading}
            onSearch={handleSearch}
            variant="inline"
          />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          {loading ? <WordDetailSkeleton word={query} /> : null}

          {!loading && error ? (
            <ErrorMessage
              error={error}
              onGoBack={handleGoBack}
              onRetry={query ? handleRetry : undefined}
            />
          ) : null}

          {!loading && !error && data ? (
            <ScrollView
              contentContainerClassName="flex-grow pb-10"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <WordMeanings entries={data} />
            </ScrollView>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
