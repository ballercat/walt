// @flow
import parser from "./parser";
import emit from "./emitter";
import generator from "./generator";
import semantics from "./semantics";
import _debug from "./utils/debug";
import printNode from "./utils/print-node";

export const debug = _debug;
export const prettyPrintNode = printNode;

// Used for deugging purposes
export const getAst = (source: string) => {
  const ast = parser(source);
  return ast;
};

export const getIR = (source: string) => {
  const ast = getAst(source);
  const semanticAST = semantics(ast);
  const wasm = emit(generator(semanticAST));
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = (source: string) => {
  const wasm = getIR(source);
  return wasm.buffer();
};

export default compile;
