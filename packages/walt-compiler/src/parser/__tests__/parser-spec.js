import test from 'ava';
import print from 'walt-buildtools/print';
import parser from '..';

test('the most basic of modules in wasm', t => {
  const result = parser('');
  // Empty ast, empty module
  t.snapshot(result);
});

test('compiles globals', t => {
  const result = parser('const answer: i32 = 42;');
  t.snapshot(result);
});

test('compiles exports', t => {
  const result = parser('export const answer: i32 = 42;');
  t.snapshot(result);
});

test.only('compiles blocks', t => {
  const result = parser('function t() { let x: i32; }');
  console.log(print(result));
});
