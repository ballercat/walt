import base from '../../base-rollup.config';

const PROD = process.env.NODE_ENV === 'production';
export default {
  ...base,
  input: 'src/index.js',
  output: {
    file: PROD
      ? 'dist/walt-plugin-syntax-closures.min.js'
      : 'dist/walt-plugin-syntax-closures.js',
    format: 'umd',
    name: 'WaltClosures',
  },
};
