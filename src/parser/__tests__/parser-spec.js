import test from 'ava';
import snapshot from 'snap-shot';
import Parser from '../Parser';
import { tokenParsers, Tokenizer, TokenStream, Stream } from '..';

const tokenizer = {
  empty: new Tokenizer(new Stream(''), tokenParsers)
};

test('the most basic of modules in wasm', t => {
  const tokens = tokenizer.empty.parse();
  const result = new Parser(new TokenStream(tokens)).parse();

  // Empty ast, empty module
  snapshot(result);
});
