// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import flow from 'rollup-plugin-flow';
import builtins from 'rollup-plugin-node-builtins';

const PROD = process.env.NODE_ENV === 'production';

export default {
  entry: 'src/index.js',
  dest: PROD ? 'dist/walt.min.js' : 'dist/walt.js',
  format: 'umd',
  moduleName: 'Walt',
  plugins: [
    builtins(),
    flow(),
    eslint(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    babel({
      babelrc: false,
      "presets": [
        "flow",
        [
          "env", {
            "modules": false,
            "targets": {
              "chrome": "60.0.0"
            }
          }],
      ],
      "plugins": [
        "external-helpers",
        "transform-object-rest-spread"
      ]
    }),
    resolve(),
    commonjs(),
    (PROD && uglify({}, minify))
  ],
};

