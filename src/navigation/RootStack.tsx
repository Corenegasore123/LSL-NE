/**
 * Main stack navigator: Splash (Onboarding) → Home → Word Detail.
 * Headers are hidden; each screen provides its own chrome.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WordDetailScreen } from '../screens/WordDetailScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="WordDetail" component={WordDetailScreen} />
    </Stack.Navigator>
  );
}
