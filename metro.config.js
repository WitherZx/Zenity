const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable problematic transformations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Simplify serializer
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

module.exports = config; 