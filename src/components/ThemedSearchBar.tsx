/**
 * Reusable search input used on Home (stacked) and Word Detail (inline).
 * Validates on submit, shows history-based suggestions, and shake animation on error.
 */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { ACCENT } from '../constants/theme';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { useTheme } from '../context/ThemeContext';
import { getSearchSuggestions } from '../utils/searchSuggestions';
import { validateSearchQuery } from '../utils/searchValidation';

interface ThemedSearchBarProps {
  initialValue?: string;
  loading?: boolean;
  variant?: 'inline' | 'stacked';
  embedded?: boolean;
  autoFocus?: boolean;
  enableSuggestions?: boolean;
  onSearch: (word: string) => void;
}

/** Dropdown of recent or prefix-matched history items below the search field. */
function SuggestionList({
  suggestions,
  query,
  onSelect,
}: {
  suggestions: string[];
  query: string;
  onSelect: (word: string) => void;
}) {
  const label = query.trim() ? 'Suggestions' : 'Recent';

  return (
    <View className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
      <Text className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </Text>
      {suggestions.map((word, index) => (
        <Pressable
          key={word}
          accessibilityRole="button"
          accessibilityLabel={`Search for ${word}`}
          className={`flex-row items-center px-4 py-3 active:bg-surface ${
            index < suggestions.length - 1 ? 'border-b border-border/70' : ''
          }`}
          onPress={() => onSelect(word)}
        >
          <Ionicons color={ACCENT} name="time-outline" size={16} />
          <Text className="ml-3 flex-1 font-sans text-[15px] capitalize text-ink">{word}</Text>
          <Ionicons color="#737373" name="arrow-up-outline" size={14} style={{ transform: [{ rotate: '45deg' }] }} />
        </Pressable>
      ))}
    </View>
  );
}

export function ThemedSearchBar({
  initialValue = '',
  loading = false,
  variant = 'inline',
  embedded = false,
  autoFocus = false,
  enableSuggestions = true,
  onSearch,
}: ThemedSearchBarProps) {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { history } = useSearchHistory();
  const isNarrow = width < 360;

  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const shakeX = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const suggestions = useMemo(
    () => (enableSuggestions ? getSearchSuggestions(value, history) : []),
    [enableSuggestions, history, value],
  );

  const showSuggestions =
    enableSuggestions && focused && suggestions.length > 0 && !loading;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  const runShake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const submitWord = (raw: string) => {
    const result = validateSearchQuery(raw);
    if (!result.valid) {
      setValidationError(result.message);
      runShake();
      return;
    }

    setValidationError(null);
    setFocused(false);
    inputRef.current?.blur();
    onSearch(result.word);
  };

  const handleSubmit = () => {
    submitWord(value);
  };

  const handleChangeText = (text: string) => {
    setValue(text);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSuggestionSelect = (word: string) => {
    setValue(word);
    submitWord(word);
  };

  const validationMessage = validationError ? (
    <Text className="mt-2 text-xs font-medium text-error">{validationError}</Text>
  ) : null;

  const fieldShellClass = embedded
    ? `w-full flex-row items-center rounded-2xl bg-background px-1 ${
        validationError ? 'border border-error' : ''
      }`
    : `w-full rounded-2xl border bg-card pl-3 pr-1.5 ${
        validationError ? 'border-error' : focused ? 'border-accent/40' : 'border-border'
      }`;

  const goButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Search"
      activeOpacity={0.75}
      className={`items-center justify-center rounded-2xl bg-accent ${
        variant === 'stacked'
          ? 'w-full py-4'
          : isNarrow
            ? 'h-10 min-w-[44px] px-3'
            : 'h-10 min-w-[52px] px-4'
      }`}
      disabled={loading}
      onPress={handleSubmit}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text className="font-bold text-sm text-white">Go</Text>
      )}
    </TouchableOpacity>
  );

  const inputField = (
    <TextInput
      ref={inputRef}
      accessibilityLabel="Search word input"
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      className="flex-1 font-sans text-base text-ink"
      editable={!loading}
      importantForAutofill="no"
      onBlur={() => {
        setTimeout(() => setFocused(false), 150);
      }}
      onChangeText={handleChangeText}
      onFocus={() => setFocused(true)}
      onSubmitEditing={handleSubmit}
      placeholder="Type a word…"
      placeholderTextColor={isDark ? '#737373' : '#828282'}
      returnKeyType="search"
      spellCheck={false}
      style={{
        flex: 1,
        minWidth: 0,
        paddingVertical: Platform.OS === 'ios' ? (variant === 'stacked' ? 12 : 10) : 8,
        minHeight: variant === 'stacked' ? 48 : undefined,
      }}
      textContentType="none"
      value={value}
    />
  );

  if (variant === 'stacked') {
    return (
      <View className="w-full">
        <Animated.View className="w-full" style={{ transform: [{ translateX: shakeX }] }}>
          <View
            className={`w-full flex-row items-center rounded-2xl border bg-card px-3 ${
              validationError ? 'border-error' : focused ? 'border-accent/40' : 'border-border'
            }`}
          >
            <Ionicons color={ACCENT} name="search" size={20} />
            <View className="ml-2 flex-1">{inputField}</View>
          </View>
          <View className="mt-4">{goButton}</View>
        </Animated.View>
        {showSuggestions ? (
          <SuggestionList
            query={value}
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
          />
        ) : null}
        {validationMessage}
      </View>
    );
  }

  return (
    <View className="w-full">
      <Animated.View
        className={fieldShellClass}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          transform: [{ translateX: shakeX }],
        }}
      >
        <Ionicons color={ACCENT} name="search" size={20} />
        <View className="mx-2 flex-1">{inputField}</View>
        {goButton}
      </Animated.View>
      {showSuggestions ? (
        <SuggestionList
          query={value}
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
        />
      ) : null}
      {validationMessage}
    </View>
  );
}
