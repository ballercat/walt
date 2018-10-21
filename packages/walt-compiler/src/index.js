// @flow
import { mapNode } from 'walt-parser-tools/map-node';
import walkNode from 'walt-parser-tools/walk-node';

import makeParser from './parser';
import semantics from './semantics';
import validate from './validation';
import generator from './generator';
import emitter from './emitter';

import debug from './utils/debug';
import prettyPrintNode from './utils/print-node';

import { VERSION_1 } from './emitter/preamble';
import type { ConfigType } from './flow/types';
import { stringEncoder, stringDecoder } from './utils/string';
import { makeFragment } from './parser/fragment';

export {
  makeParser,
  makeFragment,
  semantics,
  validate,
  generator,
  emitter,
  prettyPrintNode,
  debug,
  stringEncoder,
  stringDecoder,
  walkNode,
  mapNode,
};
export const VERSION = '0.17.0';

/**
 * Used for debugging purposes
 */
export const getIR = (source: string, config: ConfigType) => {
  const {
    version = VERSION_1,
    encodeNames = false,
    lines = source.split('\n'),
    filename = 'unknown',
    extensions = [],
  } =
    config || {};

  const parser = makeParser([]);
  const fragment = makeFragment(parser);

  const options = {
    version,
    encodeNames,
    lines,
    filename,
    extensions,
  };

  const ast = parser(source);
  const semanticAST = semantics(ast, [], { ...options, parser, fragment });
  validate(semanticAST, { lines, filename });
  const intermediateCode = generator(semanticAST, options);
  const wasm = emitter(intermediateCode, {
    version,
    encodeNames,
    filename,
    lines,
  });
  return wasm;
};

type Walt = {
  buffer: () => ArrayBuffer,
  ast: Node,
  semanticAST: Node,
};
/**
 * @typedef {function} wasm-factory
 * @returns {ArrayBuffer} WebAssembly ArrayBuffer
 */
/**
 * Compiler result object. Generated from the compile() method. Contains a buffer
 * factory method and the ast representations used to generate WASM output. The
 * result of `.buffer()` is intented to be used with WebAssembly.instantiate method.
 *
 * @example
 * type Walt = {
 *   buffer: () => ArrayBuffer,
 *   ast: Node,
 *   semanticAST: Node,
 * };
 *
 * @typedef {Object} walt
 *
 * @property {wasm-factory} buffer      Factory method for WASM output
 * @property {Object}       ast         Bare AST version (pre semantic analysis)
 * @property {Object}       semanticAST AST post semantic analysis
 */

/**
 * Compiles walt source code into an output object.
 *
 * @example
 * import { compile } from 'walt-compiler';
 *
 *  const buffer = compile(`
 *    let counter: i32 = 0;
 *    export function count(): i32 {
 *      counter += 1;
 *      return counter;
 *    }
 * `).buffer();
 *
 * WebAssembly.instantiate(buffer).then(result => {
 *   console.log(`First invocation: ${result.instance.exports.count()}`);
 *   console.log(`Second invocation: ${result.instance.exports.count()}`);
 * });
 *
 * @param {string}     source Your walt sourcecode
 * @param {ConfigType} config The configuration for this compilation
 *
 * @return {walt} Walt result object
 */
export const compile = (source: string, config: ConfigType): Walt => {
  const {
    filename = 'unknown.walt',
    extensions = [],
    linker,
    encodeNames = false,
  } =
    config || {};

  const options = {
    filename,
    lines: source.split('\n'),
    version: VERSION_1,
    encodeNames,
  };

  // Generate plugin instances and sort them by the extended compiler phase
  const plugins = extensions.reduce(
    (acc, plugin) => {
      // Default plugins to a specific to ensure correctness
      const instance = {
        semantics: _ => ({}),
        grammar: () => ({ ParserRules: [] }),
        ...plugin(options),
      };

      acc.grammar.push(instance.grammar);
      acc.semantics.push(instance.semantics);

      return acc;
    },
    {
      grammar: [],
      semantics: [],
    }
  );

  const parser = makeParser(plugins.grammar);
  const fragment = makeFragment(parser);
  const ast = parser(source);

  const semanticAST = semantics(ast, plugins.semantics, {
    parser,
    fragment,
  });

  validate(semanticAST, options);

  const intermediateCode = generator(semanticAST, { ...options, linker });
  const wasm = emitter(intermediateCode, options);

  return {
    buffer() {
      return wasm.buffer();
    },
    ast,
    semanticAST,
  };
};
