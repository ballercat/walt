// @flow
import parser from "./parser";
import emit from "./emitter";
import generator from "./generator";
import withMetadata from "./metadata";
import _debug from "./utils/debug";
export const debug = _debug;

// Used for deugging purposes
export const getAst = (source: string) => {
  const ast = parser(source);
  return ast;
};

export const getIR = (source: string) => {
  const ast = getAst(source);
  const astWithMetadata = withMetadata(ast);
  const wasm = emit(generator(astWithMetadata));
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = (source: string) => {
  const wasm = getIR(source);
  return wasm.buffer();
};

export default compile;
