/**
 * Audio playback for word pronunciations. Groups API phonetics by accent
 * (UK/US/AU), plays via expo-av, and supports speed and pause/stop controls.
 */
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DictionaryPhonetic } from '../types/dictionary';

export type AccentLabel = 'UK' | 'US' | 'AU' | 'EN';
export type PlaybackSpeed = 0.5 | 1.0 | 1.5;

export interface AudioSource {
  label: AccentLabel;
  url: string;
  phonetic: string;
}

function normalizeAudioUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const ACCENT_ORDER: AccentLabel[] = ['UK', 'US', 'AU', 'EN'];

/** Infers UK/US/AU from common patterns in dictionary API audio URLs. */
function detectAccent(url: string): AccentLabel {
  const lower = url.toLowerCase();

  if (
    lower.includes('-uk.') ||
    lower.includes('-gb.') ||
    lower.includes('_gb') ||
    lower.includes('--_gb') ||
    lower.includes('/uk-') ||
    lower.includes('british')
  ) {
    return 'UK';
  }
  if (
    lower.includes('-us.') ||
    lower.includes('_us') ||
    lower.includes('--_us') ||
    lower.includes('/us-') ||
    lower.includes('american')
  ) {
    return 'US';
  }
  if (
    lower.includes('-au.') ||
    lower.includes('_au') ||
    lower.includes('/au-') ||
    lower.includes('australian')
  ) {
    return 'AU';
  }
  return 'EN';
}

function buildAudioSources(phonetics: DictionaryPhonetic[]): AudioSource[] {
  const byLabel = new Map<AccentLabel, AudioSource>();

  for (const entry of phonetics) {
    if (!entry.audio?.trim()) {
      continue;
    }

    const url = normalizeAudioUrl(entry.audio);
    if (!url) {
      continue;
    }

    const label = detectAccent(url);
    const phonetic = entry.text?.trim() ?? '';
    const existing = byLabel.get(label);

    if (!existing) {
      byLabel.set(label, { label, url, phonetic });
      continue;
    }

    if (!existing.phonetic && phonetic) {
      byLabel.set(label, { label, url, phonetic });
    }
  }

  return ACCENT_ORDER.filter((label) => byLabel.has(label)).map(
    (label) => byLabel.get(label)!,
  );
}

export function usePronunciation(phonetics: DictionaryPhonetic[] = []) {
  const audioSources = useMemo(() => buildAudioSources(phonetics), [phonetics]);

  const [selectedSource, setSelectedSource] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  useEffect(() => {
    if (selectedSource >= audioSources.length) {
      setSelectedSource(0);
    }
  }, [audioSources.length, selectedSource]);

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // Ignore unload errors during cleanup.
      }
      soundRef.current = null;
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }
    if (status.didJustFinish) {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  const play = useCallback(
    async (overrideIndex?: number) => {
      const index = overrideIndex ?? selectedSource;
      const source = audioSources[index];
      if (!source) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (soundRef.current && isPaused) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          setIsPaused(false);
          return;
        }

        await unloadSound();

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        const { sound } = await Audio.Sound.createAsync(
          { uri: source.url },
          {
            shouldPlay: true,
            rate: playbackSpeedRef.current,
            shouldCorrectPitch: true,
          },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        setIsPlaying(true);
        setIsPaused(false);
      } catch {
        setError('Audio unavailable');
        setIsPlaying(false);
        setIsPaused(false);
      } finally {
        setIsLoading(false);
      }
    },
    [audioSources, isPaused, onPlaybackStatusUpdate, selectedSource, unloadSound],
  );

  const pause = useCallback(async () => {
    if (!soundRef.current || !isPlaying) {
      return;
    }

    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      setIsPaused(true);
    } catch {
      // Ignore pause errors.
    }
  }, [isPlaying]);

  const stop = useCallback(async () => {
    if (!soundRef.current) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    } catch {
      // Ignore stop errors.
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isPlaying || !soundRef.current) {
      return;
    }

    void soundRef.current.setRateAsync(playbackSpeed, true);
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    return () => {
      void unloadSound();
    };
  }, [unloadSound]);

  const selectSource = useCallback(
    async (index: number) => {
      if (index === selectedSource) {
        return;
      }

      const wasActive = isPlaying || isPaused;
      if (wasActive) {
        await stop();
        await unloadSound();
      }
      setSelectedSource(index);
      if (wasActive) {
        await play(index);
      }
    },
    [isPaused, isPlaying, play, selectedSource, stop, unloadSound],
  );

  const selectSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
  }, []);

  const hasActiveAudio = isPlaying || isPaused;

  return {
    audioSources,
    selectedSource,
    setSelectedSource: selectSource,
    playbackSpeed,
    setPlaybackSpeed: selectSpeed,
    isPlaying,
    isPaused,
    isLoading,
    hasActiveAudio,
    play,
    pause,
    stop,
    error,
  };
}
