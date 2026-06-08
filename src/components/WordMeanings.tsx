/**
 * Renders dictionary entries: word hero, pronunciation, and meaning cards
 * grouped by part of speech with definitions, examples, synonyms, and antonyms.
 */
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ACCENT, getAccentColor, getPartOfSpeechStyle } from '../constants/theme';
import { useDictionarySearchContext } from '../context/DictionarySearchContext';
import { useTheme } from '../context/ThemeContext';
import {
  DictionaryDefinition,
  DictionarySearchResult,
} from '../types/dictionary';
import { getPrimaryPhonetic } from '../utils/audio';
import { PronunciationPanel } from './PronunciationPanel';

interface WordMeaningsProps {
  entries: DictionarySearchResult;
}

/** Deduplicate synonym/antonym chips case-insensitively. */
function uniqueWords(words: string[]): string[] {
  const seen = new Set<string>();
  return words.filter((word) => {
    const key = word.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function WordRelationChips({
  title,
  words,
  variant,
  accentColor,
  onWordPress,
}: {
  title: string;
  words: string[];
  variant: 'synonym' | 'antonym';
  accentColor?: string;
  onWordPress: (word: string) => void;
}) {
  if (words.length === 0) {
    return null;
  }

  const isSynonym = variant === 'synonym';
  const chipColor = isSynonym ? (accentColor ?? ACCENT) : '#DC2626';

  return (
    <View className="mt-4">
      <Text className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {title}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {words.map((word) => (
          <TouchableOpacity
            key={word}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${word}`}
            activeOpacity={0.75}
            className="rounded-full border border-border bg-card px-3 py-1.5"
            onPress={() => onWordPress(word)}
          >
            <Text className="text-xs font-medium" style={{ color: chipColor }}>
              {word}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function MeaningCard({
  partOfSpeech,
  definitions,
  meaningSynonyms = [],
  meaningAntonyms = [],
  index,
  isDark,
  onWordPress,
}: {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  meaningSynonyms?: string[];
  meaningAntonyms?: string[];
  index: number;
  isDark: boolean;
  onWordPress: (word: string) => void;
}) {
  const posStyle = getPartOfSpeechStyle(isDark, partOfSpeech);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const mono = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  const usedSynonyms = new Set(
    definitions
      .flatMap((def) => def.synonyms ?? [])
      .map((word) => word.toLowerCase()),
  );
  const usedAntonyms = new Set(
    definitions
      .flatMap((def) => def.antonyms ?? [])
      .map((word) => word.toLowerCase()),
  );
  const synonyms = uniqueWords(meaningSynonyms).filter(
    (word) => !usedSynonyms.has(word.toLowerCase()),
  );
  const antonyms = uniqueWords(meaningAntonyms).filter(
    (word) => !usedAntonyms.has(word.toLowerCase()),
  );

  return (
    <Animated.View
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View className="h-[3px] w-full" style={{ backgroundColor: posStyle.color }} />

      <View className="p-5">
        <View className="mb-6 flex-row items-center gap-2">
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: posStyle.color }}
          />
          <Text
            className="text-[11px] font-bold tracking-[1.5px]"
            style={{ color: posStyle.color }}
          >
            {partOfSpeech.toUpperCase()}
          </Text>
        </View>

      {definitions.map((def, defIndex) => {
        const defSynonyms = uniqueWords(def.synonyms ?? []);
        const defAntonyms = uniqueWords(def.antonyms ?? []);

        return (
          <View
            key={`${def.definition}-${defIndex}`}
            className={defIndex > 0 ? 'mt-6 border-t border-border/60 pt-6' : ''}
          >
            <Text
              className="mb-1.5 text-xs font-semibold"
              style={{ fontFamily: mono, color: posStyle.color }}
            >
              {(defIndex + 1).toString().padStart(2, '0')}
            </Text>
            <Text className="font-sans text-[15px] leading-6 text-ink">
              {def.definition}
            </Text>
            {def.example ? (
              <View
                className="mt-3 border-l-[3px] pl-3"
                style={{ borderLeftColor: posStyle.color }}
              >
                <Text className="font-sans text-sm italic leading-[22px] text-ink-secondary">
                  “{def.example}”
                </Text>
              </View>
            ) : null}
            <WordRelationChips
              accentColor={posStyle.color}
              title="Synonyms"
              variant="synonym"
              words={defSynonyms}
              onWordPress={onWordPress}
            />
            <WordRelationChips
              title="Antonyms"
              variant="antonym"
              words={defAntonyms}
              onWordPress={onWordPress}
            />
          </View>
        );
      })}

      <WordRelationChips
        accentColor={posStyle.color}
        title="Synonyms"
        variant="synonym"
        words={synonyms}
        onWordPress={onWordPress}
      />
      <WordRelationChips
        title="Antonyms"
        variant="antonym"
        words={antonyms}
        onWordPress={onWordPress}
      />
      </View>
    </Animated.View>
  );
}

export function WordMeanings({ entries }: WordMeaningsProps) {
  const { isDark } = useTheme();
  const { searchWord } = useDictionarySearchContext();
  const accentColor = getAccentColor(isDark);
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(16)).current;

  const handleRelatedWord = useCallback(
    (word: string) => {
      void searchWord(word);
    },
    [searchWord],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, heroTranslateY]);

  let cardIndex = 0;

  return (
    <View className="pb-10">
      {entries.map((entry, entryIndex) => {
        const phoneticText = getPrimaryPhonetic(
          entry.word,
          entry.phonetic,
          entry.phonetics ?? [],
        );
        const meanings = entry.meanings ?? [];

        return (
          <View key={`${entry.word}-${entryIndex}`} className="px-5 pt-4">
            <Animated.View
              className="rounded-3xl border border-border bg-card p-5 shadow-card"
              style={{
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }],
              }}
            >
              <Text className="font-serif text-[34px] capitalize text-ink">
                {entry.word}
              </Text>

              <PronunciationPanel
                phoneticText={phoneticText}
                phonetics={entry.phonetics ?? []}
              />

              {entry.origin ? (
                <View className="mt-4 flex-row items-start rounded-2xl bg-surface px-3 py-3">
                  <Ionicons
                    color={accentColor}
                    name="information-circle-outline"
                    size={16}
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Text className="flex-1 font-sans text-xs leading-5 text-ink-secondary">
                    {entry.origin}
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            {meanings.length > 0 ? (
              <View className="mb-3 mt-10 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-border" />
                <Text className="font-semibold text-[10px] tracking-[2px] text-ink-muted">
                  DEFINITIONS
                </Text>
                <View className="h-px flex-1 bg-border" />
              </View>
            ) : null}

            <View className="gap-8">
              {meanings.map((meaning, meaningIndex) => {
                const currentIndex = cardIndex;
                cardIndex += 1;
                return (
                  <MeaningCard
                    key={`${meaning.partOfSpeech}-${meaningIndex}`}
                    definitions={meaning.definitions ?? []}
                    index={currentIndex}
                    isDark={isDark}
                    meaningAntonyms={meaning.antonyms}
                    meaningSynonyms={meaning.synonyms}
                    onWordPress={handleRelatedWord}
                    partOfSpeech={meaning.partOfSpeech ?? 'other'}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
