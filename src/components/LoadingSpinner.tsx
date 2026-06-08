/**
 * Inline loading UI for Word Detail. Shows the query word plus skeleton
 * placeholders that mirror the final layout (hero, pronunciation, definitions).
 */
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface WordDetailSkeletonProps {
  word?: string;
}

function SkeletonBlock({
  className = '',
  height,
  width,
}: {
  className?: string;
  height: number;
  width?: number | `${number}%`;
}) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  const { isDark } = useTheme();

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Animated.View
      className={`rounded-xl bg-border ${className}`}
      style={{
        height,
        width: width ?? '100%',
        opacity: pulse,
        backgroundColor: isDark ? '#373737' : '#E5DCCD',
      }}
    />
  );
}

function MeaningCardSkeleton() {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      <View className="h-[3px] w-full bg-border" />
      <View className="gap-3 p-4">
        <SkeletonBlock height={12} width="22%" />
        <SkeletonBlock height={14} width="95%" />
        <SkeletonBlock height={14} width="78%" />
        <SkeletonBlock height={12} width="40%" className="mt-2" />
        <View className="mt-1 flex-row gap-2">
          <SkeletonBlock height={28} width={64} className="rounded-full" />
          <SkeletonBlock height={28} width={72} className="rounded-full" />
          <SkeletonBlock height={28} width={56} className="rounded-full" />
        </View>
      </View>
    </View>
  );
}

export function WordDetailSkeleton({ word }: WordDetailSkeletonProps) {
  const displayWord = word?.trim();

  return (
    <ScrollView
      accessibilityRole="progressbar"
      accessibilityLabel={
        displayWord ? `Loading definition for ${displayWord}` : 'Loading definition'
      }
      contentContainerClassName="flex-grow pb-10"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-4">
        <View className="rounded-3xl border border-border bg-card p-5 shadow-card">
          {displayWord ? (
            <>
              <Text className="font-serif text-[34px] capitalize text-ink">
                {displayWord}
              </Text>
              <Text className="mt-2 font-sans text-sm text-ink-muted">
                Fetching definition…
              </Text>
            </>
          ) : (
            <>
              <SkeletonBlock height={40} width="55%" />
              <SkeletonBlock height={14} width="42%" className="mt-3" />
            </>
          )}

          <SkeletonBlock height={56} className="mt-5 rounded-2xl" />
        </View>

        <View className="mb-3 mt-10 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="font-semibold text-[10px] tracking-[2px] text-ink-muted">
            DEFINITIONS
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-8">
          <MeaningCardSkeleton />
          <MeaningCardSkeleton />
        </View>
      </View>
    </ScrollView>
  );
}

/** @deprecated Use WordDetailSkeleton */
export const LoadingSpinner = WordDetailSkeleton;
