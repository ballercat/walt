import test from 'ava';
import Parser from '..';
import { I32 } from '../../emitter/value_type';
import { EXTERN_GLOBAL } from '../../emitter/external_kind';
import Tokenizer from '../../tokenizer';
import TokenStream from '../../utils/token-stream';
import Stream from '../../utils/stream';
import emit from '../../emitter';

const tokenizer = {
  empty: new Tokenizer(new Stream('')),
  semicolon: new Tokenizer(new Stream('')),
  constGlobals: new Tokenizer(new Stream('const answer: i32 = 42;')),
  exportGlobals: new Tokenizer(new Stream('export const answer: i32 = 42;'))
};

const prepare = string =>
  new TokenStream(
    new Tokenizer(
      new Stream(string)).parse()
  );

test('the most basic of modules in wasm', t => {
  const result = new Parser(prepare('')).parse();
  // Empty ast, empty module
  t.snapshot(result);
});

test('compiles globals', t => {
  const result = new Parser(prepare('const answer: i32 = 42;')).parse();
  t.snapshot(result);
});

test('compiles exports', t => {
  const result = new Parser(prepare('export const answer: i32 = 42;')).parse();
  t.snapshot(result);
});


