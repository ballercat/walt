import Parser, {
  Stream,
  Tokenizer,
  TokenStream,
  tokenParsers
} from './parser';
import emit from './emiter';

// Used for deugging purposes
export const getAst = source => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream, tokenParsers);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const wasm = emit(ast);
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = source => {
  const wasm = getAst(source);
  return wasm.buffer();
}

export default compile;

