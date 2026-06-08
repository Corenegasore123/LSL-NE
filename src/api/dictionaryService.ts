/**
 * Dictionary API client. Fetches word definitions from dictionaryapi.dev
 * using axios, validates input first, and maps HTTP/network errors to
 * user-friendly DictionaryFetchError objects.
 */
import axios, { AxiosError, isAxiosError } from 'axios';
import {
  DictionaryApiError,
  DictionarySearchResult,
} from '../types/dictionary';
import { validateSearchQuery } from '../utils/searchValidation';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export type DictionaryFetchError = {
  type: 'not_found' | 'network' | 'server' | 'parse' | 'validation' | 'unknown';
  message: string;
};

/** Maps axios/network failures to typed errors shown in ErrorMessage. */
function parseApiError(error: unknown): DictionaryFetchError {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<DictionaryApiError | DictionaryApiError[]>;

    if (!axiosError.response) {
      return {
        type: 'network',
        message:
          'Unable to connect. Check your internet connection and try again.',
      };
    }

    if (axiosError.response.status === 404) {
      return {
        type: 'not_found',
        message: 'Word not found. Try another spelling or search term.',
      };
    }

    const data = axiosError.response.data;
    const apiMessage = Array.isArray(data)
      ? data[0]?.message
      : data?.message;

    return {
      type: 'server',
      message:
        apiMessage ??
        `Request failed (${axiosError.response.status}). Please try again.`,
    };
  }

  return {
    type: 'unknown',
    message: 'Something went wrong. Please try again.',
  };
}

/** GET /entries/en/{word} — validates locally, then calls the Free Dictionary API. */
export async function fetchWordDefinition(
  word: string,
): Promise<DictionarySearchResult> {
  const validation = validateSearchQuery(word);
  if (!validation.valid) {
    throw {
      type: 'validation',
      message: validation.message,
    } satisfies DictionaryFetchError;
  }

  const trimmed = validation.word;

  try {
    const response = await axios.get<DictionarySearchResult>(
      `${BASE_URL}/${encodeURIComponent(trimmed)}`,
      { timeout: 15000 },
    );

    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw {
        type: 'parse',
        message: 'Unexpected response from the dictionary service.',
      } satisfies DictionaryFetchError;
    }

    return response.data;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error
    ) {
      throw error;
    }

    throw parseApiError(error);
  }
}
