const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Enable better hot reloading
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.watchFolders = [__dirname];

module.exports = withNativeWind(config, { input: './app/global.css' })
