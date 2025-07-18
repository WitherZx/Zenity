const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper serializer configuration
config.serializer = {
  ...config.serializer,
  getPolyfills: () => [],
};

module.exports = config; 