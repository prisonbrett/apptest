const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Utiliser le transformer pour .svg
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Retirer svg des assets et l'ajouter aux sources
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
