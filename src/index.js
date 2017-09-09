import Tokenizer from './tokenizer';
import Parser from './parser';
import Stream from './utils/stream';
import TokenStream from './utils/token-stream';
import emit from './emitter';


// Used for deugging purposes
export const getAst = source => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  return ast;
};

export const getIR = source => {
  const ast = getAst(source);
  const wasm = emit(ast);
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = source => {
  const wasm = getIR(source);
  return wasm.buffer();
}

export default compile;

