/**
 * App entry point. Registers the root React component with Expo.
 * Gesture Handler and Reanimated must be imported first so native modules
 * initialize before any navigation or animation code runs.
 */
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
