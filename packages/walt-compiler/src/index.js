// @flow
import { mapNode } from 'walt-parser-tools/map-node';

import parser from './parser';
import semantics from './semantics';
import validate from './validation';
import generator from './generator';
import emitter from './emitter';

import debug from './utils/debug';
import prettyPrintNode from './utils/print-node';

import closurePlugin, { mapToImports } from './closure-plugin';
import { VERSION_1 } from './emitter/preamble';
import type { WebAssemblyModuleType, ConfigType } from './flow/types';
import { stringEncoder, stringDecoder } from './utils/string';
import walkNode from 'walt-parser-tools/walk-node';

export {
  parser,
  semantics,
  validate,
  generator,
  emitter,
  prettyPrintNode,
  debug,
  closurePlugin,
  stringEncoder,
  stringDecoder,
  walkNode,
  mapNode,
};
export const VERSION = '0.10.0';

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

  validate(semanticAST, {
    lines,
    filename,
  });
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

export const withPlugins = (
  plugins: { [string]: WebAssemblyModuleType },
  importsObj?: { [string]: any }
) => {
  const pluginMappers = {
    closure: (closure, imports) => {
      imports['walt-plugin-closure'] = mapToImports(closure);
    },
  };
  const resultImports = Object.entries(plugins).reduce((acc, [key, value]) => {
    pluginMappers[key](value, acc);
    return acc;
  }, {});

  return {
    ...resultImports,
    ...importsObj,
  };
};

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string, config: ConfigType) {
  const wasm = getIR(source, config);
  return wasm.buffer();
}
