const Trie = require('./../../utils/trie');
const token = require('./../token');
const Syntax = require('./../Syntax');

const supported = [
  'i32',
  'i64',
  'f32',
  'f64',
  'anyfunc'
];
const trie = new Trie(supported);
module.exports = token(trie.fsearch, Syntax.Type, supported);

