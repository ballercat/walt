// @flow
import parser from "./parser";
import emit from "./emitter";
import generator from "./generator";
import _debug from "./utils/debug";

export const debug = _debug;

// Used for deugging purposes
export const getAst = (source: string) => {
  const ast = parser(source);
  return ast;
};

export const getIR = (source: string) => {
  const ast = getAst(source);
  const wasm = emit(generator(ast));
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = (source: string) => {
  const wasm = getIR(source);
  return wasm.buffer();
};

export default compile;
