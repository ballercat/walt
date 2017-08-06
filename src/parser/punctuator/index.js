const Trie = require('./../../utils/trie');
const token = require('../token');
const Syntax = require('../Syntax');

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
  ':',
  '(', ')', '.', '{', '}'
];

const trie = new Trie(supported);
module.exports = token(trie.fsearch, Syntax.Punctuator, supported);

