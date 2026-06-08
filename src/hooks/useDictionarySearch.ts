/**
 * Hook that runs a dictionary search: validates input, calls the API,
 * updates loading/error/data state, and adds successful lookups to history.
 */
import { useCallback, useState } from 'react';
import {
  DictionaryFetchError,
  fetchWordDefinition,
} from '../api/dictionaryService';
import { DictionarySearchResult } from '../types/dictionary';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { validateSearchQuery } from '../utils/searchValidation';

interface SearchState {
  data: DictionarySearchResult | null;
  loading: boolean;
  error: DictionaryFetchError | null;
  query: string;
}

const initialState: SearchState = {
  data: null,
  loading: false,
  error: null,
  query: '',
};

/** Core search logic consumed by DictionarySearchContext. */
export function useDictionarySearch() {
  const { addToHistory } = useSearchHistory();
  const [state, setState] = useState<SearchState>(initialState);

  const searchWord = useCallback(
    async (rawWord: string) => {
      const validation = validateSearchQuery(rawWord);
      if (!validation.valid) {
        setState((current) => ({
          ...current,
          data: null,
          loading: false,
          error: {
            type: 'validation',
            message: validation.message,
          },
          query: rawWord.trim(),
        }));
        return;
      }

      const word = validation.word;

      setState({
        data: null,
        loading: true,
        error: null,
        query: word,
      });

      try {
        const data = await fetchWordDefinition(word);
        await addToHistory(word);
        setState({
          data,
          loading: false,
          error: null,
          query: word,
        });
      } catch (error) {
        const fetchError = error as DictionaryFetchError;
        setState({
          data: null,
          loading: false,
          error: fetchError,
          query: word,
        });
      }
    },
    [addToHistory],
  );

  const clearError = useCallback(() => {
    setState((current) => ({ ...current, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    searchWord,
    clearError,
    reset,
  };
}
