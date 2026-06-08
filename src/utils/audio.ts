/**
 * Helpers for phonetic text and audio URLs from API phonetics arrays.
 * Normalizes protocol-relative URLs and deduplicates audio sources.
 */
import { DictionaryEntry, DictionaryPhonetic } from '../types/dictionary';

export function normalizeAudioUrl(url?: string): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getAudioSources(
  phonetics: DictionaryPhonetic[],
): { label: string; url: string }[] {
  const seen = new Set<string>();

  return phonetics
    .map((phonetic) => {
      const url = normalizeAudioUrl(phonetic.audio);
      if (!url || seen.has(url)) {
        return null;
      }

      seen.add(url);
      return {
        label: phonetic.text?.trim() || 'Listen',
        url,
      };
    })
    .filter((item): item is { label: string; url: string } => item !== null);
}

export function mergeEntryPhonetics(
  entries: DictionaryEntry[],
): DictionaryPhonetic[] {
  const seen = new Set<string>();
  const merged: DictionaryPhonetic[] = [];

  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const url = normalizeAudioUrl(phonetic.audio) ?? '';
      const text = phonetic.text?.trim() ?? '';
      const key = url || text;
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(phonetic);
    }
  }

  return merged;
}

export function getPrimaryPhonetic(
  word: string,
  phonetic?: string,
  phonetics: DictionaryPhonetic[] = [],
): string | null {
  if (phonetic?.trim()) {
    return phonetic.trim();
  }

  const withText = phonetics.find((item) => item.text?.trim());
  return withText?.text?.trim() ?? null;
}
