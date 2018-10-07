/**
 * Semantic Analysis
 *
 * The semantic analyzer below accepts a Walt AST and maps it, returning a new
 * transformed AST which contains all necessary data to generate the final
 * WebAssembly binary.
 *
 * The transformations may or may not create new nodes or attach metadata to
 * existing nodes.
 *
 * Metadata is information necessary to generate a valid binary, like type info.
 */

// @flow
import { combineParsers } from '../plugin';
import { map } from 'walt-parser-tools/map-node';
import { enter as enterScope } from 'walt-parser-tools/scope';
import { AST_METADATA } from './metadata';
import core from '../core';
import base from '../base';
import _types from '../core/types';
import unary from '../core/unary';
import _function from '../core/function';
import _imports from '../core/imports';
import booleans from '../core/bool';
import array from '../core/array';
import memory from '../core/memory';
import _statics from '../core/statics';
import functionPointer from '../core/function-pointer';
import struct from '../core/struct';
import native from '../core/native';
import defaultArguments from '../syntax-sugar/default-arguments';
import sizeof from '../syntax-sugar/sizeof';
import { GLOBAL_INDEX } from './metadata.js';
import type {
  NodeType,
  Context,
  SemanticOptions,
  SemanticsFactory,
} from '../flow/types';

export const builtinSemantics = [
  base,
  core,
  _imports,
  _types,
  unary,
  _function,
  booleans,
  array,
  memory,
  _statics,
  functionPointer,
  struct,
  native,
  sizeof,
  defaultArguments,
];

const getBuiltInParsers = (): SemanticsFactory[] => {
  return [
    base().semantics,
    core().semantics,
    _imports().semantics,
    _types().semantics,
    unary().semantics,
    _function().semantics,
    booleans().semantics,
    array().semantics,
    memory().semantics,
    _statics().semantics,
    functionPointer().semantics,
    struct().semantics,
    native().semantics,
    sizeof().semantics,
    defaultArguments().semantics,
  ];
};

// Return AST with full transformations applied
function semantics(
  ast: NodeType,
  extraSemantics: SemanticsFactory[],
  options: SemanticOptions
): NodeType {
  // Generate all the plugin instances with proper options
  const plugins = [...getBuiltInParsers(), ...extraSemantics];

  // Here each semantics parser will receive a reference to the parser & fragment
  // this allows a semantic parser to utilize the same grammar rules as the rest
  // of the program.
  const combined = combineParsers(plugins.map(p => p(options)));

  // The context is what we use to transfer state from one parser to another.
  // Global state like type information and scope chains for example.
  const context: Context = {
    functions: {},
    types: {},
    userTypes: {},
    table: {},
    hoist: [],
    statics: {},
    path: [],
    scopes: enterScope([], GLOBAL_INDEX),
    memories: [],
    tables: [],
  };
  // Parse the current ast
  const parsed = map(combined)([ast, context]);

  const { functions, scopes, types, userTypes, statics, hoist } = context;
  return {
    ...parsed,
    meta: {
      ...parsed.meta,
      // Attach information collected to the AST
      [AST_METADATA]: {
        functions,
        globals: scopes[0],
        types,
        userTypes,
        statics,
      },
    },
    params: [...parsed.params, ...hoist],
  };
}

export default semantics;
