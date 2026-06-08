/**
 * Search input validation before API calls. Ensures a single English word
 * (letters, hyphens, apostrophes), trims whitespace, and returns clear errors.
 */
export type SearchValidationResult =
  | { valid: true; word: string }
  | { valid: false; message: string };

const MESSAGES = {
  empty: 'Please enter a word to search.',
  multipleWords: 'Please search for one word, not a sentence.',
  numbers: 'Please search for a word instead of numbers.',
  symbols: 'Please search for a word instead of numbers.',
} as const;

const WORD_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

/** Trim surrounding whitespace before validation and API lookup. */
export function normalizeSearchInput(raw: string): string {
  return raw.trim();
}

/** Returns valid lowercase word for the API, or a user-facing error message. */
export function validateSearchQuery(raw: string): SearchValidationResult {
  const word = normalizeSearchInput(raw);

  if (!word) {
    return { valid: false, message: MESSAGES.empty };
  }

  if (/\s/.test(word)) {
    return { valid: false, message: MESSAGES.multipleWords };
  }

  if (/\d/.test(word)) {
    return { valid: false, message: MESSAGES.numbers };
  }

  if (!WORD_PATTERN.test(word)) {
    return { valid: false, message: MESSAGES.symbols };
  }

  return { valid: true, word: word.toLowerCase() };
}
