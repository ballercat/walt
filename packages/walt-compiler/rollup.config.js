import base from '../../base-rollup.config';

const PROD = process.env.NODE_ENV === 'production';
export default {
  ...base,
  input: 'src/index.js',
  output: {
    file: PROD ? 'dist/walt.min.js' : 'dist/walt.js',
    format: 'umd',
    name: 'Walt',
  },
};
