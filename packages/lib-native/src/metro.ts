/**
 *  Copyright 2023 OwlMeans, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { CustomResolver } from 'metro-resolver'

const path = require('path')

export const mapNodeModules = (location: string, prefix?: string) => {
  return {
    react: path.resolve(location, (prefix ? prefix : '') + 'node_modules/react'),
    url: path.resolve(location, (prefix ? prefix : '') + 'node_modules/react-native-url-polyfill'),
    crypto: path.resolve(location, (prefix ? prefix : '') + 'node_modules/crypto-browserify'),
    buffer: path.resolve(location, (prefix ? prefix : '') + 'node_modules/buffer'),
    stream: path.resolve(location, (prefix ? prefix : '') + 'node_modules/stream-browserify'),
  }
}

export const getDefaultTransformer = () => {
  return {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  }
}


export const getDefaultResolver = (location: string, prefix?: string) => {
  return {
    extraNodeModules: mapNodeModules(location, prefix),
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    resolveRequest: ((context, moduleName, platform) => {

      const filePath = [
        'crypto-ld', '@digitalbazaar/jws-linked-data-signature',
        'base64url-universal'
      ].find(module => module === moduleName)?.replace(
        moduleName,
        path.resolve(
          location, prefix ?? '', `node_modules/${moduleName}/lib/index.js`
        )
      )

      if (filePath != null) {
        return { filePath, type: 'sourceFile' }
      }

      // Optionally, chain to the standard Metro resolver.
      return context.resolveRequest(context, moduleName, platform);
    }) as CustomResolver
  }
}

export const getDefaultMetroConfig = (location: string, prefix?: string) => {
  return {
    resolver: getDefaultResolver(location, prefix),
    transformer: getDefaultTransformer()
  }
}

