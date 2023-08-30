/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')
const { getDefaultMetroConfig } = require('@owlmeans/vc-lib-native/dist/metro')


const metro = getDefaultMetroConfig(__dirname, '../../')
module.exports = {
  resolver: {
    ...metro.resolver,
    resolverMainFields: [...metro.resolver.resolverMainFields, 'exports']
  },
  watchFolders: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../..')],
}
