/**
 * React context for dictionary search state. Shares loading, results, errors,
 * and searchWord across Home, WordDetail, and Drawer without prop drilling.
 */
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { useDictionarySearch } from '../hooks/useDictionarySearch';
import { DictionaryFetchError } from '../api/dictionaryService';
import { DictionarySearchResult } from '../types/dictionary';

interface DictionarySearchContextValue {
  data: DictionarySearchResult | null;
  loading: boolean;
  error: DictionaryFetchError | null;
  query: string;
  searchWord: (word: string) => Promise<void>;
  reset: () => void;
}

const DictionarySearchContext =
  createContext<DictionarySearchContextValue | null>(null);

export function DictionarySearchProvider({ children }: { children: ReactNode }) {
  const searchState = useDictionarySearch();

  const value = useMemo(
    () => ({
      data: searchState.data,
      loading: searchState.loading,
      error: searchState.error,
      query: searchState.query,
      searchWord: searchState.searchWord,
      reset: searchState.reset,
    }),
    [searchState],
  );

  return (
    <DictionarySearchContext.Provider value={value}>
      {children}
    </DictionarySearchContext.Provider>
  );
}

export function useDictionarySearchContext() {
  const context = useContext(DictionarySearchContext);
  if (!context) {
    throw new Error(
      'useDictionarySearchContext must be used within DictionarySearchProvider',
    );
  }
  return context;
}
