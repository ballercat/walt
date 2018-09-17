// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import flow from 'rollup-plugin-flow';
import string from 'rollup-plugin-string';
import nearley from './rollup-plugin-nearley';

const PROD = process.env.NODE_ENV === 'production';

export default {
  entry: 'src/index.js',
  dest: PROD ? 'dist/walt.min.js' : 'dist/walt.js',
  format: 'umd',
  moduleName: 'Walt',
  plugins: [
    nearley(),
    eslint(),
    flow(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    string({
      include: '**/*.walt',
    }),
    babel({
      babelrc: false,
      presets: [
        'flow',
        [
          'env',
          {
            modules: false,
            targets: {
              chrome: '60.0.0',
            },
          },
        ],
      ],
      plugins: ['external-helpers', 'transform-object-rest-spread'],
    }),
    resolve({
      jail: __dirname,
      main: false,
    }),
    commonjs({
      namedExports: {
        'node_modules/wasm-types/index.js': [
          'i32',
          'i64',
          'f32',
          'f64',
          'anyfunc',
          'func',
          'block_type',
          'i8',
          'u8',
          'i16',
          'u16',
          'u32',
          'u64',
          'set',
          'get',
          'sizeof',
        ],
        'node_modules/walt-parser-tools/scope.js': [
          'enter',
          'exit',
          'current',
          'find',
          'add',
          'index',
          'namespace',
        ],
        'node_modules/walt-parser-tools/map-node.js': ['map', 'mapNode'],
        'node_modules/walt-syntax/dist/walt-syntax.js': [
          'semantics',
          'builtinTypes',
          'statements',
          'i32',
          'f32',
          'i64',
          'f64',
          'tokens',
        ],
        'node_modules/nearley/lib/nearley.js': ['Parser', 'Grammar'],
      },
    }),
    PROD && uglify({}, minify),
  ],
};
