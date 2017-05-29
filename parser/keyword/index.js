const Trie = require('./../../utils/trie');
const token = require('./../token');
const Syntax = require('./../Syntax');

const supported = [
  // EcmaScript
  'break',
  'if',
  'else',
  'import',
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
  'void',
  'while',

  // walt replacement, matching s-expression syntax
  'func',

  // s-expression
  'global',
  'module',
  'memory',
  'table',
  'type',

  // specials/asserts
  'invoke',
  'assert',
  'assert_return',

  // additional syntax
  // statically replaced with consant value at compile time
  'sizeof'
];

const nosupport = [
  'catch',
  'extends',
  'super',
  // There is no automatic memory management in wast
  // Memory operations are not supported
  'new',
  'delete',
  // There is no concept of this in wast
  'this',
  'debugger',
  // vars and lets are replaced with types (i32, f32, etc)
  'var',
  // no classes in wast
  'class',
  'try',
  'catch',
  'finally',
  // Everything is statically typed
  'typeof',
];

const trie = new Trie(supported);
const root = trie.fsearch;
module.exports = token(root, Syntax.Keyword, supported);

