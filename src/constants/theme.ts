/**
 * Brand colors and part-of-speech styling. Each POS gets a distinct color
 * in light and dark palettes for meaning cards in WordMeanings.
 */
export const ACCENT = '#B45309';
export const ACCENT_SECONDARY = '#92400E';

export interface PartOfSpeechStyle {
  color: string;
}

const lightPalette: Record<string, PartOfSpeechStyle> = {
  noun: { color: '#B45309' },
  pronoun: { color: '#7C3AED' },
  verb: { color: '#059669' },
  adjective: { color: '#D97706' },
  adverb: { color: '#DB2777' },
  interjection: { color: '#2563EB' },
  preposition: { color: '#4F46E5' },
  conjunction: { color: '#0891B2' },
  determiner: { color: '#65A30D' },
  article: { color: '#65A30D' },
  numeral: { color: '#CA8A04' },
  other: { color: '#64748B' },
};

const darkPalette: Record<string, PartOfSpeechStyle> = {
  noun: { color: '#F59E0B' },
  pronoun: { color: '#A78BFA' },
  verb: { color: '#34D399' },
  adjective: { color: '#FBBF24' },
  adverb: { color: '#F472B6' },
  interjection: { color: '#60A5FA' },
  preposition: { color: '#818CF8' },
  conjunction: { color: '#22D3EE' },
  determiner: { color: '#A3E635' },
  article: { color: '#A3E635' },
  numeral: { color: '#FACC15' },
  other: { color: '#94A3B8' },
};

export function getPartOfSpeechStyle(
  isDark: boolean,
  partOfSpeech: string,
): PartOfSpeechStyle {
  const palette = isDark ? darkPalette : lightPalette;
  const key = partOfSpeech.toLowerCase().trim();

  if (key in palette) {
    return palette[key];
  }

  return palette.other;
}

export function getAccentColor(_isDark?: boolean): string {
  return ACCENT;
}
