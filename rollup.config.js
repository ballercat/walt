// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import commonjs from 'rollup-plugin-commonjs';

const PROD = process.env.NODE_ENV === 'production';

export default {
  entry: 'src/index.js',
  dest: PROD ? 'dist/walt.min.js' : 'dist/walt.js',
  format: 'umd',
  moduleName: 'momo',
  plugins: [
    eslint(),
    commonjs(),
    babel(),
    (PROD && uglify({}, minify))
  ],
};

