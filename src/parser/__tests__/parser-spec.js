import test from 'ava';
import snapshot from 'snap-shot';
import Parser from '../Parser';
import { I32 } from '../../emiter/value_type';
import { EXTERN_GLOBAL } from '../../emiter/external_kind';
import { tokenParsers, Tokenizer, TokenStream, Stream } from '..';
import emit from '../../emiter';

const tokenizer = {
  empty: new Tokenizer(new Stream(''), tokenParsers),
  semicolon: new Tokenizer(new Stream(''), tokenParsers),
  constGlobals: new Tokenizer(new Stream('const answer: i32 = 42;'), tokenParsers),
  exportGlobals: new Tokenizer(new Stream('export const answer: i32 = 42;'), tokenParsers)
};

const prepare = string =>
  new TokenStream(
    new Tokenizer(
      new Stream(string), tokenParsers).parse()
  );

test('the most basic of modules in wasm', t => {
  const result = new Parser(prepare('')).parse();
  // Empty ast, empty module
  snapshot(result);
});

test('compiles globals', t => {
  const result = new Parser(prepare('const answer: i32 = 42;')).parse();
  snapshot(result);
});

test('compiles exports', t => {
  const result = new Parser(prepare('export const answer: i32 = 42;')).parse();
  snapshot(result);
});


