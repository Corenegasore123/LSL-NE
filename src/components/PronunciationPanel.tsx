/**
 * Compact pronunciation controls: phonetic text, play/stop, accent pills (UK/US),
 * and playback speed. Uses usePronunciation hook with expo-av.
 */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ACCENT } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  PlaybackSpeed,
  usePronunciation,
} from '../hooks/usePronunciation';
import { DictionaryPhonetic } from '../types/dictionary';

interface PronunciationPanelProps {
  phonetics: DictionaryPhonetic[];
  phoneticText?: string | null;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1.0, 1.5];

function speedLabel(speed: PlaybackSpeed): string {
  if (speed === 1.0) {
    return '1×';
  }
  return `${speed}×`;
}

function IconButton({
  icon,
  label,
  onPress,
  disabled,
  active,
  inkColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  inkColor: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.75}
      className={`h-11 w-11 items-center justify-center rounded-2xl border ${
        active ? 'border-accent bg-accent/10' : 'border-border bg-surface-elevated'
      } ${disabled ? 'opacity-40' : ''}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons color={active ? ACCENT : inkColor} name={icon} size={20} />
    </TouchableOpacity>
  );
}

export function PronunciationPanel({
  phonetics,
  phoneticText,
}: PronunciationPanelProps) {
  const { isDark } = useTheme();
  const inkColor = isDark ? '#FAFAFA' : '#0F0F0F';

  const {
    audioSources,
    selectedSource,
    setSelectedSource,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    isPaused,
    isLoading,
    hasActiveAudio,
    play,
    pause,
    stop,
    error,
  } = usePronunciation(phonetics);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) {
      pulse.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isPlaying, pulse]);

  if (audioSources.length === 0) {
    if (!phoneticText) {
      return null;
    }

    return (
      <Text className="mt-2 font-sans text-base italic text-accent">
        {phoneticText.startsWith('/') ? phoneticText : `/${phoneticText}/`}
      </Text>
    );
  }

  const selected = audioSources[selectedSource];
  const selectedLabel = selected?.label ?? 'EN';
  const selectedPhonetic = selected?.phonetic?.trim() || phoneticText?.trim();
  const displayPhonetic = selectedPhonetic
    ? selectedPhonetic.startsWith('/')
      ? selectedPhonetic
      : `/${selectedPhonetic}/`
    : null;

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const handleSpeakerPress = () => {
    if (isLoading) {
      return;
    }
    if (isPlaying) {
      void pause();
      return;
    }
    void play();
  };

  const speakerIcon: keyof typeof Ionicons.glyphMap = isLoading
    ? 'hourglass-outline'
    : isPlaying
      ? 'pause'
      : 'volume-high';

  return (
    <View className="mt-3">
      <View className="flex-row items-center gap-2">
        {displayPhonetic ? (
          <Text className="min-w-0 flex-1 font-sans text-base italic text-accent">
            {displayPhonetic}
          </Text>
        ) : (
          <View className="flex-1" />
        )}

        <View className="relative flex-row items-center gap-2">
          {isPlaying ? (
            <Animated.View
              className="absolute right-0 h-11 w-11 rounded-2xl border border-accent"
              style={{
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              }}
            />
          ) : null}

          {isLoading ? (
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-elevated">
              <ActivityIndicator color={ACCENT} size="small" />
            </View>
          ) : (
            <IconButton
              active={isPlaying || isPaused}
              icon={speakerIcon}
              inkColor={inkColor}
              label={
                isPlaying
                  ? 'Pause pronunciation'
                  : isPaused
                    ? 'Resume pronunciation'
                    : 'Play pronunciation'
              }
              onPress={handleSpeakerPress}
            />
          )}

          {hasActiveAudio ? (
            <IconButton
              icon="stop"
              inkColor={inkColor}
              label="Stop pronunciation"
              onPress={() => void stop()}
            />
          ) : null}
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        {audioSources.map((source, index) => {
          const isSelected = index === selectedSource;
          return (
            <TouchableOpacity
              key={`${source.label}-${source.url}`}
              accessibilityRole="button"
              accessibilityLabel={`${source.label} accent`}
              activeOpacity={0.75}
              className={`rounded-full border px-3 py-1 ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-elevated'
              }`}
              onPress={() => void setSelectedSource(index)}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  isSelected ? 'text-accent' : 'text-ink-secondary'
                }`}
              >
                {source.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View className="ml-auto flex-row items-center gap-1.5">
          {SPEEDS.map((speed) => {
            const isSelected = playbackSpeed === speed;
            return (
              <TouchableOpacity
                key={speed}
                accessibilityRole="button"
                activeOpacity={0.75}
                className={`rounded-full border px-2.5 py-1 ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-elevated'
                }`}
                onPress={() => setPlaybackSpeed(speed)}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    isSelected ? 'text-accent' : 'text-ink-muted'
                  }`}
                >
                  {speedLabel(speed)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isPlaying || isPaused || isLoading ? (
        <Text className="mt-2 text-[11px] font-medium text-ink-muted">
          {isLoading
            ? `Loading ${selectedLabel} pronunciation…`
            : isPaused
              ? `Paused · ${selectedLabel} · ${speedLabel(playbackSpeed)}`
              : `Playing · ${selectedLabel} · ${speedLabel(playbackSpeed)}`}
        </Text>
      ) : null}

      {error ? (
        <View className="mt-2 flex-row items-center">
          <Ionicons color="#DC2626" name="alert-circle-outline" size={13} />
          <Text className="ml-2 text-xs text-error">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
