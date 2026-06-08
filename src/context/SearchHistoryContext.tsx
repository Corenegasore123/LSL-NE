/**
 * Persists search history on device via AsyncStorage (@dictionary_search_history).
 * Keeps up to 30 unique words, most recent first, deduped case-insensitively.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = '@dictionary_search_history';
const MAX_HISTORY = 30;

/** Lowercase trim used for deduplication and storage consistency. */
function normalizeHistoryWord(word: string): string {
  return word.trim().toLowerCase();
}

/** Removes duplicate words (case-insensitive) and caps list at MAX_HISTORY. */
function dedupeHistory(items: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const item of items) {
    if (typeof item !== 'string') {
      continue;
    }

    const normalized = normalizeHistoryWord(item);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(normalized);
  }

  return unique.slice(0, MAX_HISTORY);
}

interface SearchHistoryContextValue {
  history: string[];
  addToHistory: (word: string) => Promise<void>;
  removeFromHistory: (word: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isReady: boolean;
}

const SearchHistoryContext = createContext<SearchHistoryContextValue | null>(
  null,
);

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = dedupeHistory(parsed);
            setHistory(cleaned);
            if (cleaned.length !== parsed.length) {
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
            }
          }
        }
      } catch {
        // Ignore corrupt storage and start fresh.
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (items: string[]) => {
    setHistory(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addToHistory = useCallback(async (word: string) => {
    const normalized = normalizeHistoryWord(word);
    if (!normalized) {
      return;
    }

    setHistory((current) => {
      const withoutDuplicate = current.filter(
        (item) => normalizeHistoryWord(item) !== normalized,
      );
      const next = dedupeHistory([normalized, ...withoutDuplicate]);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback(
    async (word: string) => {
      const normalized = normalizeHistoryWord(word);
      setHistory((current) => {
        const next = current.filter(
          (item) => normalizeHistoryWord(item) !== normalized,
        );
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({
      history,
      addToHistory,
      removeFromHistory,
      clearHistory,
      isReady,
    }),
    [history, addToHistory, removeFromHistory, clearHistory, isReady],
  );

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within SearchHistoryProvider');
  }
  return context;
}
