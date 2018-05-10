// @flow
import parser, { async as asyncParser } from "./parser";
import semantics, { async as asyncSemantics } from "./semantics";
import validate from "./validation";
import generator, { async as asyncGenerator } from "./generator";
import emitter, { async as asyncEmitter } from "./emitter";

import debug from "./utils/debug";
import prettyPrintNode from "./utils/print-node";

import closurePlugin, { mapToImports } from "./closure-plugin";
import { VERSION_1 } from "./emitter/preamble";
import type { WebAssemblyModuleType, ConfigType } from "./flow/types";
import { stringEncoder, stringDecoder } from "./utils/string";
import walkNode from "./utils/walk-node";
import mapNode from "./utils/map-node";

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
export const VERSION = "0.5.3";

// Used for deugging purposes
export const getIR = (
  source: string,
  {
    version = VERSION_1,
    encodeNames = false,
    lines = source ? source.split("\n") : [],
    filename = "unknown",
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
      imports["walt-plugin-closure"] = mapToImports(closure);
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

/**
 * Async compiler. UNSTABLE
 *
 * Uses WebAssembly internally/is self-hosted
 *
 * @param {String} source Source input
 */
export const unstableAsyncCompile = (source: string): Promise<any> => {
  return Promise.all([asyncSemantics(), asyncGenerator(), asyncEmitter()]).then(
    ([sem, gen, emit]) => {
      const lines = source.split("\n");
      const filename = "??";
      const encodeNames = true;
      const version = 0x1;
      return asyncParser(source)
        .then(sem)
        .then(ast => {
          validate(ast, { lines, filename });
          return ast;
        })
        .then(ast => {
          const code = gen(ast, {
            version,
            encodeNames,
            lines,
            filename,
          });
          const wasm = emit(code, {
            version,
            encodeNames,
            filename,
            lines,
          });

          return wasm;
        });
    }
  );
};

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string, config: ConfigType) {
  const wasm = getIR(source, config);
  return wasm.buffer();
}
