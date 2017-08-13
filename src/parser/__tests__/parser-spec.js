import test from 'ava';
import snapshot from 'snap-shot';
import Parser from '../Parser';
import { I32 } from '../../emiter/value_type';
import { tokenParsers, Tokenizer, TokenStream, Stream } from '..';

const tokenizer = {
  empty: new Tokenizer(new Stream(''), tokenParsers),
  constGlobals: new Tokenizer(new Stream('const answer: i32 = 42'), tokenParsers)
};

test('the most basic of modules in wasm', t => {
  const tokens = tokenizer.empty.parse();
  const result = new Parser(new TokenStream(tokens)).parse();

  // Empty ast, empty module
  snapshot(result);
});

test('compiles globals', t => {
  const tokens = tokenizer.constGlobals.parse();
  const result = new Parser(new TokenStream(tokens)).parse();
  t.deepEqual(result, {
    Globals: [
      { id: 'answer', mutable: 0, type: I32, init: 42 }
    ]
  });
});

