// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

const PROD = process.env.NODE_ENV === 'production';

export default {
  entry: 'src/index.js',
  dest: PROD ? 'dist/walt.min.js' : 'dist/walt.js',
  format: 'umd',
  moduleName: 'Walt',
  plugins: [
    eslint(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    resolve(),
    commonjs(),
    babel({
      babelrc: false,
      "presets": [
        [
          "env", {
            "modules": false,
            "targets": {
              "chrome": "60.0.0"
            }
          }]
      ],
      "plugins": [
        "external-helpers",
        "transform-object-rest-spread"
      ]
}),
    (PROD && uglify({}, minify))
  ],
};

