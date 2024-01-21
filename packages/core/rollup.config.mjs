// import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
// import nodePolyfills from 'rollup-plugin-polyfill-node';
// import { default as pkg } from './package.json' assert { type: 'json' };
import json from '@rollup/plugin-json'

const embeded = [
  // 'blindsecp256k1',
]

// generics
const bundle = (config, input = 'src/index.ts') => ({
  ...config,
  input,
  external: (id) => {
    if (embeded.includes(id)) {
      return false
    }
    return !id.startsWith('src') && !/^[./]/.test(id)
  },
})

export default [
  // main build
  bundle({
    plugins: [
      json(),
      // convert commonjs to esm modules
      // commonjs(),
      // resolve node modules
      resolve({ browser: true }),
      // nodePolyfills(),
      // final transformation
      esbuild({ target: 'esnext' }),
    ],
    output: [
      // commonjs
      // {
      //   file: `dist/index.cjs.js`,
      //   format: 'cjs',
      //   sourcemap: true,
      // },
      // es modules
      { file: `dist/index.mjs`, format: 'es', sourcemap: true },
      // umd
      { name: 'OwlMeansVCCore', file: `dist/index.umd.js`, format: 'umd', sourcemap: true },
    ],
  }),
  // typings for main
  bundle({
    plugins: [dts()],
    output: { file: `dist/main.d.ts`, format: 'es' },
  }),

  // warmup build
  bundle({
    plugins: [
      json(),
      // convert commonjs to esm modules
      // commonjs(),
      // resolve node modules
      resolve({ browser: true }),
      // nodePolyfills(),
      // final transformation
      esbuild({ target: 'esnext' }),
    ],
    output: [
      // commonjs
      // {
      //   file: `dist/index.cjs.js`,
      //   format: 'cjs',
      //   sourcemap: true,
      // },
      // es modules
      { file: `dist/warmup.mjs`, format: 'es', sourcemap: true },
      // umd
      { name: 'OwlMeansVCWarmup', file: `dist/warmup.umd.js`, format: 'umd', sourcemap: true },
    ],
  }, 'src/warmup.ts'),

  // typings for warmup
  bundle({
    plugins: [dts()],
    output: { file: `dist/warmup.d.ts`, format: 'es' },
  }),
]
