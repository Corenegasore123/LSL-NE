/**
 * Metro bundler config. Wraps Expo defaults with NativeWind so Tailwind
 * classes in global.css are compiled into React Native styles.
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
