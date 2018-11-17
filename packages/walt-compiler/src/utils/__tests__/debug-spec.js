import test from 'ava';
import debug from '../debug';
import { compile } from '../..';

const DEFAULT_EXAMPLE = `const x: i32 = 2;
export function echo(): i32 {
  const x: i32 = 42;
  return x;
}`;

test('debug prints web-assembly opcodes', t => {
  // TODO: Change the input to debug to be a static value instead
  t.snapshot(debug(compile(DEFAULT_EXAMPLE).wasm));
});
