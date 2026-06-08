/**
 * TypeScript interfaces for the Free Dictionary API response shape.
 * DictionarySearchResult is an array because the API can return multiple entries.
 */
export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: DictionaryPhonetic[];
  origin?: string;
  meanings: DictionaryMeaning[];
}

export type DictionarySearchResult = DictionaryEntry[];

export interface DictionaryApiError {
  title: string;
  message: string;
  resolution?: string;
}
