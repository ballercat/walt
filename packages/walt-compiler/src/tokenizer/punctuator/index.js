// @flow
import Trie from './../../utils/trie';
import token from '../token';
import Syntax from 'walt-syntax';

const supported = [
  '+',
  '++',
  '-',
  '--',
  '>>',
  '>>>',
  '<<',
  '=',
  '==',
  '+=',
  '-=',
  '=>',
  '<=',
  '>=',
  '!=',
  '%',
  '/',
  '^',
  '&',
  '~',
  '|',
  '!',
  '**',
  ':',
  '(',
  ')',
  '.',
  '{',
  '}',
  ',',
  '[',
  ']',
  ';',
  '>',
  '<',
  '?',
  '||',
  '&&',
  '{',
  '}',
  '...',
];

const trie = new Trie(supported);
export default token(trie.fsearch, Syntax.Punctuator, supported);
