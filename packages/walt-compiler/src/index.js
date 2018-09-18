// @flow
import { mapNode } from 'walt-parser-tools/map-node';
import walkNode from 'walt-parser-tools/walk-node';

import parser from './parser';
import semantics from './semantics';
import validate from './validation';
import generator from './generator';
import emitter from './emitter';

import debug from './utils/debug';
import prettyPrintNode from './utils/print-node';

import { VERSION_1 } from './emitter/preamble';
import type { ConfigType } from './flow/types';
import { stringEncoder, stringDecoder } from './utils/string';
import { fragment } from './parser/fragment';

export {
  parser,
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
  fragment,
};
export const VERSION = '0.11.0';

// Used for debugging purposes
export const getIR = (
  source: string,
  {
    version = VERSION_1,
    encodeNames = false,
    lines = source ? source.split('\n') : [],
    filename = 'unknown',
  }: ConfigType = {}
) => {
  const ast = parser(source);
  const semanticAST = semantics(ast);
  validate(semanticAST, { lines, filename });
  const intermediateCode = generator(semanticAST, {
    version,
    encodeNames,
    lines,
    filename,
  });
  const wasm = emitter(intermediateCode, {
    version,
    encodeNames,
    filename,
    lines,
  });
  return wasm;
};

// Compile with plugins, future default export
export const unstableCompileWalt = (
  source: string,
  {
    filename = 'unknown',
    plugins = [],
    encodeNames,
  }: {| filename: string, plugins: any[], encodeNames: boolean |}
) => {
  const options = {
    filename,
    lines: source.split('\n'),
    version: VERSION_1,
    encodeNames,
  };

  const ast = parser(source);
  // Generate instances
  const pluginInstances = plugins.reduce(
    (acc, plugin) => {
      const instance = plugin(options);

      acc.semantics.push(instance.semantics);
      return acc;
    },
    { semantics: [] }
  );

  const semanticAST = semantics(ast, pluginInstances.semantics);

  validate(semanticAST, options);

  const intermediateCode = generator(semanticAST, options);
  const wasm = emitter(intermediateCode, options);

  return wasm;
};

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string, config: ConfigType) {
  const wasm = getIR(source, config);
  return wasm.buffer();
}
