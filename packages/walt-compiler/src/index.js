// @flow
import parser from "./parser";
import emit from "./emitter";
import codeGenerator from "./generator";
import semanticAnalyzer from "./semantics";
import astValidator from "./validation";
import _debug from "./utils/debug";
import printNode from "./utils/print-node";
import closurePlugin, { mapToImports } from "./closure-plugin";
import type { WebAssemblyModuleType } from "./flow/types";

export const debug = _debug;
export const prettyPrintNode = printNode;
export const semantics = semanticAnalyzer;
export const generator = codeGenerator;
export const validate = astValidator;
export const emitter = emit;
export { parser, printNode, closurePlugin };

// Used for deugging purposes
export const getIR = (source: string) => {
  const ast = parser(source);
  const semanticAST = semantics(ast);
  validate(
    semanticAST,
    // this will eventually be a config
    {
      lines: source ? source.split("\n") : [],
      filename: "walt-source",
    }
  );
  const intermediateCode = generator(semanticAST);
  const wasm = emitter(intermediateCode);
  return wasm;
};

export const withPlugins = (
  plugins: { [string]: WebAssemblyModuleType },
  importsObj?: { [string]: any }
) => {
  const { closure } = plugins;
  const resultImports = {};
  if (closure != null) {
    resultImports["walt-plugin-closure"] = mapToImports(closure);
  }

  return {
    ...resultImports,
    ...importsObj,
  };
};

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string) {
  const wasm = getIR(source);
  return wasm.buffer();
}
