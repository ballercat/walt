// @flow
import Trie from '../../utils/trie';
import token from '../token';
import Syntax from 'walt-syntax';

const supported = [
  // EcmaScript
  'break',
  'if',
  'else',
  'import',
  'as',
  'from',
  'export',
  'return',
  'switch',
  'case',
  'default',
  'const',
  'let',
  'for',
  'continue',
  'do',
  'while',
  'function',

  // s-expression
  'global',
  'module',
  'type',
  'lambda',

  // Unsupported
  'catch',
  'extends',
  'super',
  // There is no concept of this in wast
  'this',
  'debugger',
  // vars and lets are replaced with types (i32, f32, etc)
  'var',
  // no classes in wast
  'class',
  'try',
  'finally',
  // Everything is statically typed
  'typeof',
];

const trie = new Trie(supported);
const root = trie.fsearch;

export default token(root, Syntax.Keyword, supported);
