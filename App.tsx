/**
 * Root application component. Loads fonts, wraps the app in providers
 * (theme, search history, dictionary search), and mounts the drawer navigator.
 */
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DictionarySearchProvider } from './src/context/DictionarySearchContext';
import { SearchHistoryProvider } from './src/context/SearchHistoryContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAppFonts } from './src/hooks/useAppFonts';
import { DrawerNavigator } from './src/navigation/DrawerNavigator';

/** Inner tree once theme is available (needs useTheme for StatusBar). */
function AppShell() {
  const { isDark } = useTheme();

  return (
    <SearchHistoryProvider>
      <DictionarySearchProvider>
        <NavigationContainer>
          <DrawerNavigator />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationContainer>
      </DictionarySearchProvider>
    </SearchHistoryProvider>
  );
}

/** Gate rendering until Google fonts load to avoid flash of system font. */
export default function App() {
  const { loaded } = useAppFonts();

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#B45309" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
