/**
 * Autofill suggestions for ThemedSearchBar. Shows recent history when the
 * field is empty, or filters history by prefix when the user is typing.
 */
export function getSearchSuggestions(query: string, history: string[]): string[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return history.slice(0, 5);
  }

  return history
    .filter((word) => word.toLowerCase().startsWith(normalized))
    .slice(0, 5);
}
