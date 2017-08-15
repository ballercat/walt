import Parser, {
  Stream,
  Tokenizer,
  TokenStream,
  tokenParsers
} from './parser';
import generator from './generator';
import emit from './emiter';

// Compiles a raw binary wasm buffer
const compile = source => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream, tokenParsers);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const ir = generator(ast);
  const wasm = emit(ir);

  return wasm.buffer();
}

export default compile;

