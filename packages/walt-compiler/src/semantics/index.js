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
import { map } from '../utils/map-node';
import { AST_METADATA } from './metadata';
import core from '../core';
import base from '../base';
import _types from '../core/types';
import unary from '../core/unary';
import _function from '../core/function';
import booleans from '../core/bool';
import array from '../core/array';
import memory from '../core/memory';
import string from '../core/string';
import functionPointer from '../core/function-pointer';
import struct from '../core/struct';
import native from '../core/native';
import defaultArguments from '../syntax-sugar/default-arguments';
import sizeof from '../syntax-sugar/sizeof';
import closures from '../syntax-sugar/closures';

import type { NodeType, SemanticOptionsType } from '../flow/types';

const getBuiltInParsers = () => {
  return [
    base().semantics,
    core().semantics,
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
    closures().semantics,
  ];
};

function semantics(
  ast: NodeType,
  parsers: Array<(any) => any> = getBuiltInParsers()
): NodeType {
  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};
  const hoist: NodeType[] = [];
  const hoistImports: NodeType[] = [];
  const statics: { [string]: null } = {};

  const options: SemanticOptionsType = {
    functions,
    globals,
    types,
    userTypes,
    table,
    hoist,
    hoistImports,
    statics,
    path: [],
  };

  // Types have to be pre-parsed before the rest of the program
  // const astWithTypes = mapNode({
  //   [Syntax.Export]: (node, transform) => {
  //     const [maybeType] = node.params;
  //     if (
  //       maybeType != null &&
  //       [Syntax.Typedef, Syntax.Struct].includes(maybeType.Type)
  //     ) {
  //       return transform({
  //         ...maybeType,
  //         meta: {
  //           ...maybeType.meta,
  //           EXPORTED: true,
  //         },
  //       });
  //     }
  //     return node;
  //   },
  //   [Syntax.Typedef]: (node, _) => {
  //     let argumentsCount = 0;
  //     const defaultArgs = [];
  //     walkNode({
  //       Assignment(assignment) {
  //         const defaultValue = assignment.params[1];
  //         defaultArgs.push(defaultValue);
  //       },
  //       Type() {
  //         argumentsCount += 1;
  //       },
  //     })(node);
  //     const parsed = {
  //       ...node,
  //       meta: {
  //         ...node.meta,
  //         FUNCTION_METADATA: {
  //           argumentsCount,
  //         },
  //         DEFAULT_ARGUMENTS: defaultArgs,
  //       },
  //     };
  //     types[node.value] = parsed;
  //     return parsed;
  //   },
  //   [Syntax.GenericType]: mapGeneric({ types }),
  // })(ast);

  const combined = combineParsers(parsers.map(p => p(options)));
  const patched = map(combined)([ast, options]);

  return {
    ...patched,
    meta: {
      ...patched.meta,
      // Attach information collected to the AST
      [AST_METADATA]: { functions, globals, types, userTypes, statics },
    },
    params: [...hoistImports, ...patched.params, ...hoist],
  };
}

export default semantics;
