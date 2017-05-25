const Trie = require('./../../utils/trie');
const token = require('../token');

const supported = [
  '+',
  '++',
  '-',
  '--',
  '=',
  '==',
  '%',
  '/',
  '^',
  '&',
  '|',
  '!',
  '**',
  ':'
];

const trie = new Trie(supported);
module.exports = token(trie.fsearch, 'operator', supported);

