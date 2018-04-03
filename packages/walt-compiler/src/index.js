// @flow
import parser from "./parser";
import emit from "./emitter";
import codeGenerator from "./generator";
import semanticAnalyzer from "./semantics";
import astValidator from "./validation";
import _debug from "./utils/debug";
import printNode from "./utils/print-node";
import closurePlugin, { mapToImports } from "./closure-plugin";
import { VERSION_1 } from "./emitter/preamble";
import type { WebAssemblyModuleType, ConfigType } from "./flow/types";

export const debug = _debug;
export const prettyPrintNode = printNode;
export const semantics = semanticAnalyzer;
export const generator = codeGenerator;
export const validate = astValidator;
export const emitter = emit;
export { parser, printNode, closurePlugin };

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

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string, config: ConfigType) {
  const wasm = getIR(source, config);
  return wasm.buffer();
}
