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
import string from '../core/string';
import functionPointer from '../core/function-pointer';
import struct from '../core/struct';
import native from '../core/native';
import defaultArguments from '../syntax-sugar/default-arguments';
import sizeof from '../syntax-sugar/sizeof';
import { GLOBAL_INDEX } from './metadata.js';

import type { NodeType, SemanticOptionsType } from '../flow/types';

const getBuiltInParsers = () => {
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
    string().semantics,
    functionPointer().semantics,
    struct().semantics,
    native().semantics,
    sizeof().semantics,
    defaultArguments().semantics,
    //     closures().semantics,
  ];
};

// Return AST with full transformations applied
function semantics(
  ast: NodeType,
  extraParsers: Array<(any) => any> = []
): NodeType {
  const parsers = [...getBuiltInParsers(), ...extraParsers];

  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};
  const hoist: NodeType[] = [];
  const statics: { [string]: null } = {};
  const scopes = enterScope([], GLOBAL_INDEX);

  const options: SemanticOptionsType = {
    functions,
    globals,
    types,
    userTypes,
    table,
    hoist,
    statics,
    path: [],
    scopes,
  };

  const combined = combineParsers(parsers.map(p => p(options)));
  const patched = map(combined)([ast, options]);

  return {
    ...patched,
    meta: {
      ...patched.meta,
      // Attach information collected to the AST
      [AST_METADATA]: {
        functions,
        globals: scopes[0],
        types,
        userTypes,
        statics,
      },
    },
    params: [...patched.params, ...hoist],
  };
}

export default semantics;
