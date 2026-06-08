/**
 * Light/dark theme state. Reads and writes theme_preference to AsyncStorage
 * and syncs NativeWind colorScheme so Tailwind dark: classes apply correctly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const THEME_KEY = 'theme_preference';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tells NativeWind to apply light or dark CSS variable sets from global.css. */
function applyColorScheme(dark: boolean) {
  colorScheme.set(dark ? 'dark' : 'light');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Default to light until AsyncStorage returns a saved preference.
    applyColorScheme(false);

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (mounted) {
          const dark = saved === 'dark';
          setIsDark(dark);
          applyColorScheme(dark);
        }
      } catch {
        if (mounted) {
          setIsDark(false);
          applyColorScheme(false);
        }
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

  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      applyColorScheme(next);
      void AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      isReady,
    }),
    [isDark, toggleTheme, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
