// @flow
import Tokenizer from "./tokenizer";
import Parser from "./parser";
import Stream from "./utils/stream";
import TokenStream from "./utils/token-stream";
import emit from "./emitter";
import _debug from "./utils/debug";

export const debug = _debug;

// Used for deugging purposes
export const getAst = (source: string) => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser(tokenStream, stream.lines);
  const ast = parser.parse();
  return ast;
};

export const getIR = (source: string) => {
  const ast = getAst(source);
  const wasm = emit(ast);
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = (source: string) => {
  const wasm = getIR(source);
  return wasm.buffer();
};

export default compile;
