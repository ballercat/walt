import test from 'ava';
import snapshot from 'snap-shot';
import Parser from '../Parser';
import { I32 } from '../../emiter/value_type';
import { EXTERN_GLOBAL } from '../../emiter/external_kind';
import { tokenParsers, Tokenizer, TokenStream, Stream } from '..';

const tokenizer = {
  empty: new Tokenizer(new Stream(''), tokenParsers),
  semicolon: new Tokenizer(new Stream(''), tokenParsers),
  constGlobals: new Tokenizer(new Stream('const answer: i32 = 42'), tokenParsers),
  exportGlobals: new Tokenizer(new Stream('export const answer: i32 = 42'), tokenParsers)
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
});

test('compiles exports', t => {
  const tokens = tokenizer.exportGlobals.parse();
  const result = new Parser(new TokenStream(tokens)).parse();
  debugger;
});

